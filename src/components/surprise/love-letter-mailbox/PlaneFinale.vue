<template>
  <!-- 6) SEND IT: hilahin pataas ang papel na eroplano na may dalang huling mensahe, tapos bitawan para lumipad.
       Pagkatapos ay lalabas ang huling screen: bilang ng buwan, gallery ng lahat ng litrato, at ang mensahe. -->
  <section class="pf-stage">
    <Transition name="pf-swap" mode="out-in">
      <div v-if="mode !== 'final'" key="send" class="pf-send">
        <header class="pf-head">
          <p class="pf-eyebrow">One last thing</p>
          <h2>Send it with a swipe</h2>
        </header>

        <div class="pf-pad" aria-hidden="true">
          <span class="pf-ring" />
        </div>

        <button
          ref="planeEl"
          class="pf-plane"
          :class="{ drag: dragging, fly: mode === 'flying' }"
          :style="planeStyle"
          type="button"
          aria-label="Swipe up to send the paper plane"
          @pointerdown="down"
          @pointermove="move"
          @pointerup="up"
          @pointercancel="up"
          @keydown.enter.prevent="launch"
          @keydown.space.prevent="launch"
        >
          <svg viewBox="0 0 200 150" aria-hidden="true">
            <path d="M6 70 L194 6 L132 144 L100 100 Z" class="pf-w1" />
            <path d="M6 70 L100 100 L82 140 Z" class="pf-w2" />
            <path d="M100 100 L194 6 L82 140 Z" class="pf-w3" />
            <path d="M140 60 C128 50 130 38 138 38 C142 38 144 42 144 42 C144 42 146 38 150 38 C158 38 160 50 140 60Z" class="pf-heart" />
          </svg>
          <span class="pf-tag">For {{ recipient }}</span>
        </button>

        <p v-if="mode === 'send'" class="pf-hint">Swipe up ↑ and let go</p>
      </div>

      <div v-else key="final" class="pf-final">
        <p class="pf-eyebrow">Happy monthsary</p>

        <div class="pf-badge">
          <b>{{ monthCount }}</b>
          <small>{{ monthCount === 1 ? "month" : "months" }}</small>
        </div>

        <div ref="reelEl" class="pf-reel" @scroll.passive="onScroll" @pointerdown="stopReel">
          <div v-for="(src, i) in list" :key="i" class="pf-slide">
            <figure class="pf-pol" :style="{ rotate: (i % 2 ? 2 : -2) + 'deg' }">
              <img v-if="src" :src="src" alt="" draggable="false" />
              <span v-else class="pf-pheart">♥</span>
              <figcaption v-if="captions[i]">{{ captions[i] }}</figcaption>
            </figure>
          </div>
        </div>
        <div v-if="list.length > 1" class="pf-dots" aria-hidden="true">
          <i v-for="(src, i) in list" :key="i" :class="{ on: i === slide }" />
        </div>

        <h3>{{ recipient }}</h3>
        <p class="pf-text">{{ message }}</p>
        <p class="pf-from">Forever yours, {{ sender }}</p>
        <button class="pf-replay" type="button" @click="emit('replay')">↻ Replay</button>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  monthCount: { type: Number, default: 1 },
  photos: { type: Array, default: () => [] },
  captions: { type: Array, default: () => [] },
});
const emit = defineEmits(["launched", "replay"]);

const list = computed(() => (props.photos.length ? props.photos : [""]));

const mode = ref("send"); // send | flying | final
const planeEl = ref(null);
const reelEl = ref(null);
const dx = ref(0);
const dy = ref(0);
const dragging = ref(false);
const slide = ref(0);

let start = null;
let scale = 1;
let flyTimer = 0;
let reelTimer = 0;

const planeStyle = computed(() => ({
  translate: `${dx.value}px ${dy.value}px`,
  rotate: mode.value === "flying" ? "28deg" : `${Math.max(-18, Math.min(18, dx.value / 6))}deg`,
}));

function down(event) {
  if (mode.value !== "send") return;
  start = { x: event.clientX, y: event.clientY };
  dragging.value = true;
  const el = event.currentTarget;
  scale = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
  el.setPointerCapture?.(event.pointerId);
}
function move(event) {
  if (!start) return;
  dx.value = (event.clientX - start.x) / (scale || 1);
  dy.value = Math.min(20, (event.clientY - start.y) / (scale || 1));
}
function up() {
  if (!start) return;
  start = null;
  dragging.value = false;
  if (dy.value < -80) launch();
  else {
    dx.value = 0;
    dy.value = 0;
  }
}

function launch() {
  if (mode.value !== "send") return;
  mode.value = "flying";
  dragging.value = false;
  navigator.vibrate?.([30, 40, 30]);
  emit("launched", planeEl.value);
  dx.value = 200;
  dy.value = -640;
  flyTimer = setTimeout(() => (mode.value = "final"), 1500);
}

/* ===== Gallery: kusang umuusad, humihinto kapag hinawakan ng user ===== */
function onScroll() {
  const el = reelEl.value;
  if (el && el.clientWidth) slide.value = Math.round(el.scrollLeft / el.clientWidth);
}
function advance() {
  const el = reelEl.value;
  if (!el || list.value.length < 2) return;
  const next = (slide.value + 1) % list.value.length;
  el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
}
function stopReel() {
  clearInterval(reelTimer);
}
watch(mode, (m) => {
  if (m === "final") reelTimer = setInterval(advance, 2800);
});

onBeforeUnmount(() => {
  clearTimeout(flyTimer);
  clearInterval(reelTimer);
});
</script>

<style scoped>
.pf-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.pf-send,
.pf-final {
  position: absolute;
  inset: 0;
}
.pf-head {
  position: absolute;
  top: 9%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.pf-eyebrow {
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

/* ===== Eroplano ===== */
.pf-pad {
  position: absolute;
  left: 50%;
  bottom: 10%;
  width: 190px;
  height: 56px;
  translate: -50% 0;
}
.pf-ring {
  position: absolute;
  inset: 0;
  border: 3px dashed rgb(255 255 255 / 0.85);
  border-radius: 50%;
  animation: pf-pulse 1.4s ease-in-out infinite alternate;
}
.pf-plane {
  position: absolute;
  left: 50%;
  bottom: 16%;
  width: 210px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: grab;
  touch-action: none;
  margin-left: -105px;
  animation: pf-hover 1.8s ease-in-out infinite alternate;
}
.pf-plane.drag {
  cursor: grabbing;
  animation: none;
}
.pf-plane:not(.drag):not(.fly) {
  transition: translate 0.5s cubic-bezier(0.3, 1.5, 0.5, 1), rotate 0.5s ease;
}
.pf-plane.fly {
  animation: none;
  opacity: 0;
  scale: 0.35;
  transition:
    translate 1.5s cubic-bezier(0.5, 0, 0.8, 0.5),
    rotate 1.5s ease,
    scale 1.5s ease,
    opacity 1.2s ease 0.4s;
}
.pf-plane:focus-visible {
  outline: 2px dashed #7a2b45;
  outline-offset: 6px;
}
.pf-plane svg {
  display: block;
  width: 100%;
  filter: drop-shadow(0 12px 12px rgb(122 43 69 / 0.35));
}
.pf-w1 {
  fill: #fff;
  stroke: #e7b6c6;
  stroke-width: 2;
  stroke-linejoin: round;
}
.pf-w2 {
  fill: #ffd9e3;
  stroke: #e7b6c6;
  stroke-width: 2;
  stroke-linejoin: round;
}
.pf-w3 {
  fill: #fff0f4;
  stroke: #e7b6c6;
  stroke-width: 2;
  stroke-linejoin: round;
}
.pf-heart {
  fill: #e5384f;
}
.pf-tag {
  position: absolute;
  left: 50%;
  bottom: -14px;
  padding: 4px 14px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.85);
  color: #b4506f;
  font-family: var(--font-script);
  font-size: 18px;
  white-space: nowrap;
  translate: -50% 0;
}
.pf-hint {
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

/* ===== Huling screen ===== */
.pf-final {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 400px;
  margin: 0 auto;
  padding: 44px 18px 26px;
  text-align: center;
}
.pf-badge {
  display: grid;
  width: 76px;
  height: 76px;
  place-items: center;
  align-content: center;
  border: 3px solid #fff;
  border-radius: 50%;
  background: linear-gradient(160deg, #ff8fab, #e5384f);
  box-shadow: 0 10px 20px rgb(180 60 90 / 0.4);
  color: #fff;
  animation: pf-beat 1.4s ease-in-out infinite;
}
.pf-badge b {
  font-family: var(--font-head);
  font-size: 30px;
  line-height: 1;
}
.pf-badge small {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.pf-reel {
  display: flex;
  width: min(100%, 300px);
  margin: 4px 0 0;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  touch-action: pan-x;
}
.pf-reel::-webkit-scrollbar {
  display: none;
}
.pf-slide {
  display: grid;
  flex: 0 0 100%;
  place-items: center;
  scroll-snap-align: center;
}
.pf-pol {
  width: 158px;
  margin: 0;
  padding: 8px 8px 10px;
  background: #fff;
  box-shadow: 0 12px 24px rgb(122 43 69 / 0.32);
}
.pf-pol img {
  display: block;
  width: 142px;
  height: 142px;
  object-fit: cover;
  pointer-events: none;
}
.pf-pheart {
  display: grid;
  width: 142px;
  height: 142px;
  place-items: center;
  background: #ffe3ea;
  color: #ff8fab;
  font-size: 54px;
}
.pf-pol figcaption {
  padding-top: 6px;
  color: #6b5a47;
  font-family: var(--font-hand);
  font-size: 18px;
  line-height: 1.1;
}
.pf-dots {
  display: flex;
  gap: 6px;
}
.pf-dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(122 43 69 / 0.25);
  transition: background 0.4s ease, transform 0.4s ease;
}
.pf-dots i.on {
  background: #e5384f;
  transform: scale(1.35);
}
.pf-final h3 {
  margin: 0;
  padding: 0 0.1em;
  background: linear-gradient(180deg, #e5384f, #ff8fab);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: var(--font-script);
  font-size: clamp(50px, 16cqi, 76px);
  font-weight: 400;
  line-height: 1.12;
}
.pf-text {
  margin: 0;
  color: #5c2a3c;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
}
.pf-from {
  margin: 2px 0 0;
  color: #d94b70;
  font-family: var(--font-script);
  font-size: 26px;
}
.pf-replay {
  margin-top: 8px;
  padding: 9px 24px;
  border: 2px solid #e9677c;
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
.pf-replay:hover {
  background: #fff;
}
.pf-swap-enter-active,
.pf-swap-leave-active {
  transition: opacity 0.9s ease, filter 0.9s ease;
}
.pf-swap-enter-from,
.pf-swap-leave-to {
  opacity: 0;
  filter: blur(8px);
}

@keyframes pf-hover {
  to {
    margin-bottom: 10px;
  }
}
@keyframes pf-pulse {
  to {
    opacity: 0.35;
    scale: 1.08;
  }
}
@keyframes pf-beat {
  50% {
    scale: 1.07;
  }
}
@container (max-height: 620px) {
  .pf-head {
    top: 5%;
  }
  .pf-plane {
    width: 170px;
    margin-left: -85px;
  }
  .pf-final {
    padding: 22px 18px 14px;
    gap: 3px;
  }
  .pf-badge {
    width: 58px;
    height: 58px;
  }
  .pf-badge b {
    font-size: 22px;
  }
  .pf-pol {
    width: 124px;
    padding: 6px 6px 8px;
  }
  .pf-pol img,
  .pf-pheart {
    width: 112px;
    height: 112px;
  }
  .pf-final h3 {
    font-size: 44px;
  }
  .pf-text {
    font-size: 14px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pf-plane,
  .pf-ring,
  .pf-badge {
    animation: none;
  }
}
</style>