<template>
  <!-- 1) SPIN THE GLOBE: hilahin at i-flick ang globo para umikot (may inertia). Pagkatapos ng isang buong ikot,
       lalabas ang selyo ng bilang ng buwan at ang petsa ng simula ng inyong paglalakbay. -->
  <section class="gs-stage">
    <header class="gs-head">
      <p class="gs-eyebrow">{{ done ? "Our little journey" : "Where it all began" }}</p>
      <h2>{{ done ? `Month ${monthCount}` : "Spin the globe" }}</h2>
    </header>

    <div class="gs-wrap" :class="{ 'is-done': done }">
      <span class="gs-orbit" aria-hidden="true"><i>✈</i></span>
      <div
        ref="globeEl"
        class="gs-globe"
        :class="{ grab: dragging }"
        :style="{ '--o': o }"
        tabindex="0"
        role="button"
        aria-label="Spin the globe"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
        @keydown.enter.prevent="kick"
        @keydown.space.prevent="kick"
      >
        <div class="gs-strip">
          <svg v-for="n in 2" :key="n" class="gs-world" viewBox="0 0 400 200" aria-hidden="true">
            <path class="gs-grid" d="M0 50H400M0 100H400M0 150H400M50 0V200M100 0V200M150 0V200M200 0V200M250 0V200M300 0V200M350 0V200" />
            <g class="gs-land">
              <path d="M30 60C50 30 100 35 120 55C135 75 120 100 100 108C80 118 60 100 45 92C32 84 24 72 30 60Z" />
              <path d="M150 40C175 22 215 30 225 52C232 70 215 85 205 100C198 125 185 150 170 140C155 128 160 100 150 85C140 68 138 50 150 40Z" />
              <path d="M250 55C280 35 330 40 360 62C378 78 370 100 345 104C320 108 305 95 285 100C262 106 240 85 250 55Z" />
              <path d="M270 130C290 120 325 125 335 142C342 156 320 170 298 168C275 166 258 148 270 130Z" />
              <path d="M70 140C85 132 105 140 108 156C110 170 90 178 76 170C62 162 58 148 70 140Z" />
              <path d="M200 160C210 154 222 158 222 168C222 176 208 178 202 172C196 168 195 164 200 160Z" />
            </g>
            <g class="gs-pins">
              <path transform="translate(118 70)" d="M0 -2C-5 -9 -13 -2 0 9C13 -2 5 -9 0 -2Z" />
              <path transform="translate(232 98)" d="M0 -2C-5 -9 -13 -2 0 9C13 -2 5 -9 0 -2Z" />
              <path transform="translate(332 82)" d="M0 -2C-5 -9 -13 -2 0 9C13 -2 5 -9 0 -2Z" />
            </g>
          </svg>
        </div>
        <span class="gs-shade" />
      </div>
      <span class="gs-base" />

      <Transition name="gs-pop">
        <div v-if="done" class="gs-badge">
          <small>together for</small>
          <b>{{ monthCount }}</b>
          <small>{{ monthCount === 1 ? "month" : "months" }}</small>
          <em v-if="sinceDate">since {{ sinceDate }}</em>
        </div>
      </Transition>
    </div>

    <p v-if="!done" class="gs-hint">Flick it around · {{ Math.round(progress * 100) }}%</p>

    <Transition name="gs-rise">
      <button v-if="done" class="gs-next" type="button" @click="emit('done')">Start the journey ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

defineProps({
  monthCount: { type: Number, default: 1 },
  sinceDate: { type: String, default: "" },
});
const emit = defineEmits(["spun", "done"]);

const globeEl = ref(null);
const o = ref(0); // posisyon ng mundo, 0..1 = isang buong ikot
const progress = ref(0);
const dragging = ref(false);
const done = ref(false);

const IDLE = 0.025; // mabagal na pag-ikot kapag walang humahawak
let acc = 0;
let vel = 0;
let frame = 0;
let last = 0;
let lastX = 0;
let lastT = 0;

const wrap = (v) => ((v % 1) + 1) % 1;

function spin(step, count = true) {
  o.value = wrap(o.value + step);
  if (done.value || !count) return;
  acc += Math.abs(step);
  progress.value = Math.min(1, acc);
  if (acc >= 1) finish();
}

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  if (!dragging.value) {
    const target = done.value ? 0 : IDLE;
    vel += (target - vel) * (1 - Math.exp(-2.4 * dt));
    spin(vel * dt, Math.abs(vel) > 0.12);
  }
  frame = requestAnimationFrame(tick);
}

function down(event) {
  dragging.value = true;
  lastX = event.clientX;
  lastT = event.timeStamp;
  vel = 0;
  globeEl.value.setPointerCapture?.(event.pointerId);
}
function move(event) {
  if (!dragging.value) return;
  const d = globeEl.value.getBoundingClientRect().width || 1;
  const dx = event.clientX - lastX;
  const dt = Math.max(0.008, (event.timeStamp - lastT) / 1000);
  lastX = event.clientX;
  lastT = event.timeStamp;
  const step = -dx / (2 * d); // isang buong ikot = dalawang beses ang lapad ng globo
  spin(step);
  vel = Math.max(-3, Math.min(3, vel * 0.5 + (step / dt) * 0.5));
}
function up() {
  dragging.value = false;
}
function kick() {
  vel = 1.6;
}

function finish() {
  if (done.value) return;
  done.value = true;
  progress.value = 1;
  navigator.vibrate?.([30, 40, 30]);
  emit("spun", globeEl.value);
}

onMounted(() => {
  frame = requestAnimationFrame(tick);
});
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<style scoped>
.gs-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.gs-head {
  position: absolute;
  top: 9%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.gs-eyebrow {
  margin: 0;
  color: var(--brown);
  font-family: var(--font-type);
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: var(--ink);
  font-family: var(--font-head);
  font-size: clamp(28px, 8.4cqi, 42px);
  font-weight: 600;
  line-height: 1.15;
}

/* ===== Globo ===== */
.gs-wrap {
  position: absolute;
  left: 50%;
  top: 24%;
  width: min(68cqi, 280px);
  aspect-ratio: 1;
  translate: -50% 0;
}
.gs-orbit {
  position: absolute;
  inset: -13%;
  border: 2px dashed rgb(122 75 42 / 0.4);
  border-radius: 50%;
  pointer-events: none;
  animation: gs-rot 16s linear infinite;
}
.gs-orbit i {
  position: absolute;
  top: -13px;
  left: 50%;
  color: var(--accent);
  font-size: 24px;
  font-style: normal;
  rotate: 45deg;
  translate: -50% 0;
}
.gs-globe {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #86d0cb, #3f8f8b 55%, #2b6b6a);
  box-shadow: 0 18px 30px rgb(74 47 28 / 0.35);
  cursor: grab;
  outline: none;
  touch-action: none;
}
.gs-globe.grab {
  cursor: grabbing;
}
.gs-globe:focus-visible {
  outline: 3px dashed var(--ink);
  outline-offset: 5px;
}
.gs-strip {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 400%;
  height: 100%;
  translate: calc(var(--o) * -50%) 0;
  will-change: translate;
}
.gs-world {
  flex: 0 0 50%;
  width: 50%;
  height: 100%;
  pointer-events: none;
}
.gs-grid {
  fill: none;
  stroke: rgb(255 255 255 / 0.22);
  stroke-width: 1;
  stroke-dasharray: 3 5;
}
.gs-land path {
  fill: #ecd9a8;
  stroke: #c9a56a;
  stroke-width: 2;
  stroke-linejoin: round;
}
.gs-pins path {
  fill: var(--accent);
  stroke: #fff7e6;
  stroke-width: 1.5;
}
.gs-shade {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 26%, rgb(255 255 255 / 0.4), transparent 42%),
    radial-gradient(circle at 50% 50%, transparent 52%, rgb(0 30 40 / 0.5) 100%);
  box-shadow: inset -16px -12px 28px rgb(0 40 50 / 0.45);
  pointer-events: none;
}
.gs-base {
  position: absolute;
  left: 50%;
  bottom: -30px;
  width: 56%;
  height: 16px;
  border-radius: 50%;
  background: rgb(74 47 28 / 0.35);
  filter: blur(5px);
  translate: -50% 0;
}

/* ===== Selyo ===== */
.gs-badge {
  position: absolute;
  right: -12%;
  bottom: -6%;
  display: grid;
  width: 118px;
  height: 118px;
  place-items: center;
  align-content: center;
  border: 3px double var(--accent);
  border-radius: 50%;
  background: rgb(255 247 230 / 0.95);
  box-shadow: 0 10px 20px rgb(74 47 28 / 0.35);
  color: var(--accent);
  rotate: -12deg;
  text-align: center;
}
.gs-badge small {
  font-family: var(--font-type);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.gs-badge b {
  font-family: var(--font-head);
  font-size: 40px;
  line-height: 1;
}
.gs-badge em {
  font-family: var(--font-type);
  font-size: 9px;
  font-style: normal;
  line-height: 1.1;
  max-width: 90px;
}
.gs-pop-enter-active {
  transition: opacity 0.4s ease, transform 0.7s cubic-bezier(0.2, 1.6, 0.4, 1);
}
.gs-pop-enter-from {
  opacity: 0;
  transform: scale(2.4);
}

.gs-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1.6%;
  margin: 0;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
  pointer-events: none;
}
.gs-next {
  position: absolute;
  left: 50%;
  bottom: 3.5%;
  z-index: 4;
  padding: 12px 30px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 10px 22px rgb(74 47 28 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  translate: -50% 0;
}
.gs-rise-enter-active {
  transition: opacity 0.8s ease 0.9s, transform 0.8s ease 0.9s;
}
.gs-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes gs-rot {
  to {
    rotate: 360deg;
  }
}
@container (max-height: 620px) {
  .gs-head {
    top: 5%;
  }
  .gs-wrap {
    top: 21%;
    width: min(60cqi, 230px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .gs-orbit {
    animation: none;
  }
}
</style>