<template>
  <!-- 4) MESSAGE IN A BOTTLE: i-tap ang bote para hilahin papunta sa dalampasigan (3 beses). Kapag nakuha na,
       hilahin pataas ang tapon; lalabas at magbubukas ang sulat (may kasamang litrato). -->
  <section class="bottle-stage" :class="{ caught, popped }">
    <header class="head">
      <p class="eyebrow">{{ popped ? "From me to you" : caught ? "Almost there" : "A bottle on the tide" }}</p>
      <h2 v-if="!popped">{{ caught ? "Pull out the cork" : "Reel it in" }}</h2>
    </header>

    <div ref="bottleEl" class="bottle" :style="bottleStyle">
      <button class="catch" type="button" :disabled="caught" aria-label="Reel in the bottle" @click="tap">
        <span class="sway">
          <svg viewBox="0 0 100 200" aria-hidden="true">
            <defs>
              <linearGradient id="ob-glass" x1="0" x2="1">
                <stop offset="0" stop-color="#fff" stop-opacity="0.6" />
                <stop offset="0.5" stop-color="#b8ecf5" stop-opacity="0.28" />
                <stop offset="1" stop-color="#fff" stop-opacity="0.45" />
              </linearGradient>
            </defs>
            <g transform="rotate(-8 50 140)">
              <rect x="38" y="104" width="24" height="72" rx="6" fill="#f6e6c0" />
              <rect x="38" y="104" width="24" height="9" rx="4" fill="#e7cf9d" />
              <rect x="38" y="139" width="24" height="4" fill="#e0606a" />
            </g>
            <path
              d="M40 52 V74 C40 84 20 92 20 118 V176 Q20 192 36 192 H64 Q80 192 80 176 V118 C80 92 60 84 60 74 V52 Z"
              fill="url(#ob-glass)"
              stroke="rgb(255 255 255 / 0.85)"
              stroke-width="2"
            />
            <path d="M29 118 V170" stroke="rgb(255 255 255 / 0.75)" stroke-width="3" stroke-linecap="round" />
          </svg>
        </span>
      </button>

      <div
        v-if="caught"
        class="cork"
        :class="{ pop: popped, drag: dragging }"
        :style="corkStyle"
        role="slider"
        tabindex="0"
        aria-label="Pull out the cork"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(corkP * 100)"
        @pointerdown="corkDown"
        @pointermove="corkMove"
        @pointerup="corkUp"
        @pointercancel="corkUp"
        @keydown.enter.prevent="pop"
        @keydown.space.prevent="pop"
      />
    </div>

    <Transition name="unroll">
      <article v-if="popped" class="letter">
        <span class="rod" />
        <div class="paper">
          <img v-if="photo" class="clip" :src="photo" alt="" draggable="false" />
          <p class="to">Dear {{ recipient }},</p>
          <p class="body">{{ text }}</p>
          <p class="sig">— {{ sender }}</p>
        </div>
        <span class="rod" />
      </article>
    </Transition>

    <p v-if="!popped" class="hint">{{ hint }}</p>

    <Transition name="rise">
      <button v-if="popped" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  photo: { type: String, default: "" },
});
const emit = defineEmits(["tap", "caught", "opened", "done"]);

// posisyon ng bote sa bawat hakbang: palayo → papalapit → nakatayo na sa dalampasigan
const STEPS = [
  { x: 20, y: 60, r: -80, s: 0.5 },
  { x: 32, y: 57, r: -58, s: 0.65 },
  { x: 42, y: 54, r: -34, s: 0.82 },
  { x: 50, y: 52, r: 0, s: 1 },
];
const POPPED = { x: 50, y: 90, r: 0, s: 0.5 };

const bottleEl = ref(null);
const taps = ref(0);
const caught = ref(false);
const popped = ref(false);
const corkP = ref(0);
const dragging = ref(false);

const bottleStyle = computed(() => {
  const s = popped.value ? POPPED : STEPS[Math.min(taps.value, 3)];
  return { left: `${s.x}%`, top: `${s.y}%`, rotate: `${s.r}deg`, scale: s.s };
});
const corkStyle = computed(() => ({
  translate: `0 ${-corkP.value * 34}px`,
  rotate: `${-corkP.value * 12}deg`,
}));
const hint = computed(() =>
  caught.value ? "Drag the cork up ↑ (or tap it)" : `Tap the bottle · ${taps.value}/3 · the tide is bringing it closer`,
);

function tap() {
  if (caught.value) return;
  taps.value += 1;
  navigator.vibrate?.(12);
  if (taps.value >= 3) {
    caught.value = true;
    emit("caught", bottleEl.value);
  } else {
    emit("tap", bottleEl.value);
  }
}

let startY = null;
let moved = 0;
let scale = 1;

function pop() {
  if (popped.value) return;
  corkP.value = 1;
  popped.value = true;
  dragging.value = false;
  navigator.vibrate?.([30, 50, 30]);
  emit("opened", bottleEl.value);
}
function corkDown(event) {
  if (popped.value) return;
  startY = event.clientY;
  moved = 0;
  dragging.value = true;
  const el = bottleEl.value;
  scale = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function corkMove(event) {
  if (startY === null) return;
  const up = (startY - event.clientY) / (scale || 1);
  moved = Math.max(moved, Math.abs(up));
  corkP.value = Math.max(0, Math.min(1, up / 70));
  if (corkP.value >= 1) {
    startY = null;
    pop();
  }
}
function corkUp() {
  if (startY === null) return;
  const wasTap = moved < 5;
  startY = null;
  dragging.value = false;
  if (popped.value) return;
  if (wasTap) {
    // ang tap ay unti-unting humihila sa tapon
    corkP.value = Math.min(1, corkP.value + 0.34);
    if (corkP.value >= 1) pop();
  } else {
    corkP.value = 0;
  }
}
</script>

<style scoped>
.bottle-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.head {
  position: absolute;
  top: 9%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.eyebrow {
  margin: 0;
  color: #ffe9d6;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.34em;
  text-shadow: 0 2px 10px rgb(60 20 70 / 0.5);
  text-transform: uppercase;
}
h2 {
  margin: 8px 0 0;
  color: #fff;
  font-family: var(--font-head);
  font-size: clamp(28px, 8cqi, 40px);
  font-style: italic;
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 2px 14px rgb(60 20 70 / 0.55);
}

/* ===== Bote ===== */
.bottle {
  position: absolute;
  width: 120px;
  height: 230px;
  translate: -50% -50%;
  transition:
    left 1.1s cubic-bezier(0.3, 0.9, 0.3, 1),
    top 1.1s cubic-bezier(0.3, 0.9, 0.3, 1),
    rotate 1.1s cubic-bezier(0.3, 0.9, 0.3, 1),
    scale 1.1s cubic-bezier(0.3, 0.9, 0.3, 1),
    opacity 1s ease;
  filter: drop-shadow(0 12px 14px rgb(20 40 80 / 0.4));
}
.popped .bottle {
  opacity: 0.55;
}
.catch {
  position: absolute;
  inset: 0;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}
.catch:disabled {
  cursor: default;
}
.catch:focus-visible {
  outline: 2px dashed #fff;
  outline-offset: 6px;
}
.sway {
  display: block;
  width: 100%;
  height: 100%;
  animation: bottle-sway 3s ease-in-out infinite alternate;
}
.popped .sway {
  animation: none;
}
.sway svg {
  display: block;
  width: 100%;
  height: 100%;
}
.cork {
  position: absolute;
  top: 38px;
  left: 50%;
  z-index: 2;
  width: 34px;
  height: 28px;
  margin-left: -17px;
  border-radius: 6px 6px 4px 4px;
  background:
    repeating-linear-gradient(0deg, rgb(120 70 30 / 0.2) 0 2px, transparent 2px 6px),
    linear-gradient(90deg, #c88a52, #e3b07a 45%, #b87a44);
  box-shadow: 0 0 0 0 rgb(255 255 255 / 0.7);
  cursor: grab;
  touch-action: none;
  animation: cork-glow 1.6s ease-in-out infinite alternate;
}
.cork:not(.drag):not(.pop) {
  transition: translate 0.4s cubic-bezier(0.3, 1.6, 0.5, 1), rotate 0.4s ease;
}
.cork:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 4px;
}
.cork.pop {
  pointer-events: none;
  animation: cork-fly 1.3s ease-out forwards;
}

/* ===== Sulat ===== */
.letter {
  position: absolute;
  top: 17%;
  left: 50%;
  width: min(100% - 36px, 360px);
  clip-path: inset(-30px -30px -30px -30px);
  filter: drop-shadow(0 16px 24px rgb(40 20 70 / 0.4));
  transform: translateX(-50%);
}
.rod {
  display: block;
  height: 14px;
  margin: 0 -6px;
  border-radius: 7px;
  background: linear-gradient(180deg, #d9b87a, #f6e2b4 45%, #c79c5a);
}
.paper {
  max-height: 46cqh;
  margin: 0 4px;
  padding: 18px 20px 12px;
  overflow-y: auto;
  background:
    radial-gradient(ellipse at 30% 0%, rgb(255 255 255 / 0.7), transparent 60%),
    linear-gradient(180deg, #fdf4dc, #f6e7c3);
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
  color: #8a5a2c;
  font-family: var(--font-head);
  font-size: 24px;
  font-style: italic;
  font-weight: 600;
}
.body {
  margin: 0;
  color: #5a4426;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.55;
}
.sig {
  margin: 10px 0 0;
  color: #8a5a2c;
  font-family: var(--font-head);
  font-size: 20px;
  font-style: italic;
  text-align: right;
}
.unroll-enter-active {
  transition: clip-path 1.8s cubic-bezier(0.3, 0.7, 0.3, 1), opacity 0.5s ease;
}
.unroll-enter-from {
  opacity: 0;
  clip-path: inset(-30px -30px 100% -30px);
}

.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3%;
  margin: 0;
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 2px 8px rgb(40 20 70 / 0.6);
  pointer-events: none;
}
.next {
  position: absolute;
  left: 50%;
  bottom: 3%;
  z-index: 4;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 10px 22px rgb(40 20 70 / 0.35);
  color: #c4573d;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.rise-enter-active {
  transition: opacity 0.9s ease 1.6s, transform 0.9s ease 1.6s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes bottle-sway {
  from {
    transform: translateY(-6px) rotate(-4deg);
  }
  to {
    transform: translateY(6px) rotate(4deg);
  }
}
@keyframes cork-glow {
  to {
    box-shadow: 0 0 14px 4px rgb(255 255 255 / 0.75);
  }
}
@keyframes cork-fly {
  to {
    translate: 46px -240px;
    rotate: 300deg;
    opacity: 0;
  }
}
@container (max-height: 620px) {
  .head {
    top: 5%;
  }
  .letter {
    top: 12%;
  }
  .paper {
    max-height: 44cqh;
  }
  .body {
    font-size: 14px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sway,
  .cork {
    animation: none;
  }
}
</style>