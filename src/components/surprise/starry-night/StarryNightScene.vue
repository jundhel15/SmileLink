<template>
  <!-- EKSENA ng 02 Starry Night (nasa loob ng SurpriseShell screen):
       1) buwan + dagat + sakura, 5 wish stars, "Begin the Journey"
          (nagtitipon ang petals → nagiging alikabok → kislap ng liwanag)
       2) sky lanterns: i-swipe pataas ang 3 parol, bawat isa may sulat
       3) constellation: i-drag mula bituin hanggang bituin → hugis-pusong constellation
       4) hidden words: i-tap ang dagat → ripple + nakatagong salita
       5) message in a bottle: hilahin ang bote sa pampang → buksan ang sulat
       6) punuin ang buwan (paikutin ang daliri) → litrato sa loob + birthday message -->
  <div
    ref="sceneEl"
    class="scene-root"
    :class="{ leaving: phase !== 'intro' }"
    @pointermove="onPointerMove"
    @pointerleave="pointerActive = false"
  >
    <MoonEnvironment :glow="moonlight" :hide-moon="phase === 'moon'" />
    <OceanEnvironment />
    <div class="vignette" />
    <SakuraBranches />
    <SceneParticles ref="particlesRef" :reduced="reduced" />

    <section :key="`c${runKey}`" class="content">
      <p class="eyebrow">A wish for {{ content.recipient }}</p>
      <div class="heart-wrap">
        <HeartTrail ref="heartRef" :size="120" :boost="foundCount / 5" />
      </div>
      <h1 class="title" aria-label="Some moments are worth remembering...">
        <span class="serif" aria-hidden="true">
          <template v-for="(word, index) in words" :key="word">
            <span class="word" :style="{ '--i': index }">{{ word }}</span>{{ " " }}
          </template>
        </span>
        <span class="script word" aria-hidden="true" :style="{ '--i': 4.4 }">remembering...</span>
      </h1>
      <div class="divider-wrap"><OrnamentalDivider /></div>
      <div ref="buttonWrap" class="btn-wrap">
        <BeginJourneyButton :radiant="foundCount === 5" :disabled="phase !== 'intro'" @begin="begin" />
      </div>
    </section>

    <InteractiveElements
      :key="`i${runKey}`"
      :ready="revealed && phase === 'intro'"
      :wishes="content.wishes"
      @found="onFound"
      @complete="heartRef?.pulse()"
    />

    <Transition name="stage">
      <LanternRelease
        v-if="phase === 'lanterns'"
        :notes="content.lanterns"
        :reduced="reduced"
        @released="onLantern"
        @done="phase = 'constellation'"
      />
    </Transition>
    <Transition name="stage">
      <ConstellationTrace
        v-if="phase === 'constellation'"
        :recipient="content.recipient"
        @complete="burstAt($event, 60)"
        @done="phase = 'ripples'"
      />
    </Transition>
    <Transition name="stage">
      <WaterRipples v-if="phase === 'ripples'" :sentence="content.waterWords" @done="phase = 'bottle'" />
    </Transition>
    <Transition name="stage">
      <MessageBottle
        v-if="phase === 'bottle'"
        :recipient="content.recipient"
        :sender="content.sender"
        :note="content.bottleNote"
        @opened="burstAt($event, 40)"
        @done="phase = 'moon'"
      />
    </Transition>
    <Transition name="stage">
      <MoonReveal
        v-if="phase === 'moon'"
        :recipient="content.recipient"
        :sender="content.sender"
        :message="content.message"
        :photo="content.photo"
        @full="onMoonFull"
        @replay="replay"
      />
    </Transition>

    <div class="veil" :class="{ on: veil }" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import MoonEnvironment from "./MoonEnvironment.vue";
import OceanEnvironment from "./OceanEnvironment.vue";
import SakuraBranches from "./SakuraBranches.vue";
import SceneParticles from "./SceneParticles.vue";
import HeartTrail from "./HeartTrail.vue";
import OrnamentalDivider from "./OrnamentalDivider.vue";
import InteractiveElements from "./InteractiveElements.vue";
import BeginJourneyButton from "./BeginJourneyButton.vue";
import LanternRelease from "./LanternRelease.vue";
import ConstellationTrace from "./ConstellationTrace.vue";
import WaterRipples from "./WaterRipples.vue";
import MessageBottle from "./MessageBottle.vue";
import MoonReveal from "./MoonReveal.vue";

// content = recipient, sender, wishes (5), lanterns (3 maikling sulat), waterWords (pangungusap),
//           bottleNote (sulat sa bote), message, photo
defineProps({
  content: { type: Object, required: true },
});

const words = ["Some", "moments", "are", "worth"];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sceneEl = ref(null);
const buttonWrap = ref(null);
const heartRef = ref(null);
const particlesRef = ref(null);

const phase = ref("intro"); // intro → journey → lanterns → constellation → ripples → bottle → moon
const revealed = ref(false); // lalabas ang wish stars pagkatapos ng title animation
const foundCount = ref(0);
const veil = ref(false);
const runKey = ref(0);
const moonlight = computed(() => 0.3 + (foundCount.value / 5) * 0.7);

/* ===== Timers: naka-track lahat para malinis sa Replay at pagsara ===== */
const timers = new Set();
function later(fn, ms) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    fn();
  }, ms);
  timers.add(timer);
}
function clearTimers() {
  timers.forEach(clearTimeout);
  timers.clear();
}
// kapag na-clear ang timer (Replay/sara), hindi na itutuloy ang naka-pending na `begin`
const wait = (ms) => new Promise((resolve) => later(resolve, ms));

function scheduleReveal() {
  later(() => (revealed.value = true), reduced ? 1200 : 4300);
}

/* gitna ng isang element, relative sa loob ng eksena (para sa particles canvas).
   Hinahati sa scale kasi pinaliliit ng SurpriseShell ang device preview. */
function localCenter(el) {
  const scene = sceneEl.value.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const scale = scene.width / sceneEl.value.offsetWidth || 1;
  return {
    x: (rect.left + rect.width / 2 - scene.left) / scale,
    y: (rect.top + rect.height / 2 - scene.top) / scale,
  };
}

function onFound({ el }) {
  foundCount.value += 1;
  const { x, y } = localCenter(el);
  particlesRef.value?.burst(x, y, { count: 28, speed: 90, life: 1.5 });
}

async function begin() {
  if (phase.value !== "intro") return;
  phase.value = "journey";
  const particles = particlesRef.value;
  const scene = sceneEl.value;
  const cx = scene.clientWidth / 2;
  const cy = scene.clientHeight * 0.5;
  const btn = localCenter(buttonWrap.value);
  particles.burst(btn.x, btn.y, { count: 40, speed: 110, life: 1.8 });

  // nagtitipon ang petals sa gitna habang umiikot ang alikabok
  particles.gatherTo(cx, cy);
  particles.startVortex(cx, cy);
  await wait(reduced ? 1400 : 2900);

  // nagiging magical dust ang petals
  particles.dissolve();
  particles.burst(cx, cy, { count: 36, speed: 40, life: 2.2, size: 1.2 });
  await wait(reduced ? 500 : 1300);

  // kumakalat palabas ang alikabok + kislap ng liwanag, tapos ang sky lanterns
  particles.releaseVortex();
  veil.value = true;
  await wait(reduced ? 600 : 1200);
  particles.reset();
  phase.value = "lanterns";
  veil.value = false;
}

function onLantern({ el }) {
  const { x, y } = localCenter(el);
  particlesRef.value?.burst(x, y, { count: 18, speed: 50, life: 1.4, size: 0.9 });
}

function burstAt(el, count) {
  const { x, y } = localCenter(el);
  particlesRef.value?.burst(x, y, { count, speed: 120, life: 2, size: 1.1 });
}

function onMoonFull(el) {
  const { x, y } = localCenter(el);
  particlesRef.value?.burst(x, y, { count: 70, speed: 150, life: 2.4, size: 1.2 });
}

function replay() {
  clearTimers();
  veil.value = false;
  revealed.value = false;
  foundCount.value = 0;
  phase.value = "intro";
  particlesRef.value?.reset();
  runKey.value += 1;
  scheduleReveal();
}

/* ===== Parallax: sumusunod sa pointer; kung wala, dahan-dahang umuugoy ===== */
let pointerActive = false;
const pointerTarget = { x: 0, y: 0 };
const parallax = { x: 0, y: 0 };
let parallaxFrame = 0;
let lastTime = 0;

function onPointerMove(event) {
  const rect = sceneEl.value.getBoundingClientRect();
  pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointerTarget.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
  pointerActive = true;
}

function parallaxTick(now) {
  const t = now / 1000;
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  const tx = reduced ? 0 : pointerActive ? pointerTarget.x : Math.sin(t * 0.11) * 0.35;
  const ty = reduced ? 0 : pointerActive ? pointerTarget.y * 0.7 : Math.cos(t * 0.09) * 0.2;
  const k = Math.min(1, dt * 1.8);
  parallax.x += (tx - parallax.x) * k;
  parallax.y += (ty - parallax.y) * k;
  sceneEl.value?.style.setProperty("--px", parallax.x.toFixed(3));
  sceneEl.value?.style.setProperty("--py", parallax.y.toFixed(3));
  parallaxFrame = requestAnimationFrame(parallaxTick);
}

onMounted(() => {
  scheduleReveal();
  parallaxFrame = requestAnimationFrame(parallaxTick);
});
onBeforeUnmount(() => {
  clearTimers();
  cancelAnimationFrame(parallaxFrame);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Great+Vibes&display=swap");

.scene-root {
  --moon-x: 50%; /* pahalang na puwesto ng buwan at ng repleksyon nito sa dagat */
  --font-serif: "Cormorant Garamond", Georgia, "Times New Roman", serif;
  --font-script: "Great Vibes", "Segoe Script", cursive;
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background: #14102b;
  color: #fff;
}
.vignette {
  position: absolute;
  z-index: 2;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 52%, transparent 48%, rgb(10 6 28 / 0.5) 100%);
}

/* ===== Gitnang laman: puso, title, divider, button ===== */
.content {
  position: absolute;
  z-index: 10;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 22px 130px;
  text-align: center;
  pointer-events: none;
  transition:
    opacity 1.8s ease,
    filter 1.8s ease,
    transform 2.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.content::before {
  /* bahagyang dilim sa likod ng text para mabasa */
  content: "";
  position: absolute;
  z-index: -1;
  top: 44%;
  left: 50%;
  width: min(130%, 900px);
  height: 70%;
  transform: translate(-50%, -50%);
  background: radial-gradient(closest-side, rgb(18 11 42 / 0.4), transparent);
}
.leaving .content {
  opacity: 0;
  filter: blur(10px);
  transform: scale(0.94);
}
.eyebrow {
  margin: 0 0 6px;
  color: #f1d3a6;
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  animation: fade-up 2s ease 0.2s both;
}
.heart-wrap {
  margin-bottom: 8px;
  animation: fade-up 2s ease 0.4s both;
}
.title {
  margin: 0;
  color: #f4e9f7;
  font-family: var(--font-serif);
  font-size: 30px; /* pamalit sa lumang browser na walang cqi */
  font-size: clamp(24px, 8.2cqi, 46px);
  font-weight: 300;
  line-height: 1.25;
  letter-spacing: 0.045em;
  text-shadow:
    0 0 26px rgb(214 178 240 / 0.42),
    0 2px 20px rgb(14 8 34 / 0.7);
}
.serif {
  display: block;
}
.word {
  display: inline-block;
  opacity: 0;
  animation: word-in 1.9s cubic-bezier(0.2, 0.7, 0.2, 1) calc(0.9s + var(--i) * 0.34s) both;
}
.script {
  display: block;
  margin-top: 0.02em;
  padding: 0 0.1em;
  font-family: var(--font-script);
  font-size: 58px;
  font-size: clamp(44px, 16cqi, 92px);
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.12;
  background: linear-gradient(180deg, #fff3f8 8%, #f1c4d8 55%, #dca7a0 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: none;
  filter: drop-shadow(0 0 20px rgb(244 170 208 / 0.38));
}
.divider-wrap {
  margin-top: 14px;
  animation: fade-up 2s ease 3s both;
}
.btn-wrap {
  margin-top: 24px;
  pointer-events: auto;
  animation: fade-up 2s ease 3.4s both;
}

/* ===== Kislap ng lavender na liwanag (paglipat sa sky lanterns) ===== */
.veil {
  position: absolute;
  z-index: 30;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  background: radial-gradient(
    circle at 50% 50%,
    rgb(250 236 248 / 0.9) 0%,
    rgb(214 190 238 / 0.6) 40%,
    rgb(120 92 170 / 0.2) 80%,
    transparent 100%
  );
  transition: opacity 1.2s ease;
}
.veil.on {
  opacity: 0.85;
}
/* pagpasok/paglabas ng lanterns at buwan */
.stage-enter-active,
.stage-leave-active {
  transition: opacity 1.2s ease, filter 1.2s ease;
}
.stage-enter-from,
.stage-leave-to {
  opacity: 0;
  filter: blur(8px);
}

@keyframes word-in {
  from {
    opacity: 0;
    filter: blur(9px);
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: none;
  }
}
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
/* malapad na screen (laptop): mas maliit ang title kumpara sa lapad */
@container (min-width: 700px) {
  .title {
    font-size: clamp(30px, 4cqi, 46px);
  }
  .script {
    font-size: clamp(60px, 8cqi, 92px);
  }
}
/* maikling screen (landscape na phone): walang puso, mas siksik ang title */
@container (max-height: 620px) {
  .content {
    padding: 16px 22px 64px;
  }
  .heart-wrap {
    display: none;
  }
  .title {
    font-size: clamp(20px, 4.4cqi, 30px);
  }
  .script {
    font-size: clamp(36px, 8cqi, 56px);
  }
  .divider-wrap {
    margin-top: 6px;
  }
  .btn-wrap {
    margin-top: 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .word,
  .eyebrow,
  .heart-wrap,
  .divider-wrap,
  .btn-wrap {
    animation-duration: 0.6s;
    animation-delay: 0s;
  }
}
</style>
