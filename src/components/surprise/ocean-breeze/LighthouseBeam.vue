<template>
  <!-- 5) LIGHTHOUSE BEAM: gabi na. Ikutin ang sinag ng parola gamit ang daliri (o hayaang umikot ito). Pag natamaan
       ng liwanag ang mga nakatagong bituin sa dilim, lalabas ang litrato at isang salita tungkol sa kanya. -->
  <section
    ref="stageEl"
    class="light-stage"
    :class="{ done }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <header class="head">
      <p class="eyebrow">{{ done ? "This is what I see" : "Out in the dark" }}</p>
      <h2>{{ done ? "Look what the light found" : "Sweep the light" }}</h2>
    </header>

    <div class="beam" aria-hidden="true" />

    <span
      v-for="(w, i) in shownWords"
      :key="i"
      :ref="(el) => (spotEls[i] = el)"
      class="spot"
      :class="{ found: found.includes(i) }"
      :style="{ left: `${SPOTS[i].x}%`, top: `${SPOTS[i].y}%`, '--rot': `${SPOTS[i].r}deg` }"
    >
      <i class="dot" />
      <span class="polaroid" :class="{ nophoto: !photoFor(i) }">
        <img v-if="photoFor(i)" :src="photoFor(i)" alt="" draggable="false" />
        <b class="word">{{ w }}</b>
      </span>
    </span>

    <div class="tower" aria-hidden="true">
      <span class="lamp-glow" />
      <svg viewBox="0 0 56 130">
        <path d="M0 130 Q6 112 18 106 H40 Q52 112 56 130Z" fill="#1b2c44" />
        <path d="M19 106 L23 38 H33 L37 106Z" fill="#f2efe6" />
        <path d="M21.4 68 H34.6 L35.3 82 H20.7Z" fill="#c9423f" />
        <path d="M20.1 92 H35.9 L36.6 104 H19.4Z" fill="#c9423f" />
        <rect x="19" y="35" width="18" height="4" fill="#28384f" />
        <rect x="22" y="25" width="12" height="11" fill="#ffe9a0" />
        <path d="M21 25 L28 15 L35 25Z" fill="#b23b3b" />
      </svg>
    </div>

    <p v-if="!done" class="hint">Drag to swing the light · found {{ found.length }}/{{ n }}</p>

    <Transition name="rise">
      <button v-if="done" class="next" type="button" @pointerdown.stop @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  words: { type: Array, required: true }, // maiikling salita (hanggang 4)
  photos: { type: Array, default: () => [] },
});
const emit = defineEmits(["found", "finished", "done"]);

// puwesto ng mga nakatagong bituin (% ng entablado); r = bahagyang ikot ng polaroid
const SPOTS = [
  { x: 62, y: 24, r: -4 },
  { x: 72, y: 44, r: 3 },
  { x: 36, y: 15, r: 5 },
  { x: 74, y: 64, r: -3 },
];
const n = computed(() => Math.min(props.words.length, SPOTS.length));
const shownWords = computed(() => props.words.slice(0, n.value));
const photoFor = (i) => (props.photos.length ? props.photos[(i + 2) % props.photos.length] : "");

const stageEl = ref(null);
const spotEls = [];
const found = ref([]);
const done = ref(false);

// ang parola ay nasa (14%, 62%) ng entablado; a = anggulo ng sinag sa degrees
let a = -40;
let aim = -40;
let dragging = false;
let frame = 0;
let last = 0;

function check() {
  if (done.value || !stageEl.value) return;
  const w = stageEl.value.clientWidth;
  const h = stageEl.value.clientHeight;
  const lampX = w * 0.14;
  const lampY = h * 0.62;
  for (let i = 0; i < n.value; i++) {
    if (found.value.includes(i)) continue;
    const angle = (Math.atan2((SPOTS[i].y / 100) * h - lampY, (SPOTS[i].x / 100) * w - lampX) * 180) / Math.PI;
    if (Math.abs(angle - a) < 6.5) {
      found.value = [...found.value, i];
      navigator.vibrate?.(15);
      emit("found", spotEls[i]);
      if (found.value.length === n.value) {
        done.value = true;
        navigator.vibrate?.([20, 40, 20]);
        emit("finished", stageEl.value);
      }
    }
  }
}

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  if (dragging) a += (aim - a) * Math.min(1, dt * 10);
  else a += (-36 + Math.sin((now / 1000) * 0.55) * 48 - a) * Math.min(1, dt * 2); // kusang umiikot
  stageEl.value?.style.setProperty("--a", `${a.toFixed(2)}deg`);
  check();
  frame = requestAnimationFrame(loop);
}

function aimFrom(event) {
  const rect = stageEl.value.getBoundingClientRect();
  const f = Math.max(0, Math.min(1, (event.clientX - rect.left) / (rect.width || 1)));
  aim = -86 + f * 100;
}
function onDown(event) {
  if (done.value) return;
  dragging = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  aimFrom(event);
}
function onMove(event) {
  if (dragging) aimFrom(event);
}
function onUp() {
  dragging = false;
}

onMounted(() => {
  frame = requestAnimationFrame(loop);
});
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<style scoped>
.light-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.light-stage:not(.done) {
  cursor: ew-resize;
}
.head {
  position: absolute;
  top: 8%;
  left: 50%;
  z-index: 4;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.eyebrow {
  margin: 0;
  color: #bcd6f5;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.34em;
  text-transform: uppercase;
}
h2 {
  margin: 8px 0 0;
  color: #fff;
  font-family: var(--font-head);
  font-size: clamp(28px, 8cqi, 40px);
  font-style: italic;
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 2px 14px rgb(0 10 30 / 0.7);
}

/* ===== Sinag ===== */
.beam {
  position: absolute;
  top: 62%;
  left: 14%;
  z-index: 1;
  width: 170%;
  height: 150px;
  margin-top: -75px;
  background: linear-gradient(90deg, rgb(255 250 215 / 0.9), rgb(255 244 190 / 0.35) 45%, rgb(255 244 190 / 0));
  clip-path: polygon(0 47%, 100% 0, 100% 100%, 0 53%);
  mix-blend-mode: screen;
  pointer-events: none;
  rotate: var(--a, -40deg);
  transform-origin: 0 50%;
}

/* ===== Mga nakatagong bituin / polaroid ===== */
.spot {
  position: absolute;
  z-index: 2;
  width: 0;
  height: 0;
}
.dot {
  position: absolute;
  left: 0;
  top: 0;
  width: 7px;
  height: 7px;
  margin: -3.5px 0 0 -3.5px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px 3px rgb(255 255 255 / 0.7);
  transition: opacity 0.5s ease;
  animation: dot-twinkle 2s ease-in-out infinite alternate;
}
.found .dot {
  opacity: 0;
}
.polaroid {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 78px;
  padding: 5px 5px 4px;
  background: #fffdf6;
  box-shadow:
    0 0 26px 6px rgb(255 240 180 / 0.55),
    0 8px 18px rgb(0 0 0 / 0.4);
  opacity: 0;
  rotate: var(--rot);
  scale: 0.4;
  translate: -50% -50%;
  transition: opacity 0.6s ease, scale 0.8s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.found .polaroid {
  opacity: 1;
  scale: 1;
}
.polaroid img {
  display: block;
  width: 68px;
  height: 68px;
  object-fit: cover;
  pointer-events: none;
}
.polaroid.nophoto {
  padding: 14px 16px;
}
.word {
  padding: 4px 0 1px;
  color: #3a3326;
  font-family: var(--font-head);
  font-size: 15px;
  font-style: italic;
  font-weight: 600;
  line-height: 1.1;
}

/* ===== Parola ===== */
.tower {
  position: absolute;
  top: calc(62% - 32px);
  left: calc(14% - 28px);
  z-index: 3;
  width: 56px;
  height: 130px;
  pointer-events: none;
}
.tower svg {
  display: block;
  width: 100%;
  height: 100%;
}
.lamp-glow {
  position: absolute;
  top: 6px;
  left: -22px;
  width: 100px;
  height: 52px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgb(255 244 190 / 0.9), rgb(255 244 190 / 0) 70%);
  animation: lamp-pulse 2.4s ease-in-out infinite alternate;
}

.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3%;
  z-index: 4;
  margin: 0;
  color: #d7e6fa;
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 600;
  text-align: center;
  pointer-events: none;
}
.next {
  position: absolute;
  left: 50%;
  bottom: 3%;
  z-index: 5;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: #ff8a6b;
  box-shadow: 0 10px 22px rgb(0 10 30 / 0.5);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.rise-enter-active {
  transition: opacity 0.9s ease 0.9s, transform 0.9s ease 0.9s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes dot-twinkle {
  to {
    transform: scale(1.9);
  }
}
@keyframes lamp-pulse {
  to {
    opacity: 0.6;
  }
}
@container (max-height: 620px) {
  .head {
    top: 4%;
  }
  .polaroid {
    width: 64px;
  }
  .polaroid img {
    width: 54px;
    height: 54px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .dot,
  .lamp-glow {
    animation: none;
  }
}
</style>