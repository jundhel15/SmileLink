<template>
  <!-- 5) LIFT THE SUN: madaling-araw pa lang. Hilahin pataas ang inaantok na araw mula sa likod ng mga bundok.
       Habang tumataas, nagbabago ang langit mula gabi tungo umaga, at kapag sumikat na, lalabas ang pinakamahabang sulat.
       Kapag binitawan bago makarating, dahan-dahan itong babalik sa ilalim. -->
  <section ref="stageEl" class="sr-stage" :class="{ 'is-done': done }" :style="{ '--p': p }">
    <span class="sr-sky night" />
    <span class="sr-sky dawn" />
    <span class="sr-stars"><i v-for="s in stars" :key="s.id" :style="s.style" /></span>
    <span class="sr-rays" />

    <header class="sr-head">
      <p class="sr-eyebrow">{{ done ? `Month ${monthCount}` : "Before sunrise" }}</p>
      <h2>{{ done ? "Good morning" : "Lift the sun" }}</h2>
    </header>

    <button
      ref="sunEl"
      class="sr-sun"
      :class="{ drag: dragging }"
      type="button"
      aria-label="Drag the sun up"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="up"
      @keydown.enter.prevent="nudge"
      @keydown.space.prevent="nudge"
    >
      <span class="sr-face"><i /><i /><b /></span>
    </button>
    <span v-if="!done" class="sr-arrow" aria-hidden="true">↑</span>

    <svg class="sr-hills night" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 140V70Q40 40 90 62Q140 20 200 58Q260 30 310 60Q360 40 400 66V140Z" />
      <path class="front" d="M0 140V96Q60 70 120 94Q190 64 250 96Q320 74 400 98V140Z" />
    </svg>
    <svg class="sr-hills day" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 140V70Q40 40 90 62Q140 20 200 58Q260 30 310 60Q360 40 400 66V140Z" />
      <path class="front" d="M0 140V96Q60 70 120 94Q190 64 250 96Q320 74 400 98V140Z" />
    </svg>

    <svg v-for="b in 3" :key="`b${b}`" class="sr-bird" :class="`b${b}`" viewBox="0 0 24 10" aria-hidden="true">
      <path d="M1 8Q6 -2 12 6Q18 -2 23 8" />
    </svg>

    <Transition name="sr-card">
      <article v-if="done" class="sr-card">
        <img v-if="photo" class="sr-clip" :src="photo" alt="" draggable="false" />
        <p class="sr-to">Dear {{ recipient }},</p>
        <p class="sr-body">{{ letter }}</p>
        <p class="sr-sig">— {{ sender }}</p>
      </article>
    </Transition>

    <p v-if="!done" class="sr-hint">Pull the sun up · {{ Math.round(p * 100) }}%</p>

    <Transition name="sr-rise">
      <button v-if="done" class="sr-next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  letter: { type: String, required: true },
  monthCount: { type: Number, default: 1 },
  photo: { type: String, default: "" },
});
const emit = defineEmits(["risen", "done"]);

const stageEl = ref(null);
const sunEl = ref(null);
const p = ref(0); // 0 = nakatago sa bundok, 1 = sumikat na
const dragging = ref(false);
const done = ref(false);

const stars = Array.from({ length: 30 }, (_, id) => {
  const size = 1.5 + Math.random() * 2.5;
  return {
    id,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 55}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${2 + Math.random() * 3}s`,
      animationDelay: `${-Math.random() * 4}s`,
    },
  };
});

let startY = 0;
let startP = 0;
let height = 1;
let frame = 0;
let last = 0;

const clamp = (v) => Math.max(0, Math.min(1, v));

function down(event) {
  if (done.value) return;
  height = stageEl.value.getBoundingClientRect().height || 1;
  startY = event.clientY;
  startP = p.value;
  dragging.value = true;
  sunEl.value.setPointerCapture?.(event.pointerId);
}
function move(event) {
  if (!dragging.value || done.value) return;
  // ang araw ay umaakyat ng 48% ng taas ng eksena, kaya ganito ang sukat para sumunod ang daliri
  p.value = clamp(startP + (startY - event.clientY) / (height * 0.48));
  if (p.value >= 0.985) finish();
}
function up() {
  dragging.value = false;
}
function nudge() {
  if (done.value) return;
  p.value = clamp(p.value + 0.34);
  if (p.value >= 0.985) finish();
}

function finish() {
  if (done.value) return;
  done.value = true;
  dragging.value = false;
  p.value = 1;
  navigator.vibrate?.([30, 40, 60]);
  emit("risen", sunEl.value);
}

// kapag binitawan, dahan-dahang lulubog ang araw
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  if (!dragging.value && !done.value && p.value > 0) p.value = Math.max(0, p.value - dt * 0.22);
  frame = requestAnimationFrame(tick);
}

onMounted(() => {
  frame = requestAnimationFrame(tick);
});
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<style scoped>
.sr-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.sr-sky {
  position: absolute;
  inset: 0;
}
.sr-sky.night {
  background: linear-gradient(180deg, #171332, #33264d 60%, #5a3c52);
}
.sr-sky.dawn {
  background: linear-gradient(180deg, #8fd0e8, #ffe3b8 58%, #ffb27a);
  opacity: var(--p);
}
.sr-stars {
  position: absolute;
  inset: 0;
  opacity: calc(1 - var(--p) * 1.5);
}
.sr-stars i {
  position: absolute;
  border-radius: 50%;
  background: #fff7d6;
  animation: sr-twinkle ease-in-out infinite alternate;
}
.sr-rays {
  position: absolute;
  left: 50%;
  top: calc(72% - var(--p) * 48%);
  width: 170%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: repeating-conic-gradient(rgb(255 236 170 / 0.4) 0 8deg, transparent 8deg 20deg);
  opacity: var(--p);
  pointer-events: none;
  translate: -50% -50%;
  mask: radial-gradient(circle, #000 0, transparent 62%);
  -webkit-mask: radial-gradient(circle, #000 0, transparent 62%);
  animation: sr-spin 50s linear infinite;
}

.sr-head {
  position: absolute;
  z-index: 6;
  top: 8%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  pointer-events: none;
  transform: translateX(-50%);
}
.sr-eyebrow {
  margin: 0;
  color: #fff7e6;
  font-family: var(--font-type);
  font-size: 12px;
  letter-spacing: 0.3em;
  text-shadow: 0 2px 8px rgb(60 30 10 / 0.6);
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #fff7e6;
  font-family: var(--font-head);
  font-size: clamp(28px, 8.4cqi, 42px);
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 2px 12px rgb(60 30 10 / 0.6);
}

/* ===== Araw ===== */
.sr-sun {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: calc(72% - var(--p) * 48%);
  display: grid;
  width: 80px;
  height: 80px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, #fff6b8, #ffd25a 55%, #f4a02c);
  box-shadow: 0 0 calc(24px + var(--p) * 70px) calc(6px + var(--p) * 30px) rgb(255 205 110 / 0.6);
  cursor: grab;
  touch-action: none;
  translate: -50% -50%;
}
.sr-sun.drag {
  cursor: grabbing;
}
.sr-sun:focus-visible {
  outline: 3px dashed #fff7e6;
  outline-offset: 6px;
}
.sr-face {
  position: relative;
  display: block;
  width: 56px;
  height: 40px;
}
.sr-face i {
  position: absolute;
  top: 6px;
  width: 8px;
  height: calc(2px + var(--p) * 7px);
  border-radius: 50%;
  background: #6b3a14;
}
.sr-face i:first-child {
  left: 10px;
}
.sr-face i:nth-child(2) {
  right: 10px;
}
.sr-face b {
  position: absolute;
  left: 50%;
  bottom: 4px;
  width: calc(10px + var(--p) * 12px);
  height: calc(4px + var(--p) * 9px);
  border-bottom: 3px solid #6b3a14;
  border-radius: 0 0 50% 50%;
  translate: -50% 0;
}
.sr-arrow {
  position: absolute;
  z-index: 3;
  left: 50%;
  top: calc(72% - var(--p) * 48% - 66px);
  color: #fff7e6;
  font-family: var(--font-head);
  font-size: 30px;
  font-weight: 700;
  pointer-events: none;
  text-shadow: 0 2px 8px rgb(60 30 10 / 0.6);
  translate: -50% 0;
  animation: sr-arrow 1s ease-in-out infinite alternate;
}

/* ===== Bundok at ibon ===== */
.sr-hills {
  position: absolute;
  z-index: 3;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 30%;
  pointer-events: none;
}
.sr-hills.night {
  opacity: calc(1 - var(--p));
}
.sr-hills.day {
  opacity: var(--p);
}
.sr-hills.night path {
  fill: #2d2447;
}
.sr-hills.night path.front {
  fill: #1f1a36;
}
.sr-hills.day path {
  fill: #86a86a;
}
.sr-hills.day path.front {
  fill: #5f8a52;
}
.sr-bird {
  position: absolute;
  z-index: 2;
  top: 22%;
  left: -40px;
  width: 24px;
  fill: none;
  opacity: 0;
  stroke: #5a3a22;
  stroke-width: 1.6;
  stroke-linecap: round;
}
.sr-bird.b2 {
  top: 30%;
  width: 18px;
}
.sr-bird.b3 {
  top: 17%;
  width: 20px;
}
.is-done .sr-bird {
  animation: sr-fly 9s linear infinite;
}
.is-done .sr-bird.b2 {
  animation-delay: 1.4s;
}
.is-done .sr-bird.b3 {
  animation-delay: 3s;
}

/* ===== Sulat ===== */
.sr-card {
  position: absolute;
  z-index: 5;
  left: 50%;
  top: 34%;
  width: min(90cqi, 360px);
  max-height: 46cqh;
  padding: 18px 20px 14px;
  overflow-y: auto;
  border: 2px solid #fff;
  border-radius: 8px;
  background:
    repeating-linear-gradient(0deg, transparent 0 27px, rgb(122 75 42 / 0.13) 27px 28px),
    linear-gradient(180deg, #fffaf0, #fbefd6);
  box-shadow: 0 20px 38px rgb(74 47 28 / 0.4);
  translate: -50% 0;
}
.sr-clip {
  float: right;
  width: 78px;
  height: 78px;
  margin: 0 0 6px 10px;
  padding: 4px 4px 14px;
  background: #fff;
  box-shadow: 0 4px 10px rgb(74 47 28 / 0.3);
  object-fit: cover;
  pointer-events: none;
  rotate: 5deg;
}
.sr-to {
  margin: 0 0 6px;
  color: var(--accent);
  font-family: var(--font-hand);
  font-size: 34px;
  font-weight: 700;
  line-height: 1.1;
}
.sr-body {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: clamp(21px, 6cqi, 26px);
  line-height: 1.26;
}
.sr-sig {
  margin: 10px 0 0;
  color: var(--brown);
  font-family: var(--font-hand);
  font-size: 28px;
  font-weight: 700;
  text-align: right;
}
.sr-card-enter-active {
  transition: opacity 0.9s ease 0.5s, transform 0.9s cubic-bezier(0.2, 1.1, 0.4, 1) 0.5s;
}
.sr-card-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.sr-hint {
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
.sr-next {
  position: absolute;
  z-index: 7;
  left: 50%;
  bottom: 3.5%;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 10px 22px rgb(74 47 28 / 0.4);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.sr-rise-enter-active {
  transition: opacity 0.8s ease 1.6s, transform 0.8s ease 1.6s;
}
.sr-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes sr-twinkle {
  from {
    opacity: 0.25;
  }
  to {
    opacity: 1;
  }
}
@keyframes sr-spin {
  to {
    rotate: 360deg;
  }
}
@keyframes sr-arrow {
  to {
    transform: translateY(-9px);
  }
}
@keyframes sr-fly {
  0% {
    opacity: 0;
    transform: translate(0, 0);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(480px, -40px);
  }
}
@container (max-height: 620px) {
  .sr-head {
    top: 4%;
  }
  .sr-card {
    top: 31%;
    max-height: 48cqh;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sr-rays,
  .sr-arrow,
  .sr-stars i {
    animation: none;
  }
  .is-done .sr-bird {
    animation: none;
  }
}
</style>