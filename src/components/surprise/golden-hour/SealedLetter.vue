<template>
  <!-- 5) SEALED LETTER: i-tap ang wax seal (nababasag), bubukas ang sobre; hilahin pataas (o i-tap) ang sulat para mabasa. -->
  <section class="letter-stage" :class="step">
    <header v-if="step !== 'read'" class="head">
      <p class="eyebrow">A letter for you</p>
      <h2>
        <Transition name="swap" mode="out-in">
          <span :key="step">{{ step === "sealed" ? "Tap the wax seal" : "Pull the letter out ↑" }}</span>
        </Transition>
      </h2>
    </header>

    <Transition name="drop">
      <div v-if="step !== 'read'" ref="envEl" class="env">
        <div class="env-back" />
        <div
          class="paper"
          :style="{ '--pull': `${pull}px` }"
          role="button"
          :tabindex="step === 'open' ? 0 : -1"
          aria-label="Pull the letter out"
          @pointerdown="onPaperDown"
          @pointermove="onPaperMove"
          @pointerup="onPaperUp"
          @pointercancel="onPaperUp"
          @keydown.enter.prevent="read"
          @keydown.space.prevent="read"
        >
          <p class="paper-to">To {{ recipient }},</p>
          <span class="lines" />
        </div>
        <div class="env-front" />
        <div class="flap" />
        <button class="seal" type="button" :disabled="step !== 'sealed'" aria-label="Break the wax seal" @click="openSeal">
          <span class="half l" />
          <span class="half r" />
          <span class="heart">♥</span>
        </button>
      </div>
    </Transition>

    <Transition name="unroll">
      <article v-if="step === 'read'" class="letter">
        <p class="letter-to">Dear {{ recipient }},</p>
        <p class="letter-body">{{ text }}</p>
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
  text: { type: String, required: true },
});
const emit = defineEmits(["opened", "done"]);

const step = ref("sealed"); // sealed → open → read
const pull = ref(0);
const envEl = ref(null);
let startY = null;
let moved = 0;

function openSeal() {
  if (step.value !== "sealed") return;
  step.value = "open";
  navigator.vibrate?.(20);
}

// hilahin pataas (o i-tap) ang sulat
function onPaperDown(event) {
  if (step.value !== "open") return;
  startY = event.clientY;
  moved = 0;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function onPaperMove(event) {
  if (startY === null) return;
  const dy = event.clientY - startY;
  moved = Math.max(moved, Math.abs(dy));
  pull.value = Math.max(-90, Math.min(0, dy));
}
function onPaperUp() {
  if (startY === null) return;
  const accepted = pull.value < -35 || moved < 6;
  startY = null;
  pull.value = 0;
  if (accepted) read();
}
function read() {
  if (step.value !== "open") return;
  step.value = "read";
  navigator.vibrate?.([20, 40, 20]);
  emit("opened", envEl.value);
}
</script>

<style scoped>
.letter-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 54px;
  padding: 70px 22px 90px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
}
.letter-stage.read {
  gap: 0;
}
.eyebrow {
  margin: 0;
  color: #b8514a;
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #4a2340;
  font-family: var(--font-serif);
  font-size: clamp(24px, 7.2cqi, 36px);
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 1px 0 rgb(255 255 255 / 0.55);
}

/* ===== Sobre (CSS lang) ===== */
.env {
  position: relative;
  flex: none;
  width: min(100% - 56px, 320px);
  aspect-ratio: 8 / 5;
  perspective: 900px;
  filter: drop-shadow(0 16px 24px rgb(110 40 60 / 0.35));
}
.env-back,
.env-front,
.flap {
  position: absolute;
  inset: 0;
}
.env-back {
  z-index: 1;
  border-radius: 6px;
  background: #d98b72;
}
.paper {
  position: absolute;
  z-index: 2;
  left: 7%;
  right: 7%;
  top: 6%;
  bottom: 4%;
  padding: 12px 14px;
  border-radius: 4px;
  background: linear-gradient(180deg, #fffaf0, #fbefd8);
  text-align: left;
  pointer-events: none;
  touch-action: none;
  outline: none;
  transform: translateY(var(--pull, 0px));
  transition: transform 0.7s cubic-bezier(0.3, 1.2, 0.4, 1);
}
.open .paper {
  pointer-events: auto;
  cursor: grab;
  transform: translateY(calc(-44% + var(--pull, 0px)));
  animation: nudge 1.6s ease-in-out 1s infinite alternate;
}
.open .paper:focus-visible {
  box-shadow: 0 0 0 3px #4a2340;
}
.paper-to {
  margin: 0 0 8px;
  color: #8a4f74;
  font-family: var(--font-hand);
  font-size: 24px;
  font-weight: 700;
}
.lines {
  display: block;
  height: 40px;
  background: repeating-linear-gradient(180deg, transparent 0 9px, rgb(138 79 116 / 0.22) 9px 10px);
}
.env-front {
  z-index: 3;
  border-radius: 6px;
  background: linear-gradient(180deg, #f0a98f, #e58f78);
  clip-path: polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%);
}
.flap {
  z-index: 4;
  bottom: auto;
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(180deg, #f5b9a0, #ea9a82);
  clip-path: polygon(0 0, 100% 0, 50% 58%);
  transform-origin: 50% 0;
  transition:
    transform 0.9s cubic-bezier(0.4, 0, 0.2, 1),
    z-index 0s 0.35s;
}
.open .flap {
  z-index: 1;
  transform: rotateX(180deg);
}

/* wax seal: nababasag sa dalawa */
.seal {
  position: absolute;
  z-index: 6;
  top: 58%;
  left: 50%;
  width: 50px;
  height: 50px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  transform: translate(-50%, -50%);
}
.seal:focus-visible {
  outline: 2px solid #4a2340;
  outline-offset: 4px;
  border-radius: 50%;
}
.half {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #e4566a, #b02a40 70%);
  box-shadow: 0 3px 8px rgb(0 0 0 / 0.3);
  transition: transform 0.7s ease, opacity 0.7s ease 0.2s;
}
.half.l {
  clip-path: polygon(0 0, 55% 0, 45% 100%, 0 100%);
}
.half.r {
  clip-path: polygon(55% 0, 100% 0, 100% 100%, 45% 100%);
}
.heart {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: rgb(255 255 255 / 0.85);
  font-size: 20px;
  transition: opacity 0.3s ease;
}
.seal:not(:disabled) {
  animation: pulse 1.4s ease-in-out infinite alternate;
}
.open .half.l {
  transform: translate(-16px, 6px) rotate(-22deg);
  opacity: 0;
}
.open .half.r {
  transform: translate(16px, 6px) rotate(22deg);
  opacity: 0;
}
.open .heart {
  opacity: 0;
}
.drop-leave-active {
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.drop-leave-to {
  opacity: 0;
  transform: translateY(60px) scale(0.9);
}

/* ===== Sulat na bumubukas pababa ===== */
.letter {
  position: relative;
  width: min(100% - 12px, 380px);
  max-height: 100%;
  padding: 26px 24px 22px;
  overflow-y: auto;
  border-radius: 6px;
  background:
    radial-gradient(ellipse at 30% 15%, rgb(255 255 255 / 0.6), transparent 60%),
    repeating-linear-gradient(180deg, transparent 0 29px, rgb(138 79 116 / 0.1) 29px 30px),
    linear-gradient(180deg, #fffaf0, #fbefd8);
  color: #4a2340;
  box-shadow:
    0 22px 50px rgb(110 40 60 / 0.4),
    0 0 0 6px rgb(255 255 255 / 0.5);
  text-align: left;
}
.letter-to {
  margin: 0 0 8px;
  color: #8a4f74;
  font-family: var(--font-hand);
  font-size: 32px;
  font-weight: 700;
}
.letter-body {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 17px;
  line-height: 30px;
}
.letter-from {
  margin: 10px 0 0;
  color: #8a4f74;
  font-family: var(--font-hand);
  font-size: 30px;
  font-weight: 700;
  text-align: right;
}
.next {
  display: block;
  margin: 14px auto 0;
  padding: 10px 26px;
  border: 1px solid #d9574c;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.7);
  color: #b8403a;
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
.unroll-enter-active {
  transition:
    clip-path 1.2s cubic-bezier(0.3, 0.8, 0.3, 1) 0.5s,
    opacity 0.4s ease 0.5s;
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

@keyframes nudge {
  to {
    transform: translateY(calc(-48% + var(--pull, 0px)));
  }
}
@keyframes pulse {
  to {
    transform: translate(-50%, -50%) scale(1.1);
  }
}
@container (max-height: 620px) {
  .letter-stage {
    gap: 30px;
    padding: 30px 22px 30px;
  }
  .letter-body {
    font-size: 15px;
    line-height: 26px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .open .paper,
  .seal:not(:disabled) {
    animation: none;
  }
}
</style>