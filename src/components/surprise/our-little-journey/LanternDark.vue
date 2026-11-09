<template>
  <!-- 4) FIND THE HIDDEN PROMISES: madilim ang buong kampo. I-drag ang parol at itapat sa mga nakatagong tag
       hanggang lumiwanag ang bawat pangako. Kapag nahanap lahat, babalik ang liwanag. -->
  <section
    ref="stageEl"
    class="ld-stage"
    :class="{ 'is-done': done }"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="up"
    @pointercancel="up"
  >
    <svg class="ld-camp" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
      <path class="ld-hill" d="M0 120V70Q50 48 100 66Q160 40 220 64Q265 50 300 62V120Z" />
      <path class="ld-pine" d="M20 100L34 62L48 100Z M26 84L34 54L42 84Z M250 100L264 60L278 100Z M256 82L264 52L272 82Z" />
      <path class="ld-tent" d="M120 104L150 62L180 104Z" />
      <path class="ld-door" d="M142 104L150 82L158 104Z" />
    </svg>

    <div
      v-for="(t, i) in promises"
      :key="i"
      :ref="(el) => (noteEls[i] = el)"
      class="ld-note"
      :class="{ found: found.includes(i) }"
      :style="noteStyle(i)"
    >
      <span class="ld-hole" />
      <b>Promise {{ i + 1 }}</b>
      <p>{{ t }}</p>
    </div>

    <span
      v-for="(t, i) in promises"
      :key="`s${i}`"
      v-show="!found.includes(i)"
      class="ld-spark"
      :style="{ left: POS[i].x * 100 + '%', top: POS[i].y * 100 + '%' }"
      aria-hidden="true"
    />

    <div class="ld-dark" :style="{ '--lx': lx + 'px', '--ly': ly + 'px' }" />

    <div class="ld-lantern" :style="{ left: lx + 'px', top: ly + 'px' }" aria-hidden="true">
      <span class="ld-body" />
    </div>

    <header class="ld-head">
      <p class="ld-eyebrow">{{ found.length }} of {{ n }} promises found</p>
      <h2>{{ done ? "Every promise, found" : "Find what's hidden" }}</h2>
    </header>

    <p v-if="!done" class="ld-hint">{{ dragged ? "Hold the light over the hidden notes" : "Drag the lantern around the dark" }}</p>

    <Transition name="ld-rise">
      <button v-if="done" class="ld-next" type="button" @click.stop="emit('done')" @pointerdown.stop>Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  promises: { type: Array, required: true },
});
const emit = defineEmits(["found", "finished", "done"]);

const n = Math.min(props.promises.length, 3);
const POS = [
  { x: 0.3, y: 0.32, r: -4 },
  { x: 0.7, y: 0.5, r: 3 },
  { x: 0.34, y: 0.7, r: -2 },
];
const noteStyle = (i) => ({ left: `${POS[i].x * 100}%`, top: `${POS[i].y * 100}%`, rotate: `${POS[i].r}deg` });

const stageEl = ref(null);
const noteEls = [];
const found = ref([]);
const lx = ref(0);
const ly = ref(0);
const dragged = ref(false);
const done = ref(false);

const dwell = Array(3).fill(0);
let pressed = false;
let frame = 0;
let last = 0;

// posisyon ng daliri sa loob ng eksena (hinahati sa scale ng preview)
function setLight(event) {
  const r = stageEl.value.getBoundingClientRect();
  const s = r.width / (stageEl.value.offsetWidth || 1) || 1;
  const lift = event.pointerType === "touch" ? 36 : 0; // para hindi matakpan ng daliri
  lx.value = (event.clientX - r.left) / s;
  ly.value = (event.clientY - r.top) / s - lift;
  dragged.value = true;
}
function down(event) {
  pressed = true;
  stageEl.value.setPointerCapture?.(event.pointerId);
  setLight(event);
}
function move(event) {
  if (pressed || event.pointerType === "mouse") setLight(event);
}
function up() {
  pressed = false;
}

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  const w = stageEl.value?.offsetWidth || 0;
  const h = stageEl.value?.offsetHeight || 0;
  for (let i = 0; i < n; i++) {
    if (found.value.includes(i)) continue;
    const dist = Math.hypot(lx.value - POS[i].x * w, ly.value - POS[i].y * h);
    dwell[i] = dist < 80 ? dwell[i] + dt : Math.max(0, dwell[i] - dt * 2);
    if (dwell[i] > 0.55) discover(i);
  }
  frame = requestAnimationFrame(tick);
}

function discover(i) {
  found.value.push(i);
  navigator.vibrate?.([20, 30, 20]);
  emit("found", noteEls[i]);
  if (found.value.length >= n) {
    done.value = true;
    emit("finished", noteEls[i]);
  }
}

onMounted(() => {
  lx.value = stageEl.value.offsetWidth * 0.5;
  ly.value = stageEl.value.offsetHeight * 0.8;
  frame = requestAnimationFrame(tick);
});
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<style scoped>
.ld-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  cursor: none;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.ld-camp {
  position: absolute;
  z-index: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 30%;
}
.ld-hill {
  fill: #4b6b45;
}
.ld-pine {
  fill: #2f4a30;
}
.ld-tent {
  fill: #e0704f;
  stroke: #fff7e6;
  stroke-width: 2;
  stroke-linejoin: round;
}
.ld-door {
  fill: #7a3a22;
}

/* ===== Mga nakatagong tag ===== */
.ld-note {
  position: absolute;
  z-index: 1;
  width: 158px;
  padding: 16px 12px 12px;
  border-radius: 6px;
  background: linear-gradient(160deg, #f1dcae, #e2c28a);
  box-shadow: 0 8px 16px rgb(0 0 0 / 0.35);
  text-align: center;
  translate: -50% -50%;
  transition: scale 0.6s cubic-bezier(0.3, 1.5, 0.5, 1), box-shadow 0.6s ease;
}
.ld-note.found {
  z-index: 4;
  scale: 1.12;
  box-shadow:
    0 0 0 3px rgb(255 213 128 / 0.8),
    0 0 36px 12px rgb(255 190 90 / 0.55);
}
.ld-hole {
  position: absolute;
  top: 5px;
  left: 50%;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4a2f1c;
  translate: -50% 0;
}
.ld-note b {
  display: block;
  color: #b4651f;
  font-family: var(--font-type);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.ld-note p {
  margin: 4px 0 0;
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: 22px;
  line-height: 1.05;
}
.ld-spark {
  position: absolute;
  z-index: 3;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff7d6;
  box-shadow: 0 0 10px 3px rgb(255 230 150 / 0.7);
  pointer-events: none;
  translate: -50% -50%;
  animation: ld-glint 1.6s ease-in-out infinite alternate;
}

/* ===== Dilim at parol ===== */
.ld-dark {
  position: absolute;
  z-index: 3;
  inset: 0;
  background: radial-gradient(
    circle at var(--lx) var(--ly),
    rgb(10 6 24 / 0) 0,
    rgb(10 6 24 / 0) 46px,
    rgb(10 6 24 / 0.55) 92px,
    rgb(10 6 24 / 0.96) 160px
  );
  pointer-events: none;
  transition: opacity 1.6s ease;
}
.is-done .ld-dark {
  opacity: 0;
}
.ld-lantern {
  position: absolute;
  z-index: 5;
  width: 28px;
  height: 38px;
  pointer-events: none;
  translate: -50% -50%;
}
.ld-lantern::before {
  content: "";
  position: absolute;
  top: -11px;
  left: 4px;
  width: 20px;
  height: 14px;
  border: 3px solid #7a4b2a;
  border-bottom: 0;
  border-radius: 12px 12px 0 0;
}
.ld-body {
  position: absolute;
  inset: 0;
  border: 3px solid #5b3a22;
  border-radius: 8px 8px 10px 10px;
  background: radial-gradient(circle at 50% 60%, #fff3b0, #ffc247 55%, #e8892f);
  box-shadow: 0 0 30px 14px rgb(255 190 90 / 0.5);
  animation: ld-flicker 0.7s ease-in-out infinite alternate;
}

.ld-head {
  position: absolute;
  z-index: 6;
  top: 9%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  pointer-events: none;
  transform: translateX(-50%);
}
.ld-eyebrow {
  margin: 0;
  color: #ffd9a0;
  font-family: var(--font-type);
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #fff7e6;
  font-family: var(--font-head);
  font-size: clamp(28px, 8.4cqi, 42px);
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 2px 12px rgb(20 10 30 / 0.6);
}
.ld-hint {
  position: absolute;
  z-index: 6;
  left: 0;
  right: 0;
  bottom: 1.6%;
  margin: 0;
  color: #fff7e6;
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 8px rgb(20 10 30 / 0.7);
  pointer-events: none;
}
.ld-next {
  position: absolute;
  z-index: 7;
  left: 50%;
  bottom: 3.5%;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 10px 22px rgb(0 0 0 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.ld-rise-enter-active {
  transition: opacity 0.8s ease 1.2s, transform 0.8s ease 1.2s;
}
.ld-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes ld-flicker {
  to {
    box-shadow: 0 0 40px 18px rgb(255 190 90 / 0.62);
    scale: 1.04;
  }
}
@keyframes ld-glint {
  from {
    opacity: 0.25;
  }
  to {
    opacity: 0.9;
  }
}
@container (max-height: 620px) {
  .ld-head {
    top: 5%;
  }
  .ld-note {
    width: 136px;
  }
  .ld-note p {
    font-size: 19px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ld-body,
  .ld-spark {
    animation: none;
  }
}
</style>