<template>
  <!-- 1) SEED & WATER: i-drag ang butil papunta sa lupa para itanim. Tapos kuskusin ang pandilig pakaliwa-pakanan para
       diligan; lalaki ang halaman, mamumulaklak, at lilitaw ang karatula na may pangalan niya. -->
  <section
    ref="stageEl"
    class="seed-stage"
    :class="`ph-${phase}`"
    @pointerdown="onStageDown"
    @pointermove="onStageMove"
    @pointerup="onStageUp"
    @pointercancel="onStageUp"
  >
    <header class="head">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
    </header>

    <div ref="soilEl" class="soil" :class="{ target: phase === 'seed' }">
      <span class="ring" />
    </div>

    <div ref="plantEl" class="plant" :style="{ '--g': grow }" aria-hidden="true">
      <svg viewBox="0 0 120 230">
        <path class="stem" d="M60 228 C60 190 50 160 58 120 C64 90 60 60 60 44" />
        <path class="leaf l1" d="M56 170 C30 168 18 150 14 134 C36 136 52 148 56 170Z" />
        <path class="leaf l2" d="M60 140 C86 138 98 120 104 104 C82 106 64 118 60 140Z" />
        <path class="leaf l3" d="M58 100 C40 98 30 88 28 76 C44 78 56 86 58 100Z" />
        <ellipse class="bud" cx="60" cy="42" rx="6" ry="9" />
        <g class="flower">
          <ellipse
            v-for="a in [0, 45, 90, 135, 180, 225, 270, 315]"
            :key="a"
            cx="60"
            cy="24"
            rx="9"
            ry="16"
            :transform="`rotate(${a} 60 40)`"
          />
          <circle cx="60" cy="40" r="9" class="core" />
        </g>
      </svg>
    </div>

    <Transition name="sign">
      <div v-if="phase === 'grown'" class="sign">
        <span class="board">
          <small>Happy birthday</small>
          <b>{{ recipient }}</b>
        </span>
        <span class="post" />
      </div>
    </Transition>

    <button
      v-if="phase === 'seed'"
      ref="seedEl"
      class="seed-wrap"
      :class="{ drag: seedDrag }"
      :style="{ translate: `${seedDx}px ${seedDy}px` }"
      type="button"
      aria-label="Plant the seed"
      @pointerdown="seedDown"
      @pointermove="seedMove"
      @pointerup="seedUp"
      @pointercancel="seedUp"
      @keydown.enter.prevent="plant"
    >
      <span class="seed" />
    </button>

    <div v-if="phase === 'water'" class="can" :class="{ pouring }" :style="{ left: `${canX}px`, top: `${canY}px` }" aria-hidden="true">
      <svg viewBox="0 0 90 70">
        <path d="M20 22 H66 L62 62 H24Z" fill="#7fc8e8" stroke="#4a9cc0" stroke-width="2" />
        <path d="M20 30 L4 18 L8 14 L24 24" fill="#7fc8e8" stroke="#4a9cc0" stroke-width="2" />
        <path d="M66 28 C84 28 84 52 64 52" fill="none" stroke="#4a9cc0" stroke-width="5" />
        <ellipse cx="43" cy="22" rx="23" ry="4" fill="#a5dcf3" />
      </svg>
      <span class="drops"><i v-for="n in 6" :key="n" :style="{ animationDelay: `${n * 0.11}s`, left: `${(n % 3) * 7}px` }" /></span>
    </div>

    <p v-if="phase !== 'grown'" class="hint">{{ hint }}</p>

    <Transition name="rise">
      <button v-if="phase === 'grown'" class="next" type="button" @pointerdown.stop @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
});
const emit = defineEmits(["planted", "grown", "done"]);

const stageEl = ref(null);
const soilEl = ref(null);
const seedEl = ref(null);
const plantEl = ref(null);

const phase = ref("seed"); // seed | water | grown
const water = ref(0);
const pouring = ref(false);
const canX = ref(0);
const canY = ref(0);

const seedDx = ref(0);
const seedDy = ref(0);
const seedDrag = ref(false);

const grow = computed(() => (phase.value === "seed" ? 0 : Math.max(0.06, 1 - Math.pow(1 - water.value, 2))));
const eyebrow = computed(() => (phase.value === "seed" ? "A little beginning" : phase.value === "water" ? "Now give it water" : "Look at that"));
const title = computed(() =>
  phase.value === "seed" ? "Plant the seed" : phase.value === "water" ? "Water it with love" : "Something beautiful grew",
);
const hint = computed(() =>
  phase.value === "seed" ? "Drag the seed into the soil ↓" : `Scrub the watering can side to side · ${Math.round(water.value * 100)}%`,
);

/* ===== Hakbang 1: ilipat ang butil sa lupa ===== */
let seedStart = null;
let seedScale = 1;

function seedDown(event) {
  seedStart = { x: event.clientX, y: event.clientY };
  seedDrag.value = true;
  const el = stageEl.value;
  seedScale = el.clientWidth ? el.getBoundingClientRect().width / el.clientWidth : 1;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function seedMove(event) {
  if (!seedStart) return;
  seedDx.value = (event.clientX - seedStart.x) / (seedScale || 1);
  seedDy.value = (event.clientY - seedStart.y) / (seedScale || 1);
}
function seedUp() {
  if (!seedStart) return;
  seedStart = null;
  seedDrag.value = false;
  const s = seedEl.value.getBoundingClientRect();
  const g = soilEl.value.getBoundingClientRect();
  const dist = Math.hypot(s.left + s.width / 2 - (g.left + g.width / 2), s.top + s.height / 2 - (g.top + g.height / 2));
  if (dist < g.width * 0.45) plant();
  else {
    seedDx.value = 0;
    seedDy.value = 0;
  }
}
function plant() {
  if (phase.value !== "seed") return;
  navigator.vibrate?.(20);
  phase.value = "water";
  emit("planted", soilEl.value);
  placeCan(stageEl.value.clientWidth * 0.7, stageEl.value.clientHeight * 0.33);
}

/* ===== Hakbang 2: diligan gamit ang pandilig ===== */
let watering = false;
let lastX = 0;
let pourTimer = 0;

function stagePoint(event) {
  const el = stageEl.value;
  const r = el.getBoundingClientRect();
  return {
    x: ((event.clientX - r.left) * el.clientWidth) / (r.width || 1),
    y: ((event.clientY - r.top) * el.clientHeight) / (r.height || 1),
    W: el.clientWidth,
    H: el.clientHeight,
  };
}
function placeCan(x, y, H = stageEl.value.clientHeight) {
  canX.value = x;
  canY.value = Math.max(H * 0.2, Math.min(H * 0.46, y));
}
function onStageDown(event) {
  if (phase.value !== "water") return;
  watering = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  const p = stagePoint(event);
  lastX = p.x;
  placeCan(p.x, p.y, p.H);
}
function onStageMove(event) {
  if (!watering || phase.value !== "water") return;
  const p = stagePoint(event);
  const dx = Math.abs(p.x - lastX);
  lastX = p.x;
  placeCan(p.x, p.y, p.H);
  if (dx > 0.5) {
    pouring.value = true;
    clearTimeout(pourTimer);
    pourTimer = setTimeout(() => (pouring.value = false), 160);
    water.value = Math.min(1, water.value + dx / (p.W * 5));
    if (water.value >= 1) {
      phase.value = "grown";
      pouring.value = false;
      watering = false;
      navigator.vibrate?.([20, 40, 20]);
      emit("grown", plantEl.value);
    }
  }
}
function onStageUp() {
  watering = false;
}

onMounted(() => {
  canX.value = stageEl.value.clientWidth * 0.7;
  canY.value = stageEl.value.clientHeight * 0.33;
});
onBeforeUnmount(() => clearTimeout(pourTimer));
</script>

<style scoped>
.seed-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.seed-stage.ph-water {
  cursor: ew-resize;
  touch-action: none;
}
.head {
  position: absolute;
  top: 9%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.eyebrow {
  margin: 0;
  color: #e0667f;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #2f5d3a;
  font-family: var(--font-head);
  font-size: clamp(28px, 8.4cqi, 42px);
  font-weight: 600;
  line-height: 1.15;
}

/* ===== Lupa ===== */
.soil {
  position: absolute;
  left: 50%;
  bottom: 7%;
  width: 210px;
  height: 74px;
  border-radius: 50% 50% 14px 14px / 100% 100% 0 0;
  background:
    radial-gradient(rgb(60 30 10 / 0.35) 1.5px, transparent 2px) 0 0 / 14px 14px,
    linear-gradient(180deg, #8a5a3a, #6a4128);
  box-shadow: 0 10px 18px rgb(40 25 10 / 0.3);
  translate: -50% 0;
}
.ring {
  position: absolute;
  inset: -10px -10px 8px;
  border: 2px dashed rgb(255 255 255 / 0);
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  transition: border-color 0.4s ease;
}
.target .ring {
  border-color: rgb(255 255 255 / 0.9);
  animation: ring-pulse 1.2s ease-in-out infinite alternate;
}

/* ===== Halaman ===== */
.plant {
  position: absolute;
  left: 50%;
  bottom: calc(7% + 50px);
  width: 150px;
  height: 288px;
  pointer-events: none;
  translate: -50% 0;
}
.plant svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.stem {
  fill: none;
  stroke: #3f9b5a;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 210;
  stroke-dashoffset: calc(210 * (1 - var(--g)));
}
.leaf {
  fill: #5cb86d;
  stroke: #3f9b5a;
  stroke-width: 1.2;
  transform-box: fill-box;
  transform-origin: bottom center;
}
.l1 {
  scale: clamp(0, calc((var(--g) - 0.12) * 5), 1);
}
.l2 {
  scale: clamp(0, calc((var(--g) - 0.3) * 5), 1);
}
.l3 {
  scale: clamp(0, calc((var(--g) - 0.5) * 5), 1);
}
.bud {
  fill: #7bc47f;
  opacity: clamp(0, calc((var(--g) - 0.55) * 6), 1);
}
.flower {
  transform-box: fill-box;
  transform-origin: center;
  scale: clamp(0, calc((var(--g) - 0.7) * 3.4), 1);
}
.flower ellipse {
  fill: #ff8fab;
  stroke: #e86a8c;
  stroke-width: 0.8;
}
.core {
  fill: #ffd166;
  stroke: #e0a93a;
  stroke-width: 1;
}

/* ===== Karatula ===== */
.sign {
  position: absolute;
  left: 50%;
  bottom: calc(7% + 20px);
  translate: 74px 0;
  transform-origin: bottom center;
}
.board {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 128px;
  padding: 8px 10px 10px;
  border: 3px solid #a9703d;
  border-radius: 8px;
  background: repeating-linear-gradient(0deg, #e7c08a 0 6px, #dcb078 6px 7px);
  box-shadow: 0 6px 12px rgb(60 35 15 / 0.35);
  rotate: -4deg;
}
.board small {
  color: #7a4c27;
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.board b {
  color: #5c3516;
  font-family: var(--font-script);
  font-size: 30px;
  font-weight: 400;
  line-height: 1.1;
}
.post {
  display: block;
  width: 10px;
  height: 46px;
  margin: -2px auto 0;
  background: linear-gradient(90deg, #8a5a3a, #b07a4c);
}
.sign-enter-active {
  transition: opacity 0.6s ease 0.5s, scale 0.9s cubic-bezier(0.3, 1.6, 0.5, 1) 0.5s;
}
.sign-enter-from {
  opacity: 0;
  scale: 0.2;
}

/* ===== Butil ===== */
.seed-wrap {
  position: absolute;
  left: 22%;
  top: 38%;
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  padding: 0;
  margin: -36px 0 0 -36px;
  border: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 0.5), rgb(255 255 255 / 0) 70%);
  cursor: grab;
  touch-action: none;
  animation: seed-float 1.6s ease-in-out infinite alternate;
}
.seed-wrap.drag {
  cursor: grabbing;
  animation: none;
  z-index: 3;
}
.seed-wrap:not(.drag) {
  transition: translate 0.5s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.seed-wrap:focus-visible {
  outline: 2px dashed #2f5d3a;
  outline-offset: 4px;
}
.seed {
  display: block;
  width: 26px;
  height: 36px;
  border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: radial-gradient(circle at 35% 30%, #d6a578, #7a4b2a);
  box-shadow: 0 6px 10px rgb(60 35 15 / 0.4);
  rotate: 18deg;
}

/* ===== Pandilig ===== */
.can {
  position: absolute;
  z-index: 4;
  width: 84px;
  pointer-events: none;
  rotate: -8deg;
  transition: rotate 0.2s ease;
  translate: -50% -50%;
}
.can.pouring {
  rotate: -30deg;
}
.can svg {
  display: block;
  width: 100%;
  filter: drop-shadow(0 6px 6px rgb(30 70 100 / 0.35));
}
.drops {
  position: absolute;
  left: -2px;
  top: 14px;
}
.drops i {
  position: absolute;
  top: 0;
  width: 5px;
  height: 9px;
  border-radius: 50%;
  background: #8ed1f0;
  opacity: 0;
}
.pouring .drops i {
  animation: drop 0.7s linear infinite;
}

.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1.6%;
  margin: 0;
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 8px rgb(30 70 40 / 0.6);
  pointer-events: none;
}
.next {
  position: absolute;
  left: 50%;
  top: 22%;
  z-index: 4;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: #ff8fab;
  box-shadow: 0 10px 22px rgb(180 60 90 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.rise-enter-active {
  transition: opacity 0.9s ease 1.1s, transform 0.9s ease 1.1s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes ring-pulse {
  to {
    border-color: rgb(255 255 255 / 0.4);
  }
}
@keyframes seed-float {
  to {
    transform: translateY(-8px);
  }
}
@keyframes drop {
  from {
    opacity: 1;
    translate: 0 0;
  }
  to {
    opacity: 0;
    translate: -6px 130px;
  }
}
@container (max-height: 620px) {
  .head {
    top: 5%;
  }
  .plant {
    scale: 0.8;
    transform-origin: bottom center;
  }
  .sign {
    scale: 0.85;
  }
}
@media (prefers-reduced-motion: reduce) {
  .seed-wrap,
  .target .ring {
    animation: none;
  }
}
</style>