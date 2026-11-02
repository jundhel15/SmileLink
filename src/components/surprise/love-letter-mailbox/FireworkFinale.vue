<template>
  <!-- 6) LIGHT UP THE SKY: i-tap kahit saan sa langit para magpaputok ng paputok na puso (5 beses). Pagkatapos,
       lalabas ang huling screen: bilang ng buwan, gallery ng LAHAT ng litrato, at ang mensahe. -->
  <section ref="stageEl" class="fw-stage">
    <Transition name="fw-swap" mode="out-in">
      <div v-if="mode === 'fire'" key="fire" class="fw-fire">
        <header class="fw-head">
          <p class="fw-eyebrow">{{ shots }} of {{ TARGET }} fired</p>
          <h2>{{ shots >= TARGET ? "Happy Monthsary!" : "Light up the sky" }}</h2>
        </header>

        <div
          class="fw-sky"
          tabindex="0"
          role="button"
          aria-label="Tap the sky to launch fireworks"
          @pointerdown="onTap"
          @keydown.enter.prevent="launchAuto"
          @keydown.space.prevent="launchAuto"
        >
          <span v-if="shots === 0" class="fw-tap" aria-hidden="true" />
        </div>

        <span v-for="r in rockets" :key="r.id" class="fw-rocket" :style="r.style" aria-hidden="true" />

        <ol class="fw-dots" aria-hidden="true">
          <li v-for="i in TARGET" :key="i" :class="{ on: i <= shots }">✦</li>
        </ol>
        <p v-if="shots < TARGET" class="fw-hint">Tap anywhere in the sky</p>
      </div>

      <div v-else key="final" class="fw-final">
        <div class="fw-card">
          <p class="fw-eyebrow dark">Happy monthsary</p>

          <div class="fw-badge">
            <b>{{ monthCount }}</b>
            <small>{{ monthCount === 1 ? "month" : "months" }}</small>
          </div>

          <div ref="reelEl" class="fw-reel" @scroll.passive="onScroll" @pointerdown="stopReel">
            <div v-for="(src, i) in list" :key="i" class="fw-slide">
              <figure class="fw-pol" :style="{ rotate: (i % 2 ? 2 : -2) + 'deg' }">
                <img v-if="src" :src="src" alt="" draggable="false" />
                <span v-else class="fw-pheart">♥</span>
                <figcaption v-if="captions[i]">{{ captions[i] }}</figcaption>
              </figure>
            </div>
          </div>
          <div v-if="list.length > 1" class="fw-pdots" aria-hidden="true">
            <i v-for="(src, i) in list" :key="i" :class="{ on: i === slide }" />
          </div>

          <h3>{{ recipient }}</h3>
          <p class="fw-text">{{ message }}</p>
          <p class="fw-from">Forever yours, {{ sender }}</p>
          <button class="fw-replay" type="button" @click="emit('replay')">↻ Replay</button>
        </div>
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
const emit = defineEmits(["fire", "finale", "replay"]);

const TARGET = 5;
const list = computed(() => (props.photos.length ? props.photos : [""]));

const stageEl = ref(null);
const reelEl = ref(null);
const mode = ref("fire"); // fire | final
const shots = ref(0);
const rockets = ref([]);
const slide = ref(0);

let launched = 0;
let rocketId = 0;
let reelTimer = 0;
const timers = [];

// posisyon sa loob ng eksena (hinahati sa scale ng preview)
function localPoint(event) {
  const r = stageEl.value.getBoundingClientRect();
  const s = r.width / (stageEl.value.offsetWidth || 1) || 1;
  return { x: (event.clientX - r.left) / s, y: (event.clientY - r.top) / s };
}

function onTap(event) {
  const { x, y } = localPoint(event);
  launchAt(x, y);
}
function launchAuto() {
  const w = stageEl.value.offsetWidth;
  const h = stageEl.value.offsetHeight;
  launchAt(w * (0.25 + Math.random() * 0.5), h * (0.2 + Math.random() * 0.25));
}

function launchAt(x, y) {
  if (launched >= TARGET) return;
  launched += 1;
  const id = ++rocketId;
  const h = stageEl.value.offsetHeight;
  rockets.value.push({ id, style: { left: `${x}px`, top: `${y}px`, "--rise": `${h - y}px` } });
  timers.push(
    setTimeout(() => {
      rockets.value = rockets.value.filter((r) => r.id !== id);
      emit("fire", { x, y });
      navigator.vibrate?.(14);
      shots.value += 1;
      if (shots.value >= TARGET) {
        emit("finale");
        timers.push(setTimeout(() => (mode.value = "final"), 1800));
      }
    }, 620),
  );
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
  timers.forEach(clearTimeout);
  clearInterval(reelTimer);
});
</script>

<style scoped>
.fw-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.fw-fire,
.fw-final {
  position: absolute;
  inset: 0;
}
.fw-head {
  position: absolute;
  z-index: 4;
  top: 9%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  pointer-events: none;
  transform: translateX(-50%);
}
.fw-eyebrow {
  margin: 0;
  color: #ffd6e4;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.fw-eyebrow.dark {
  color: #d94b70;
}
h2 {
  margin: 6px 0 0;
  color: #fff;
  font-family: var(--font-head);
  font-size: clamp(28px, 8.4cqi, 42px);
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 2px 12px rgb(43 23 69 / 0.5);
}

/* ===== Langit at paputok ===== */
.fw-sky {
  position: absolute;
  z-index: 2;
  inset: 0;
  cursor: crosshair;
  outline: none;
  touch-action: manipulation;
}
.fw-sky:focus-visible {
  outline: 2px dashed #ffe9a8;
  outline-offset: -6px;
}
.fw-tap {
  position: absolute;
  left: 50%;
  top: 42%;
  width: 70px;
  height: 70px;
  border: 3px solid rgb(255 255 255 / 0.85);
  border-radius: 50%;
  pointer-events: none;
  translate: -50% -50%;
  animation: fw-ping 1.4s ease-out infinite;
}
.fw-rocket {
  position: absolute;
  z-index: 3;
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 50%;
  background: #fff6c9;
  box-shadow: 0 0 10px 3px #ffd36e;
  pointer-events: none;
  animation: fw-up 0.62s cubic-bezier(0.25, 0.6, 0.45, 1) forwards;
}
.fw-rocket::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 100%;
  width: 3px;
  height: 46px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: linear-gradient(#ffd36e, transparent);
}
.fw-dots {
  position: absolute;
  z-index: 4;
  left: 50%;
  bottom: 7%;
  display: flex;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
  transform: translateX(-50%);
}
.fw-dots li {
  color: rgb(255 255 255 / 0.35);
  font-size: 18px;
  transition: color 0.4s ease, transform 0.4s ease;
}
.fw-dots li.on {
  color: #ffe9a8;
  text-shadow: 0 0 10px #ffd36e;
  transform: scale(1.25);
}
.fw-hint {
  position: absolute;
  z-index: 4;
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
  text-shadow: 0 2px 8px rgb(43 23 69 / 0.6);
  pointer-events: none;
}

/* ===== Huling screen ===== */
.fw-final {
  display: grid;
  place-items: center;
  padding: 22px 14px;
}
.fw-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: min(100%, 360px);
  max-height: 100%;
  padding: 18px 16px 16px;
  overflow-y: auto;
  border: 2px solid #fff;
  border-radius: 26px;
  background: linear-gradient(180deg, rgb(255 250 246 / 0.95), rgb(255 232 240 / 0.95));
  box-shadow: 0 20px 44px rgb(20 8 40 / 0.5);
  text-align: center;
}
.fw-badge {
  display: grid;
  flex: 0 0 auto;
  width: 70px;
  height: 70px;
  place-items: center;
  align-content: center;
  border: 3px solid #fff;
  border-radius: 50%;
  background: linear-gradient(160deg, #ff8fab, #e5384f);
  box-shadow: 0 10px 20px rgb(180 60 90 / 0.4);
  color: #fff;
  animation: fw-beat 1.4s ease-in-out infinite;
}
.fw-badge b {
  font-family: var(--font-head);
  font-size: 28px;
  line-height: 1;
}
.fw-badge small {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.fw-reel {
  display: flex;
  flex: 0 0 auto;
  width: min(100%, 290px);
  margin: 2px 0 0;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  touch-action: pan-x;
}
.fw-reel::-webkit-scrollbar {
  display: none;
}
.fw-slide {
  display: grid;
  flex: 0 0 100%;
  padding-block: 4px;
  place-items: center;
  scroll-snap-align: center;
}
.fw-pol {
  width: 158px;
  margin: 0;
  padding: 8px 8px 10px;
  background: #fff;
  box-shadow: 0 12px 24px rgb(122 43 69 / 0.32);
}
.fw-pol img {
  display: block;
  width: 142px;
  height: 142px;
  object-fit: cover;
  pointer-events: none;
}
.fw-pheart {
  display: grid;
  width: 142px;
  height: 142px;
  place-items: center;
  background: #ffe3ea;
  color: #ff8fab;
  font-size: 54px;
}
.fw-pol figcaption {
  padding-top: 6px;
  color: #6b5a47;
  font-family: var(--font-hand);
  font-size: 18px;
  line-height: 1.1;
}
.fw-pdots {
  display: flex;
  gap: 6px;
}
.fw-pdots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(122 43 69 / 0.25);
  transition: background 0.4s ease, transform 0.4s ease;
}
.fw-pdots i.on {
  background: #e5384f;
  transform: scale(1.35);
}
.fw-card h3 {
  margin: 0;
  padding: 0 0.1em;
  background: linear-gradient(180deg, #e5384f, #ff8fab);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: var(--font-script);
  font-size: clamp(46px, 14cqi, 66px);
  font-weight: 400;
  line-height: 1.12;
}
.fw-text {
  margin: 0;
  color: #5c2a3c;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
}
.fw-from {
  margin: 2px 0 0;
  color: #d94b70;
  font-family: var(--font-script);
  font-size: 26px;
}
.fw-replay {
  margin-top: 6px;
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
.fw-replay:hover {
  background: #fff;
}
.fw-swap-enter-active,
.fw-swap-leave-active {
  transition: opacity 0.9s ease, filter 0.9s ease;
}
.fw-swap-enter-from,
.fw-swap-leave-to {
  opacity: 0;
  filter: blur(8px);
}

@keyframes fw-up {
  from {
    transform: translateY(var(--rise));
  }
  to {
    transform: translateY(0);
  }
}
@keyframes fw-ping {
  from {
    opacity: 1;
    scale: 0.6;
  }
  to {
    opacity: 0;
    scale: 1.6;
  }
}
@keyframes fw-beat {
  50% {
    scale: 1.07;
  }
}
@container (max-height: 620px) {
  .fw-head {
    top: 5%;
  }
  .fw-final {
    padding: 14px 12px;
  }
  .fw-card {
    gap: 3px;
    padding: 12px 14px 12px;
  }
  .fw-badge {
    width: 54px;
    height: 54px;
  }
  .fw-badge b {
    font-size: 21px;
  }
  .fw-pol {
    width: 124px;
    padding: 6px 6px 8px;
  }
  .fw-pol img,
  .fw-pheart {
    width: 112px;
    height: 112px;
  }
  .fw-card h3 {
    font-size: 42px;
  }
  .fw-text {
    font-size: 13px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .fw-badge,
  .fw-tap {
    animation: none;
  }
}
</style>