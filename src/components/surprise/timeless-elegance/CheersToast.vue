<template>
  <!-- 4) CHEERS: dalawang champagne glass sa magkabilang gilid; i-drag ang daliri papunta sa gitna
       para magkalansingan ang mga ito. Pag nag-clink: kislap + "Cheers!" + pangalan nilang dalawa. -->
  <section
    class="toast-stage"
    :class="{ linked }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <header class="head">
      <p class="eyebrow">{{ linked ? "Cheers" : "Raise a toast" }}</p>
      <h2>
        <Transition name="swap" mode="out-in">
          <span :key="linked">{{ linked ? "Here's to you!" : "Bring the glasses together" }}</span>
        </Transition>
      </h2>
    </header>

    <svg
      ref="svgEl"
      class="glasses"
      viewBox="0 0 300 220"
      tabindex="0"
      role="slider"
      aria-label="Bring the glasses together"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(p * 100)"
      @keydown.right.prevent="advance(p + 0.12)"
      @keydown.left.prevent="advance(p + 0.12)"
      @keydown.enter.prevent="advance(p + 0.12)"
      @keydown.space.prevent="advance(p + 0.12)"
    >
      <defs>
        <linearGradient id="te-toast-wine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fbe7a6" />
          <stop offset="1" stop-color="#e2b252" />
        </linearGradient>
        <linearGradient id="te-toast-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.18" />
          <stop offset="1" stop-color="#ffffff" stop-opacity="0.65" />
        </linearGradient>
        <radialGradient id="te-toast-halo">
          <stop offset="0" stop-color="#fff2c4" stop-opacity="0.95" />
          <stop offset="0.5" stop-color="#e8c26a" stop-opacity="0.4" />
          <stop offset="1" stop-color="#e8c26a" stop-opacity="0" />
        </radialGradient>
        <clipPath id="te-toast-bowl"><path :d="BOWL" /></clipPath>
      </defs>

      <circle class="halo" :class="{ on: linked }" cx="150" cy="64" r="84" fill="url(#te-toast-halo)" />

      <!-- kaliwa at kanang baso: ang pivot ay ang paanan, kaya nakahilig papunta sa gitna -->
      <g v-for="side in SIDES" :key="side.k" :transform="`translate(${side.k === 'l' ? lx : rx} 206) rotate(${side.k === 'l' ? tilt : -tilt})`">
        <ellipse class="foot-shadow" cx="0" cy="3" rx="24" ry="5" />
        <g class="glass">
          <path :d="BOWL" class="body" />
          <g clip-path="url(#te-toast-bowl)">
            <rect x="-24" y="-112" width="48" height="112" fill="url(#te-toast-wine)" />
            <circle
              v-for="b in BUBBLES"
              :key="b.i"
              class="bubble"
              :cx="b.x"
              cy="-50"
              :r="b.r"
              :style="{ '--d': `${b.d}s`, '--h': `${b.h}px` }"
            />
          </g>
          <path :d="BOWL" class="shine" fill="url(#te-toast-glass)" />
          <path d="M-1.9 -46H1.9V-8H-1.9Z" class="stem" />
          <ellipse class="foot" cx="0" cy="-5" rx="21" ry="5" />
        </g>
      </g>

      <!-- kislap ng "clink" -->
      <g v-if="linked" class="clink" transform="translate(150 66)">
        <path v-for="n in 8" :key="n" :d="RAY" :transform="`rotate(${(n - 1) * 45})`" />
        <circle r="5" fill="#fff8dc" />
      </g>
    </svg>

    <p v-if="!linked" class="hint">Drag toward the middle · {{ Math.round(p * 100) }}%</p>

    <Transition name="rise">
      <div v-if="linked" class="names">
        <p class="together">{{ together }}</p>
        <p class="pair">{{ recipient }} <span>&amp;</span> {{ sender }}</p>
        <button class="next" type="button" @pointerdown.stop @click="emit('done')">Continue ✦</button>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  together: { type: String, default: "" },
});
const emit = defineEmits(["linked", "done"]);

// hugis ng baso (flute): ang paanan ay nasa (0, 0), pataas ang -y
const BOWL = "M-17 -140C-17 -98 -14 -62 0 -46C14 -62 17 -98 17 -140Z";
const RAY = "M0 -9L2 -26L0 -34L-2 -26Z";
const SIDES = [{ k: "l" }, { k: "r" }];
const BUBBLES = [
  { i: 0, x: -7, r: 1.8, d: 2.2, h: 62 },
  { i: 1, x: 3, r: 1.4, d: 2.9, h: 70 },
  { i: 2, x: -2, r: 2.2, d: 3.4, h: 56 },
  { i: 3, x: 9, r: 1.5, d: 2.5, h: 64 },
  { i: 4, x: -11, r: 1.3, d: 3.1, h: 50 },
];

const svgEl = ref(null);
const p = ref(0); // 0 = magkalayo, 1 = nag-clink na
const linked = ref(false);
let dragging = false;

const lx = computed(() => 48 + p.value * 49);
const rx = computed(() => 300 - lx.value);
const tilt = computed(() => p.value * 16);

function advance(value) {
  if (linked.value) return;
  const next = Math.min(1, value);
  if (next > p.value) p.value = next;
  if (p.value >= 0.985) {
    p.value = 1;
    linked.value = true;
    navigator.vibrate?.([20, 40, 30]);
    emit("linked", svgEl.value);
  }
}

// sinusundan ng mga baso ang daliri (kahit saan sa screen)
function fromPointer(event) {
  const rect = svgEl.value.getBoundingClientRect();
  const dist = Math.abs(event.clientX - (rect.left + rect.width / 2));
  const unit = (dist * 300) / rect.width; // sa viewBox units
  const value = Math.max(0, Math.min(1, 1 - (unit - 53) / 99));
  advance(Math.min(value, p.value + 0.25));
}
function onDown(event) {
  if (linked.value) return;
  dragging = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  fromPointer(event);
}
function onMove(event) {
  if (dragging) fromPointer(event);
}
function onUp() {
  dragging = false;
}
</script>

<style scoped>
.toast-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 70px 18px 90px;
  text-align: center;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.toast-stage:not(.linked) {
  cursor: grab;
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
  font-size: clamp(26px, 7.6cqi, 38px);
  font-weight: 500;
  line-height: 1.15;
}
.glasses {
  flex: 0 1 auto;
  width: min(100%, 380px);
  overflow: visible;
  outline: none;
}
.glasses:focus-visible {
  outline: 2px dashed #b8914f;
  outline-offset: 6px;
}
.glass .body {
  fill: rgb(255 255 255 / 0.28);
  stroke: #c9a15a;
  stroke-width: 1.6;
}
.glass .shine {
  stroke: none;
}
.glass .stem {
  fill: rgb(255 255 255 / 0.7);
  stroke: #c9a15a;
  stroke-width: 1.2;
}
.glass .foot {
  fill: rgb(255 255 255 / 0.75);
  stroke: #c9a15a;
  stroke-width: 1.4;
}
.glass {
  filter: drop-shadow(0 6px 8px rgb(100 70 20 / 0.22));
}
.foot-shadow {
  fill: rgb(100 70 20 / 0.18);
}
.bubble {
  fill: rgb(255 255 255 / 0.85);
  animation: rise-bubble var(--d) ease-in infinite;
}
.halo {
  opacity: 0;
  transition: opacity 1.2s ease;
}
.halo.on {
  opacity: 1;
  animation: breathe 3s ease-in-out infinite;
  transform-origin: 150px 64px;
}
.clink path {
  fill: #fff3b8;
  stroke: #e0a94f;
  stroke-width: 0.8;
  stroke-linejoin: round;
}
.clink {
  animation: clink 1.1s ease-out both;
}
.hint {
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  pointer-events: none;
}
.names {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.together {
  margin: 0;
  color: #b8914f;
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.pair {
  margin: 0;
  font-family: var(--font-script);
  font-size: clamp(40px, 12cqi, 58px);
  line-height: 1.2;
  background: linear-gradient(180deg, #e2c48a 5%, #b8914f 60%, #8f6d33 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.pair span {
  margin: 0 0.1em;
}
.next {
  margin-top: 14px;
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
  transition: opacity 0.5s ease, filter 0.5s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(6px);
}
.rise-enter-active {
  transition: opacity 0.9s ease 0.7s, transform 0.9s ease 0.7s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes rise-bubble {
  from {
    transform: translateY(0);
    opacity: 0.9;
  }
  to {
    transform: translateY(calc(var(--h) * -1));
    opacity: 0;
  }
}
@keyframes clink {
  from {
    opacity: 1;
    transform: translate(150px, 66px) scale(0.2);
  }
  60% {
    opacity: 1;
    transform: translate(150px, 66px) scale(1.15);
  }
  to {
    opacity: 0.9;
    transform: translate(150px, 66px) scale(1);
  }
}
@keyframes breathe {
  50% {
    transform: scale(1.1);
    opacity: 0.75;
  }
}
@container (max-height: 620px) {
  .toast-stage {
    gap: 8px;
    padding: 30px 18px 36px;
  }
  .glasses {
    width: min(100%, 250px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .halo.on,
  .bubble {
    animation: none;
  }
}
</style>
