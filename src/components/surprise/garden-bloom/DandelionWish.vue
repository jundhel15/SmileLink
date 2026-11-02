<template>
  <!-- 2) DANDELION WISH: haplusin (i-swipe) ng daliri ang malambot na dandelion para hipan palayo ang mga buto.
       Habang nililipad ang mga ito, isa-isang lumilitaw ang mga hiling para sa kanya. -->
  <section
    class="dande-stage"
    :class="{ done }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <header class="head">
      <p class="eyebrow">{{ done ? "Wishes in the wind" : "Make a wish" }}</p>
      <h2>{{ done ? "Carried away for you" : "Blow the dandelion" }}</h2>
    </header>

    <div class="wish-slot" aria-live="polite">
      <Transition name="card" mode="out-in">
        <p v-if="current >= 0" :key="current" class="wish">{{ wishes[current] }}</p>
        <p v-else key="idle" class="idle">Brush the fluff away with your finger…</p>
      </Transition>
    </div>

    <svg ref="svgEl" class="dande" viewBox="0 0 200 440" aria-hidden="true">
      <path class="stalk" d="M100 120 C100 220 92 300 104 440" />
      <path class="blade" d="M102 330 C140 320 160 290 168 262 C132 268 106 292 102 330Z" />
      <path class="blade" d="M98 380 C60 370 40 340 32 314 C68 320 94 342 98 380Z" />
      <circle cx="100" cy="110" r="11" class="core" />
      <g
        v-for="(s, i) in seeds"
        :key="i"
        class="seed"
        :class="{ blown: blown[i] }"
        :style="seedStyle(i)"
      >
        <line :x1="s.x0" :y1="s.y0" :x2="s.x1" :y2="s.y1" class="thread" />
        <g :transform="`translate(${s.x1} ${s.y1})`">
          <path d="M-6 0H6 M0 -6V6 M-4.2 -4.2L4.2 4.2 M4.2 -4.2L-4.2 4.2" class="puff" />
          <circle r="2" class="puff-core" />
        </g>
      </g>
    </svg>

    <p v-if="!done" class="hint">Swipe over the dandelion · {{ Math.round(progress * 100) }}%</p>

    <Transition name="rise">
      <button v-if="done" class="next" type="button" @pointerdown.stop @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  wishes: { type: Array, required: true }, // mga hiling na lalabas habang hinihipan
});
const emit = defineEmits(["finished", "done"]);

const CX = 100;
const CY = 110;
const N = 42;

// mga buto: nakapabilog sa paligid ng gitna ng bulaklak
const seeds = Array.from({ length: N }, (_, i) => {
  const a = (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
  const len = 46 + Math.random() * 16;
  return {
    x0: CX + Math.cos(a) * 10,
    y0: CY + Math.sin(a) * 10,
    x1: CX + Math.cos(a) * len,
    y1: CY + Math.sin(a) * len,
  };
});

const svgEl = ref(null);
const blown = ref(Array(N).fill(false));
const fly = ref(Array(N).fill(null));
const count = ref(0);
const done = ref(false);
const progress = computed(() => count.value / N);

const current = computed(() => {
  let index = -1;
  props.wishes.forEach((_, i) => {
    if (progress.value >= (i + 1) / props.wishes.length - 0.04) index = i;
  });
  return index;
});

let dragging = false;
let lastBuzz = 0;
const timers = [];

function seedStyle(i) {
  const f = fly.value[i];
  return f ? { "--fx": `${f.fx}px`, "--fy": `${f.fy}px`, "--fr": `${f.fr}deg` } : {};
}

function toSvg(event) {
  const r = svgEl.value.getBoundingClientRect();
  const s = r.width / 200 || 1;
  return { x: (event.clientX - r.left) / s, y: (event.clientY - r.top) / s };
}

function blow(i, from) {
  if (blown.value[i]) return;
  const s = seeds[i];
  const dx = s.x1 - from.x;
  const dy = s.y1 - from.y;
  const len = Math.hypot(dx, dy) || 1;
  fly.value[i] = {
    fx: Math.round((dx / len) * 80 + 110 + Math.random() * 70), // may hangin papunta sa kanan
    fy: Math.round((dy / len) * 50 - 120 - Math.random() * 140),
    fr: Math.round(Math.random() * 360 - 120),
  };
  blown.value[i] = true;
  count.value += 1;
  if (count.value >= N * 0.9) finish();
}

function sweep(event, radius) {
  const p = toSvg(event);
  let hit = false;
  seeds.forEach((s, i) => {
    if (blown.value[i]) return;
    const near = Math.min(Math.hypot(s.x1 - p.x, s.y1 - p.y), Math.hypot((s.x0 + s.x1) / 2 - p.x, (s.y0 + s.y1) / 2 - p.y));
    if (near < radius) {
      blow(i, p);
      hit = true;
    }
  });
  const now = performance.now();
  if (hit && now - lastBuzz > 120) {
    navigator.vibrate?.(6);
    lastBuzz = now;
  }
}

function finish() {
  if (done.value) return;
  done.value = true;
  // ihipan na rin ang natitira, isa-isa
  seeds.forEach((s, i) => {
    if (!blown.value[i]) timers.push(setTimeout(() => blow(i, { x: CX - 40, y: CY + 20 }), i * 25));
  });
  navigator.vibrate?.([20, 40, 20]);
  emit("finished", svgEl.value);
}

function onDown(event) {
  if (done.value) return;
  dragging = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  sweep(event, 32);
}
function onMove(event) {
  if (dragging && !done.value) sweep(event, 24);
}
function onUp() {
  dragging = false;
}

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<style scoped>
.dande-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.dande-stage:not(.done) {
  cursor: pointer;
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

.wish-slot {
  position: absolute;
  top: 22%;
  left: 50%;
  display: grid;
  place-items: center;
  width: min(100% - 52px, 330px);
  min-height: 92px;
  padding: 12px 20px;
  border: 2px solid rgb(255 255 255 / 0.9);
  border-radius: 24px;
  background: rgb(255 255 255 / 0.7);
  box-shadow: 0 10px 26px rgb(60 110 70 / 0.2);
  text-align: center;
  transform: translateX(-50%);
}
.wish {
  margin: 0;
  color: #2f5d3a;
  font-family: var(--font-script);
  font-size: clamp(24px, 7cqi, 30px);
  line-height: 1.25;
}
.idle {
  margin: 0;
  color: #4d7a5a;
  font-family: var(--font-body);
  font-size: 16px;
  font-style: italic;
  font-weight: 700;
}
.card-enter-active,
.card-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.card-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}
.card-leave-to {
  opacity: 0;
}

/* ===== Dandelion ===== */
.dande {
  position: absolute;
  left: 50%;
  bottom: -24px;
  width: min(52cqi, 200px);
  height: auto;
  overflow: visible;
  translate: -50% 0;
}
.stalk {
  fill: none;
  stroke: #4aa35f;
  stroke-width: 5;
  stroke-linecap: round;
}
.blade {
  fill: #5cb86d;
  stroke: #3f9b5a;
  stroke-width: 1;
}
.core {
  fill: #b9a36c;
  stroke: #8d7a47;
  stroke-width: 1;
}
.thread {
  stroke: #d6cfb4;
  stroke-width: 1;
}
.puff {
  fill: none;
  stroke: #fff;
  stroke-width: 1.4;
  stroke-linecap: round;
}
.puff-core {
  fill: #fffdf0;
}
.seed {
  transform-box: fill-box;
  transform-origin: center;
  filter: drop-shadow(0 1px 1px rgb(60 90 60 / 0.25));
}
.seed.blown {
  opacity: 0;
  translate: var(--fx) var(--fy);
  rotate: var(--fr);
  transition:
    translate 3.4s cubic-bezier(0.2, 0.6, 0.3, 1),
    rotate 3.4s ease,
    opacity 1.2s ease 2.2s;
}

.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1.6%;
  z-index: 2;
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
  bottom: 4%;
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
  transition: opacity 0.9s ease 2s, transform 0.9s ease 2s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@container (max-height: 620px) {
  .head {
    top: 4%;
  }
  .wish-slot {
    top: 19%;
    min-height: 74px;
  }
  .dande {
    width: min(44cqi, 170px);
  }
}
</style>