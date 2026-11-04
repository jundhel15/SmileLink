<template>
  <!-- PUNUIN ANG BUWAN: malaking crescent sa gitna; paikutin ang daliri sa paligid nito (o i-hold)
       para mapuno. Pag full moon na: lalabas ang litrato sa loob + birthday message. -->
  <!-- naka-attach sa buong eksena ang pointer: kahit saan iikot ang daliri, binibilang batay sa gitna ng buwan -->
  <section
    class="moon-stage"
    :class="{ full }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <header class="moon-head">
      <p class="eyebrow">{{ full ? "Happy birthday" : "One last wish" }}</p>
      <h2 v-if="!full">Circle the moon<br />to make it full</h2>
    </header>

    <div
      ref="moonEl"
      class="big-moon"
      :style="{ '--p': shown }"
      role="button"
      tabindex="0"
      :aria-label="full ? `Full moon with a photo of ${recipient}` : `Fill the moon, ${Math.round(progress * 100)} percent`"
      @keydown.space.prevent="bump(0.08)"
      @keydown.enter.prevent="bump(0.08)"
    >
      <span class="moon-halo" aria-hidden="true" />
      <span class="moon-disc">
        <span class="moon-face" />
        <img
          v-for="(src, i) in pics"
          :key="i"
          class="moon-photo"
          :class="{ cur: i === slide }"
          :src="src"
          alt=""
          draggable="false"
        />
      </span>
      <svg class="moon-ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="48" pathLength="1" />
      </svg>
    </div>

    <p v-if="!full" class="hint">{{ Math.round(progress * 100) }}% full · trace circles or hold</p>

    <Transition name="rise">
      <div v-if="full" class="message">
        <h3>{{ recipient }}</h3>
        <p class="text">{{ message }}</p>
        <p class="from">— {{ sender }}</p>
        <div class="actions">
          <button v-if="pics.length > 1" class="more" type="button" @click="emit('gallery')">See our memories ✦</button>
          <button class="replay" type="button" @click="emit('replay')">↻ Replay</button>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  // 1 hanggang 10 litrato (URL string o { src }). Sunod-sunod silang lilitaw sa loob ng buwan.
  photos: { type: Array, default: () => [] },
});
const emit = defineEmits(["full", "replay", "gallery"]);

const pics = computed(() =>
  props.photos
    .map((p) => (typeof p === "string" ? p : p?.src))
    .filter(Boolean)
    .slice(0, 10),
);
const moonEl = ref(null);
const progress = ref(0);
const full = ref(false);
// laging may manipis na crescent sa simula (0.16) para alam kung ano ang pupunuin
const shown = computed(() => (full.value ? 1 : 0.16 + progress.value * 0.84));

const slide = ref(0);
let slideTimer = 0;
watch(
  () => full.value,
  (isFull) => {
    clearInterval(slideTimer);
    if (isFull && pics.value.length > 1) {
      slideTimer = setInterval(() => {
        slide.value = (slide.value + 1) % pics.value.length;
      }, 3200);
    }
  },
);

const ROTATIONS = 1.5; // ilang ikot ng daliri bago mapuno
let lastAngle = null;
let holdTimer = 0;

function bump(amount) {
  if (full.value) return;
  progress.value = Math.min(1, progress.value + amount);
  if (progress.value >= 1) complete();
}

function angleOf(event) {
  const rect = moonEl.value.getBoundingClientRect();
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top + rect.height / 2);
  // masyadong malapit sa gitna = hindi maaasahan ang anggulo
  if (Math.hypot(dx, dy) < rect.width * 0.08) return null;
  return Math.atan2(dy, dx);
}

function onDown(event) {
  if (full.value) return;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  lastAngle = angleOf(event);
  // kahit hindi gumagalaw (hold), dahan-dahang napupuno
  clearInterval(holdTimer);
  holdTimer = setInterval(() => bump(0.012), 100);
}
function onMove(event) {
  if (holdTimer === 0 || full.value) return;
  const angle = angleOf(event);
  if (angle === null) return;
  if (lastAngle !== null) {
    let delta = angle - lastAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    bump(Math.abs(delta) / (Math.PI * 2 * ROTATIONS));
  }
  lastAngle = angle;
}
function onUp() {
  clearInterval(holdTimer);
  holdTimer = 0;
  lastAngle = null;
}

function complete() {
  onUp();
  full.value = true;
  navigator.vibrate?.([30, 50, 30]);
  emit("full", moonEl.value);
}

onBeforeUnmount(() => {
  clearInterval(holdTimer);
  clearInterval(slideTimer);
});
</script>

<style scoped>
.moon-stage {
  --size: min(56cqi, 34cqh, 240px);
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 70px 22px 120px;
  text-align: center;
  touch-action: none; /* para hindi mag-scroll ang page habang umiikot ang daliri */
  user-select: none;
  -webkit-user-select: none;
}
.moon-stage:not(.full) {
  cursor: grab;
}
.moon-head {
  min-height: 92px;
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
  line-height: 1.15;
  text-shadow: 0 0 22px rgb(214 178 240 / 0.5);
}

/* ===== Malaking buwan ===== */
.big-moon {
  position: relative;
  flex: none;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  cursor: grab;
  touch-action: none;
  outline: none;
  transition: transform 1s cubic-bezier(0.3, 1.4, 0.5, 1);
}
.big-moon:focus-visible .moon-ring circle {
  stroke: rgb(255 236 214 / 0.6);
}
.full .big-moon {
  cursor: default;
  transform: scale(1.04);
}
.moon-halo {
  position: absolute;
  inset: -45%;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 236 214 / 0.42), rgb(214 178 240 / 0.18) 45%, transparent 70%);
  opacity: calc(0.25 + var(--p) * 0.75);
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.full .moon-halo {
  animation: breathe 3s ease-in-out infinite;
}
/* crescent → full: tinatakpan ng bilog na "anino" na umuusog pakanan habang tumataas ang --p */
.moon-disc {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 50%;
  -webkit-mask-image: radial-gradient(
    circle calc(var(--size) / 2) at calc(50% + var(--p) * var(--size) * 1.05) 50%,
    transparent 98%,
    #000 100%
  );
  mask-image: radial-gradient(
    circle calc(var(--size) / 2) at calc(50% + var(--p) * var(--size) * 1.05) 50%,
    transparent 98%,
    #000 100%
  );
  box-shadow: 0 0 calc(20px + var(--p) * 50px) rgb(255 236 214 / 0.6);
}
.moon-face {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 62%, rgb(214 190 170 / 0.45) 0 7%, transparent 8%),
    radial-gradient(circle at 64% 32%, rgb(214 190 170 / 0.35) 0 9%, transparent 10%),
    radial-gradient(circle at 56% 72%, rgb(214 190 170 / 0.3) 0 5%, transparent 6%),
    radial-gradient(circle at 38% 36%, #fffaf0, #f6e7cf 55%, #e3cdb4);
}
.moon-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  filter: sepia(0.25) saturate(0.9);
  -webkit-mask-image: radial-gradient(circle, #000 55%, transparent 72%);
  mask-image: radial-gradient(circle, #000 55%, transparent 72%);
  transition: opacity 2s ease 0.4s;
  pointer-events: none;
}
.full .moon-photo.cur {
  opacity: 1;
}
.moon-ring {
  position: absolute;
  inset: -10px;
  overflow: visible;
  pointer-events: none;
}
.moon-ring circle {
  fill: none;
  stroke: rgb(255 236 214 / 0.22);
  stroke-width: 0.8;
  stroke-dasharray: 0.02 0.03;
  animation: spin 24s linear infinite;
  transform-origin: 50% 50%;
}
.full .moon-ring {
  opacity: 0;
  transition: opacity 0.8s ease;
}
.hint {
  margin: 0;
  color: rgb(253 242 248 / 0.85);
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  text-shadow: 0 2px 8px rgb(10 6 30 / 0.8);
}

/* ===== Mensahe pagkatapos mapuno ===== */
.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  max-width: 420px;
}
.message h3 {
  margin: 0;
  color: #fde7f0;
  font-family: var(--font-script);
  font-size: clamp(54px, 16cqi, 80px);
  font-weight: 400;
  line-height: 1;
  text-shadow: 0 0 24px rgb(244 170 208 / 0.6);
}
.message .text {
  margin: 0;
  color: #f4e9f7;
  font-family: var(--font-serif);
  font-size: 19px;
  line-height: 1.45;
  text-shadow: 0 2px 10px rgb(10 6 30 / 0.8);
}
.message .from {
  margin: 0;
  color: #f1d3a6;
  font-family: var(--font-script);
  font-size: 28px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}
.more {
  padding: 10px 22px;
  border: 1px solid rgb(255 217 138 / 0.8);
  border-radius: 999px;
  background: linear-gradient(180deg, rgb(255 217 138 / 0.28), rgb(255 217 138 / 0.12));
  color: #fff6e0;
  font-family: var(--font-serif);
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 0 18px rgb(255 217 138 / 0.35);
}
.more:hover {
  background: rgb(255 217 138 / 0.35);
}
.replay {
  padding: 10px 24px;
  border: 1px solid rgb(241 211 166 / 0.6);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.08);
  color: #fdf2f8;
  font-family: var(--font-serif);
  font-size: 16px;
  cursor: pointer;
}
.replay:hover {
  background: rgb(255 255 255 / 0.18);
}
.rise-enter-active {
  transition: opacity 1.4s ease 1s, transform 1.4s ease 1s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes breathe {
  50% {
    transform: scale(1.08);
    opacity: 0.8;
  }
}
@container (max-height: 620px) {
  .moon-stage {
    padding: 20px 22px 40px;
    gap: 10px;
  }
  .moon-head {
    min-height: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .moon-ring circle,
  .full .moon-halo {
    animation: none;
  }
}
</style>
