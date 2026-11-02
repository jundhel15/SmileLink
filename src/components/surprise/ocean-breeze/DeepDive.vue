<template>
  <!-- 2) DEEP DIVE: mag-swipe pababa para sumisid. Habang lumalalim, lumilitaw ang mga alaala kasama ng litrato;
       sa ilalim ng dagat, may perlas na naghihintay. -->
  <section
    class="dive-stage"
    :class="{ done }"
    :style="{ '--p': p }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <div class="tint" />

    <div class="drift" aria-hidden="true">
      <svg
        v-for="(f, i) in fish"
        :key="`f${i}`"
        class="fish"
        :class="f.dir < 0 ? 'l' : 'r'"
        :style="{ top: `${f.top}%`, width: `${f.w}px`, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }"
        viewBox="0 0 60 30"
      >
        <path d="M4 15C14 2 36 2 46 15C36 28 14 28 4 15Z M44 15L58 4L58 26Z" :fill="f.color" />
        <circle cx="14" cy="12" r="1.6" fill="#05283c" />
      </svg>
      <span v-for="(j, i) in jellies" :key="`j${i}`" class="jelly" :style="{ left: `${j.x}%`, top: `${j.top}%`, '--s': j.s }">
        <i />
      </span>
    </div>

    <header class="head">
      <p class="eyebrow">{{ done ? "The bottom of the sea" : "Dive deeper" }}</p>
      <h2>{{ done ? "Look what I found" : "Swim down with me" }}</h2>
    </header>

    <div class="gauge" aria-hidden="true">
      <span class="track">
        <span class="fill" :style="{ height: `${p * 100}%` }" />
        <span v-for="(t, i) in stops" :key="i" class="stop" :class="{ lit: p >= t }" :style="{ top: `${t * 100}%` }" />
      </span>
      <span class="meters">{{ depth }} m</span>
    </div>

    <div ref="cardEl" class="card-slot" aria-live="polite">
      <Transition name="card" mode="out-in">
        <div v-if="current >= 0" :key="current" class="card">
          <img v-if="photoFor(current)" class="thumb" :src="photoFor(current)" alt="" draggable="false" />
          <p class="title">{{ memories[current].title }}</p>
          <p class="text">{{ memories[current].text }}</p>
        </div>
        <p v-else key="idle" class="idle">Something is shining down below…</p>
      </Transition>
    </div>

    <svg class="shell" viewBox="0 0 130 70" aria-hidden="true">
      <path d="M8 62 Q65 -14 122 62 Z" fill="#f3d9c4" stroke="#d9a98a" stroke-width="2" />
      <path d="M65 8 V62 M40 16 L46 62 M90 16 L84 62 M22 34 L30 62 M108 34 L100 62" stroke="#d9a98a" stroke-width="1.6" fill="none" />
      <path d="M4 62 H126 Q120 68 65 68 Q10 68 4 62Z" fill="#e7bfa3" />
    </svg>
    <div ref="pearlEl" class="pearl" :class="{ on: done }" />

    <p v-if="!done" class="hint">Swipe down to dive ↓ · {{ depth }} m</p>

    <Transition name="rise">
      <button v-if="done" class="next" type="button" @pointerdown.stop @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  memories: { type: Array, required: true }, // [{ title, text }]
  photos: { type: Array, default: () => [] },
});
const emit = defineEmits(["stop", "finished", "done"]);

const photoFor = (i) => (props.photos.length ? props.photos[i % props.photos.length] : "");

const fish = [
  { top: 8, w: 52, dur: 15, delay: -2, dir: 1, color: "#ffb08a" },
  { top: 17, w: 40, dur: 19, delay: -9, dir: -1, color: "#ffe08a" },
  { top: 28, w: 64, dur: 22, delay: -5, dir: 1, color: "#9be7f0" },
  { top: 39, w: 36, dur: 17, delay: -12, dir: -1, color: "#ff9fb0" },
  { top: 52, w: 58, dur: 24, delay: -7, dir: 1, color: "#b8f0c4" },
  { top: 66, w: 44, dur: 20, delay: -15, dir: -1, color: "#a8b8ff" },
  { top: 80, w: 70, dur: 26, delay: -3, dir: 1, color: "#7fd6e8" },
];
const jellies = [
  { x: 14, top: 54, s: 1 },
  { x: 76, top: 72, s: 1.3 },
];

const stops = computed(() => props.memories.map((_, i) => ((i + 1) / (props.memories.length + 1)) * 0.92));

const cardEl = ref(null);
const pearlEl = ref(null);
const p = ref(0); // 0 = nasa ibabaw, 1 = nasa ilalim
const done = ref(false);
const depth = computed(() => Math.round(p.value * 30));

const current = computed(() => {
  let index = -1;
  stops.value.forEach((t, i) => {
    if (p.value >= t) index = i;
  });
  return index;
});
watch(current, (now, before) => {
  if (now > before && now >= 0) emit("stop", cardEl.value);
});

let lastY = null;
let moved = 0;
let stageHeight = 1;

function dive(amount) {
  if (done.value) return;
  p.value = Math.min(1, p.value + amount);
  if (p.value >= 0.985) {
    p.value = 1;
    done.value = true;
    navigator.vibrate?.([20, 40, 20]);
    emit("finished", pearlEl.value);
  }
}

// pababang swipe kahit saan = sisid; maikling tap = konting sisid din
function onDown(event) {
  if (done.value) return;
  lastY = event.clientY;
  moved = 0;
  stageHeight = event.currentTarget.getBoundingClientRect().height || 1;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function onMove(event) {
  if (lastY === null) return;
  const dy = event.clientY - lastY;
  lastY = event.clientY;
  moved += Math.abs(dy);
  if (dy > 0) dive(dy / (stageHeight * 0.6));
}
function onUp() {
  if (lastY !== null && moved < 6) dive(0.12);
  lastY = null;
}
</script>

<style scoped>
.dive-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.dive-stage:not(.done) {
  cursor: grab;
}
.tint {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 120%, rgb(255 214 120 / 0), rgb(2 12 28 / 0.65));
  opacity: calc(var(--p) * 0.85);
  pointer-events: none;
}

/* ===== Mga isda at dikya (umaakyat habang lumalalim) ===== */
.drift {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 190%;
  pointer-events: none;
  translate: 0 calc(var(--p) * -42%);
}
.fish {
  position: absolute;
  left: -90px;
  opacity: 0.9;
  animation: swim-r linear infinite;
}
.fish.l {
  scale: -1 1;
  animation-name: swim-l;
}
.jelly {
  position: absolute;
  width: calc(46px * var(--s));
  height: calc(66px * var(--s));
  animation: jelly-bob 4s ease-in-out infinite alternate;
}
.jelly i {
  display: block;
  width: 100%;
  height: 58%;
  border-radius: 50% 50% 32% 32%;
  background: radial-gradient(circle at 40% 30%, rgb(255 255 255 / 0.85), rgb(255 160 220 / 0.55) 60%, rgb(255 120 200 / 0.25));
  box-shadow: 0 0 22px 6px rgb(255 150 220 / 0.45);
}
.jelly::after {
  content: "";
  position: absolute;
  left: 12%;
  right: 12%;
  top: 54%;
  height: 46%;
  background: repeating-linear-gradient(90deg, rgb(255 170 230 / 0.55) 0 2px, transparent 2px 7px);
  -webkit-mask-image: linear-gradient(180deg, #000, transparent);
  mask-image: linear-gradient(180deg, #000, transparent);
}

.head {
  position: absolute;
  top: 8%;
  left: 50%;
  width: min(100% - 90px, 380px);
  text-align: center;
  transform: translateX(-50%);
}
.eyebrow {
  margin: 0;
  color: #bff3fb;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.34em;
  text-transform: uppercase;
}
h2 {
  margin: 8px 0 0;
  color: #fff;
  font-family: var(--font-head);
  font-size: clamp(26px, 7.4cqi, 38px);
  font-style: italic;
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 2px 14px rgb(3 30 55 / 0.6);
}

/* ===== Panukat ng lalim ===== */
.gauge {
  position: absolute;
  top: 20%;
  right: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 46%;
}
.track {
  position: relative;
  flex: 1;
  width: 6px;
  border-radius: 3px;
  background: rgb(255 255 255 / 0.25);
}
.fill {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  border-radius: 3px;
  background: linear-gradient(180deg, #bff3fb, #5cc8d7);
  box-shadow: 0 0 10px rgb(150 235 250 / 0.7);
}
.stop {
  position: absolute;
  left: 50%;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  border: 2px solid rgb(255 255 255 / 0.7);
  border-radius: 50%;
  background: #0b3a5c;
  transition: background 0.5s ease, box-shadow 0.5s ease;
}
.stop.lit {
  background: #ffe08a;
  box-shadow: 0 0 12px 3px rgb(255 224 138 / 0.8);
}
.meters {
  color: #d9f7fb;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
}

/* ===== Kard ng alaala ===== */
.card-slot {
  position: absolute;
  top: 25%;
  left: calc(50% - 22px);
  display: grid;
  place-items: center;
  width: min(100% - 100px, 290px);
  min-height: 150px;
  transform: translateX(-50%);
}
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 16px 18px;
  border: 1px solid rgb(255 255 255 / 0.4);
  border-radius: 22px;
  background: rgb(255 255 255 / 0.16);
  box-shadow: 0 12px 30px rgb(0 20 40 / 0.35);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  text-align: center;
}
.thumb {
  width: 78px;
  height: 78px;
  margin-bottom: 4px;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 6px 16px rgb(0 20 40 / 0.4);
  object-fit: cover;
  pointer-events: none;
}
.title {
  margin: 0;
  color: #fff;
  font-family: var(--font-head);
  font-size: 22px;
  font-style: italic;
  font-weight: 600;
}
.text {
  margin: 0;
  color: #e6fafd;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
}
.idle {
  margin: 0;
  color: #d9f7fb;
  font-family: var(--font-head);
  font-size: 19px;
  font-style: italic;
}
.card-enter-active,
.card-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.card-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.96);
}
.card-leave-to {
  opacity: 0;
}

/* ===== Perlas ===== */
.shell {
  position: absolute;
  left: 50%;
  bottom: 8%;
  width: 130px;
  margin-left: -65px;
  opacity: clamp(0, calc((var(--p) - 0.6) * 2.5), 1);
}
.pearl {
  position: absolute;
  left: 50%;
  bottom: 15%;
  width: 66px;
  height: 66px;
  margin-left: -33px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, #ffe9f2 45%, #e6bfd6);
  box-shadow: 0 0 40px 14px rgb(255 235 245 / 0.65);
  opacity: 0;
  scale: 0.2;
  transition: opacity 1s ease, scale 1.2s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.pearl.on {
  opacity: 1;
  scale: 1;
  animation: pearl-pulse 2.4s ease-in-out infinite alternate;
}

.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3%;
  margin: 0;
  color: #d9f7fb;
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 600;
  text-align: center;
  pointer-events: none;
}
.next {
  position: absolute;
  left: 50%;
  bottom: 3%;
  z-index: 3;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: #ff8a6b;
  box-shadow: 0 10px 22px rgb(0 20 40 / 0.4);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.rise-enter-active {
  transition: opacity 0.9s ease 0.9s, transform 0.9s ease 0.9s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes swim-r {
  from {
    left: -90px;
  }
  to {
    left: 110%;
  }
}
@keyframes swim-l {
  from {
    left: 110%;
  }
  to {
    left: -90px;
  }
}
@keyframes jelly-bob {
  to {
    transform: translateY(-18px);
  }
}
@keyframes pearl-pulse {
  to {
    box-shadow: 0 0 56px 22px rgb(255 235 245 / 0.8);
  }
}
@container (max-height: 620px) {
  .head {
    top: 4%;
  }
  .card-slot {
    top: 21%;
    min-height: 120px;
  }
  .thumb {
    width: 56px;
    height: 56px;
  }
  .text {
    font-size: 14px;
  }
  .shell {
    width: 100px;
    margin-left: -50px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .fish,
  .jelly,
  .pearl.on {
    animation: none;
  }
}
</style>