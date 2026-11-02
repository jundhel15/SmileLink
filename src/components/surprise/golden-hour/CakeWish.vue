<template>
  <!-- 6) CAKE WISH: i-tap ang bawat kandila para sindihan, tapos i-hold ang "blow" para hipan.
       Kapag namatay ang apoy: confetti + litrato (polaroid) + final birthday message. -->
  <section class="cake-stage">
    <Transition name="swap" mode="out-in">
      <div v-if="!showMessage" key="cake" class="cake-area">
        <header class="head">
          <p class="eyebrow">{{ allLit ? "Make a wish" : "One last surprise" }}</p>
          <h2>{{ allLit ? "Close your eyes… then blow" : "Light the candles" }}</h2>
        </header>

        <div ref="cakeEl" class="cake" :style="{ '--b': blow }">
          <span class="glow" :class="{ on: litCount > 0 && !blown }" :style="{ opacity: 0.25 + (litCount / lit.length) * 0.75 }" />
          <div class="candles">
            <button
              v-for="(on, i) in lit"
              :key="i"
              class="candle"
              :style="{ '--c': CANDLE_COLORS[i % CANDLE_COLORS.length], '--k': i }"
              type="button"
              :disabled="on || blown"
              :aria-label="on ? `Candle ${i + 1} is lit` : `Light candle ${i + 1}`"
              @click="light(i)"
            >
              <span class="stick" />
              <span v-if="on && !blown" class="flame" />
              <span v-if="blown" class="smoke" />
            </button>
          </div>
          <div class="tier top" />
          <div class="tier bottom" />
          <div class="plate" />
        </div>

        <p v-if="!allLit" class="hint">{{ litCount }} / {{ lit.length }} lit · tap each candle</p>
        <button
          v-else-if="!blown"
          class="blow"
          type="button"
          :style="{ '--b': blow }"
          @pointerdown="startBlow"
          @pointerup="stopBlow"
          @pointercancel="stopBlow"
          @contextmenu.prevent
          @keydown.space.prevent="startBlow"
          @keyup.space="stopBlow"
          @keydown.enter.prevent="startBlow"
          @keyup.enter="stopBlow"
        >
          <span class="fill" />
          <span class="label">Hold to blow 💨</span>
        </button>
      </div>

      <div v-else key="msg" class="message">
        <p class="eyebrow">Happy birthday</p>
        <div class="photo-frame">
          <img v-if="photo" :src="photo" alt="" draggable="false" />
          <span v-else class="emoji">🎂</span>
        </div>
        <h3>{{ recipient }}</h3>
        <p class="text">{{ message }}</p>
        <p class="from">— {{ sender }}</p>
        <button class="replay" type="button" @click="emit('replay')">↻ Replay</button>
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
  photo: { type: String, default: "" },
  candles: { type: Number, default: 5 },
});
const emit = defineEmits(["blown", "replay"]);

const CANDLE_COLORS = ["#ff7a7a", "#f4b942", "#2a9d8f", "#8e7dff", "#5ec2f2"];

const lit = ref(Array.from({ length: props.candles }, () => false));
const cakeEl = ref(null);
const blow = ref(0); // 0–1: gaano na katagal na hinihipan
const blown = ref(false);
const showMessage = ref(false);

const litCount = computed(() => lit.value.filter(Boolean).length);
const allLit = computed(() => litCount.value === lit.value.length);

let blowing = false;
let frame = 0;
let lastTime = 0;
let timer = 0;

function light(i) {
  if (lit.value[i] || blown.value) return;
  lit.value[i] = true;
  navigator.vibrate?.(12);
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  blow.value = blowing ? Math.min(1, blow.value + dt / 1.3) : Math.max(0, blow.value - dt / 0.7);
  if (blow.value >= 1) {
    extinguish();
    return;
  }
  frame = blowing || blow.value > 0 ? requestAnimationFrame(loop) : 0;
}

function startBlow(event) {
  if (!allLit.value || blown.value || blowing) return;
  blowing = true;
  if (event.pointerId !== undefined) event.currentTarget.setPointerCapture?.(event.pointerId);
  if (!frame) {
    lastTime = performance.now();
    frame = requestAnimationFrame(loop);
  }
}
function stopBlow() {
  blowing = false;
}

function extinguish() {
  blowing = false;
  frame = 0;
  blown.value = true;
  navigator.vibrate?.([30, 40, 30]);
  emit("blown", cakeEl.value);
  timer = setTimeout(() => (showMessage.value = true), 1700);
}

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  clearTimeout(timer);
});
</script>

<style scoped>
.cake-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 22px 70px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
}
.cake-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
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

/* ===== Cake (CSS lang) ===== */
.cake {
  position: relative;
  flex: none;
  width: 220px;
  height: 196px;
  margin-top: 28px;
}
.glow {
  position: absolute;
  top: -50px;
  left: 50%;
  width: 300px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgb(255 214 140 / 0.65), transparent);
  opacity: 0;
  pointer-events: none;
  transform: translateX(-50%);
  transition: opacity 0.8s ease;
}
.glow.on {
  animation: flicker-glow 0.9s ease-in-out infinite alternate;
}
.tier {
  position: absolute;
  border-radius: 14px 14px 10px 10px;
}
.tier::before {
  /* icing na tumutulo */
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 18px;
  border-radius: 14px 14px 0 0;
  background:
    radial-gradient(circle at 10px 18px, var(--ice) 0 8px, transparent 9px) 0 0 / 28px 100% repeat-x,
    linear-gradient(var(--ice), var(--ice)) 0 0 / 100% 12px no-repeat;
}
.tier.top {
  --ice: #f78fb3;
  top: 56px;
  left: 38px;
  width: 144px;
  height: 58px;
  background: linear-gradient(180deg, #fff2de, #f6dfbe);
  box-shadow: 0 6px 14px rgb(110 40 60 / 0.2);
}
.tier.bottom {
  --ice: #ffffff;
  top: 112px;
  left: 10px;
  width: 200px;
  height: 66px;
  background: linear-gradient(180deg, #f9b6c8, #ee94ad);
  box-shadow: 0 8px 16px rgb(110 40 60 / 0.25);
}
.plate {
  position: absolute;
  top: 172px;
  left: -12px;
  width: 244px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffffff, #ecd9d0);
  box-shadow: 0 8px 14px rgb(110 40 60 / 0.25);
}
.candles {
  position: absolute;
  z-index: 2;
  top: 4px;
  left: 50%;
  display: flex;
  justify-content: space-between;
  width: 150px;
  transform: translateX(-50%);
}
.candle {
  position: relative;
  width: 26px;
  height: 56px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}
.candle:focus-visible {
  outline: 2px solid #4a2340;
  outline-offset: 2px;
  border-radius: 6px;
}
.candle:not(:disabled) .stick {
  animation: invite 1.2s ease-in-out calc(var(--k) * 0.15s) infinite alternate;
}
.stick {
  position: absolute;
  bottom: 0;
  left: 8px;
  width: 10px;
  height: 36px;
  border-radius: 3px;
  background: repeating-linear-gradient(135deg, var(--c) 0 6px, #fff 6px 10px);
  box-shadow: inset -2px 0 3px rgb(0 0 0 / 0.15);
}
.flame {
  position: absolute;
  bottom: 34px;
  left: 8px;
  width: 11px;
  height: 20px;
  border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: radial-gradient(ellipse at 50% 72%, #fff, #ffe08a 45%, #ff9a3c);
  box-shadow: 0 0 12px 4px rgb(255 190 90 / 0.7);
  transform-origin: 50% 100%;
  rotate: calc(var(--b) * 28deg);
  animation: flame 0.22s ease-in-out infinite alternate;
}
.smoke {
  position: absolute;
  bottom: 38px;
  left: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(120 100 110 / 0.5);
  filter: blur(3px);
  animation: smoke 1.6s ease-out forwards;
}

.hint {
  margin: 0;
  color: #6d3a58;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
}
.blow {
  position: relative;
  min-width: 210px;
  padding: 14px 28px;
  overflow: hidden;
  border: 1px solid #d9574c;
  border-radius: 999px;
  background: #fff8ee;
  color: #b8403a;
  cursor: pointer;
  touch-action: none;
  -webkit-touch-callout: none;
  box-shadow: 0 8px 20px rgb(217 87 76 / 0.3);
  animation: invite-btn 1.3s ease-in-out infinite alternate;
}
.blow .fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #ffd0b8, #ff9aa8);
  transform: scaleX(var(--b));
  transform-origin: 0 50%;
}
.blow .label {
  position: relative;
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

/* ===== Mensahe ===== */
.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  max-width: 400px;
}
.photo-frame {
  display: grid;
  place-items: center;
  width: clamp(140px, 40cqi, 180px);
  aspect-ratio: 1;
  margin: 6px 0 14px;
  padding: 8px;
  background: #fffdf8;
  box-shadow: 0 14px 30px rgb(90 40 60 / 0.35);
  transform: rotate(-4deg);
  animation: pop-in 1s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
.photo-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.emoji {
  font-size: 64px;
}
.message h3 {
  margin: 0;
  color: #4a2340;
  font-family: var(--font-hand);
  font-size: clamp(52px, 16cqi, 76px);
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 2px 0 rgb(255 255 255 / 0.6);
}
.text {
  margin: 0;
  color: #4a2340;
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.45;
}
.from {
  margin: 0;
  color: #b8514a;
  font-family: var(--font-hand);
  font-size: 30px;
  font-weight: 700;
}
.replay {
  margin-top: 8px;
  padding: 9px 24px;
  border: 1px solid #d9574c;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.6);
  color: #b8403a;
  font-family: var(--font-serif);
  font-size: 16px;
  cursor: pointer;
}
.replay:hover {
  background: #fff;
}
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.7s ease, filter 0.7s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(8px);
}

@keyframes flame {
  from {
    scale: 1 1;
  }
  to {
    scale: 0.88 1.1;
  }
}
@keyframes flicker-glow {
  to {
    transform: translateX(-50%) scale(1.06);
  }
}
@keyframes invite {
  to {
    translate: 0 -3px;
  }
}
@keyframes invite-btn {
  to {
    box-shadow: 0 8px 28px rgb(217 87 76 / 0.55);
  }
}
@keyframes smoke {
  to {
    opacity: 0;
    transform: translate(10px, -70px) scale(4);
  }
}
@keyframes pop-in {
  from {
    opacity: 0;
    transform: rotate(-14deg) scale(0.5);
  }
}
@container (max-height: 620px) {
  .cake-stage {
    padding: 24px 22px 30px;
  }
  .cake-area {
    gap: 14px;
  }
  .cake {
    margin-top: 10px;
    zoom: 0.8;
  }
  .photo-frame {
    width: 110px;
    margin-bottom: 4px;
  }
  .message h3 {
    font-size: 48px;
  }
  .text {
    font-size: 15px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .flame,
  .glow.on,
  .stick,
  .blow {
    animation: none !important;
  }
}
</style>