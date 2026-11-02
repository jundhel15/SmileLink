<template>
  <!-- 4) FRIENDSHIP BRACELET: i-drag ang daliri sa tali; sunod-sunod na sumasampa ang mga bead na may letra
       hanggang mabuo ang salita (hal. B-E-S-T-I-E). -->
  <section class="bead-stage" :class="{ done }">
    <header class="head">
      <p class="eyebrow">Friendship bracelet</p>
      <h2>
        <Transition name="swap" mode="out-in">
          <span :key="done">{{ done ? "Made just for you" : "Drag along the string" }}</span>
        </Transition>
      </h2>
    </header>

    <div
      ref="areaEl"
      class="area"
      :style="{ '--p': p, '--n': letters.length }"
      tabindex="0"
      role="slider"
      aria-label="Thread the beads"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(p * 100)"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown.right.prevent="advance(p + 0.12)"
      @keydown.enter.prevent="advance(p + 0.12)"
      @keydown.space.prevent="advance(p + 0.12)"
    >
      <span class="string" />
      <span class="string lit" />
      <span
        v-for="(letter, i) in letters"
        :key="i"
        class="bead"
        :class="{ on: isOn(i) }"
        :style="{
          left: `${((i + 0.5) / letters.length) * 100}%`,
          '--c': COLORS[i % COLORS.length],
          '--ox': `${OFFSETS[i % OFFSETS.length]}px`,
          '--oy': `${64 + (i % 3) * 9}px`,
          '--rot': `${OFFSETS[(i + 2) % OFFSETS.length] * 3}deg`,
        }"
      >
        <span class="letter">{{ letter }}</span>
      </span>
      <span class="needle" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path :d="SPARKLE" /></svg>
      </span>
    </div>

    <p v-if="!done" class="hint">{{ threaded }} / {{ letters.length }} beads · slide your finger →</p>

    <Transition name="rise">
      <div v-if="done" class="result">
        <p class="note">{{ note }}</p>
        <button class="next" type="button" @click="emit('done')">Continue ✦</button>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  word: { type: String, required: true },
  note: { type: String, default: "" },
});
const emit = defineEmits(["threaded", "done"]);

const COLORS = ["#ff7a7a", "#f4b942", "#2a9d8f", "#f78fb3", "#8e7dff", "#5ec2f2"];
const OFFSETS = [-9, 7, -4, 10, -11, 5]; // konting gulo ng mga bead na hindi pa nakasampa
const SPARKLE = "M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z";

const letters = computed(() => [...props.word.replace(/\s+/g, "").toUpperCase()].slice(0, 10));
const areaEl = ref(null);
const p = ref(0); // 0–1: gaano na kalayo ang karayom
const done = ref(false);
let dragging = false;

const isOn = (i) => p.value >= (i + 0.5) / letters.value.length - 0.02;
const threaded = computed(() => letters.value.filter((_, i) => isOn(i)).length);

// laging pasulong lang, at hindi puwedeng lumundag nang sobra (para ramdam ang pagsasampa)
function advance(value) {
  if (done.value) return;
  const next = Math.min(1, value);
  if (next > p.value) p.value = next;
  if (p.value >= 0.97) {
    p.value = 1;
    done.value = true;
    navigator.vibrate?.([15, 30, 15]);
    emit("threaded", areaEl.value);
  }
}
function fromPointer(event) {
  const rect = areaEl.value.getBoundingClientRect();
  const value = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  advance(Math.min(value, p.value + 0.25));
}
function onDown(event) {
  if (done.value) return;
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
.bead-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 70px 22px 90px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
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

/* ===== Tali at mga bead ===== */
.area {
  --bs: min(38px, calc((100cqi - 70px) / var(--n)));
  position: relative;
  flex: none;
  width: min(calc(100% - 8px), 380px);
  height: 150px;
  cursor: grab;
  touch-action: none;
  outline: none;
}
.area:focus-visible {
  outline: 2px dashed #4a2340;
  outline-offset: 6px;
  border-radius: 12px;
}
.string {
  position: absolute;
  left: -6px;
  right: -6px;
  top: 60px;
  height: 3px;
  border-radius: 2px;
  background: repeating-linear-gradient(90deg, #8a5a48 0 4px, #a8765c 4px 8px);
  transform: translateY(-50%);
}
.string.lit {
  right: auto;
  width: calc(var(--p) * 100% + 6px);
  background: linear-gradient(90deg, #f4b942, #fff0b8);
  box-shadow: 0 0 10px rgb(244 185 66 / 0.8);
  transition: width 0.15s ease-out;
}
.bead {
  position: absolute;
  top: 60px;
  display: grid;
  place-items: center;
  width: var(--bs);
  height: var(--bs);
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.85), transparent 30%),
    radial-gradient(circle at 50% 50%, var(--c), color-mix(in srgb, var(--c) 65%, #4a2340));
  box-shadow: inset -3px -4px 8px rgb(0 0 0 / 0.18), 0 4px 10px rgb(90 40 60 / 0.25);
  opacity: 0.8;
  transform: translate(calc(-50% + var(--ox)), calc(-50% + var(--oy))) rotate(var(--rot)) scale(0.88);
  transition:
    transform 0.7s cubic-bezier(0.3, 1.6, 0.5, 1),
    opacity 0.4s ease;
}
.bead.on {
  --ox: 0px;
  --oy: 0px;
  --rot: 0deg;
  opacity: 1;
}
.bead.on {
  transform: translate(-50%, -50%) scale(1);
}
.letter {
  color: #fff;
  font-family: var(--font-serif);
  font-size: calc(var(--bs) * 0.5);
  font-weight: 600;
  text-shadow: 0 1px 3px rgb(0 0 0 / 0.35);
  opacity: 0;
  transition: opacity 0.4s ease 0.25s;
}
.on .letter {
  opacity: 1;
}
.needle {
  position: absolute;
  top: 60px;
  left: calc(var(--p) * 100%);
  width: 30px;
  height: 30px;
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: left 0.15s ease-out, opacity 0.6s ease;
}
.needle svg {
  width: 100%;
  height: 100%;
  fill: #fff8dc;
  filter: drop-shadow(0 0 4px #fff) drop-shadow(0 0 10px #f4b942);
  animation: spin 3s linear infinite;
}
.done .needle {
  opacity: 0;
}
.done .bead.on {
  animation: shine 2.4s ease-in-out infinite alternate;
  animation-delay: calc(var(--n) * 0s);
}
.hint {
  margin: 0;
  color: #6d3a58;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
}
.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  max-width: 360px;
}
.note {
  margin: 0;
  color: #4a2340;
  font-family: var(--font-hand);
  font-size: clamp(26px, 7.6cqi, 34px);
  font-weight: 700;
  line-height: 1.1;
}
.next {
  padding: 10px 26px;
  border: 1px solid #d9574c;
  border-radius: 999px;
  background: #fff8ee;
  color: #b8403a;
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 8px 20px rgb(217 87 76 / 0.28);
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
  transition: opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes shine {
  to {
    filter: brightness(1.18) drop-shadow(0 0 6px rgb(255 240 190 / 0.9));
  }
}
@container (max-height: 620px) {
  .bead-stage {
    gap: 10px;
    padding: 30px 22px 30px;
  }
  .area {
    height: 130px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .needle svg,
  .done .bead.on {
    animation: none;
  }
}
</style>