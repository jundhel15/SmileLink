<template>
  <!-- 3) TURN THE HANDS OF TIME: paikutin pa-clockwise ang kamay ng gintong orasan;
       bawat dumadaang marker ay nagpapakita ng isang mahalagang sandali ng relasyon. -->
  <section class="dial-stage" :class="{ done }">
    <header class="head">
      <p class="eyebrow">{{ done ? "Every moment, kept" : "Our story" }}</p>
      <h2>
        <Transition name="swap" mode="out-in">
          <span :key="done">{{ done ? "Time only made it sweeter" : "Turn the hands of time" }}</span>
        </Transition>
      </h2>
    </header>

    <div
      ref="dialEl"
      class="dial"
      tabindex="0"
      role="slider"
      aria-label="Turn the hands of time"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(turn * 100)"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown.right.prevent="bump(0.06)"
      @keydown.enter.prevent="bump(0.06)"
      @keydown.space.prevent="bump(0.06)"
    >
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <linearGradient id="te-dial-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#f0dca8" />
            <stop offset="0.5" stop-color="#b8914f" />
            <stop offset="1" stop-color="#e6cf9c" />
          </linearGradient>
          <radialGradient id="te-dial-face" cx="0.4" cy="0.35" r="0.9">
            <stop offset="0" stop-color="#fffdf6" />
            <stop offset="1" stop-color="#f0e4cb" />
          </radialGradient>
        </defs>
        <circle class="shadow" cx="100" cy="104" r="96" />
        <circle cx="100" cy="100" r="96" fill="url(#te-dial-face)" stroke="url(#te-dial-gold)" stroke-width="5" />
        <circle cx="100" cy="100" r="89" fill="none" stroke="#b8914f" stroke-width="0.6" />
        <line
          v-for="(tick, i) in ticks"
          :key="`t${i}`"
          :x1="tick.x1"
          :y1="tick.y1"
          :x2="tick.x2"
          :y2="tick.y2"
          :stroke="tick.major ? '#8f6d33' : '#c9ad78'"
          :stroke-width="tick.major ? 1.4 : 0.6"
        />
        <text
          v-for="(n, i) in NUMERALS"
          :key="`n${i}`"
          class="numeral"
          :x="100 + Math.sin((i * 30 * Math.PI) / 180) * 68"
          :y="100 - Math.cos((i * 30 * Math.PI) / 180) * 68 + 3"
          text-anchor="middle"
        >
          {{ n }}
        </text>
        <circle
          v-for="(mark, i) in marks"
          :key="`m${i}`"
          class="mark"
          :class="{ lit: turn >= (i + 1) / milestones.length - 0.015 }"
          :cx="mark.x"
          :cy="mark.y"
          r="5"
        />
        <g :transform="`rotate(${turn * 360} 100 100)`">
          <line x1="100" y1="114" x2="100" y2="38" stroke="url(#te-dial-gold)" stroke-width="2.6" stroke-linecap="round" />
          <path d="M100 26 L106 40 L100 54 L94 40Z" fill="url(#te-dial-gold)" stroke="#8f6d33" stroke-width="0.6" />
          <circle class="knob" cx="100" cy="26" r="0" />
        </g>
        <circle cx="100" cy="100" r="6" fill="url(#te-dial-gold)" stroke="#8f6d33" stroke-width="0.6" />
      </svg>
    </div>

    <div class="card" aria-live="polite">
      <Transition name="swap" mode="out-in">
        <div :key="current" class="card-inner">
          <template v-if="current >= 0">
            <p class="date">{{ milestones[current].date }}</p>
            <p class="label">{{ milestones[current].label }}</p>
            <p class="text">{{ milestones[current].text }}</p>
          </template>
          <p v-else class="prompt">Slide your finger around the clock ↻</p>
        </div>
      </Transition>
    </div>

    <p v-if="!done" class="hint">{{ Math.round(turn * 100) }}% · clockwise</p>

    <Transition name="rise">
      <button v-if="done" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  milestones: { type: Array, required: true }, // [{ date, label, text }]
});
const emit = defineEmits(["milestone", "finished", "done"]);

const NUMERALS = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

const ticks = Array.from({ length: 60 }, (_, i) => {
  const a = (i * 6 * Math.PI) / 180;
  const major = i % 5 === 0;
  const r1 = 85;
  const r2 = major ? 77 : 81.5;
  return {
    major,
    x1: 100 + Math.sin(a) * r1,
    y1: 100 - Math.cos(a) * r1,
    x2: 100 + Math.sin(a) * r2,
    y2: 100 - Math.cos(a) * r2,
  };
});
// marker ng bawat sandali sa gilid ng orasan (ang huli ay nasa tuktok, kumpleto na ang ikot)
const marks = computed(() =>
  props.milestones.map((_, i) => {
    const a = (((i + 1) / props.milestones.length) * 360 * Math.PI) / 180;
    return { x: 100 + Math.sin(a) * 96, y: 100 - Math.cos(a) * 96 };
  }),
);

const dialEl = ref(null);
const turn = ref(0); // 0–1 = isang buong ikot
const done = ref(false);
let dragging = false;
let moved = 0;
let lastAngle = null;

const current = computed(() => {
  let index = -1;
  props.milestones.forEach((_, i) => {
    if (turn.value >= (i + 1) / props.milestones.length - 0.015) index = i;
  });
  return index;
});
watch(current, (now, before) => {
  if (now > before && now >= 0) emit("milestone", dialEl.value);
});

function bump(amount) {
  if (done.value) return;
  turn.value = Math.min(1, turn.value + amount);
  if (turn.value >= 0.985) {
    turn.value = 1;
    done.value = true;
    navigator.vibrate?.([20, 40, 20]);
    emit("finished", dialEl.value);
  }
}

// anggulo mula sa tuktok (pa-clockwise), batay sa gitna ng orasan
function angleOf(event) {
  const rect = dialEl.value.getBoundingClientRect();
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top + rect.height / 2);
  if (Math.hypot(dx, dy) < rect.width * 0.06) return null;
  return Math.atan2(dx, -dy);
}

function onDown(event) {
  if (done.value) return;
  dragging = true;
  moved = 0;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  lastAngle = angleOf(event);
}
function onMove(event) {
  if (!dragging || done.value) return;
  const angle = angleOf(event);
  if (angle === null) return;
  if (lastAngle !== null) {
    let delta = angle - lastAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    moved += Math.abs(delta);
    if (delta > 0) bump(delta / (Math.PI * 2)); // pa-clockwise lang ang binibilang
  }
  lastAngle = angle;
}
function onUp() {
  if (dragging && moved < 0.05) bump(0.08); // maikling tap = konting usad
  dragging = false;
  lastAngle = null;
}
</script>

<style scoped>
.dial-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 64px 22px 70px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
}
.eyebrow {
  margin: 0;
  color: #b8914f;
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.34em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #3f3a2e;
  font-family: var(--font-serif);
  font-size: clamp(24px, 7cqi, 36px);
  font-weight: 500;
  line-height: 1.15;
}

/* ===== Orasan ===== */
.dial {
  flex: 0 1 auto;
  width: min(66cqi, 280px, 36cqh);
  aspect-ratio: 1;
  cursor: grab;
  touch-action: none;
  outline: none;
}
.dial:focus-visible {
  outline: 2px dashed #b8914f;
  outline-offset: 6px;
  border-radius: 50%;
}
.dial svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.shadow {
  fill: rgb(80 60 30 / 0.22);
  filter: blur(8px);
}
.numeral {
  fill: #8f6d33;
  font-family: var(--font-serif);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.mark {
  fill: #fffdf6;
  stroke: #b8914f;
  stroke-width: 1.4;
  transition: fill 0.5s ease, filter 0.5s ease;
}
.mark.lit {
  fill: #f4d98c;
  filter: drop-shadow(0 0 4px #e8c26a);
}
.done .dial svg {
  filter: drop-shadow(0 0 14px rgb(232 194 106 / 0.7));
}

/* ===== Kard ng sandali ===== */
.card {
  display: grid;
  place-items: center;
  width: min(100%, 340px);
  min-height: 118px;
}
.date {
  margin: 0;
  color: #b8914f;
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.label {
  margin: 0;
  font-family: var(--font-script);
  font-size: clamp(40px, 11cqi, 52px);
  line-height: 1.15;
  background: linear-gradient(180deg, #e2c48a 5%, #b8914f 60%, #8f6d33 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.text {
  margin: 0;
  color: #3f3a2e;
  font-family: var(--font-serif);
  font-size: 19px;
  font-style: italic;
  line-height: 1.3;
}
.prompt {
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 18px;
  font-style: italic;
}
.hint {
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 14px;
  font-style: italic;
}
.next {
  padding: 11px 30px;
  border: 1px solid #b8914f;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.85);
  color: #7a5c26;
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 8px 20px rgb(120 90 40 / 0.18);
}
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.45s ease, filter 0.45s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(6px);
}
.rise-enter-active {
  transition: opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

@container (max-height: 620px) {
  .dial-stage {
    gap: 6px;
    padding: 30px 22px 30px;
  }
  .card {
    min-height: 96px;
  }
  .hint {
    display: none;
  }
}
</style>