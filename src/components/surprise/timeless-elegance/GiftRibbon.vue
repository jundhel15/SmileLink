<template>
  <!-- 6) GIFT RIBBON: hilahin pababa ang gintong ribbon; kumakalag ang bow, tumataas ang takip,
       at lumalabas mula sa kahon ang litrato nila sa loob ng oval na gintong frame + final message. -->
  <section
    class="gift-stage"
    :class="{ opened }"
    :style="{ '--p': p }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <Transition name="swap" mode="out-in">
      <div v-if="!showMessage" key="box" class="box-area">
        <header class="head">
          <p class="eyebrow">{{ opened ? "Surprise" : "One last thing" }}</p>
          <h2>{{ opened ? "Happy birthday, my love" : "Pull the ribbon" }}</h2>
        </header>

        <div ref="boxEl" class="gift">
          <span class="rays" />

          <div class="photo-oval inside" aria-hidden="true">
            <img v-if="photo" :src="photo" alt="" draggable="false" />
            <span v-else class="heart">♥</span>
          </div>

          <div class="body">
            <span class="ribbon-v" />
            <span class="ribbon-h" />
          </div>
          <div class="lid">
            <span class="ribbon-v" />
          </div>

          <div class="bow">
            <span class="loop l" />
            <span class="loop r" />
            <button class="tail l" type="button" aria-label="Pull the ribbon" @click="onTail" />
            <button class="tail r" type="button" aria-label="Pull the ribbon" @click="onTail" />
            <span class="knot" />
          </div>
        </div>

        <p v-if="!opened" class="hint">Drag down ↓ · {{ Math.round(p * 100) }}%</p>
      </div>

      <div v-else key="msg" class="message" @pointerdown.stop>
        <p class="eyebrow">Happy birthday</p>
        <div class="photo-oval">
          <img v-if="photo" :src="photo" alt="" draggable="false" />
          <span v-else class="heart">♥</span>
        </div>
        <h3>{{ recipient }}</h3>
        <p class="text">{{ message }}</p>
        <p class="from">Forever yours, {{ sender }}</p>
        <button class="replay" type="button" @click="emit('replay')">↻ Replay</button>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  photo: { type: String, default: "" },
});
const emit = defineEmits(["opened", "replay"]);

const boxEl = ref(null);
const p = ref(0); // 0 = nakatali, 1 = kalag na ang ribbon
const opened = ref(false);
const showMessage = ref(false);
let lastY = null;
let moved = 0;
let stageHeight = 1;
let timer = 0;

function pull(amount) {
  if (opened.value) return;
  p.value = Math.min(1, p.value + amount);
  if (p.value >= 1) open();
}

function open() {
  opened.value = true;
  navigator.vibrate?.([30, 50, 30]);
  emit("opened", boxEl.value);
  timer = setTimeout(() => (showMessage.value = true), 3000);
}

// pababang drag kahit saan = hila sa ribbon; maikling tap = hila rin
function onDown(event) {
  if (opened.value) return;
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
  if (dy > 0) pull(dy / (stageHeight * 0.28));
}
function onUp() {
  if (lastY !== null && moved < 6) pull(0.34);
  lastY = null;
}
// keyboard (Enter/Space) lang ang aabot dito; ang mouse/daliri ay hawak na ng eksena
function onTail(event) {
  if (event.detail === 0) pull(0.34);
}

onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
.gift-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 22px 60px;
  text-align: center;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.gift-stage:not(.opened) {
  cursor: grab;
}
.box-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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

/* ===== Regalo (CSS lang) ===== */
.gift {
  position: relative;
  flex: none;
  width: 240px;
  height: 300px;
}
.rays {
  position: absolute;
  left: 50%;
  bottom: 80px;
  width: 360px;
  height: 360px;
  margin-left: -180px;
  background: repeating-conic-gradient(rgb(255 232 170 / 0.6) 0 8deg, transparent 8deg 24deg);
  -webkit-mask-image: radial-gradient(circle, #000 15%, transparent 68%);
  mask-image: radial-gradient(circle, #000 15%, transparent 68%);
  opacity: 0;
  transition: opacity 1.4s ease 0.4s;
  animation: spin 18s linear infinite;
  pointer-events: none;
}
.opened .rays {
  opacity: 1;
}
.body {
  position: absolute;
  left: 20px;
  bottom: 0;
  z-index: 3;
  width: 200px;
  height: 116px;
  border-radius: 3px;
  background:
    linear-gradient(180deg, rgb(0 0 0 / 0.06), transparent 30%),
    linear-gradient(90deg, #f1e7d2, #fffaf0 45%, #eadfc6);
  box-shadow: 0 16px 30px rgb(100 75 30 / 0.3);
}
.lid {
  position: absolute;
  left: 8px;
  bottom: 116px;
  z-index: 4;
  width: 224px;
  height: 44px;
  border-radius: 3px;
  background: linear-gradient(180deg, #fffdf7, #f0e5cd);
  box-shadow: 0 6px 14px rgb(100 75 30 / 0.22);
  transition:
    transform 1s cubic-bezier(0.3, 1, 0.4, 1),
    opacity 0.8s ease 0.6s;
}
.opened .lid {
  opacity: 0;
  transform: translate(70px, -90px) rotate(16deg);
}
.ribbon-v,
.ribbon-h {
  position: absolute;
  background: linear-gradient(90deg, #b8914f, #ecd6a0 45%, #b8914f);
}
.ribbon-v {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 30px;
  margin-left: -15px;
}
.ribbon-h {
  top: 40%;
  left: 0;
  right: 0;
  height: 22px;
  background: linear-gradient(180deg, #b8914f, #ecd6a0 45%, #b8914f);
}

/* ===== Bow at mga laylayan ===== */
.bow {
  position: absolute;
  left: 50%;
  bottom: 150px;
  z-index: 6;
  width: 96px;
  height: 56px;
  margin-left: -48px;
  transform: scale(calc(1 - var(--p) * 0.6));
  opacity: calc(1 - var(--p) * 1.15);
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}
.loop {
  position: absolute;
  top: 8px;
  width: 50px;
  height: 36px;
  border: 9px solid #c9a15a;
  border-radius: 50%;
  box-shadow: inset 0 2px 3px rgb(255 255 255 / 0.45), 0 3px 6px rgb(100 75 30 / 0.3);
}
.loop.l {
  left: 0;
  transform: rotate(-22deg);
}
.loop.r {
  right: 0;
  transform: rotate(22deg);
}
.knot {
  position: absolute;
  top: 16px;
  left: 50%;
  width: 22px;
  height: 22px;
  margin-left: -11px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff0c4, #b8914f 75%);
  box-shadow: 0 3px 6px rgb(100 75 30 / 0.35);
}
.tail {
  position: absolute;
  top: 28px;
  width: 20px;
  height: 78px;
  padding: 0;
  border: 0;
  background: linear-gradient(90deg, #b8914f, #ecd6a0 50%, #b8914f);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%);
  cursor: pointer;
  transform-origin: 50% 0;
  translate: 0 calc(var(--p) * 46px);
}
.tail:focus-visible {
  outline: 2px solid #3f3a2e;
}
.tail.l {
  left: 22px;
  transform: rotate(10deg);
}
.tail.r {
  right: 22px;
  transform: rotate(-10deg);
}

/* ===== Litrato sa oval na gintong frame ===== */
.photo-oval {
  display: grid;
  place-items: center;
  width: 140px;
  height: 180px;
  overflow: hidden;
  border: 4px solid #c9a15a;
  border-radius: 50%;
  background: #fffdf7;
  box-shadow:
    0 0 0 5px #fffaf0,
    0 0 0 6.5px #c9a15a,
    0 14px 30px rgb(100 75 30 / 0.35);
}
.photo-oval img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.heart {
  color: #c9a15a;
  font-size: 54px;
}
.photo-oval.inside {
  position: absolute;
  left: 50%;
  bottom: 96px;
  z-index: 2;
  margin-left: -70px;
  opacity: 0;
  transform: translateY(110px) scale(0.5);
  transition:
    transform 1.6s cubic-bezier(0.25, 1.1, 0.35, 1) 0.5s,
    opacity 0.6s ease 0.5s;
}
.opened .photo-oval.inside {
  opacity: 1;
  transform: translateY(-120px) scale(1);
}
.hint {
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  pointer-events: none;
}

/* ===== Mensahe ===== */
.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  max-width: 400px;
}
.message .photo-oval {
  margin: 8px 0 14px;
  animation: pop-in 1.2s cubic-bezier(0.3, 1.4, 0.5, 1) both;
}
.message h3 {
  margin: 0;
  font-family: var(--font-script);
  font-size: clamp(54px, 17cqi, 80px);
  font-weight: 400;
  line-height: 1.1;
  background: linear-gradient(180deg, #e2c48a 5%, #b8914f 55%, #8f6d33 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 2px 6px rgb(120 90 40 / 0.2));
}
.text {
  margin: 0;
  color: #3f3a2e;
  font-family: var(--font-serif);
  font-size: 20px;
  font-style: italic;
  line-height: 1.45;
}
.from {
  margin: 4px 0 0;
  color: #9c7637;
  font-family: var(--font-script);
  font-size: 32px;
  line-height: 1.2;
}
.replay {
  margin-top: 10px;
  padding: 9px 24px;
  border: 1px solid #b8914f;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.7);
  color: #7a5c26;
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
}
.replay:hover {
  background: #fff;
}
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.8s ease, filter 0.8s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(8px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
}
@container (max-height: 620px) {
  .gift-stage {
    padding: 24px 22px 24px;
  }
  .gift {
    zoom: 0.78;
  }
  .message .photo-oval {
    width: 104px;
    height: 134px;
    margin: 4px 0 6px;
  }
  .message h3 {
    font-size: 46px;
  }
  .text {
    font-size: 16px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .rays {
    animation: none;
  }
}
</style>