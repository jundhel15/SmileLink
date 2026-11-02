<template>
  <!-- 2) BLOOM GARDEN: may bouquet ng mga usbong sa vase; i-tap ang bawat usbong para mamukadkad
       at lumabas ang isang bagay na hinahangaan niya sa kanya. -->
  <section class="garden-stage">
    <header class="head">
      <p class="eyebrow">Things I adore about you</p>
      <h2>Let each bud bloom</h2>
    </header>

    <div class="note-slot" aria-live="polite">
      <Transition name="note" mode="out-in">
        <p :key="current" class="note">{{ current >= 0 ? blooms[current] : "Tap a bud to see what it holds." }}</p>
      </Transition>
    </div>

    <svg class="stems" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path
        v-for="(text, i) in blooms"
        :key="i"
        class="stem"
        :class="{ grown: opened.includes(i) }"
        :d="stem(i)"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <div class="vase" aria-hidden="true" />

    <button
      v-for="(text, i) in blooms"
      :key="`f${i}`"
      class="flower"
      :class="{ open: opened.includes(i) }"
      :style="{
        left: `${spot(i).x}%`,
        top: `${spot(i).y}%`,
        '--c1': PALETTE[i % PALETTE.length][0],
        '--c2': PALETTE[i % PALETTE.length][1],
        '--delay': `${i * 0.2}s`,
      }"
      type="button"
      :disabled="opened.includes(i)"
      :aria-label="`Bloom flower ${i + 1}`"
      @click="bloom(i, $event)"
    >
      <span class="sway">
        <span v-for="n in 8" :key="n" class="petal" :style="{ '--a': `${(n - 1) * 45}deg`, '--k': n }" />
        <span class="core" />
      </span>
    </button>

    <p class="hint">{{ opened.length }} / {{ blooms.length }} in bloom</p>

    <Transition name="rise">
      <button v-if="allOpen" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  blooms: { type: Array, required: true },
});
const emit = defineEmits(["bloomed", "done"]);

// [panlabas, ilalim ng petal]
const PALETTE = [
  ["#fffdf8", "#efe3cc"],
  ["#fde8e2", "#f1b9ae"],
  ["#fff6de", "#eed59a"],
  ["#ffffff", "#dfe6d6"],
  ["#fbe4ec", "#ecb1c3"],
];
const SPOTS = [
  { x: 18, y: 62 },
  { x: 35, y: 51 },
  { x: 52, y: 46 },
  { x: 69, y: 52 },
  { x: 84, y: 62 },
  { x: 26, y: 70 },
  { x: 76, y: 70 },
];
const spot = (i) => SPOTS[i % SPOTS.length];
// tangkay: mula sa vase (50, 86) papunta sa bulaklak
function stem(i) {
  const { x, y } = spot(i);
  const mid = (86 + y) / 2;
  return `M50 86 C50 ${mid + 6}, ${x} ${mid}, ${x} ${y + 6}`;
}

const opened = ref([]);
const current = ref(-1);
const allOpen = computed(() => opened.value.length === props.blooms.length);

function bloom(i, event) {
  if (opened.value.includes(i)) return;
  opened.value = [...opened.value, i];
  current.value = i;
  navigator.vibrate?.(15);
  emit("bloomed", event.currentTarget);
}
</script>

<style scoped>
.garden-stage {
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

/* ===== Kard ng sulat ===== */
.note-slot {
  position: absolute;
  top: 22%;
  left: 50%;
  display: grid;
  place-items: center;
  width: min(100% - 56px, 340px);
  min-height: 84px;
  padding: 14px 20px;
  border: 1px solid rgb(184 145 79 / 0.6);
  background: rgb(255 253 247 / 0.85);
  box-shadow:
    0 0 0 4px rgb(255 253 247 / 0.6),
    0 10px 24px rgb(120 90 40 / 0.15);
  transform: translateX(-50%);
}
.note {
  margin: 0;
  color: #3f3a2e;
  font-family: var(--font-serif);
  font-size: clamp(19px, 5.4cqi, 23px);
  font-style: italic;
  line-height: 1.3;
  text-align: center;
}
.note-enter-active,
.note-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.note-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.note-leave-to {
  opacity: 0;
}

/* ===== Tangkay at vase ===== */
.stems {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.stem {
  fill: none;
  stroke: #8a9a7b;
  stroke-width: 2.2;
  stroke-linecap: round;
  transition: stroke 1s ease;
}
.stem.grown {
  stroke: #6b7c5c;
}
.vase {
  position: absolute;
  left: 50%;
  bottom: 5%;
  z-index: 2;
  width: 88px;
  height: 94px;
  margin-left: -44px;
  border-radius: 16px 16px 42px 42px / 12px 12px 52px 52px;
  background: linear-gradient(90deg, #ece3d0, #fffdf8 45%, #e0d4ba);
  box-shadow:
    inset 0 -10px 16px rgb(150 120 70 / 0.2),
    0 10px 20px rgb(80 60 30 / 0.25);
}
.vase::before {
  content: "";
  position: absolute;
  top: 14px;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #b8914f, #e6cf9c 50%, #b8914f);
}

/* ===== Bulaklak: usbong → bukadkad ===== */
.flower {
  position: absolute;
  z-index: 3;
  width: 76px;
  height: 76px;
  margin: -38px 0 0 -38px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  cursor: pointer;
  animation: grow-in 1.4s cubic-bezier(0.3, 1.4, 0.5, 1) var(--delay) both;
}
.flower:focus-visible {
  outline: 2px solid #b8914f;
  outline-offset: 4px;
}
.flower::after {
  /* gintong liwanag pagkabukadkad */
  content: "";
  position: absolute;
  inset: -22px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(236 200 110 / 0.55), transparent 65%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 1s ease 0.3s;
}
.flower.open::after {
  opacity: 1;
}
.sway {
  position: absolute;
  inset: 0;
  transform-origin: 50% 80%;
  animation: sway 4s ease-in-out var(--delay) infinite alternate;
}
.petal {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 34px;
  margin: -34px 0 0 -9px;
  border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%;
  background: radial-gradient(ellipse at 50% 85%, var(--c2), var(--c1) 70%);
  box-shadow: inset 0 -4px 6px rgb(0 0 0 / 0.05);
  transform-origin: 50% 100%;
  /* usbong: lahat ng petal ay magkakadikit paitaas */
  transform: rotate(calc(var(--k) * 3deg - 14deg)) translateY(2px) scale(0.55, 0.85);
  transition: transform 1.1s cubic-bezier(0.3, 1.4, 0.5, 1) calc(var(--k) * 0.04s);
}
.open .petal {
  transform: rotate(var(--a)) translateY(-2px) scale(1);
}
.core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff0c4, #d9b46a 70%);
  box-shadow: 0 0 8px rgb(236 200 110 / 0.9);
  transform: scale(0);
  transition: transform 0.8s cubic-bezier(0.3, 1.6, 0.5, 1) 0.5s;
}
.open .core {
  transform: scale(1);
}
.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1.4%;
  z-index: 3;
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  text-align: center;
  pointer-events: none;
}
.next {
  position: absolute;
  left: 50%;
  bottom: 14%;
  z-index: 4;
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
  transform: translateX(-50%);
}
.rise-enter-active {
  transition: opacity 0.8s ease 0.8s;
}
.rise-enter-from {
  opacity: 0;
}

@keyframes grow-in {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.4);
  }
}
@keyframes sway {
  from {
    transform: rotate(-3deg);
  }
  to {
    transform: rotate(3deg);
  }
}
@container (max-height: 620px) {
  .head {
    top: 4%;
  }
  .note-slot {
    top: 19%;
    min-height: 64px;
  }
  .hint {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .flower {
    animation-duration: 0.5s;
  }
  .sway {
    animation: none;
  }
}
</style>