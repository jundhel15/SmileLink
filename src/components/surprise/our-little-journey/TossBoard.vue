<template>
  <!-- 6) FLICK THEM ONTO THE BOARD: may bunton ng polaroid sa ibaba. I-flick (o i-tap) ang nasa ibabaw para lumipad
       at dumikit sa corkboard. Kapag nailagay ang LAHAT ng litrato, lalabas ang mensahe at selyo ng buwan. -->
  <section ref="stageEl" class="tb-stage">
    <header class="tb-head">
      <p class="tb-eyebrow">{{ finished ? `Month ${monthCount}` : `${tossed} of ${n} on the board` }}</p>
      <h2>{{ finished ? "Our little journey" : "Flick them onto the board" }}</h2>
    </header>

    <div ref="boardEl" class="tb-board" :style="{ '--cols': cols }">
      <div
        v-for="(src, i) in list"
        :key="i"
        :ref="(el) => (cellEls[i] = el)"
        class="tb-cell"
        :class="{ filled: i < tossed }"
        :style="{ '--r': tilt(i) + 'deg' }"
      >
        <template v-if="i < tossed">
          <img v-if="src" :src="src" alt="" draggable="false" />
          <span v-else class="tb-ph">♥</span>
        </template>
        <span v-else class="tb-num">{{ i + 1 }}</span>
      </div>
      <Transition name="tb-pop">
        <div v-if="finished" class="tb-badge">
          <b>{{ monthCount }}</b>
          <small>{{ monthCount === 1 ? "month" : "months" }}</small>
        </div>
      </Transition>
    </div>

    <div v-if="!finished" ref="stackEl" class="tb-stack">
      <div
        v-for="k in visible"
        :key="k"
        :ref="(el) => setTop(k, el)"
        class="tb-card"
        :class="{ top: k === tossed, drag: dragging && k === tossed, fly: flying && k === tossed }"
        :style="cardStyle(k)"
        @pointerdown="down($event, k)"
        @pointermove="move($event, k)"
        @pointerup="up($event, k)"
        @pointercancel="up($event, k)"
      >
        <img v-if="list[k]" :src="list[k]" alt="" draggable="false" />
        <span v-else class="tb-ph">♥</span>
        <p>{{ captions[k] || DEFAULT_CAPTIONS[k % DEFAULT_CAPTIONS.length] }}</p>
      </div>
    </div>
    <p v-if="!finished && tossed === 0" class="tb-hint">Flick or tap the top photo</p>

    <Transition name="tb-rise">
      <div v-if="finished" class="tb-panel">
        <h3>{{ recipient }}</h3>
        <p class="tb-text">{{ message }}</p>
        <p class="tb-from">Forever yours, {{ sender }}</p>
        <button class="tb-replay" type="button" @click="emit('replay')">↻ Replay</button>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  monthCount: { type: Number, default: 1 },
  photos: { type: Array, default: () => [] },
  captions: { type: Array, default: () => [] },
});
const emit = defineEmits(["tossed", "finished", "replay"]);

const DEFAULT_CAPTIONS = [
  "Where it started",
  "Silly us",
  "A day I keep",
  "Just because",
  "My favorite smile",
  "Warm and happy",
  "Our little world",
  "Still laughing",
  "Golden hour",
  "Forever and a day",
];

const list = computed(() => (props.photos.length ? props.photos : ["", "", ""]));
const n = computed(() => list.value.length);
const cols = computed(() => (n.value <= 2 ? 2 : n.value <= 6 ? 3 : 4));
const tilt = (i) => ((i * 37) % 9) - 4;

const stageEl = ref(null);
const boardEl = ref(null);
const stackEl = ref(null);
const cellEls = [];
let topEl = null;

const tossed = ref(0);
const dragging = ref(false);
const flying = ref(false);
const finished = ref(false);
const dx = ref(0);
const dy = ref(0);
const fx = ref(0);
const fy = ref(0);
const fs = ref(1);
const fr = ref(0);

// ang tatlong card sa ibabaw lang ang ginuguhit; ang huli sa listahan ang nasa pinakaitaas
const visible = computed(() => {
  const out = [];
  for (let k = Math.min(n.value - 1, tossed.value + 2); k >= tossed.value; k--) out.push(k);
  return out;
});

function setTop(k, el) {
  if (k === tossed.value) topEl = el;
}

function cardStyle(k) {
  const depth = k - tossed.value;
  if (depth === 0) {
    if (flying.value) return { translate: `${fx.value}px ${fy.value}px`, scale: fs.value, rotate: `${fr.value}deg` };
    return { translate: `${dx.value}px ${dy.value}px`, rotate: `${dx.value / 18}deg` };
  }
  return { translate: `0 ${-depth * 6}px`, scale: 1 - depth * 0.05, rotate: `${depth % 2 ? 3 : -3}deg` };
}

let start = null;
let scale = 1;
let samples = [];
const timers = [];

function down(event, k) {
  if (k !== tossed.value || flying.value) return;
  const r = stackEl.value.getBoundingClientRect();
  scale = r.width / (stackEl.value.offsetWidth || 1) || 1;
  start = { x: event.clientX, y: event.clientY };
  samples = [{ x: event.clientX, y: event.clientY, t: event.timeStamp }];
  dragging.value = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function move(event, k) {
  if (!start || k !== tossed.value) return;
  dx.value = (event.clientX - start.x) / scale;
  dy.value = (event.clientY - start.y) / scale;
  samples.push({ x: event.clientX, y: event.clientY, t: event.timeStamp });
  if (samples.length > 5) samples.shift();
}
function up(event, k) {
  if (!start || k !== tossed.value) return;
  start = null;
  dragging.value = false;
  const dist = Math.hypot(dx.value, dy.value);
  const a = samples[0];
  const b = samples[samples.length - 1];
  const speed = Math.hypot(b.x - a.x, b.y - a.y) / Math.max(1, b.t - a.t) / scale; // px kada ms
  if (dist < 8 || dist > 70 || speed > 0.5) toss();
  else {
    dx.value = 0;
    dy.value = 0;
  }
}

// lumilipad ang card papunta sa bakanteng puwesto sa pisara
function toss() {
  if (flying.value || !topEl) return;
  const i = tossed.value;
  const stack = stackEl.value.getBoundingClientRect();
  const cell = cellEls[i].getBoundingClientRect();
  fx.value = (cell.left + cell.width / 2 - (stack.left + stack.width / 2)) / scale;
  fy.value = (cell.top + cell.height / 2 - (stack.top + stack.height / 2)) / scale;
  fs.value = cell.width / (stack.width || 1);
  fr.value = tilt(i);
  flying.value = true;
  navigator.vibrate?.(14);
  timers.push(setTimeout(land, 720));
}

function land() {
  const i = tossed.value;
  flying.value = false;
  dx.value = 0;
  dy.value = 0;
  tossed.value += 1;
  emit("tossed", cellEls[i]);
  if (tossed.value >= n.value) {
    finished.value = true;
    emit("finished", boardEl.value);
  }
}

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<style scoped>
.tb-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.tb-head {
  position: absolute;
  z-index: 4;
  top: 7%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  pointer-events: none;
  transform: translateX(-50%);
}
.tb-eyebrow {
  margin: 0;
  color: var(--brown);
  font-family: var(--font-type);
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: var(--ink);
  font-family: var(--font-head);
  font-size: clamp(26px, 7.8cqi, 38px);
  font-weight: 600;
  line-height: 1.15;
}

/* ===== Pisara ===== */
.tb-board {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 17%;
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: 8px;
  align-content: center;
  width: min(92cqi, 370px);
  padding: 12px;
  border: 5px solid #8b5a34;
  border-radius: 12px;
  background:
    radial-gradient(circle at 20% 20%, rgb(255 255 255 / 0.18), transparent 50%),
    radial-gradient(#b98a5a 1.2px, transparent 1.4px) 0 0 / 9px 9px,
    #c9a173;
  box-shadow:
    inset 0 4px 10px rgb(74 47 28 / 0.35),
    0 14px 26px rgb(74 47 28 / 0.35);
  translate: -50% 0;
}
.tb-cell {
  position: relative;
  display: grid;
  aspect-ratio: 0.86;
  place-items: center;
  border: 2px dashed rgb(255 247 230 / 0.6);
  border-radius: 6px;
}
.tb-num {
  color: rgb(255 247 230 / 0.7);
  font-family: var(--font-head);
  font-size: 22px;
}
.tb-cell.filled {
  padding: 6% 6% 14%;
  border: 0;
  border-radius: 3px;
  background: #fffaf0;
  box-shadow: 0 5px 10px rgb(74 47 28 / 0.35);
  rotate: var(--r);
}
.tb-cell.filled::before {
  content: "";
  position: absolute;
  top: -7px;
  left: 50%;
  z-index: 1;
  width: 44%;
  height: 12px;
  background: repeating-linear-gradient(45deg, rgb(232 169 58 / 0.85) 0 5px, rgb(255 213 128 / 0.85) 5px 10px);
  rotate: -4deg;
  translate: -50% 0;
}
.tb-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.tb-ph {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  background: #fde4d4;
  color: var(--accent);
  font-size: 28px;
}
.tb-badge {
  position: absolute;
  right: -14px;
  top: -22px;
  z-index: 3;
  display: grid;
  width: 66px;
  height: 66px;
  place-items: center;
  align-content: center;
  border: 3px solid #fff;
  border-radius: 50%;
  background: linear-gradient(160deg, #f08a63, #c4476b);
  box-shadow: 0 8px 16px rgb(74 47 28 / 0.4);
  color: #fff;
  rotate: 10deg;
}
.tb-badge b {
  font-family: var(--font-head);
  font-size: 26px;
  line-height: 1;
}
.tb-badge small {
  font-family: var(--font-type);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.tb-pop-enter-active {
  transition: opacity 0.4s ease, transform 0.7s cubic-bezier(0.2, 1.6, 0.4, 1);
}
.tb-pop-enter-from {
  opacity: 0;
  transform: scale(2.2);
}

/* ===== Bunton ng polaroid ===== */
.tb-stack {
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: 7%;
  width: min(56cqi, 210px);
  aspect-ratio: 0.82;
  translate: -50% 0;
}
.tb-card {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 8px 8px 0;
  border-radius: 4px;
  background: #fffaf0;
  box-shadow: 0 12px 24px rgb(74 47 28 / 0.4);
  transition:
    translate 0.35s ease,
    scale 0.35s ease,
    rotate 0.35s ease;
  user-select: none;
}
.tb-card.top {
  cursor: grab;
  touch-action: none;
}
.tb-card.drag {
  cursor: grabbing;
  transition: none;
}
.tb-card.fly {
  transition:
    translate 0.7s cubic-bezier(0.3, 0.7, 0.4, 1),
    scale 0.7s cubic-bezier(0.3, 0.7, 0.4, 1),
    rotate 0.7s ease;
  pointer-events: none;
}
.tb-card img,
.tb-card .tb-ph {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  object-fit: cover;
  pointer-events: none;
}
.tb-card p {
  margin: 0;
  padding: 6px 2px 8px;
  color: #6b5a47;
  font-family: var(--font-hand);
  font-size: 20px;
  line-height: 1.1;
  text-align: center;
}
.tb-hint {
  position: absolute;
  z-index: 4;
  left: 0;
  right: 0;
  bottom: 1.6%;
  margin: 0;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
  pointer-events: none;
}

/* ===== Mensahe ===== */
.tb-panel {
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: 4%;
  width: min(92cqi, 370px);
  max-height: 34cqh;
  padding: 10px 14px 12px;
  overflow-y: auto;
  border: 2px solid #fff;
  border-radius: 18px;
  background: linear-gradient(180deg, rgb(255 250 240 / 0.95), rgb(251 239 214 / 0.95));
  box-shadow: 0 14px 28px rgb(74 47 28 / 0.35);
  text-align: center;
  translate: -50% 0;
}
.tb-panel h3 {
  margin: 0;
  color: var(--accent);
  font-family: var(--font-hand);
  font-size: clamp(42px, 13cqi, 58px);
  font-weight: 700;
  line-height: 1.05;
}
.tb-text {
  margin: 2px 0 0;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
}
.tb-from {
  margin: 4px 0 0;
  color: var(--brown);
  font-family: var(--font-hand);
  font-size: 26px;
  font-weight: 700;
}
.tb-replay {
  margin-top: 6px;
  padding: 8px 22px;
  border: 2px solid var(--accent);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.7);
  color: var(--accent);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.tb-replay:hover {
  background: #fff;
}
.tb-rise-enter-active {
  transition: opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s;
}
.tb-rise-enter-from {
  opacity: 0;
  transform: translate(-50%, 16px);
}

@container (max-height: 620px) {
  .tb-head {
    top: 4%;
  }
  .tb-board {
    top: 15%;
    width: min(84cqi, 330px);
    padding: 9px;
    gap: 6px;
  }
  .tb-stack {
    bottom: 5%;
    width: min(46cqi, 170px);
  }
  .tb-panel {
    bottom: 3%;
    max-height: 36cqh;
  }
  .tb-panel h3 {
    font-size: 40px;
  }
  .tb-text {
    font-size: 13px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tb-card,
  .tb-card.fly {
    transition: none;
  }
}
</style>