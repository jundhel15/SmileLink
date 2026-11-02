<template>
  <!-- 3) TURN THE CRANK: paikutin ng daliri ang hawakan ng music box. Habang umiikot, may lumilipad na nota
       at unti-unting nabubuklat pababa ang balumbon na may pinakamahabang sulat. -->
  <section class="mc-stage">
    <header class="mc-head">
      <p class="mc-eyebrow">{{ opened ? `Month ${monthCount}` : "A little music box" }}</p>
      <h2>{{ opened ? "Read it slowly" : "Turn the crank" }}</h2>
    </header>

    <div class="mc-paperwrap" :class="{ 'is-open': opened }" :style="{ '--p': p }">
      <article class="mc-paper">
        <img v-if="photo" class="mc-clip" :src="photo" alt="" draggable="false" />
        <p class="mc-to">Dear {{ recipient }},</p>
        <p class="mc-body">{{ letter }}</p>
        <p class="mc-sig">— {{ sender }}</p>
      </article>
      <span class="mc-roll top" aria-hidden="true" />
      <span class="mc-roll edge" aria-hidden="true"><i>♥</i></span>
    </div>

    <div class="mc-box">
      <span v-for="note in notes" :key="note.id" class="mc-note" :style="note.style" aria-hidden="true">{{ note.ch }}</span>
      <span v-if="!moved && !opened" class="mc-ring" aria-hidden="true" />
      <div
        ref="dialEl"
        class="mc-dial"
        :class="{ turning }"
        tabindex="0"
        role="button"
        aria-label="Turn the crank"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
        @keydown.enter.prevent="nudge"
        @keydown.space.prevent="nudge"
      >
        <svg class="mc-gear" viewBox="0 0 100 100" aria-hidden="true" :style="{ rotate: ang + 'deg' }">
          <circle cx="50" cy="50" r="42" class="mc-teeth" />
          <circle cx="50" cy="50" r="34" class="mc-gearbody" />
          <circle cx="50" cy="50" r="6" class="mc-hub" />
        </svg>
        <span class="mc-arm" :style="{ rotate: ang + 'deg' }"><i class="mc-knob" /></span>
      </div>
    </div>

    <p v-if="!opened" class="mc-hint">Turn it round and round · {{ Math.round(p * 100) }}%</p>

    <Transition name="mc-rise">
      <button v-if="opened" class="mc-next" type="button" @click="emit('done')">Continue ✦</button>
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
const emit = defineEmits(["unrolled", "done"]);

const dialEl = ref(null);
const p = ref(0); // 0 = nakabalumbon, 1 = bukas na ang sulat
const ang = ref(0); // anggulo ng hawakan (degrees)
const turning = ref(false);
const moved = ref(false);
const opened = ref(false);
const notes = ref([]);

const NOTES = ["♪", "♫", "♥", "♡"];
let center = { x: 0, y: 0 };
let lastA = 0;
let active = false;
let lastStep = 0;
let noteId = 0;
const timers = [];

const angleOf = (event) => Math.atan2(event.clientY - center.y, event.clientX - center.x);

function down(event) {
  if (opened.value) return;
  const r = dialEl.value.getBoundingClientRect();
  center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  lastA = angleOf(event);
  active = true;
  turning.value = true;
  dialEl.value.setPointerCapture?.(event.pointerId);
}
function move(event) {
  if (!active || opened.value) return;
  const a = angleOf(event);
  let d = a - lastA;
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  lastA = a;
  advance(d);
}
function up() {
  active = false;
  turning.value = false;
}
function nudge() {
  if (!opened.value) advance(Math.PI / 2);
}

// dalawang buong ikot (4π) para mabuklat ang buong sulat
function advance(d) {
  moved.value = true;
  ang.value += (d * 180) / Math.PI;
  p.value = Math.min(1, p.value + Math.abs(d) / (Math.PI * 4));
  const step = Math.floor(p.value * 10);
  if (step > lastStep) {
    lastStep = step;
    spawnNote();
  }
  if (p.value >= 1) finish();
}

function spawnNote() {
  const id = ++noteId;
  notes.value.push({
    id,
    ch: NOTES[id % NOTES.length],
    style: { left: `${28 + Math.random() * 44}%`, "--dx": `${Math.round((Math.random() - 0.5) * 90)}px` },
  });
  timers.push(
    setTimeout(() => {
      notes.value = notes.value.filter((n) => n.id !== id);
    }, 2200),
  );
}

function finish() {
  if (opened.value) return;
  p.value = 1;
  opened.value = true;
  active = false;
  turning.value = false;
  navigator.vibrate?.([30, 40, 50]);
  emit("unrolled", dialEl.value);
}

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<style scoped>
.mc-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.mc-head {
  position: absolute;
  top: 8%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.mc-eyebrow {
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

/* ===== Balumbon ng sulat ===== */
.mc-paperwrap {
  position: absolute;
  left: 50%;
  top: 19%;
  width: min(88cqi, 350px);
  height: min(44cqh, 340px);
  translate: -50% 0;
}
.mc-paper {
  height: 100%;
  padding: 24px 20px 14px;
  overflow-y: hidden;
  border: 2px solid #fff;
  border-radius: 6px;
  background:
    repeating-linear-gradient(0deg, transparent 0 27px, rgb(224 102 127 / 0.14) 27px 28px),
    linear-gradient(180deg, #fffaf2, #fff1e2);
  box-shadow: 0 18px 34px rgb(122 43 69 / 0.3);
  clip-path: inset(0 0 calc((1 - var(--p)) * 100%) 0);
}
.is-open .mc-paper {
  overflow-y: auto;
  touch-action: pan-y;
}
.mc-clip {
  float: right;
  width: 78px;
  height: 78px;
  margin: 0 0 6px 10px;
  padding: 4px 4px 14px;
  background: #fff;
  box-shadow: 0 4px 10px rgb(122 43 69 / 0.3);
  object-fit: cover;
  pointer-events: none;
  rotate: 5deg;
}
.mc-to {
  margin: 0 0 6px;
  color: #d94b70;
  font-family: var(--font-script);
  font-size: 30px;
  line-height: 1.15;
}
.mc-body {
  margin: 0;
  color: #5c2a3c;
  font-family: var(--font-hand);
  font-size: clamp(21px, 6cqi, 26px);
  line-height: 1.28;
}
.mc-sig {
  margin: 10px 0 0;
  color: #b4506f;
  font-family: var(--font-script);
  font-size: 26px;
  text-align: right;
}
.mc-roll {
  position: absolute;
  z-index: 2;
  left: -8px;
  right: -8px;
  height: 18px;
  border-radius: 9px;
  background: linear-gradient(180deg, #fff, #ffd6e2 55%, #f3a8be);
  box-shadow: 0 4px 8px rgb(122 43 69 / 0.28);
}
.mc-roll.top {
  top: -9px;
}
.mc-roll.edge {
  top: calc(var(--p) * 100% - 9px);
  display: grid;
  place-items: center;
}
.mc-roll.edge i {
  color: #e5384f;
  font-size: 10px;
  font-style: normal;
  line-height: 1;
}

/* ===== Music box ===== */
.mc-box {
  position: absolute;
  left: 50%;
  bottom: 8%;
  display: grid;
  width: min(82cqi, 310px);
  aspect-ratio: 2.1;
  place-items: center;
  border: 3px solid #fff;
  border-radius: 22px 22px 16px 16px;
  background: linear-gradient(180deg, #ffb3c7, #ff8fab);
  box-shadow:
    0 16px 28px rgb(122 43 69 / 0.35),
    inset 0 6px 0 rgb(255 255 255 / 0.35);
  translate: -50% 0;
}
.mc-box::before {
  content: "";
  position: absolute;
  left: 10%;
  right: 10%;
  top: -14px;
  height: 14px;
  border: 3px solid #fff;
  border-bottom: 0;
  border-radius: 10px 10px 0 0;
  background: #ff93b0;
}
.mc-ring {
  position: absolute;
  width: 132px;
  height: 132px;
  border: 3px dashed rgb(255 255 255 / 0.85);
  border-radius: 50%;
  pointer-events: none;
  animation: mc-pulse 1.4s ease-in-out infinite alternate;
}
.mc-dial {
  position: relative;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, #ffe3ea);
  box-shadow:
    inset 0 0 0 4px #fff,
    0 6px 12px rgb(122 43 69 / 0.3);
  cursor: grab;
  outline: none;
  touch-action: none;
}
.mc-dial.turning {
  cursor: grabbing;
}
.mc-dial:focus-visible {
  outline: 2px dashed #7a2b45;
  outline-offset: 4px;
}
.mc-gear {
  position: absolute;
  inset: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  pointer-events: none;
}
.mc-teeth {
  fill: none;
  stroke: #e0667f;
  stroke-width: 9;
  stroke-dasharray: 5.2 5.2;
}
.mc-gearbody {
  fill: #ffd6e2;
  stroke: #fff;
  stroke-width: 2;
}
.mc-hub {
  fill: #e0667f;
}
.mc-arm {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 46px;
  height: 6px;
  margin-top: -3px;
  border-radius: 3px;
  background: #7a2b45;
  pointer-events: none;
  transform-origin: 0 50%;
}
.mc-knob {
  position: absolute;
  right: -10px;
  top: -8px;
  width: 22px;
  height: 22px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ff5c75, #c61f3b);
  box-shadow: 0 3px 6px rgb(122 43 69 / 0.4);
}
.mc-note {
  position: absolute;
  top: 6%;
  color: #fff;
  font-size: 24px;
  pointer-events: none;
  text-shadow: 0 2px 6px rgb(122 43 69 / 0.5);
  animation: mc-float 2.2s ease-out forwards;
}

.mc-hint {
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
.mc-next {
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
.mc-rise-enter-active {
  transition: opacity 0.9s ease 0.9s, transform 0.9s ease 0.9s;
}
.mc-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes mc-pulse {
  to {
    opacity: 0.35;
    scale: 1.1;
  }
}
@keyframes mc-float {
  from {
    opacity: 0;
    transform: translate(0, 0) scale(0.6);
  }
  15% {
    opacity: 1;
  }
  to {
    opacity: 0;
    transform: translate(var(--dx), -130px) scale(1.2) rotate(18deg);
  }
}
@container (max-height: 620px) {
  .mc-head {
    top: 4%;
  }
  .mc-paperwrap {
    top: 16%;
    height: min(40cqh, 300px);
  }
  .mc-box {
    bottom: 6%;
    width: min(70cqi, 260px);
  }
  .mc-dial {
    width: 92px;
    height: 92px;
  }
  .mc-arm {
    width: 38px;
  }
  .mc-ring {
    width: 112px;
    height: 112px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .mc-ring,
  .mc-note {
    animation: none;
  }
}
</style>