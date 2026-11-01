<template>
  <!-- SKY LANTERNS: may parol na nakalutang sa dagat; i-swipe pataas (o i-tap) para lumipad,
       dala ang isang maikling sulat. Ang mga napalipad na ay naiiwang lumulutang sa langit. -->
  <section class="lantern-stage">
    <header class="lantern-head">
      <p class="eyebrow">Make a wish</p>
      <h2>Send your wishes to the sky</h2>
      <p class="note" aria-live="polite">
        <Transition name="note" mode="out-in">
          <span :key="noteIndex">{{ noteIndex >= 0 ? notes[noteIndex] : "Each lantern carries a little note." }}</span>
        </Transition>
      </p>
    </header>

    <!-- mga napalipad na parol -->
    <span
      v-for="lantern in flown"
      :key="lantern.id"
      class="lantern flying"
      :style="{ '--drift': `${lantern.drift}px`, '--height': `${lantern.height}cqh`, '--scale': lantern.scale }"
      aria-hidden="true"
    >
      <span class="lantern-body" />
    </span>

    <!-- parol na handa nang paliparin -->
    <button
      v-if="flown.length < notes.length"
      :key="`ready-${flown.length}`"
      class="lantern ready"
      type="button"
      :style="{ '--lift': `${lift}px` }"
      :aria-label="`Release lantern ${flown.length + 1} of ${notes.length}`"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @click="release"
    >
      <span class="lantern-body" />
    </button>
    <span v-if="flown.length < notes.length" class="water-glow" aria-hidden="true" />

    <p class="hint">
      {{ flown.length < notes.length ? `Swipe up to release ↑ · ${flown.length + 1} of ${notes.length}` : "Look how bright your sky is ✨" }}
    </p>
  </section>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";

const props = defineProps({
  notes: { type: Array, required: true },
  reduced: { type: Boolean, default: false },
});
const emit = defineEmits(["released", "done"]);

const flown = ref([]);
const noteIndex = ref(-1);
const lift = ref(0); // gaano kataas na hinila ng daliri (para ramdam ang swipe)
let startY = null;
let doneTimer = 0;

function onDown(event) {
  startY = event.clientY;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function onMove(event) {
  if (startY === null) return;
  lift.value = Math.max(-70, Math.min(0, event.clientY - startY));
}
function onUp() {
  startY = null;
}

// tap o swipe (pareho nagiging click) = lilipad ang parol
function release(event) {
  if (flown.value.length >= props.notes.length) return;
  const index = flown.value.length;
  emit("released", { index, el: event.currentTarget });
  flown.value = [
    ...flown.value,
    {
      id: index,
      drift: [-70, 80, -20, 120, -120][index % 5] + (Math.random() - 0.5) * 30,
      height: 60 + Math.random() * 16,
      scale: 0.32 + Math.random() * 0.12,
    },
  ];
  noteIndex.value = index;
  lift.value = 0;
  navigator.vibrate?.(20);
  if (flown.value.length === props.notes.length) {
    doneTimer = setTimeout(() => emit("done"), props.reduced ? 1500 : 4200);
  }
}

onBeforeUnmount(() => clearTimeout(doneTimer));
</script>

<style scoped>
.lantern-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
}
.lantern-head {
  position: absolute;
  top: 26%;
  left: 50%;
  width: min(100% - 44px, 420px);
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
  margin: 6px 0 10px;
  color: #f4e9f7;
  font-family: var(--font-serif);
  font-size: clamp(26px, 8cqi, 38px);
  font-weight: 400;
  line-height: 1.15;
  text-shadow: 0 0 22px rgb(214 178 240 / 0.5);
}
.note {
  min-height: 2.6em;
  margin: 0;
  color: #fde7c4;
  font-family: var(--font-script);
  font-size: clamp(24px, 7cqi, 32px);
  line-height: 1.2;
  text-shadow: 0 0 14px rgb(255 180 100 / 0.6);
}
.note-enter-active,
.note-leave-active {
  transition: opacity 0.5s ease, filter 0.5s ease;
}
.note-enter-from,
.note-leave-to {
  opacity: 0;
  filter: blur(6px);
}

/* ===== Parol (CSS lang): papel na kumikinang mula sa loob ===== */
.lantern {
  position: absolute;
  left: 50%;
  bottom: 13%;
  width: 46px;
  height: 58px;
  margin-left: -23px;
  padding: 0;
  border: 0;
  background: none;
}
.lantern-body {
  position: absolute;
  inset: 0;
  border-radius: 42% 42% 30% 30% / 34% 34% 24% 24%;
  background:
    repeating-linear-gradient(90deg, transparent 0 10px, rgb(150 60 30 / 0.16) 10px 11px),
    radial-gradient(ellipse at 50% 72%, #fff6d2 0%, #ffcb73 32%, #f28e4c 72%, #b9542f 100%);
  box-shadow:
    0 0 22px 8px rgb(255 170 90 / 0.55),
    0 0 60px 22px rgb(255 150 80 / 0.22);
  animation: sway 3.2s ease-in-out infinite alternate;
  transform-origin: 50% 0;
}
.lantern-body::before {
  /* itaas na gilid */
  content: "";
  position: absolute;
  top: -3px;
  left: 18%;
  right: 18%;
  height: 6px;
  border-radius: 3px;
  background: #7a3a24;
}
.lantern-body::after {
  /* apoy sa ilalim */
  content: "";
  position: absolute;
  bottom: 6px;
  left: 50%;
  width: 8px;
  height: 11px;
  margin-left: -4px;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: radial-gradient(ellipse at 50% 70%, #fff, #ffe08a 50%, #ff9a3c);
  filter: blur(0.5px);
  animation: flicker 0.18s steps(2) infinite alternate;
}
.lantern.ready {
  cursor: grab;
  touch-action: none;
  transform: translateY(var(--lift, 0));
  transition: transform 0.25s ease;
  animation: bob 2.6s ease-in-out infinite alternate;
}
.lantern.ready:focus-visible {
  outline: 2px solid #ffcb73;
  outline-offset: 8px;
  border-radius: 12px;
}
/* lumilipad: pataas, palayo (lumiliit), may konting anod pakaliwa/kanan */
.lantern.flying {
  pointer-events: none;
  animation: rise 6s cubic-bezier(0.25, 0.1, 0.3, 1) forwards;
}
.water-glow {
  position: absolute;
  left: 50%;
  bottom: calc(13% - 18px);
  width: 120px;
  height: 22px;
  margin-left: -60px;
  border-radius: 50%;
  background: radial-gradient(ellipse closest-side, rgb(255 180 100 / 0.55), transparent);
  pointer-events: none;
  animation: shimmer 2.6s ease-in-out infinite alternate;
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
}

@keyframes rise {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(var(--drift), calc(var(--height) * -1)) scale(var(--scale));
  }
}
@keyframes bob {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 -6px;
  }
}
@keyframes sway {
  from {
    transform: rotate(-4deg);
  }
  to {
    transform: rotate(4deg);
  }
}
@keyframes flicker {
  to {
    opacity: 0.75;
    transform: scaleY(0.9);
  }
}
@keyframes shimmer {
  to {
    opacity: 0.6;
    transform: scaleX(1.15);
  }
}
@container (max-height: 620px) {
  .lantern-head {
    top: 16%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .lantern-body,
  .lantern-body::after,
  .lantern.ready,
  .water-glow {
    animation: none;
  }
  .lantern.flying {
    animation-duration: 1.5s;
  }
}
</style>
