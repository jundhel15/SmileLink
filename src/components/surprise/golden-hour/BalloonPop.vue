<template>
  <!-- 3) BALLOON POP: lumulutang ang mga lobo; i-tap para pumutok at lumabas ang isang dahilan kung bakit mahal ka niya. -->
  <section class="balloon-stage">
    <header class="head">
      <p class="eyebrow">Reasons I love you</p>
      <h2>Pop the balloons</h2>
    </header>

    <div class="note-slot" aria-live="polite">
      <Transition name="note" mode="out-in">
        <p :key="current" class="note">{{ current >= 0 ? reasons[current] : "Each balloon is hiding something true." }}</p>
      </Transition>
    </div>

    <button
      v-for="(reason, i) in reasons"
      :key="i"
      class="balloon"
      :class="{ popped: popped.includes(i) }"
      :style="{
        left: `${spot(i).x}%`,
        top: `${spot(i).y}%`,
        '--c': COLORS[i % COLORS.length],
        '--delay': `${i * 0.25}s`,
      }"
      type="button"
      :disabled="popped.includes(i)"
      :aria-label="`Pop balloon ${i + 1}`"
      @click="pop(i, $event)"
    >
      <span class="sway">
        <span class="body" />
        <span class="knot" />
        <span class="string" />
      </span>
    </button>

    <p class="hint">{{ popped.length }} / {{ reasons.length }} popped</p>

    <Transition name="rise">
      <button v-if="allPopped" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  reasons: { type: Array, required: true },
});
const emit = defineEmits(["popped", "done"]);

const COLORS = ["#ff7a7a", "#f4b942", "#2a9d8f", "#f78fb3", "#8e7dff", "#5ec2f2"];
// puwesto ng mga lobo (% ng screen); iniiwasan ang taas kung nasaan ang sticky note
const SPOTS = [
  { x: 17, y: 52 },
  { x: 50, y: 46 },
  { x: 83, y: 53 },
  { x: 33, y: 70 },
  { x: 67, y: 71 },
  { x: 14, y: 76 },
  { x: 86, y: 76 },
];
const spot = (i) => SPOTS[i % SPOTS.length];

const popped = ref([]);
const current = ref(-1);
const allPopped = computed(() => popped.value.length === props.reasons.length);

function pop(i, event) {
  if (popped.value.includes(i)) return;
  popped.value = [...popped.value, i];
  current.value = i;
  navigator.vibrate?.(15);
  emit("popped", event.currentTarget);
}
</script>

<style scoped>
.balloon-stage {
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

/* ===== Sticky note na may dahilan ===== */
.note-slot {
  position: absolute;
  top: 24%;
  left: 50%;
  display: grid;
  place-items: center;
  width: min(100% - 44px, 360px);
  min-height: 92px;
  padding: 14px 18px;
  background: #fff4b8;
  box-shadow: 0 10px 22px rgb(110 60 40 / 0.25);
  transform: translateX(-50%) rotate(-1.5deg);
}
.note-slot::before {
  content: "";
  position: absolute;
  top: -9px;
  left: 50%;
  width: 54px;
  height: 16px;
  background: rgb(247 143 179 / 0.7);
  transform: translateX(-50%) rotate(2deg);
}
.note {
  margin: 0;
  color: #4a2340;
  font-family: var(--font-hand);
  font-size: clamp(22px, 6.4cqi, 28px);
  font-weight: 700;
  line-height: 1.12;
  text-align: center;
}
.note-enter-active,
.note-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.note-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
.note-leave-to {
  opacity: 0;
}

/* ===== Lobo (CSS lang) ===== */
.balloon {
  position: absolute;
  width: 64px;
  height: 130px;
  margin: -65px 0 0 -32px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  animation: float-in 2.6s cubic-bezier(0.2, 0.8, 0.25, 1) var(--delay) both;
}
.balloon:focus-visible {
  outline: 2px solid #4a2340;
  outline-offset: 6px;
  border-radius: 20px;
}
.sway {
  position: absolute;
  inset: 0;
  transform-origin: 50% 100%;
  animation: bob 3s ease-in-out calc(var(--delay) + 2.6s) infinite alternate;
}
.body {
  position: absolute;
  top: 0;
  left: 0;
  width: 64px;
  height: 78px;
  border-radius: 50% 50% 48% 48% / 42% 42% 58% 58%;
  background:
    radial-gradient(ellipse at 32% 26%, rgb(255 255 255 / 0.75), transparent 28%),
    radial-gradient(circle at 50% 40%, var(--c), color-mix(in srgb, var(--c) 70%, #4a2340));
  box-shadow: inset -6px -8px 14px rgb(0 0 0 / 0.14);
}
.knot {
  position: absolute;
  top: 76px;
  left: 28px;
  width: 8px;
  height: 8px;
  background: var(--c);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  filter: brightness(0.85);
}
.string {
  position: absolute;
  top: 84px;
  left: 31px;
  width: 1.5px;
  height: 46px;
  background: rgb(74 35 64 / 0.45);
}
.popped {
  pointer-events: none;
}
.popped .sway {
  animation: boom 0.28s ease-out forwards;
}
.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 4%;
  margin: 0;
  color: #6d3a58;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  text-align: center;
  pointer-events: none;
}
.next {
  position: absolute;
  left: 50%;
  bottom: 9%;
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
  transform: translateX(-50%);
}
.rise-enter-active {
  transition: opacity 0.8s ease 0.6s;
}
.rise-enter-from {
  opacity: 0;
}

@keyframes float-in {
  from {
    transform: translateY(60cqh);
  }
  to {
    transform: none;
  }
}
@keyframes bob {
  from {
    transform: rotate(-4deg) translateY(0);
  }
  to {
    transform: rotate(4deg) translateY(-8px);
  }
}
@keyframes boom {
  40% {
    transform: scale(1.3);
    opacity: 1;
  }
  to {
    transform: scale(1.7);
    opacity: 0;
  }
}
@container (max-height: 620px) {
  .head {
    top: 4%;
  }
  .note-slot {
    top: 20%;
    min-height: 72px;
  }
  .hint {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .balloon {
    animation-duration: 0.6s;
  }
  .sway {
    animation: none;
  }
}
</style>