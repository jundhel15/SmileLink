<template>
  <!-- 2) TRACE THE HEART: hilahin ang daliri sa mga tuldok na hugis puso. Bawat madaanan ay nagiging bituin;
       kapag halos kumpleto na, sisindi ang buong puso at lalabas ang bilang ng buwan at ang inyong mga pangalan. -->
  <section class="ht-stage">
    <header class="ht-head">
      <p class="ht-eyebrow">{{ done ? "Our constellation" : `${percent}% lit` }}</p>
      <h2>{{ done ? "Written in the stars" : "Trace the heart" }}</h2>
    </header>

    <div
      ref="wrapEl"
      class="ht-wrap"
      :class="{ 'is-done': done }"
      tabindex="0"
      role="button"
      aria-label="Trace the heart with your finger"
      @keydown.enter.prevent="complete"
      @keydown.space.prevent="complete"
    >
      <svg
        ref="svgEl"
        class="ht-svg"
        viewBox="0 0 200 190"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
      >
        <defs>
          <linearGradient id="ht-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ff8fab" />
            <stop offset="1" stop-color="#e5384f" />
          </linearGradient>
        </defs>
        <path :d="outline" class="ht-fill" />
        <path :d="outline" class="ht-ghost" />
        <line v-for="(s, k) in segs" :key="k" :x1="s.x1" :y1="s.y1" :x2="s.x2" :y2="s.y2" class="ht-seg" />
        <circle v-if="litCount === 0" :cx="pts[0].x" :cy="pts[0].y" r="9" class="ht-start" />
        <circle
          v-for="(p, i) in pts"
          :key="i"
          :cx="p.x"
          :cy="p.y"
          :r="lit[i] ? 4.4 : 3"
          class="ht-node"
          :class="{ on: lit[i] }"
          :style="{ animationDelay: (i % 7) * 0.25 + 's' }"
        />
      </svg>

      <div class="ht-center" aria-hidden="true">
        <small>Month</small>
        <b>{{ monthCount }}</b>
        <span>{{ recipient }} ♥ {{ sender }}</span>
        <em v-if="sinceDate">since {{ sinceDate }}</em>
      </div>
    </div>

    <p v-if="!done" class="ht-hint">Drag your finger along the dots</p>

    <Transition name="ht-rise">
      <button v-if="done" class="ht-next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  monthCount: { type: Number, default: 1 },
  sinceDate: { type: String, default: "" },
});
const emit = defineEmits(["completed", "done"]);

const N = 44; // dami ng bituin sa puso
const R = 14; // gaano kalapit ang daliri para masindihan ang bituin (svg units)

function heartAt(t) {
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x: +(100 + x * 5.6).toFixed(1), y: +(80 - y * 5.4).toFixed(1) };
}

// nagsisimula sa ibabang dulo ng puso at umiikot pataas
const pts = Array.from({ length: N }, (_, i) => heartAt(Math.PI + (i / N) * Math.PI * 2));
const outline = (() => {
  const steps = 120;
  const list = Array.from({ length: steps }, (_, i) => heartAt(Math.PI + (i / steps) * Math.PI * 2));
  return `M${list.map((p) => `${p.x} ${p.y}`).join(" L")} Z`;
})();

const wrapEl = ref(null);
const svgEl = ref(null);
const lit = ref(Array(N).fill(false));
const done = ref(false);

const litCount = computed(() => lit.value.filter(Boolean).length);
const percent = computed(() => Math.round((litCount.value / N) * 100));
const segs = computed(() =>
  pts.flatMap((p, i) => {
    const j = (i + 1) % N;
    return lit.value[i] && lit.value[j] ? [{ x1: p.x, y1: p.y, x2: pts[j].x, y2: pts[j].y }] : [];
  }),
);

let last = null;
let dragging = false;

// posisyon ng daliri sa loob ng svg (kasama na ang scale ng preview)
function toSvg(event) {
  const r = svgEl.value.getBoundingClientRect();
  return {
    x: ((event.clientX - r.left) * 200) / (r.width || 1),
    y: ((event.clientY - r.top) * 190) / (r.height || 1),
  };
}

function distToSeg(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function down(event) {
  if (done.value) return;
  dragging = true;
  last = toSvg(event);
  svgEl.value.setPointerCapture?.(event.pointerId);
  light(last, last);
}
function move(event) {
  if (!dragging || done.value) return;
  const cur = toSvg(event);
  light(last, cur);
  last = cur;
}
function up() {
  dragging = false;
}

function light(a, b) {
  let changed = false;
  pts.forEach((p, i) => {
    if (!lit.value[i] && distToSeg(p, a, b) < R) {
      lit.value[i] = true;
      changed = true;
    }
  });
  if (changed) {
    navigator.vibrate?.(8);
    if (litCount.value / N >= 0.92) complete();
  }
}

function complete() {
  if (done.value) return;
  done.value = true;
  dragging = false;
  lit.value = Array(N).fill(true);
  navigator.vibrate?.([30, 40, 30]);
  emit("completed", wrapEl.value);
}
</script>

<style scoped>
.ht-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.ht-head {
  position: absolute;
  top: 9%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.ht-eyebrow {
  margin: 0;
  color: #ffd6e4;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #fff;
  font-family: var(--font-head);
  font-size: clamp(28px, 8.4cqi, 42px);
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 2px 12px rgb(43 23 69 / 0.5);
}

/* ===== Puso ===== */
.ht-wrap {
  position: absolute;
  left: 50%;
  top: 22%;
  width: min(86cqi, 340px);
  aspect-ratio: 200 / 190;
  outline: none;
  translate: -50% 0;
}
.ht-wrap:focus-visible {
  outline: 2px dashed #ffe9a8;
  outline-offset: 6px;
}
.ht-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  cursor: crosshair;
  touch-action: none;
  transition: filter 1s ease;
}
.is-done .ht-svg {
  filter: drop-shadow(0 0 16px rgb(255 120 160 / 0.9));
}
.ht-fill {
  fill: url(#ht-grad);
  opacity: 0;
  transition: opacity 1.4s ease;
}
.is-done .ht-fill {
  opacity: 0.88;
}
.ht-ghost {
  fill: none;
  stroke: rgb(255 255 255 / 0.4);
  stroke-width: 3;
  stroke-dasharray: 1 7;
  stroke-linecap: round;
}
.ht-seg {
  stroke: #ffd6e4;
  stroke-width: 2.4;
  stroke-linecap: round;
  opacity: 0.9;
}
.ht-node {
  fill: rgb(255 255 255 / 0.55);
  pointer-events: none;
}
.ht-node.on {
  fill: #ffe9a8;
  filter: drop-shadow(0 0 5px #ffd36e);
  animation: ht-twinkle 1.6s ease-in-out infinite alternate;
}
.ht-start {
  fill: none;
  stroke: #ffe9a8;
  stroke-width: 2;
  transform-box: fill-box;
  transform-origin: center;
  animation: ht-ping 1.2s ease-out infinite;
  pointer-events: none;
}

.ht-center {
  position: absolute;
  left: 50%;
  top: 44%;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 62%;
  color: #fff;
  opacity: 0;
  pointer-events: none;
  text-align: center;
  text-shadow: 0 2px 8px rgb(122 43 69 / 0.5);
  translate: -50% -50%;
}
.is-done .ht-center {
  opacity: 1;
  transition: opacity 1s ease 0.5s;
}
.ht-center small {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.ht-center b {
  font-family: var(--font-head);
  font-size: clamp(44px, 14cqi, 62px);
  line-height: 1;
}
.ht-center span {
  margin-top: 2px;
  font-family: var(--font-script);
  font-size: clamp(22px, 6.4cqi, 28px);
  line-height: 1.15;
}
.ht-center em {
  margin-top: 4px;
  font-family: var(--font-body);
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0.1em;
  opacity: 0.9;
}

.ht-hint {
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
  text-shadow: 0 2px 8px rgb(43 23 69 / 0.6);
  pointer-events: none;
}
.ht-next {
  position: absolute;
  left: 50%;
  bottom: 3.5%;
  z-index: 4;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: #e9677c;
  box-shadow: 0 10px 22px rgb(0 0 0 / 0.3);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.ht-rise-enter-active {
  transition: opacity 0.9s ease 1.4s, transform 0.9s ease 1.4s;
}
.ht-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes ht-twinkle {
  from {
    opacity: 0.65;
  }
  to {
    opacity: 1;
  }
}
@keyframes ht-ping {
  from {
    opacity: 1;
    scale: 0.6;
  }
  to {
    opacity: 0;
    scale: 1.8;
  }
}
@container (max-height: 620px) {
  .ht-head {
    top: 5%;
  }
  .ht-wrap {
    top: 19%;
    width: min(72cqi, 280px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ht-node.on,
  .ht-start {
    animation: none;
  }
}
</style>