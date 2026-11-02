<template>
  <!-- 1) RAISE THE FLAG: hilahin pataas ang pulang bandila ng mailbox. Kapag naitaas na, bubukas ang pinto
       at lilipad palabas ang mga sulat na naghihintay sa loob. -->
  <section ref="stageEl" class="fl-stage" :class="{ 'is-open': opened }">
    <header class="fl-head">
      <p class="fl-eyebrow">{{ opened ? "You've got mail" : `Month ${monthCount}` }}</p>
      <h2>{{ opened ? "So many letters for you" : "Raise the flag" }}</h2>
    </header>

    <div ref="boxEl" class="fl-box" :class="{ drag: dragging }">
      <svg viewBox="0 0 300 240" aria-hidden="true">
        <ellipse cx="124" cy="232" rx="86" ry="8" class="fl-ground" />
        <rect x="112" y="156" width="24" height="76" rx="4" class="fl-pole" />
        <g class="fl-bow">
          <path d="M124 176 C100 156 84 168 92 184 C100 196 118 188 124 176Z" />
          <path d="M124 176 C148 156 164 168 156 184 C148 196 130 188 124 176Z" />
          <circle cx="124" cy="178" r="6" />
        </g>
        <path d="M30 160 V96 C30 58 62 36 100 36 H150 C188 36 220 58 220 96 V160 Z" class="fl-body" />
        <path d="M44 160 V98 C44 66 70 50 102 50 H148 C180 50 206 66 206 98 V160 Z" class="fl-inside" />
        <g class="fl-door">
          <path d="M30 160 V96 C30 58 62 36 100 36 H150 C188 36 220 58 220 96 V160 Z" class="fl-doorface" />
          <path d="M125 128 C96 108 100 84 118 84 C124 84 125 90 125 90 C125 90 126 84 132 84 C150 84 154 108 125 128Z" class="fl-emblem" />
        </g>
        <g class="fl-flag" :style="flagStyle">
          <rect x="222" y="50" width="8" height="58" rx="3" class="fl-arm" />
          <rect x="230" y="50" width="32" height="24" rx="4" class="fl-flagcloth" />
        </g>
        <circle cx="226" cy="108" r="7" class="fl-pivot" />
      </svg>

      <button
        v-if="!opened"
        class="fl-hit"
        type="button"
        aria-label="Raise the flag"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
        @keydown.enter.prevent="nudge"
        @keydown.space.prevent="nudge"
      >
        <span class="fl-arrow" aria-hidden="true">↑</span>
      </button>

      <template v-if="opened">
        <span v-for="(f, i) in flies" :key="i" class="fl-fly" :style="f">
          <span class="fl-env"><i>♥</i></span>
        </span>
      </template>
    </div>

    <p v-if="!opened" class="fl-hint">Drag the flag up · {{ Math.round(p * 100) }}%</p>

    <Transition name="fl-rise">
      <button v-if="opened" class="fl-next" type="button" @click="emit('done')">Open them ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

defineProps({
  monthCount: { type: Number, default: 1 },
});
const emit = defineEmits(["opened", "done"]);

const stageEl = ref(null);
const boxEl = ref(null);
const p = ref(0); // 0 = nakababa ang bandila, 1 = nakataas
const dragging = ref(false);
const opened = ref(false);

const flagStyle = computed(() => ({
  transformOrigin: "226px 108px",
  transformBox: "view-box",
  transform: `rotate(${88 * (1 - p.value)}deg)`,
}));

// mga sulat na lilipad palabas
const flies = [
  { tx: -130, ty: -150, r: -22, d: 0.0 },
  { tx: -78, ty: -205, r: 14, d: 0.08 },
  { tx: -24, ty: -130, r: -8, d: 0.16 },
  { tx: 34, ty: -215, r: 20, d: 0.05 },
  { tx: 86, ty: -150, r: -16, d: 0.12 },
  { tx: 132, ty: -200, r: 24, d: 0.2 },
  { tx: 6, ty: -262, r: -4, d: 0.26 },
].map((f) => ({
  "--tx": `${f.tx}px`,
  "--ty": `${f.ty}px`,
  "--r": `${f.r}deg`,
  animationDelay: `${f.d}s`,
}));

let start = null;
let startP = 0;
let timer = 0;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function down(event) {
  if (opened.value) return;
  start = { y: event.clientY };
  startP = p.value;
  dragging.value = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function move(event) {
  if (!start || opened.value) return;
  const rect = stageEl.value.getBoundingClientRect();
  const dy = start.y - event.clientY;
  p.value = clamp(startP + dy / ((rect.height || 1) * 0.2), 0, 1);
  if (p.value >= 0.96) open();
}
function up() {
  start = null;
  dragging.value = false;
}
function nudge() {
  p.value = clamp(p.value + 0.34, 0, 1);
  if (p.value >= 0.96) open();
}

function open() {
  if (opened.value) return;
  p.value = 1;
  opened.value = true;
  dragging.value = false;
  start = null;
  navigator.vibrate?.([30, 50, 30]);
  emit("opened", boxEl.value);
}

onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
.fl-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.fl-head {
  position: absolute;
  top: 9%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.fl-eyebrow {
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

/* ===== Mailbox ===== */
.fl-box {
  position: absolute;
  left: 50%;
  bottom: 13%;
  width: min(88cqi, 350px);
  aspect-ratio: 300 / 240;
  translate: -50% 0;
}
.fl-box svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 10px 12px rgb(122 43 69 / 0.25));
}
.fl-ground {
  fill: rgb(122 43 69 / 0.18);
}
.fl-pole {
  fill: #b07a4c;
  stroke: #8a5a3a;
  stroke-width: 1.5;
}
.fl-bow path,
.fl-bow circle {
  fill: #ff8fab;
  stroke: #e76f90;
  stroke-width: 1.5;
}
.fl-body {
  fill: #ff9fb8;
  stroke: #e76f90;
  stroke-width: 3;
}
.fl-inside {
  fill: #7a2b45;
}
.fl-door {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  transition: transform 0.9s cubic-bezier(0.5, 0, 0.3, 1);
}
.is-open .fl-door {
  transform: scaleY(0.1);
}
.fl-doorface {
  fill: #ffb3c7;
  stroke: #e76f90;
  stroke-width: 3;
}
.fl-emblem {
  fill: #e5384f;
  stroke: #c61f3b;
  stroke-width: 2;
}
.fl-flag {
  transition: transform 0.5s cubic-bezier(0.3, 1.4, 0.5, 1);
}
.drag .fl-flag,
.is-open .fl-flag {
  transition: none;
}
.fl-arm {
  fill: #c2455f;
}
.fl-flagcloth {
  fill: #e5384f;
  stroke: #b81f3a;
  stroke-width: 1.5;
}
.fl-pivot {
  fill: #7a2b45;
}

.fl-hit {
  position: absolute;
  top: 8%;
  right: -2%;
  display: grid;
  width: 32%;
  height: 56%;
  place-items: start center;
  padding: 0;
  border: 0;
  border-radius: 20px;
  background: transparent;
  cursor: grab;
  touch-action: none;
}
.fl-hit:active {
  cursor: grabbing;
}
.fl-hit:focus-visible {
  outline: 2px dashed #7a2b45;
  outline-offset: 2px;
}
.fl-arrow {
  margin-top: -2px;
  color: #fff;
  font-family: var(--font-head);
  font-size: 30px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgb(122 43 69 / 0.6);
  animation: fl-arrow 1s ease-in-out infinite alternate;
}

/* ===== Mga sulat na lumilipad ===== */
.fl-fly {
  position: absolute;
  left: 38%;
  top: 28%;
  animation: fl-pop 1.2s cubic-bezier(0.2, 1.1, 0.4, 1) both;
}
.fl-env {
  position: relative;
  display: grid;
  width: 50px;
  aspect-ratio: 1.4;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 6px;
  background: linear-gradient(160deg, #fff8f0, #ffe3d3);
  box-shadow: 0 8px 14px rgb(122 43 69 / 0.28);
  animation: fl-bob 2.6s ease-in-out 1.2s infinite alternate;
}
.fl-env::before {
  content: "";
  position: absolute;
  inset: 0 0 45%;
  background: linear-gradient(#ffb3c7, #ff93b0);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.fl-env i {
  position: relative;
  z-index: 1;
  margin-top: 4px;
  color: #e5384f;
  font-size: 11px;
  font-style: normal;
}

.fl-hint {
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
.fl-next {
  position: absolute;
  left: 50%;
  bottom: 4%;
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
.fl-rise-enter-active {
  transition: opacity 0.9s ease 1.6s, transform 0.9s ease 1.6s;
}
.fl-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes fl-arrow {
  to {
    transform: translateY(-9px);
  }
}
@keyframes fl-pop {
  from {
    opacity: 0;
    transform: translate(0, 40px) scale(0.3) rotate(0deg);
  }
  to {
    opacity: 1;
    transform: translate(var(--tx), var(--ty)) scale(1) rotate(var(--r));
  }
}
@keyframes fl-bob {
  from {
    transform: translateY(0) rotate(-3deg);
  }
  to {
    transform: translateY(-8px) rotate(3deg);
  }
}
@container (max-height: 620px) {
  .fl-head {
    top: 5%;
  }
  .fl-box {
    bottom: 9%;
    width: min(74cqi, 290px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .fl-arrow,
  .fl-env {
    animation: none;
  }
}
</style>