<template>
  <!-- CONNECT THE CONSTELLATION: i-drag ang daliri mula bituin hanggang bituin (o i-tap isa-isa)
       para mabuo ang hugis-pusong constellation na ipinangalan sa may birthday. -->
  <section class="constellation-stage" :class="{ done }">
    <header class="head">
      <p class="eyebrow">{{ done ? "Look up" : "Connect the stars" }}</p>
      <h2>
        <Transition name="swap" mode="out-in">
          <span :key="done">{{ done ? `The ${recipient} constellation` : "Draw a line from star to star" }}</span>
        </Transition>
      </h2>
    </header>

    <svg
      ref="svgEl"
      class="sky-box"
      viewBox="0 0 100 100"
      tabindex="0"
      role="button"
      :aria-label="done ? `The ${recipient} constellation` : `Connect star ${count + 1} of ${points.length}`"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown.enter.prevent="connect(count)"
      @keydown.space.prevent="connect(count)"
    >
      <polyline class="lines" :points="linePoints" />
      <line
        v-if="pointer && !done && count > 0"
        class="live"
        :x1="points[count - 1].x"
        :y1="points[count - 1].y"
        :x2="pointer.x"
        :y2="pointer.y"
      />
      <g
        v-for="(point, index) in points"
        :key="index"
        class="star"
        :class="{ lit: index < count, next: index === count && !done }"
      >
        <circle class="glow" :cx="point.x" :cy="point.y" r="3.4" />
        <circle class="core" :cx="point.x" :cy="point.y" r="1.3" />
      </g>
    </svg>

    <p v-if="!done" class="hint">{{ count }} / {{ points.length }} stars · start at the glowing one</p>
    <p v-else class="caption">Found in the sky on your birthday ✦</p>

    <Transition name="rise">
      <button v-if="done" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
});
const emit = defineEmits(["complete", "done"]);

// 12 bituin sa hugis puso (parametric heart), sunod-sunod paikot
const points = Array.from({ length: 12 }, (_, i) => {
  const t = (i / 12) * Math.PI * 2;
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x: 50 + x * 2.6, y: 46 - y * 2.6 };
});
const HIT_RADIUS = 7; // sa viewBox units

const svgEl = ref(null);
const count = ref(0);
const done = ref(false);
const pointer = ref(null);
let dragging = false;

const linePoints = computed(() => {
  const lit = points.slice(0, count.value);
  if (done.value) lit.push(points[0]); // isara ang puso
  return lit.map((point) => `${point.x},${point.y}`).join(" ");
});

// client coords → viewBox coords (gumagana kahit naka-scale ang device preview)
function toSvg(event) {
  const svg = svgEl.value;
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function tryConnect(event) {
  const p = toSvg(event);
  pointer.value = { x: p.x, y: p.y };
  const next = points[count.value];
  if (next && Math.hypot(p.x - next.x, p.y - next.y) < HIT_RADIUS) connect(count.value);
}

function connect(index) {
  if (done.value || index !== count.value) return;
  count.value += 1;
  navigator.vibrate?.(12);
  if (count.value === points.length) {
    done.value = true;
    pointer.value = null;
    emit("complete", svgEl.value);
  }
}

function onDown(event) {
  if (done.value) return;
  dragging = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  tryConnect(event);
}
function onMove(event) {
  if (dragging && !done.value) tryConnect(event);
}
function onUp() {
  dragging = false;
  pointer.value = null;
}
</script>

<style scoped>
.constellation-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 130px 22px 150px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
}
.eyebrow {
  margin: 0;
  color: #f1d3a6;
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #f4e9f7;
  font-family: var(--font-serif);
  font-size: clamp(24px, 7.4cqi, 36px);
  font-weight: 400;
  line-height: 1.15;
  text-shadow: 0 0 22px rgb(214 178 240 / 0.5);
}
.sky-box {
  flex: 0 1 auto;
  width: min(100%, 360px, 42cqh);
  aspect-ratio: 1;
  overflow: visible;
  cursor: crosshair;
  touch-action: none;
  outline: none;
}
.sky-box:focus-visible .next .glow {
  stroke: #fff;
  stroke-width: 0.6;
}
.lines {
  fill: none;
  stroke: #f6dcb0;
  stroke-width: 0.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 1.5px #f4bcd6);
}
.done .lines {
  stroke-width: 0.8;
  animation: glow 2.4s ease-in-out infinite alternate;
}
.live {
  stroke: rgb(246 220 176 / 0.55);
  stroke-width: 0.45;
  stroke-dasharray: 1.2 1;
  stroke-linecap: round;
}
.star .glow {
  fill: rgb(255 246 230 / 0.15);
  transition: fill 0.3s ease, r 0.3s ease;
}
.star .core {
  fill: rgb(255 246 230 / 0.6);
  transition: fill 0.3s ease;
}
.star.lit .glow {
  fill: rgb(244 188 214 / 0.35);
}
.star.lit .core,
.star.next .core {
  fill: #fff;
}
.star.next .glow {
  fill: rgb(255 236 214 / 0.45);
  animation: beckon 1.1s ease-in-out infinite alternate;
  transform-box: fill-box;
  transform-origin: center;
}
.done .star .core {
  filter: drop-shadow(0 0 1.5px #fff);
}
.hint,
.caption {
  margin: 0;
  color: rgb(253 242 248 / 0.85);
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  text-shadow: 0 2px 8px rgb(10 6 30 / 0.8);
}
.caption {
  color: #f1d3a6;
}
.next {
  margin-top: 6px;
  padding: 11px 26px;
  border: 1px solid rgb(241 211 166 / 0.7);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #fdf2f8;
  font-family: var(--font-serif);
  font-size: 17px;
  letter-spacing: 0.06em;
  cursor: pointer;
}
.next:hover {
  background: rgb(255 255 255 / 0.2);
}
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.5s ease, filter 0.5s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(6px);
}
.rise-enter-active {
  transition: opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes beckon {
  to {
    transform: scale(1.6);
  }
}
@keyframes glow {
  to {
    filter: drop-shadow(0 0 3px #f4bcd6);
  }
}
@container (max-height: 620px) {
  .constellation-stage {
    padding: 20px 22px 50px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .star.next .glow,
  .done .lines {
    animation: none;
  }
}
</style>
