<template>
  <!-- 3) BREAK THE WAX SEAL: pindutin at i-hold ang pulang wax seal. Iinit ito, at kapag napuno ang bilog,
       mababasag ito sa dalawa at bubuksan ang pinakamahabang sulat para sa kanya. -->
  <section class="ws-stage" :class="{ 'is-cracking': cracking }">
    <header class="ws-head">
      <p class="ws-eyebrow">{{ cracked ? `Month ${monthCount}` : "Sealed with love" }}</p>
      <h2>{{ cracked ? "Read it slowly" : "Press and hold the seal" }}</h2>
    </header>

    <Transition name="ws-swap" mode="out-in">
      <div v-if="!cracked" key="seal" class="ws-fold">
        <span class="ws-flap" />
        <span class="ws-crease" />
        <button
          ref="sealEl"
          class="ws-seal"
          :class="{ holding: holding }"
          type="button"
          aria-label="Press and hold to break the seal"
          @pointerdown="press"
          @pointerup="release"
          @pointercancel="release"
          @pointerleave="release"
          @contextmenu.prevent
          @keydown.enter.prevent="crack"
          @keydown.space.prevent="crack"
        >
          <svg class="ws-ring" viewBox="0 0 140 140" aria-hidden="true">
            <circle cx="70" cy="70" r="62" class="ws-ring-bg" />
            <circle cx="70" cy="70" r="62" class="ws-ring-fg" :style="{ strokeDashoffset: 390 * (1 - progress) }" />
          </svg>
          <span class="ws-wax" :style="{ scale: 1 + progress * 0.12 }">
            <span class="ws-half l"><span class="ws-heart">♥</span></span>
            <span class="ws-half r"><span class="ws-heart">♥</span></span>
          </span>
        </button>
        <span class="ws-from">From {{ sender }}</span>
      </div>

      <article v-else key="letter" class="ws-letter">
        <img v-if="photo" class="ws-clip" :src="photo" alt="" draggable="false" />
        <p class="ws-to">Dear {{ recipient }},</p>
        <p class="ws-body">{{ letter }}</p>
        <p class="ws-sig">— {{ sender }}</p>
      </article>
    </Transition>

    <p v-if="!cracked" class="ws-hint">Keep holding · {{ Math.round(progress * 100) }}%</p>

    <Transition name="ws-rise">
      <button v-if="cracked" class="ws-next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  letter: { type: String, required: true },
  monthCount: { type: Number, default: 1 },
  photo: { type: String, default: "" },
});
const emit = defineEmits(["cracked", "done"]);

const sealEl = ref(null);
const progress = ref(0);
const holding = ref(false);
const cracking = ref(false);
const cracked = ref(false);

let isHolding = false;
let frame = 0;
let last = 0;
let timer = 0;

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  progress.value = Math.max(0, Math.min(1, progress.value + (isHolding ? dt / 1.5 : -dt / 0.9)));
  if (progress.value >= 1) {
    frame = 0;
    crack();
    return;
  }
  if (isHolding || progress.value > 0) frame = requestAnimationFrame(loop);
  else frame = 0;
}

function press(event) {
  if (cracking.value) return;
  isHolding = true;
  holding.value = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  if (!frame) {
    last = performance.now();
    frame = requestAnimationFrame(loop);
  }
}
function release() {
  isHolding = false;
  holding.value = false;
}

function crack() {
  if (cracking.value) return;
  isHolding = false;
  holding.value = false;
  progress.value = 1;
  cracking.value = true;
  navigator.vibrate?.([30, 40, 50]);
  emit("cracked", sealEl.value);
  timer = setTimeout(() => (cracked.value = true), 1100);
}

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  clearTimeout(timer);
});
</script>

<style scoped>
.ws-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.ws-head {
  position: absolute;
  top: 9%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.ws-eyebrow {
  margin: 0;
  color: #d94b70;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #7a2b45;
  font-family: var(--font-head);
  font-size: clamp(28px, 8.4cqi, 42px);
  font-weight: 600;
  line-height: 1.15;
}

/* ===== Nakatuping sulat ===== */
.ws-fold {
  position: absolute;
  left: 50%;
  top: 30%;
  width: min(80cqi, 310px);
  aspect-ratio: 1.15;
  border: 2px solid #fff;
  border-radius: 10px;
  background: linear-gradient(160deg, #fffaf2, #ffe9d9);
  box-shadow: 0 18px 34px rgb(122 43 69 / 0.3);
  translate: -50% 0;
}
.ws-flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 56%;
  border-radius: 8px 8px 0 0;
  background: linear-gradient(#ffd9e3, #ffc2d4);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.ws-crease {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(to top right, transparent 49.4%, rgb(224 102 127 / 0.28) 50%, transparent 50.8%) left bottom / 50% 62% no-repeat,
    linear-gradient(to top left, transparent 49.4%, rgb(224 102 127 / 0.28) 50%, transparent 50.8%) right bottom / 50% 62% no-repeat;
}
.ws-from {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 9%;
  color: #b4506f;
  font-family: var(--font-script);
  font-size: 22px;
  text-align: center;
}

/* ===== Wax seal ===== */
.ws-seal {
  position: absolute;
  left: 50%;
  top: 54%;
  display: grid;
  width: 120px;
  height: 120px;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  touch-action: none;
  translate: -50% -50%;
  -webkit-touch-callout: none;
}
.ws-seal:focus-visible {
  outline: 2px dashed #7a2b45;
  outline-offset: 4px;
}
.ws-ring {
  position: absolute;
  inset: -8px;
  width: calc(100% + 16px);
  height: calc(100% + 16px);
  rotate: -90deg;
  pointer-events: none;
}
.ws-ring-bg {
  fill: none;
  stroke: rgb(255 255 255 / 0.7);
  stroke-width: 5;
}
.ws-ring-fg {
  fill: none;
  stroke: #e0667f;
  stroke-width: 5;
  stroke-dasharray: 390;
  stroke-linecap: round;
}
.ws-wax {
  position: relative;
  display: block;
  width: 96px;
  height: 96px;
  pointer-events: none;
}
.ws-half {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 52% 48% 55% 45% / 48% 55% 45% 52%;
  background:
    radial-gradient(circle at 34% 28%, rgb(255 255 255 / 0.35), transparent 38%),
    radial-gradient(circle at 50% 50%, #e5384f 0 58%, #b81f3a 100%);
  box-shadow:
    inset 0 0 0 6px rgb(255 255 255 / 0.12),
    0 8px 14px rgb(122 43 69 / 0.4);
  transition: transform 0.9s cubic-bezier(0.4, 0, 0.3, 1), opacity 0.9s ease 0.2s;
}
.ws-half.l {
  clip-path: polygon(0 0, 56% 0, 44% 28%, 58% 52%, 44% 78%, 54% 100%, 0 100%);
}
.ws-half.r {
  clip-path: polygon(56% 0, 100% 0, 100% 100%, 54% 100%, 44% 78%, 58% 52%, 44% 28%);
}
.ws-heart {
  color: #ffd2dc;
  font-size: 40px;
  line-height: 1;
  text-shadow: 0 -1px 0 rgb(0 0 0 / 0.25), 0 1px 0 rgb(255 255 255 / 0.25);
}
.holding .ws-wax {
  animation: ws-throb 0.4s ease-in-out infinite alternate;
  filter: drop-shadow(0 0 14px rgb(255 120 140 / 0.9));
}
.is-cracking .ws-half.l {
  transform: translate(-46px, 26px) rotate(-22deg);
  opacity: 0;
}
.is-cracking .ws-half.r {
  transform: translate(46px, 26px) rotate(22deg);
  opacity: 0;
}
.is-cracking .ws-ring {
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* ===== Sulat ===== */
.ws-letter {
  position: absolute;
  left: 50%;
  top: 20%;
  width: min(90cqi, 360px);
  max-height: 58cqh;
  padding: 20px 22px 14px;
  overflow-y: auto;
  border: 2px solid #fff;
  border-radius: 8px;
  background:
    repeating-linear-gradient(0deg, transparent 0 27px, rgb(224 102 127 / 0.14) 27px 28px),
    linear-gradient(180deg, #fffaf2, #fff1e2);
  box-shadow:
    0 0 0 5px rgb(255 255 255 / 0.55),
    0 20px 38px rgb(122 43 69 / 0.32);
  translate: -50% 0;
}
.ws-clip {
  float: right;
  width: 82px;
  height: 82px;
  margin: 0 0 6px 10px;
  padding: 4px 4px 14px;
  background: #fff;
  box-shadow: 0 4px 10px rgb(122 43 69 / 0.3);
  object-fit: cover;
  pointer-events: none;
  rotate: 5deg;
}
.ws-to {
  margin: 0 0 6px;
  color: #d94b70;
  font-family: var(--font-script);
  font-size: 30px;
  line-height: 1.15;
}
.ws-body {
  margin: 0;
  color: #5c2a3c;
  font-family: var(--font-hand);
  font-size: clamp(22px, 6.4cqi, 27px);
  line-height: 1.28;
}
.ws-sig {
  margin: 10px 0 0;
  color: #b4506f;
  font-family: var(--font-script);
  font-size: 26px;
  text-align: right;
}
.ws-swap-enter-active {
  transition: opacity 0.8s ease, clip-path 1.5s cubic-bezier(0.3, 0.7, 0.3, 1);
}
.ws-swap-leave-active {
  transition: opacity 0.3s ease;
}
.ws-swap-enter-from {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
}
.ws-swap-leave-to {
  opacity: 0;
}

.ws-hint {
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
  text-shadow: 0 2px 8px rgb(122 43 69 / 0.55);
  pointer-events: none;
}
.ws-next {
  position: absolute;
  left: 50%;
  bottom: 3.5%;
  z-index: 4;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: #e9677c;
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
.ws-rise-enter-active {
  transition: opacity 0.9s ease 1.5s, transform 0.9s ease 1.5s;
}
.ws-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes ws-throb {
  to {
    filter: drop-shadow(0 0 22px rgb(255 120 140 / 1));
  }
}
@container (max-height: 620px) {
  .ws-head {
    top: 5%;
  }
  .ws-fold {
    top: 26%;
  }
  .ws-letter {
    top: 16%;
    max-height: 56cqh;
  }
}
@media (prefers-reduced-motion: reduce) {
  .holding .ws-wax {
    animation: none;
  }
}
</style>