<template>
  <!-- MESSAGE IN A BOTTLE: may bote sa malayo; hilahin pababa (o i-tap) papunta sa pampang,
       tapos i-tap para tumalsik ang tapon at bumukas ang sulat. -->
  <section
    class="bottle-stage"
    :class="{ arrived, opened }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <header v-if="!opened" class="head">
      <p class="eyebrow">A message drifted in</p>
      <h2>
        <Transition name="swap" mode="out-in">
          <span :key="arrived">{{ arrived ? "Tap the bottle to open it" : "Pull the bottle to shore" }}</span>
        </Transition>
      </h2>
    </header>

    <span class="wake" :style="{ '--p': progress }" aria-hidden="true" />
    <button
      ref="bottleEl"
      class="bottle"
      type="button"
      :style="{ '--p': progress }"
      :aria-label="arrived ? 'Open the bottle' : `Pull the bottle to shore, ${Math.round(progress * 100)} percent`"
      @click="onBottleClick"
    >
      <svg viewBox="0 0 60 120" aria-hidden="true">
        <g class="cork"><rect x="23" y="3" width="14" height="13" rx="2.5" /></g>
        <path
          class="glass"
          d="M24 16h12v16c0 6 14 10 14 24v52a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8V56c0-14 14-18 14-24Z"
        />
        <rect class="paper" x="20" y="56" width="20" height="42" rx="4" />
        <rect class="ribbon" x="19" y="73" width="22" height="5" rx="1" />
        <path class="shine" d="M16 64v38" />
      </svg>
    </button>

    <p v-if="!arrived" class="hint">Drag down ↓ · {{ Math.round(progress * 100) }}%</p>

    <Transition name="unroll">
      <article v-if="opened" class="letter" @pointerdown.stop>
        <p class="letter-to">To {{ recipient }},</p>
        <p class="letter-body">{{ note }}</p>
        <p class="letter-from">— {{ sender }}</p>
        <button class="next" type="button" @click="emit('done')">Continue ✦</button>
      </article>
    </Transition>
  </section>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  note: { type: String, required: true },
});
const emit = defineEmits(["opened", "done"]);

const bottleEl = ref(null);
const progress = ref(0); // 0 = malayo sa horizon, 1 = nasa pampang
const arrived = ref(false);
const opened = ref(false);
let lastY = null;
let moved = 0;
let stageHeight = 1;

function pull(amount) {
  if (arrived.value) return;
  progress.value = Math.min(1, progress.value + amount);
  if (progress.value >= 1) {
    arrived.value = true;
    navigator.vibrate?.(25);
  }
}

// pababang drag kahit saan sa eksena = hila palapit; maikling tap = hila rin
// (hawak ng eksena ang pointer, kaya dito binibilang ang tap at hindi sa click ng bote)
function onDown(event) {
  if (arrived.value) return;
  lastY = event.clientY;
  moved = 0;
  stageHeight = event.currentTarget.getBoundingClientRect().height || 1;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function onMove(event) {
  if (lastY === null) return;
  const dy = event.clientY - lastY;
  lastY = event.clientY;
  moved += Math.abs(dy);
  if (dy > 0) pull(dy / (stageHeight * 0.3));
}
function onUp() {
  if (lastY !== null && moved < 6) pull(0.34);
  lastY = null;
}

function onBottleClick(event) {
  if (!arrived.value) {
    // keyboard (Enter/Space) lang ang aabot dito bago dumating ang bote
    if (event.detail === 0) pull(0.34);
    return;
  }
  if (opened.value) return;
  opened.value = true;
  navigator.vibrate?.([20, 40, 20]);
  emit("opened", bottleEl.value);
}
</script>

<style scoped>
.bottle-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.bottle-stage:not(.arrived) {
  cursor: grab;
}
.head {
  position: absolute;
  top: 28%;
  left: 50%;
  width: min(100% - 44px, 440px);
  text-align: center;
  transform: translateX(-50%);
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
  line-height: 1.2;
  text-shadow: 0 0 22px rgb(214 178 240 / 0.5);
}

/* ===== Bote: mula horizon (maliit) papuntang pampang (malaki) ===== */
.bottle {
  position: absolute;
  top: calc(76% + var(--p) * 10%);
  left: 50%;
  width: 60px;
  height: 120px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  transform: translate(-50%, -50%) scale(calc(0.3 + var(--p) * 0.7));
  transition:
    top 0.35s ease,
    transform 0.35s ease;
}
.bottle svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  animation: bob 2.6s ease-in-out infinite alternate;
  transform-origin: 50% 80%;
}
.bottle:focus-visible {
  outline: 2px solid #ffe7c4;
  outline-offset: 6px;
  border-radius: 12px;
}
.arrived .bottle svg {
  filter: drop-shadow(0 0 12px rgb(255 236 214 / 0.7));
  animation: bob 2.6s ease-in-out infinite alternate, call 1.4s ease-in-out infinite alternate;
}
.opened .bottle {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
  transition: opacity 1s ease 0.5s, transform 1s ease 0.5s;
}
.glass {
  fill: rgb(150 215 225 / 0.28);
  stroke: rgb(220 250 255 / 0.75);
  stroke-width: 1.5;
}
.paper {
  fill: #f6e7c8;
}
.ribbon {
  fill: #e88bb1;
}
.shine {
  stroke: rgb(255 255 255 / 0.55);
  stroke-width: 2;
  stroke-linecap: round;
}
.cork rect {
  fill: #b98a5a;
  stroke: #8a6036;
  stroke-width: 1;
}
.opened .cork {
  animation: pop 0.7s cubic-bezier(0.3, 1.4, 0.5, 1) forwards;
  transform-box: fill-box;
  transform-origin: center;
}
.wake {
  position: absolute;
  top: calc(80% + var(--p) * 10%);
  left: 50%;
  width: calc(50px + var(--p) * 90px);
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(ellipse closest-side, rgb(255 236 214 / 0.35), transparent);
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: top 0.35s ease, width 0.35s ease, opacity 1s ease 0.5s;
}
.opened .wake {
  opacity: 0;
}
.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4%;
  margin: 0;
  color: rgb(253 242 248 / 0.85);
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  text-align: center;
  text-shadow: 0 2px 8px rgb(10 6 30 / 0.8);
  pointer-events: none;
}

/* ===== Sulat (papel na bumubukas pababa) ===== */
.letter {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(100% - 44px, 380px);
  padding: 26px 24px 22px;
  border-radius: 6px;
  background:
    radial-gradient(ellipse at 30% 20%, rgb(255 255 255 / 0.5), transparent 60%),
    linear-gradient(180deg, #fbf1dc, #f1dfbd);
  color: #4a3550;
  box-shadow:
    0 20px 50px rgb(0 0 0 / 0.45),
    0 0 40px rgb(255 220 170 / 0.25);
  text-align: left;
  transform: translate(-50%, -50%);
  cursor: default;
}
.letter::before,
.letter::after {
  /* nakarolyong dulo sa itaas at ibaba */
  content: "";
  position: absolute;
  left: -6px;
  right: -6px;
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(180deg, #e9d3a8, #fbf1dc 50%, #d9bf8e);
}
.letter::before {
  top: -7px;
}
.letter::after {
  bottom: -7px;
}
.letter-to {
  margin: 0 0 10px;
  font-family: var(--font-script);
  font-size: 30px;
  color: #8a4f74;
}
.letter-body {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.5;
}
.letter-from {
  margin: 12px 0 0;
  font-family: var(--font-script);
  font-size: 28px;
  color: #8a4f74;
  text-align: right;
}
.letter .next {
  display: block;
  margin: 14px auto 0;
  padding: 10px 24px;
  border: 1px solid #c79b6a;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.5);
  color: #6b4560;
  font-family: var(--font-serif);
  font-size: 16px;
  cursor: pointer;
}
.unroll-enter-active {
  transition:
    clip-path 1.1s cubic-bezier(0.3, 0.8, 0.3, 1) 0.6s,
    opacity 0.4s ease 0.6s;
}
.unroll-enter-from {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
}
.unroll-enter-to {
  clip-path: inset(0 0 0 0);
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

@keyframes bob {
  from {
    transform: rotate(-8deg) translateY(0);
  }
  to {
    transform: rotate(8deg) translateY(-4px);
  }
}
@keyframes call {
  to {
    filter: drop-shadow(0 0 22px rgb(255 236 214 / 0.95));
  }
}
@keyframes pop {
  to {
    opacity: 0;
    transform: translate(14px, -40px) rotate(160deg);
  }
}
@container (max-height: 620px) {
  .head {
    top: 12%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bottle svg,
  .arrived .bottle svg {
    animation: none;
  }
}
</style>
