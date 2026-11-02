<template>
  <!-- 5) BOUQUET: i-drag ang bawat bulaklak (bawat isa ay may dahilan kung bakit siya espesyal) papunta sa balot.
       Kapag kumpleto, mag-iisa itong magtatali ng laso, at lalabas ang gallery ng lahat ng litrato kasama ang
       huling mensahe. -->
  <section class="bq-stage">
    <Transition name="swap" mode="out-in">
      <div v-if="!showMessage" key="build" class="build">
        <header class="head">
          <p class="eyebrow">{{ tied ? "For you" : "Pick the flowers" }}</p>
          <h2>{{ tied ? "A bouquet of reasons" : "Make a bouquet" }}</h2>
        </header>

        <div class="reason-slot" aria-live="polite">
          <Transition name="card" mode="out-in">
            <p v-if="current >= 0" :key="current" class="reason">{{ reasons[current] }}</p>
            <p v-else key="idle" class="idle">Drag each flower into the wrap.</p>
          </Transition>
        </div>

        <!-- mga bulaklak na kukunin -->
        <div
          v-for="(r, i) in reasons"
          v-show="!placed.includes(i)"
          :key="`f${i}`"
          :ref="(el) => (flowerEls[i] = el)"
          class="flower"
          :class="{ dragging: drag === i }"
          :style="flowerStyle(i)"
          role="button"
          tabindex="0"
          :aria-label="`Pick flower ${i + 1}`"
          @pointerdown="down(i, $event)"
          @pointermove="move(i, $event)"
          @pointerup="up(i, $event)"
          @pointercancel="up(i, $event)"
          @keydown.enter.prevent="drop(i)"
          @keydown.space.prevent="drop(i)"
        >
          <span class="sway" :style="{ animationDelay: `${i * 0.4}s` }">
            <svg viewBox="0 0 60 150" aria-hidden="true">
              <path d="M30 52 C30 90 26 120 30 150" class="stem" />
              <path d="M30 112 C14 108 8 96 8 88 C20 90 28 98 30 112Z" class="lf" />
              <ellipse
                v-for="a in [0, 51, 103, 154, 206, 257, 309]"
                :key="a"
                cx="30"
                cy="20"
                rx="8.5"
                ry="15"
                :fill="COLORS[i % COLORS.length]"
                class="pt"
                :transform="`rotate(${a} 30 34)`"
              />
              <circle cx="30" cy="34" r="7" class="ct" />
            </svg>
          </span>
        </div>

        <!-- ang bouquet -->
        <div ref="anchorEl" class="anchor">
          <span
            v-for="(r, i) in reasons"
            v-show="placed.includes(i)"
            :key="`p${i}`"
            class="placed"
            :style="{ rotate: `${angle(i)}deg`, '--h': `${i % 2 ? 1 : 0.94}` }"
          >
            <svg viewBox="0 0 60 150" aria-hidden="true">
              <path d="M30 52 C30 90 26 120 30 150" class="stem" />
              <path d="M30 112 C14 108 8 96 8 88 C20 90 28 98 30 112Z" class="lf" />
              <ellipse
                v-for="a in [0, 51, 103, 154, 206, 257, 309]"
                :key="a"
                cx="30"
                cy="20"
                rx="8.5"
                ry="15"
                :fill="COLORS[i % COLORS.length]"
                class="pt"
                :transform="`rotate(${a} 30 34)`"
              />
              <circle cx="30" cy="34" r="7" class="ct" />
            </svg>
          </span>
        </div>

        <div class="wrap-shadow">
          <div ref="wrapEl" class="wrap">
            <span class="fold" />
          </div>
        </div>

        <svg class="bow" :class="{ on: tied }" viewBox="0 0 80 50" aria-hidden="true">
          <path d="M40 26 C22 4 4 10 6 26 C8 40 28 36 40 26Z" class="bw" />
          <path d="M40 26 C58 4 76 10 74 26 C72 40 52 36 40 26Z" class="bw" />
          <path d="M36 28 L26 48 L36 44 Z M44 28 L54 48 L44 44 Z" class="bw" />
          <circle cx="40" cy="26" r="6" class="bk" />
        </svg>

        <p v-if="!tied" class="hint">Drag a flower to the wrap · {{ placed.length }}/{{ reasons.length }}</p>
      </div>

      <div v-else key="msg" class="message">
        <p class="eyebrow">Happy birthday</p>

        <div ref="reelEl" class="reel" @scroll.passive="onScroll" @pointerdown="stopReel">
          <div v-for="(src, i) in photos" :key="i" class="slide">
            <span class="ringpic"><img :src="src" alt="" draggable="false" /></span>
          </div>
          <div v-if="!photos.length" class="slide">
            <span class="ringpic"><span class="heart">♥</span></span>
          </div>
        </div>
        <div v-if="photos.length > 1" class="dots" aria-hidden="true">
          <i v-for="(src, i) in photos" :key="i" :class="{ on: i === slide }" />
        </div>

        <h3>{{ recipient }}</h3>
        <p class="text">{{ message }}</p>
        <p class="from">With love, {{ sender }}</p>
        <button class="replay" type="button" @click="emit('replay')">↻ Replay</button>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  reasons: { type: Array, required: true }, // bakit espesyal siya; isang bulaklak bawat isa
  photos: { type: Array, default: () => [] },
});
const emit = defineEmits(["placed", "complete", "replay"]);

const COLORS = ["#ff8fab", "#ffd166", "#b8a1f0", "#ff9e7a", "#ffffff", "#7fd6c2"];

const anchorEl = ref(null);
const wrapEl = ref(null);
const reelEl = ref(null);
const flowerEls = [];
const st = ref(props.reasons.map(() => ({ dx: 0, dy: 0 })));
const drag = ref(-1);
const placed = ref([]);
const current = ref(-1);
const tied = ref(false);
const showMessage = ref(false);
const slide = ref(0);

let start = null;
let scale = 1;
let tieTimer = 0;
let msgTimer = 0;
let reelTimer = 0;

// pag-aayos ng bouquet: bawat bulaklak ay may sariling puwesto sa pamaypay
function angle(i) {
  const n = props.reasons.length;
  return n === 1 ? 0 : (i - (n - 1) / 2) * (56 / (n - 1));
}
// puwesto ng bulaklak sa taas habang hindi pa kinukuha
function flowerStyle(i) {
  const n = props.reasons.length;
  const s = st.value[i];
  return {
    left: `${((i + 1) / (n + 1)) * 100}%`,
    top: `${30 + (i % 2) * 7}%`,
    translate: `${s.dx}px ${s.dy}px`,
  };
}

function drop(i) {
  if (placed.value.includes(i)) return;
  placed.value = [...placed.value, i];
  current.value = i;
  st.value[i].dx = 0;
  st.value[i].dy = 0;
  navigator.vibrate?.(15);
  emit("placed", wrapEl.value);
  if (placed.value.length === props.reasons.length) {
    tieTimer = setTimeout(() => {
      tied.value = true;
      navigator.vibrate?.([30, 50, 30]);
      emit("complete", wrapEl.value);
    }, 800);
    msgTimer = setTimeout(() => (showMessage.value = true), 4200);
  }
}

function down(i, event) {
  drag.value = i;
  start = { x: event.clientX, y: event.clientY };
  const el = event.currentTarget;
  scale = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
  el.setPointerCapture?.(event.pointerId);
}
function move(i, event) {
  if (drag.value !== i || !start) return;
  st.value[i].dx = (event.clientX - start.x) / (scale || 1);
  st.value[i].dy = (event.clientY - start.y) / (scale || 1);
}
function up(i) {
  if (drag.value !== i) return;
  drag.value = -1;
  start = null;
  // ang ulo ng bulaklak ang sinusukat laban sa bunganga ng balot
  const f = flowerEls[i].getBoundingClientRect();
  const w = wrapEl.value.getBoundingClientRect();
  const dist = Math.hypot(f.left + f.width / 2 - (w.left + w.width / 2), f.top + f.height * 0.2 - (w.top + w.height * 0.1));
  if (dist < Math.max(90 * (scale || 1), w.width * 0.7)) drop(i);
  else {
    st.value[i].dx = 0;
    st.value[i].dy = 0;
  }
}

/* ===== Gallery: kusang umuusad, humihinto kapag hinawakan ng user ===== */
function onScroll() {
  const el = reelEl.value;
  if (el && el.clientWidth) slide.value = Math.round(el.scrollLeft / el.clientWidth);
}
function advance() {
  const el = reelEl.value;
  if (!el || props.photos.length < 2) return;
  const next = (slide.value + 1) % props.photos.length;
  el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
}
function stopReel() {
  clearInterval(reelTimer);
}
watch(showMessage, (visible) => {
  if (visible) reelTimer = setInterval(advance, 2800);
});

onBeforeUnmount(() => {
  clearTimeout(tieTimer);
  clearTimeout(msgTimer);
  clearInterval(reelTimer);
});
</script>

<style scoped>
.bq-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.build {
  position: absolute;
  inset: 0;
}
.head {
  position: absolute;
  top: 8%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.eyebrow {
  margin: 0;
  color: #e0667f;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #2f5d3a;
  font-family: var(--font-head);
  font-size: clamp(28px, 8.4cqi, 42px);
  font-weight: 600;
  line-height: 1.15;
}

/* ===== Dahilan ===== */
.reason-slot {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  display: grid;
  place-items: center;
  width: min(100% - 52px, 320px);
  min-height: 62px;
  padding: 10px 18px;
  border: 2px solid rgb(255 255 255 / 0.9);
  border-radius: 22px;
  background: rgb(255 255 255 / 0.78);
  box-shadow: 0 10px 22px rgb(60 110 70 / 0.2);
  text-align: center;
  transform: translateX(-50%);
}
.reason {
  margin: 0;
  color: #2f5d3a;
  font-family: var(--font-script);
  font-size: clamp(21px, 6cqi, 26px);
  line-height: 1.2;
}
.idle {
  margin: 0;
  color: #4d7a5a;
  font-family: var(--font-body);
  font-size: 15px;
  font-style: italic;
  font-weight: 700;
}
.card-enter-active,
.card-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.card-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.card-leave-to {
  opacity: 0;
}

/* ===== Mga bulaklak na kukunin ===== */
.flower {
  position: absolute;
  width: 56px;
  height: 130px;
  margin: -24px 0 0 -28px;
  cursor: grab;
  outline: none;
  touch-action: none;
}
.flower:not(.dragging) {
  transition: translate 0.5s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.flower.dragging {
  cursor: grabbing;
  z-index: 6;
}
.flower:focus-visible {
  outline: 2px dashed #2f5d3a;
  outline-offset: 4px;
}
.sway {
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: 50% 100%;
  animation: flower-sway 3s ease-in-out infinite alternate;
}
.flower svg,
.placed svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 4px 4px rgb(60 100 60 / 0.25));
}
.stem {
  fill: none;
  stroke: #4aa35f;
  stroke-width: 3.5;
  stroke-linecap: round;
}
.lf {
  fill: #5cb86d;
  stroke: #3f9b5a;
  stroke-width: 0.8;
}
.pt {
  stroke: rgb(150 80 100 / 0.3);
  stroke-width: 0.7;
}
.ct {
  fill: #ffd166;
  stroke: #e0a93a;
  stroke-width: 0.9;
}

/* ===== Bouquet ===== */
.anchor {
  position: absolute;
  left: 50%;
  bottom: calc(6% + 46px);
  z-index: 2;
  width: 0;
  height: 0;
}
.placed {
  position: absolute;
  left: -32px;
  bottom: 0;
  width: 64px;
  height: 150px;
  transform-origin: 50% 100%;
  scale: var(--h);
  animation: place-in 0.9s cubic-bezier(0.3, 1.4, 0.5, 1) both;
}
.wrap-shadow {
  position: absolute;
  left: 50%;
  bottom: 6%;
  z-index: 3;
  filter: drop-shadow(0 12px 12px rgb(80 50 30 / 0.35));
  translate: -50% 0;
}
.wrap {
  position: relative;
  width: 150px;
  height: 150px;
  background:
    radial-gradient(rgb(255 255 255 / 0.55) 2px, transparent 2.5px) 0 0 / 14px 14px,
    linear-gradient(135deg, #ffd6e0, #ffb3c7);
  clip-path: polygon(6% 0, 94% 0, 66% 100%, 34% 100%);
}
.fold {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgb(255 255 255 / 0.5) 0 40%, transparent 40%);
  clip-path: polygon(6% 0, 56% 0, 50% 100%, 34% 100%);
}
.bow {
  position: absolute;
  left: 50%;
  bottom: calc(6% + 78px);
  z-index: 4;
  width: 82px;
  margin-left: -41px;
  scale: 0;
  transition: scale 0.8s cubic-bezier(0.3, 1.8, 0.5, 1);
}
.bow.on {
  scale: 1;
}
.bw {
  fill: #ff6f91;
  stroke: #d94b70;
  stroke-width: 1;
}
.bk {
  fill: #ff8fab;
  stroke: #d94b70;
  stroke-width: 1;
}

.hint {
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
  text-shadow: 0 2px 8px rgb(30 70 40 / 0.6);
  pointer-events: none;
}

/* ===== Huling mensahe at gallery ===== */
.message {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 400px;
  margin: 0 auto;
  padding: 50px 18px 30px;
  text-align: center;
}
.reel {
  display: flex;
  width: min(100%, 300px);
  margin: 6px 0 2px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  touch-action: pan-x;
}
.reel::-webkit-scrollbar {
  display: none;
}
.slide {
  display: grid;
  flex: 0 0 100%;
  place-items: center;
  scroll-snap-align: center;
}
.ringpic {
  display: grid;
  place-items: center;
  width: 156px;
  height: 156px;
  padding: 7px;
  border-radius: 50%;
  background: repeating-conic-gradient(#ff9ab4 0 10deg, #ffd166 10deg 20deg, #b8e0a0 20deg 30deg, #ffffff 30deg 40deg);
  box-shadow: 0 12px 26px rgb(80 110 70 / 0.35);
}
.ringpic img {
  width: 100%;
  height: 100%;
  border: 3px solid #fff;
  border-radius: 50%;
  object-fit: cover;
  pointer-events: none;
}
.ringpic .heart {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;
  color: #ff8fab;
  font-size: 40px;
}
.dots {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}
.dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(47 93 58 / 0.25);
  transition: background 0.4s ease, transform 0.4s ease;
}
.dots i.on {
  background: #ff8fab;
  transform: scale(1.35);
}
.message h3 {
  margin: 0;
  padding: 0 0.1em;
  background: linear-gradient(180deg, #ff7aa0, #ff9e5e);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: var(--font-script);
  font-size: clamp(54px, 17cqi, 80px);
  font-weight: 400;
  line-height: 1.12;
}
.text {
  margin: 0;
  color: #2f5d3a;
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.5;
}
.from {
  margin: 4px 0 0;
  color: #d94b70;
  font-family: var(--font-script);
  font-size: 28px;
}
.replay {
  margin-top: 10px;
  padding: 9px 24px;
  border: 2px solid #ff8fab;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.7);
  color: #d94b70;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.replay:hover {
  background: #fff;
}
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.9s ease, filter 0.9s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(8px);
}

@keyframes flower-sway {
  from {
    transform: rotate(-4deg);
  }
  to {
    transform: rotate(4deg);
  }
}
@keyframes place-in {
  from {
    opacity: 0;
    transform: translateY(-80px) scale(0.6);
  }
}
@container (max-height: 620px) {
  .head {
    top: 4%;
  }
  .flower {
    scale: 0.8;
  }
  .reason-slot {
    top: 47%;
    min-height: 50px;
  }
  .wrap {
    scale: 0.85;
    transform-origin: bottom center;
  }
  .message {
    padding: 26px 18px 18px;
  }
  .ringpic {
    width: 112px;
    height: 112px;
  }
  .message h3 {
    font-size: 46px;
  }
  .text {
    font-size: 15px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sway {
    animation: none;
  }
}
</style>