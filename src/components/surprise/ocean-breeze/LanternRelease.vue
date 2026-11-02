<template>
  <!-- 6) SKY LANTERN: sa loob ng parol, paikot-ikot ang mga litrato. Mag-swipe pataas para paliparin ito; lilipad ang
       dose-dosenang parol sa langit, at lalabas ang swipeable gallery ng LAHAT ng litrato kasama ang huling mensahe. -->
  <section class="lant-stage" :class="{ released }" :style="{ '--p': p }">
    <Transition name="swap" mode="out-in">
      <div
        v-if="!showMessage"
        key="launch"
        class="launch"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      >
        <header class="head">
          <p class="eyebrow">{{ released ? "Make a wish" : "One last thing" }}</p>
          <h2>{{ released ? "Fly, little light" : "Let your lantern go" }}</h2>
        </header>

        <div ref="lanternEl" class="lantern" aria-hidden="true">
          <span class="cap" />
          <div class="body">
            <div class="window">
              <Transition name="fade" mode="out-in">
                <img v-if="photos.length" :key="idx" :src="photos[idx]" alt="" draggable="false" />
                <span v-else class="heart">♥</span>
              </Transition>
            </div>
          </div>
          <span class="base" />
          <span class="flame" />
        </div>

        <p v-if="!released" class="hint">Swipe up to release it ↑ · {{ Math.round(p * 100) }}%</p>
      </div>

      <div v-else key="msg" class="message">
        <p class="eyebrow">Happy birthday</p>

        <div class="reel" ref="reelEl" @scroll.passive="onScroll" @pointerdown="stopReel">
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
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  photos: { type: Array, default: () => [] },
});
const emit = defineEmits(["released", "replay"]);

const lanternEl = ref(null);
const reelEl = ref(null);
const p = ref(0); // 0 = nakatali, 1 = pinakawalan na
const released = ref(false);
const showMessage = ref(false);
const idx = ref(0); // aling litrato ang nasa bintana ng parol
const slide = ref(0); // aling litrato ang nasa gallery

let lastY = null;
let moved = 0;
let stageHeight = 1;
let releaseTimer = 0;
let cycleTimer = 0;
let reelTimer = 0;

function pull(amount) {
  if (released.value) return;
  p.value = Math.min(1, p.value + amount);
  if (p.value >= 1) release();
}
function release() {
  released.value = true;
  navigator.vibrate?.([30, 50, 30]);
  emit("released", lanternEl.value);
  releaseTimer = setTimeout(() => (showMessage.value = true), 3300);
}

// pataas na swipe kahit saan = hila sa parol; maikling tap = konting hila
function onDown(event) {
  if (released.value) return;
  lastY = event.clientY;
  moved = 0;
  stageHeight = event.currentTarget.getBoundingClientRect().height || 1;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function onMove(event) {
  if (lastY === null) return;
  const dy = lastY - event.clientY;
  lastY = event.clientY;
  moved += Math.abs(dy);
  if (dy > 0) pull(dy / (stageHeight * 0.26));
}
function onUp() {
  if (lastY !== null && moved < 6) pull(0.34);
  lastY = null;
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

onMounted(() => {
  if (props.photos.length > 1) cycleTimer = setInterval(() => (idx.value = (idx.value + 1) % props.photos.length), 1700);
});
onBeforeUnmount(() => {
  clearTimeout(releaseTimer);
  clearInterval(cycleTimer);
  clearInterval(reelTimer);
});
</script>

<style scoped>
.lant-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
}
.launch {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 22px 60px;
  touch-action: none;
}
.lant-stage:not(.released) .launch {
  cursor: grab;
}
.eyebrow {
  margin: 0;
  color: #bcd6f5;
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
  font-size: clamp(28px, 8cqi, 40px);
  font-style: italic;
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 2px 14px rgb(0 10 30 / 0.7);
}

/* ===== Parol ===== */
.lantern {
  position: relative;
  width: 150px;
  height: 225px;
  filter: drop-shadow(0 0 calc(14px + var(--p) * 26px) rgb(255 170 90 / 0.85));
  translate: 0 calc(var(--p) * -34px);
  animation: lantern-float 3s ease-in-out infinite alternate;
}
.released .lantern {
  opacity: 0;
  scale: 0.5;
  translate: 0 -140%;
  transition:
    translate 3.2s cubic-bezier(0.45, 0.05, 0.5, 1),
    scale 3.2s ease,
    opacity 1.2s ease 2s;
}
.cap {
  position: absolute;
  top: 0;
  left: 12%;
  right: 12%;
  height: 16px;
  border-radius: 6px 6px 0 0;
  background: #c06a3a;
}
.body {
  position: absolute;
  top: 14px;
  left: 0;
  right: 0;
  height: 150px;
  background:
    repeating-linear-gradient(90deg, rgb(120 50 10 / 0.22) 0 2px, transparent 2px 30px),
    linear-gradient(180deg, #ffd28a, #ff9d5c 70%, #ff7c4a);
  clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
}
.window {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  overflow: hidden;
  border: 4px solid #fff3d4;
  border-radius: 50%;
  background: #fff3d4;
  box-shadow: 0 0 22px 6px rgb(255 240 190 / 0.7);
  translate: -50% -50%;
}
.window img {
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.heart {
  color: #ff8a6b;
  font-size: 40px;
}
.base {
  position: absolute;
  top: 164px;
  left: 6%;
  right: 6%;
  height: 12px;
  border-radius: 3px;
  background: #8c4a28;
}
.flame {
  position: absolute;
  top: 176px;
  left: 50%;
  width: 22px;
  height: 36px;
  margin-left: -11px;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: radial-gradient(ellipse at 50% 70%, #fff6cf, #ffc24d 55%, #ff7a2f);
  box-shadow: 0 0 20px 8px rgb(255 170 60 / 0.6);
  transform-origin: 50% 90%;
  animation: flicker 0.6s ease-in-out infinite alternate;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.7s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.hint {
  margin: 0;
  color: #d7e6fa;
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 600;
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
  background: repeating-conic-gradient(#e7c58d 0 10deg, #b98b54 10deg 20deg);
  box-shadow: 0 0 40px 8px rgb(255 214 140 / 0.35), 0 14px 26px rgb(0 10 30 / 0.5);
}
.ringpic img {
  width: 100%;
  height: 100%;
  border: 3px solid #fff3d4;
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
  background: #fff3d4;
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
  background: rgb(255 255 255 / 0.35);
  transition: background 0.4s ease, transform 0.4s ease;
}
.dots i.on {
  background: #ffd9a0;
  transform: scale(1.35);
}
.message h3 {
  margin: 0;
  background: linear-gradient(180deg, #ffe3b0, #ff9d7a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: var(--font-head);
  font-size: clamp(46px, 14cqi, 70px);
  font-style: italic;
  font-weight: 600;
  line-height: 1.12;
  padding: 0 0.1em;
}
.text {
  margin: 0;
  color: #eaf3ff;
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.5;
}
.from {
  margin: 4px 0 0;
  color: #ffd9a0;
  font-family: var(--font-head);
  font-size: 22px;
  font-style: italic;
}
.replay {
  margin-top: 10px;
  padding: 9px 24px;
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.12);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.replay:hover {
  background: rgb(255 255 255 / 0.25);
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

@keyframes lantern-float {
  from {
    transform: translateY(-4px);
  }
  to {
    transform: translateY(5px);
  }
}
@keyframes flicker {
  from {
    transform: scale(1, 0.9) rotate(-2deg);
  }
  to {
    transform: scale(1.06, 1.08) rotate(2deg);
  }
}
@container (max-height: 620px) {
  .launch {
    gap: 6px;
    padding: 28px 22px 28px;
  }
  .lantern {
    zoom: 0.8;
  }
  .message {
    padding: 26px 18px 18px;
  }
  .ringpic {
    width: 112px;
    height: 112px;
  }
  .message h3 {
    font-size: 42px;
  }
  .text {
    font-size: 15px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .lantern,
  .flame {
    animation: none;
  }
}
</style>