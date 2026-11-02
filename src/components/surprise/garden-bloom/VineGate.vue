<template>
  <!-- 4) VINE & GATE: sundan ng daliri ang kumikinang na tuldok para palaguin ang baging na may bulaklak hanggang sa
       pintuan ng hardin. Pagdating doon, bubukas ang gate at lilitaw ang sulat. -->
  <section class="vine-stage" :class="{ opened }">
    <header class="head">
      <p class="eyebrow">{{ opened ? "The garden gate" : "Follow the glow" }}</p>
      <h2>{{ opened ? "Come on in" : "Grow the vine to the gate" }}</h2>
    </header>

    <svg
      ref="svgEl"
      class="vine-svg"
      :class="{ faded: showLetter }"
      viewBox="0 0 300 500"
      tabindex="0"
      role="slider"
      aria-label="Grow the vine"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(percent * 100)"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown.right.prevent="setCur(cur + len * 0.06)"
      @keydown.enter.prevent="setCur(cur + len * 0.06)"
      @keydown.space.prevent="setCur(cur + len * 0.06)"
    >
      <defs>
        <radialGradient id="gb-gate-glow">
          <stop offset="0" stop-color="#fff6c8" stop-opacity="0.95" />
          <stop offset="1" stop-color="#fff6c8" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- gate -->
      <g class="gate" :style="{ '--o': opened ? 1 : 0 }">
        <circle cx="150" cy="104" r="60" fill="url(#gb-gate-glow)" class="gate-glow" />
        <rect x="108" y="62" width="10" height="78" class="post" />
        <rect x="182" y="62" width="10" height="78" class="post" />
        <rect x="118" y="74" width="32" height="66" class="door l" />
        <rect x="150" y="74" width="32" height="66" class="door r" />
        <path d="M112 72 Q150 22 188 72" class="arch" />
      </g>

      <path :d="PATH_D" class="guide" />
      <path ref="pathEl" :d="PATH_D" class="vine" :style="{ strokeDasharray: len, strokeDashoffset: len - cur }" />

      <g v-for="(d, i) in deco" :key="i" :transform="`translate(${d.x} ${d.y})`">
        <g class="deco" :class="{ on: cur >= d.l }">
          <path v-if="d.type === 'leaf'" d="M0 0 C6 -10 18 -10 24 0 C18 10 6 10 0 0Z" class="leaf" :transform="`rotate(${d.r})`" />
          <g v-else>
            <circle
              v-for="a in [0, 72, 144, 216, 288]"
              :key="a"
              cx="0"
              cy="-6.5"
              r="4.6"
              :fill="d.color"
              :transform="`rotate(${a})`"
              class="petal"
            />
            <circle r="3.2" class="core" />
          </g>
        </g>
      </g>

      <circle v-if="!opened" class="tip-glow" :cx="tip.x" :cy="tip.y" r="16" />
      <circle v-if="!opened" class="tip" :cx="tip.x" :cy="tip.y" r="7" />
    </svg>

    <p v-if="!opened" class="hint">Drag along the glowing path · {{ Math.round(percent * 100) }}%</p>

    <Transition name="unfold">
      <article v-if="showLetter" ref="letterEl" class="letter">
        <img v-if="photo" class="clip" :src="photo" alt="" draggable="false" />
        <p class="to">Dear {{ recipient }},</p>
        <p class="body">{{ letter }}</p>
        <p class="sig">— {{ sender }}</p>
      </article>
    </Transition>

    <Transition name="rise">
      <button v-if="showLetter" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  letter: { type: String, required: true },
  photo: { type: String, default: "" },
});
const emit = defineEmits(["opened", "done"]);

// daan ng baging: mula sa ibabang-kaliwa hanggang sa pintuan sa itaas
const PATH_D = "M40 470 C40 400 250 410 250 335 S50 280 60 205 S210 160 150 118";
const FLOWER_COLORS = ["#ff8fab", "#ffd166", "#b8a1f0", "#ff9e7a"];

const svgEl = ref(null);
const pathEl = ref(null);
const letterEl = ref(null);
const len = ref(1);
const cur = ref(0); // haba ng baging na tumubo na
const tip = ref({ x: 40, y: 470 });
const deco = ref([]);
const opened = ref(false);
const showLetter = ref(false);

const percent = computed(() => cur.value / (len.value || 1));
let dragging = false;
let timer = 0;

function setCur(l) {
  if (opened.value || l <= cur.value) return;
  cur.value = Math.min(len.value, l);
  const pt = pathEl.value.getPointAtLength(cur.value);
  tip.value = { x: pt.x, y: pt.y };
  if (cur.value >= len.value * 0.985) open();
}

function open() {
  cur.value = len.value;
  opened.value = true;
  navigator.vibrate?.([30, 50, 30]);
  emit("opened", svgEl.value);
  timer = setTimeout(() => (showLetter.value = true), 1400);
}

// pointer → coordinates ng SVG (isinasaalang-alang ang "meet" scaling at ang pag-scale ng preview)
function toSvg(event) {
  const r = svgEl.value.getBoundingClientRect();
  const s = Math.min(r.width / 300, r.height / 500) || 1;
  const ox = r.left + (r.width - 300 * s) / 2;
  const oy = r.top + (r.height - 500 * s) / 2;
  return { x: (event.clientX - ox) / s, y: (event.clientY - oy) / s };
}

// hanapin ang pinakamalayong punto ng daan (sa harap lang ng dulo ng baging) na malapit sa daliri
function follow(event) {
  if (opened.value) return;
  const p = toSvg(event);
  const start = cur.value;
  let best = -1;
  for (let l = start; l <= Math.min(len.value, start + 130); l += 3) {
    const q = pathEl.value.getPointAtLength(l);
    if (Math.hypot(q.x - p.x, q.y - p.y) < 38) best = l;
  }
  if (best >= 0) setCur(best);
}

function onDown(event) {
  if (opened.value) return;
  dragging = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  follow(event);
}
function onMove(event) {
  if (dragging) follow(event);
}
function onUp() {
  dragging = false;
}

onMounted(() => {
  len.value = pathEl.value.getTotalLength();
  const pts = [0.1, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63, 0.72, 0.8, 0.88, 0.95];
  deco.value = pts.map((f, i) => {
    const l = f * len.value;
    const a = pathEl.value.getPointAtLength(l);
    const b = pathEl.value.getPointAtLength(Math.min(len.value, l + 2));
    const heading = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    const flower = i % 2 === 1;
    return {
      type: flower ? "flower" : "leaf",
      x: a.x,
      y: a.y,
      l,
      r: heading + (i % 4 === 0 ? 65 : -65),
      color: FLOWER_COLORS[Math.floor(i / 2) % FLOWER_COLORS.length],
    };
  });
});
onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
.vine-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.head {
  position: absolute;
  top: 8%;
  left: 50%;
  z-index: 3;
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
  color: #6b4a1f;
  font-family: var(--font-head);
  font-size: clamp(24px, 7cqi, 36px);
  font-weight: 600;
  line-height: 1.15;
}

.vine-svg {
  position: absolute;
  top: 17%;
  left: 50%;
  height: 74%;
  aspect-ratio: 3 / 5;
  overflow: visible;
  outline: none;
  touch-action: none;
  translate: -50% 0;
  cursor: crosshair;
  transition: opacity 1s ease;
}
.vine-svg.faded {
  opacity: 0.18;
  pointer-events: none;
}
.vine-svg:focus-visible {
  outline: 2px dashed #2f5d3a;
  outline-offset: 6px;
}
.guide {
  fill: none;
  stroke: rgb(255 255 255 / 0.85);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 2 10;
}
.vine {
  fill: none;
  stroke: #3f9b5a;
  stroke-width: 7;
  stroke-linecap: round;
}
.deco {
  transform-box: fill-box;
  transform-origin: center;
  scale: 0;
  transition: scale 0.6s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.deco.on {
  scale: 1;
}
.leaf {
  fill: #5cb86d;
  stroke: #3f9b5a;
  stroke-width: 1;
}
.petal {
  stroke: rgb(120 60 80 / 0.25);
  stroke-width: 0.6;
}
.core {
  fill: #fff1b8;
  stroke: #e0a93a;
  stroke-width: 0.8;
}
.tip {
  fill: #fff6c8;
  stroke: #ffb703;
  stroke-width: 3;
}
.tip-glow {
  fill: rgb(255 240 150 / 0.55);
  animation: tip-pulse 1.1s ease-in-out infinite alternate;
  transform-box: fill-box;
  transform-origin: center;
}

/* ===== Gate ===== */
.post {
  fill: #a9703d;
  stroke: #7a4c27;
  stroke-width: 1.2;
}
.arch {
  fill: none;
  stroke: #a9703d;
  stroke-width: 8;
  stroke-linecap: round;
}
.door {
  fill: #c8935a;
  stroke: #7a4c27;
  stroke-width: 1.4;
  transition: scale 1.5s cubic-bezier(0.3, 0.8, 0.3, 1);
  transform-box: fill-box;
  scale: 1 1;
}
.door.l {
  transform-origin: left center;
}
.door.r {
  transform-origin: right center;
}
.gate .door {
  scale: calc(1 - var(--o) * 0.88) 1;
}
.gate-glow {
  opacity: var(--o);
  transition: opacity 1.4s ease 0.3s;
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
  text-shadow: 0 2px 8px rgb(80 50 20 / 0.55);
  pointer-events: none;
}

/* ===== Sulat ===== */
.letter {
  position: absolute;
  top: 19%;
  left: 50%;
  z-index: 4;
  width: min(100% - 36px, 360px);
  max-height: 58cqh;
  padding: 20px 22px 14px;
  overflow-y: auto;
  border: 2px solid #8fc58f;
  border-radius: 6px;
  background:
    radial-gradient(ellipse at 30% 0%, rgb(255 255 255 / 0.75), transparent 60%),
    linear-gradient(180deg, #fffaf0, #f9efd6);
  box-shadow:
    0 0 0 5px rgb(255 255 255 / 0.7),
    0 18px 36px rgb(80 60 30 / 0.3);
  transform: translateX(-50%);
}
.clip {
  float: right;
  width: 78px;
  height: 78px;
  margin: 0 0 6px 10px;
  padding: 4px 4px 14px;
  background: #fff;
  box-shadow: 0 4px 10px rgb(80 50 20 / 0.3);
  object-fit: cover;
  pointer-events: none;
  rotate: 5deg;
}
.to {
  margin: 0 0 6px;
  color: #3f7a4f;
  font-family: var(--font-script);
  font-size: 30px;
  line-height: 1.15;
}
.body {
  margin: 0;
  color: #5a4426;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.55;
}
.sig {
  margin: 10px 0 0;
  color: #3f7a4f;
  font-family: var(--font-script);
  font-size: 26px;
  text-align: right;
}
.unfold-enter-active {
  transition: opacity 0.8s ease, clip-path 1.6s cubic-bezier(0.3, 0.7, 0.3, 1);
}
.unfold-enter-from {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
}

.next {
  position: absolute;
  left: 50%;
  bottom: 3.5%;
  z-index: 5;
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
  transition: opacity 0.9s ease 1.4s, transform 0.9s ease 1.4s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes tip-pulse {
  to {
    scale: 1.7;
    opacity: 0.2;
  }
}
@container (max-height: 620px) {
  .head {
    top: 4%;
  }
  .vine-svg {
    top: 14%;
    height: 78%;
  }
  .letter {
    top: 14%;
    max-height: 56cqh;
  }
  .body {
    font-size: 14px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tip-glow {
    animation: none;
  }
}
</style>