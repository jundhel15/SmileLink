<template>
  <!-- 3) SLICE THE PIE: i-swipe ang kutsilyo sa ibabaw ng pie. Bawat hiwa na nadaanan ay lilipad palayo at
       lalabas sa ilalim ang isang litrato. Kapag nahiwa lahat, handa na ang susunod. -->
  <section class="ps-stage">
    <header class="ps-head">
      <p class="ps-eyebrow">{{ count }} of {{ N }} slices</p>
      <h2>{{ done ? "Every slice, ours" : "Slice the pie" }}</h2>
    </header>

    <div class="ps-body" :style="{ '--d': 'min(72cqi, 260px, 34cqh)' }">
      <div
        ref="pieEl"
        class="ps-pie"
        :class="{ grab: dragging }"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
      >
        <svg class="ps-svg" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <pattern id="ps-lat" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="12" height="12" fill="#eab05a" />
              <path d="M0 6H12M6 0V12" stroke="#c97b2e" stroke-width="3" />
            </pattern>
            <clipPath v-for="w in wedges" :id="`ps-c${w.i}`" :key="`c${w.i}`">
              <path :d="w.d" />
            </clipPath>
          </defs>
          <circle cx="100" cy="100" r="98" fill="#fff4e0" stroke="#e7cfa6" stroke-width="2" />
          <circle cx="100" cy="100" r="94.5" fill="none" stroke="#d98b36" stroke-width="5" />
          <g v-for="w in wedges" :key="`p${w.i}`" :clip-path="`url(#ps-c${w.i})`">
            <rect width="200" height="200" fill="#fde4d4" />
            <image v-if="w.src" :href="w.src" x="0" y="0" width="200" height="200" preserveAspectRatio="xMidYMid slice" />
          </g>
          <path
            v-for="w in wedges"
            :key="`t${w.i}`"
            :d="w.d"
            class="ps-top"
            :class="{ gone: sliced[w.i] }"
            :style="{ '--dx': w.dx + 'px', '--dy': w.dy + 'px' }"
          />
          <path v-for="w in wedges" :key="`l${w.i}`" :d="w.d" class="ps-line-edge" :class="{ on: sliced[w.i] }" />
        </svg>

        <svg v-if="dragging" class="ps-trail" aria-hidden="true">
          <polyline :points="trailPts" />
        </svg>
        <span v-if="dragging" class="ps-knife" :style="{ left: knife.x + 'px', top: knife.y + 'px' }" aria-hidden="true">
          <i /><b />
        </span>
      </div>

      <div class="ps-noteBox">
        <Transition name="ps-note" mode="out-in">
          <p v-if="note" :key="note" class="ps-note">“{{ note }}”</p>
        </Transition>
      </div>

      <div class="ps-row">
        <span v-for="w in wedges" :key="w.i" class="ps-thumb" :class="{ on: sliced[w.i] }">
          <img v-if="sliced[w.i] && w.src" :src="w.src" alt="" draggable="false" />
          <i v-else-if="sliced[w.i]">♥</i>
        </span>
      </div>

      <div class="ps-foot">
        <button v-if="done" class="ps-next" type="button" @click="emit('done')">Continue ✦</button>
        <p v-else class="ps-hint">{{ count ? "Keep slicing" : "Swipe the knife across the pie" }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  photos: { type: Array, default: () => [] },
  captions: { type: Array, default: () => [] },
});
const emit = defineEmits(["sliced", "finished", "done"]);

const DEFAULT_NOTES = ["Where it started", "Silly us", "A day I keep", "Just because", "My favorite smile", "Warm and happy"];

const N = Math.min(6, Math.max(3, props.photos.length)); // dami ng hiwa
const STEP = 360 / N;
const R = 92;

const pol = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
};

const wedges = Array.from({ length: N }, (_, i) => {
  const a0 = -90 + i * STEP;
  const a1 = a0 + STEP;
  const mid = ((a0 + STEP / 2) * Math.PI) / 180;
  const [x0, y0] = pol(a0, R);
  const [x1, y1] = pol(a1, R);
  return {
    i,
    d: `M100 100 L${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 ${STEP > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`,
    dx: (Math.cos(mid) * 36).toFixed(1),
    dy: (Math.sin(mid) * 36).toFixed(1),
    src: props.photos.length ? props.photos[i % props.photos.length] : "",
  };
});

const pieEl = ref(null);
const sliced = ref(Array(N).fill(false));
const count = ref(0);
const note = ref("");
const done = ref(false);
const dragging = ref(false);
const knife = ref({ x: 0, y: 0 });
const trail = ref([]);
const trailPts = computed(() => trail.value.map((p) => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(" "));
const timers = [];

// posisyon ng daliri sa loob ng pie (hinahati sa scale ng preview)
function localXY(event) {
  const r = pieEl.value.getBoundingClientRect();
  const s = r.width / (pieEl.value.offsetWidth || 1) || 1;
  return { x: (event.clientX - r.left) / s, y: (event.clientY - r.top) / s };
}

function sliceAt(event) {
  if (done.value) return;
  const r = pieEl.value.getBoundingClientRect();
  const dx = event.clientX - (r.left + r.width / 2);
  const dy = event.clientY - (r.top + r.height / 2);
  const rr = (Math.hypot(dx, dy) / (r.width / 2)) * 100;
  if (rr > 98 || rr < 8) return;
  const deg = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
  const i = Math.min(N - 1, Math.floor(deg / STEP));
  if (sliced.value[i]) return;
  sliced.value[i] = true;
  count.value += 1;
  note.value = props.captions[i] || DEFAULT_NOTES[i % DEFAULT_NOTES.length];
  navigator.vibrate?.(16);
  emit("sliced", { x: event.clientX, y: event.clientY });
  if (count.value >= N) {
    timers.push(
      setTimeout(() => {
        done.value = true;
        emit("finished", pieEl.value);
      }, 700),
    );
  }
}

function track(event) {
  const p = localXY(event);
  knife.value = p;
  trail.value.push(p);
  if (trail.value.length > 14) trail.value.shift();
  sliceAt(event);
}

function down(event) {
  if (done.value) return;
  dragging.value = true;
  trail.value = [];
  pieEl.value.setPointerCapture?.(event.pointerId);
  track(event);
}
function move(event) {
  if (dragging.value) track(event);
}
function up() {
  dragging.value = false;
  trail.value = [];
}

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<style scoped>
.ps-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.ps-head {
  position: absolute;
  top: 58px;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.ps-eyebrow {
  margin: 0;
  color: var(--brown);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}
h2 {
  margin: 4px 0 0;
  color: var(--ink);
  font-family: var(--font-script);
  font-size: clamp(26px, 7.4cqi, 36px);
  font-weight: 400;
  line-height: 1.2;
}

.ps-body {
  position: absolute;
  inset: 138px 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.ps-foot {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-height: 52px;
}

/* ===== Pie ===== */
.ps-pie {
  position: relative;
  flex: none;
  width: var(--d);
  height: var(--d);
  cursor: crosshair;
  touch-action: none;
  filter: drop-shadow(0 12px 16px rgb(110 42 28 / 0.35));
}
.ps-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.ps-top {
  fill: url(#ps-lat);
  stroke: #a8601f;
  stroke-width: 2.4;
  stroke-linejoin: round;
  transition:
    transform 0.7s cubic-bezier(0.3, 1.3, 0.5, 1),
    opacity 0.5s ease 0.25s;
}
.ps-top.gone {
  opacity: 0;
  transform: translate(var(--dx), var(--dy));
}
.ps-line-edge {
  fill: none;
  stroke: #fff4e0;
  stroke-width: 1.6;
  stroke-linejoin: round;
  opacity: 0;
  transition: opacity 0.5s ease 0.3s;
}
.ps-line-edge.on {
  opacity: 1;
}
.ps-trail {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.ps-trail polyline {
  fill: none;
  stroke: rgb(255 255 255 / 0.85);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ps-knife {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
  rotate: 18deg;
}
.ps-knife i {
  position: absolute;
  top: -6px;
  left: -62px;
  width: 62px;
  height: 12px;
  border-radius: 8px 2px 2px 8px;
  background: linear-gradient(180deg, #fff, #c9ced4);
  box-shadow: 0 3px 6px rgb(0 0 0 / 0.3);
  clip-path: polygon(0 50%, 12% 0, 100% 0, 100% 100%, 12% 100%);
}
.ps-knife b {
  position: absolute;
  top: -7px;
  left: -112px;
  width: 52px;
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(180deg, #ff8a6b, #e0502f);
  box-shadow: 0 3px 6px rgb(0 0 0 / 0.3);
}

/* ===== Caption at maliliit na litrato ===== */
.ps-noteBox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(90cqi, 340px);
  min-height: 34px;
}
.ps-note {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: clamp(24px, 7cqi, 30px);
  line-height: 1.05;
  text-align: center;
}
.ps-note-enter-active,
.ps-note-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.ps-note-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.ps-note-leave-to {
  opacity: 0;
}
.ps-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  width: min(90cqi, 340px);
}
.ps-thumb {
  display: grid;
  width: 40px;
  height: 40px;
  overflow: hidden;
  place-items: center;
  border: 2px dashed rgb(138 75 42 / 0.45);
  border-radius: 50%;
  color: var(--accent);
  transition: transform 0.4s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.ps-thumb.on {
  border: 2px solid #fff;
  background: #fde4d4;
  box-shadow: 0 3px 8px rgb(110 42 28 / 0.3);
  animation: ps-pop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.ps-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.ps-hint {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
}
.ps-next {
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 10px 22px rgb(110 42 28 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  animation: ps-next 0.7s ease 0.4s both;
}

@keyframes ps-next {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes ps-pop {
  from {
    transform: scale(0.2) rotate(-40deg);
  }
  to {
    transform: none;
  }
}
@container (max-height: 620px) {
  .ps-head {
    top: 54px;
  }
  .ps-body {
    top: 122px;
    gap: 5px;
  }
  .ps-thumb {
    width: 34px;
    height: 34px;
  }
}
</style>
