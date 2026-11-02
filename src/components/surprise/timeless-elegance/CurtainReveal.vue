<template>
  <!-- 1) CURTAINS: hilahin pahalang (o i-tap) ang mabibigat na olive-green na kurtina; bubukas ito
       at lilitaw ang pangalan ng may birthday. -->
  <section
    ref="stageEl"
    class="curtain-stage"
    :class="{ open }"
    :style="{ '--p': p }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <div class="behind">
      <p class="eyebrow">Happy birthday</p>
      <h1 class="name">{{ recipient }}</h1>
      <svg class="divider" viewBox="0 0 220 20" aria-hidden="true">
        <defs>
          <linearGradient id="te-curtain-div-l" x1="0" x2="1">
            <stop offset="0" stop-color="#b8914f" stop-opacity="0" />
            <stop offset="1" stop-color="#b8914f" />
          </linearGradient>
          <linearGradient id="te-curtain-div-r" x1="0" x2="1">
            <stop offset="0" stop-color="#b8914f" />
            <stop offset="1" stop-color="#b8914f" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path d="M6 10h84" stroke="url(#te-curtain-div-l)" stroke-width="1" />
        <path d="M130 10h84" stroke="url(#te-curtain-div-r)" stroke-width="1" />
        <path d="M110 2 117 10 110 18 103 10Z" fill="none" stroke="#b8914f" stroke-width="1.1" />
        <path d="M110 6.5 113.5 10 110 13.5 106.5 10Z" fill="#d9b46a" />
      </svg>
      <p class="line">A private celebration, made only for you.<br />With all my love, {{ sender }}</p>
      <Transition name="rise">
        <button v-if="open" class="next" type="button" @pointerdown.stop @click="emit('done')">Begin ✦</button>
      </Transition>
    </div>

    <div class="panel left" aria-hidden="true"><span class="tassel" /></div>
    <div class="panel right" aria-hidden="true"><span class="tassel" /></div>
    <div class="rod" aria-hidden="true"><span class="finial l" /><span class="finial r" /></div>

    <p v-if="!open" class="hint">Draw the curtains ↔ · {{ Math.round(p * 100) }}%</p>
    <button v-if="!open" class="sr-open" type="button" @pointerdown.stop @click="pull(0.34)">Open the curtains</button>
  </section>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
});
const emit = defineEmits(["opened", "done"]);

const stageEl = ref(null);
const p = ref(0); // 0 = sarado, 1 = bukas na bukas
const open = ref(false);
let lastX = null;
let moved = 0;
let stageWidth = 1;

function pull(amount) {
  if (open.value) return;
  p.value = Math.min(1, p.value + amount);
  if (p.value >= 1) {
    open.value = true;
    navigator.vibrate?.([20, 40, 20]);
    emit("opened", stageEl.value);
  }
}

// pahalang na drag kahit saan = bumubukas; maikling tap = konting bukas din
function onDown(event) {
  if (open.value) return;
  lastX = event.clientX;
  moved = 0;
  stageWidth = event.currentTarget.getBoundingClientRect().width || 1;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function onMove(event) {
  if (lastX === null) return;
  const dx = Math.abs(event.clientX - lastX);
  lastX = event.clientX;
  moved += dx;
  pull(dx / (stageWidth * 0.55));
}
function onUp() {
  if (lastX !== null && moved < 6) pull(0.34);
  lastX = null;
}
</script>

<style scoped>
.curtain-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.curtain-stage:not(.open) {
  cursor: grab;
}

/* ===== Nasa likod ng kurtina ===== */
.behind {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 28px 60px;
  text-align: center;
  opacity: calc(0.15 + var(--p) * 0.85);
  transform: scale(calc(0.94 + var(--p) * 0.06));
}
.eyebrow {
  margin: 0;
  color: #b8914f;
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.4em;
  text-transform: uppercase;
}
.name {
  margin: 6px 0 4px;
  padding: 0 0.1em;
  font-family: var(--font-script);
  font-size: clamp(64px, 22cqi, 112px);
  font-weight: 400;
  line-height: 1.1;
  background: linear-gradient(180deg, #e2c48a 5%, #b8914f 55%, #8f6d33 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 2px 6px rgb(120 90 40 / 0.25));
}
.divider {
  display: block;
  width: 200px;
  height: 18px;
  margin-bottom: 10px;
}
.line {
  margin: 0;
  color: #3f3a2e;
  font-family: var(--font-serif);
  font-size: 20px;
  font-style: italic;
  line-height: 1.45;
}
.next {
  margin-top: 22px;
  padding: 12px 34px;
  border: 1px solid #b8914f;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.7);
  color: #7a5c26;
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 8px 20px rgb(120 90 40 / 0.18);
}
.next:hover {
  background: #fff;
}
.rise-enter-active {
  transition: opacity 0.9s ease 0.6s, transform 0.9s ease 0.6s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

/* ===== Kurtina ===== */
.panel {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 3;
  width: 52%;
  background:
    repeating-linear-gradient(90deg, rgb(0 0 0 / 0.22) 0 3px, transparent 3px 20px, rgb(255 255 255 / 0.08) 20px 24px, transparent 24px 42px),
    linear-gradient(180deg, rgb(255 255 255 / 0.1), transparent 30%, rgb(0 0 0 / 0.28) 100%),
    linear-gradient(90deg, #52614a, #3c4a35 50%, #4a5940);
  box-shadow: 0 0 40px rgb(0 0 0 / 0.35);
  transition: transform 0.35s ease-out;
  will-change: transform;
}
.panel::after {
  /* gintong laylayan sa ibaba */
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 14px;
  background: repeating-linear-gradient(90deg, #b8914f 0 3px, #e6cf9c 3px 5px, #b8914f 5px 8px);
}
.panel.left {
  left: 0;
  transform: translateX(calc(var(--p) * -104%));
}
.panel.right {
  right: 0;
  transform: translateX(calc(var(--p) * 104%));
}
.tassel {
  position: absolute;
  top: 46%;
  width: 14px;
  height: 90px;
}
.left .tassel {
  right: 14px;
}
.right .tassel {
  left: 14px;
}
.tassel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 6px;
  width: 2px;
  height: 56px;
  background: linear-gradient(180deg, #b8914f, #e6cf9c);
}
.tassel::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 14px;
  height: 38px;
  border-radius: 7px 7px 3px 3px;
  background: repeating-linear-gradient(90deg, #b8914f 0 2px, #e6cf9c 2px 4px);
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.3);
}
.rod {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 4;
  height: 12px;
  background: linear-gradient(180deg, #e6cf9c, #b8914f 60%, #8f6d33);
  box-shadow: 0 4px 10px rgb(0 0 0 / 0.3);
}
.finial {
  position: absolute;
  top: -3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff0c4, #b8914f 70%);
}
.finial.l {
  left: 4px;
}
.finial.r {
  right: 4px;
}
.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 7%;
  z-index: 5;
  margin: 0;
  color: #f3e4bd;
  font-family: var(--font-serif);
  font-size: 16px;
  font-style: italic;
  text-align: center;
  text-shadow: 0 2px 8px rgb(0 0 0 / 0.6);
  pointer-events: none;
  opacity: calc(1 - var(--p) * 1.4);
}
.sr-open {
  position: absolute;
  z-index: 6;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  border: 0;
  padding: 0;
}
.sr-open:focus-visible {
  width: auto;
  height: auto;
  left: 50%;
  top: 14%;
  padding: 8px 16px;
  clip-path: none;
  background: #fff;
  transform: translateX(-50%);
}

@container (max-height: 620px) {
  .behind {
    padding: 20px 28px 30px;
  }
  .line {
    font-size: 16px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .panel {
    transition-duration: 0.01s;
  }
}
</style>