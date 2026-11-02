<template>
  <!-- EKSENA ng Monthsary 03 Sweet Treat Counter (nasa loob ng SurpriseShell screen):
       1) scoop: i-tap ang mga tub para magtayo ng ice cream cone
       2) boba: pumutok ng boba pearls at hanapin ang tatlong gintong pearl na may pangako
       3) pie: i-swipe ang kutsilyo sa pie; bawat hiwa ay may litrato
       4) candle: sindihan ang kandila gamit ang posporo, mag-wish, tapos hipan sa pamamagitan ng swipe
       5) fortune: hilahin ang fortune cookie → lalabas ang mahabang sulat
       6) stamp: i-stamp ang loyalty card; bawat stamp ay litrato → mensahe sa dulo -->
  <div ref="sceneEl" class="scene-root" @pointermove="onPointerMove" @pointerleave="pointerActive = false">
    <SweetBackdrop :mood="mood" />

    <ol class="steps" aria-hidden="true">
      <li v-for="(name, i) in phases" :key="name" :class="{ on: i <= phaseIndex }" />
    </ol>

    <div :key="runKey" class="stages">
      <Transition name="stage">
        <ScoopStack v-if="phase === 'scoop'" :flavors="flavors" @scooped="burstAt($event, 26)" @finished="onScooped" @done="go('boba')" />
      </Transition>
      <Transition name="stage">
        <BobaPop
          v-if="phase === 'boba'"
          :promises="promises"
          @popped="burstAt($event, 8)"
          @found="burstAt($event, 36)"
          @finished="onBoba"
          @done="go('pie')"
        />
      </Transition>
      <Transition name="stage">
        <PieSlice v-if="phase === 'pie'" :photos="photos" :captions="captions" @sliced="burstAt($event, 20)" @finished="onPie" @done="go('candle')" />
      </Transition>
      <Transition name="stage">
        <CandleWish
          v-if="phase === 'candle'"
          :count="candleCount"
          :month-count="monthCount"
          @lit="burstAt($event, 12)"
          @out="burstAt($event, 12)"
          @finished="onWish"
          @done="go('fortune')"
        />
      </Transition>
      <Transition name="stage">
        <FortuneCookie
          v-if="phase === 'fortune'"
          :recipient="recipient"
          :sender="sender"
          :letter="letter"
          :month-count="monthCount"
          :photo="photos[1] || photos[0] || ''"
          @cracked="onCracked"
          @done="go('stamp')"
        />
      </Transition>
      <Transition name="stage">
        <StampCard
          v-if="phase === 'stamp'"
          :recipient="recipient"
          :sender="sender"
          :message="message"
          :month-count="monthCount"
          :photos="photos"
          :captions="captions"
          @stamped="burstAt($event, 24)"
          @finished="onFinished"
          @replay="replay"
        />
      </Transition>
    </div>

    <SweetFx ref="fxRef" :reduced="reduced" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import SweetBackdrop from "./SweetBackdrop.vue";
import SweetFx from "./SweetFx.vue";
import ScoopStack from "./ScoopStack.vue";
import BobaPop from "./BobaPop.vue";
import PieSlice from "./PieSlice.vue";
import CandleWish from "./CandleWish.vue";
import FortuneCookie from "./FortuneCookie.vue";
import StampCard from "./StampCard.vue";

// content = recipient, sender, monthCount, flavors (3), promises (3), letter, message,
//           photos (5–10 na URL; kung may lumang `photo` lang, ito ang gagamitin), captions (opsyonal)
const props = defineProps({
  content: { type: Object, required: true },
});

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DEFAULT_FLAVORS = ["Sweet like your laugh.", "Warm like your hugs.", "Never enough of you."];
const DEFAULT_PROMISES = [
  "I will always save the last bite for you.",
  "I will keep making you smile.",
  "I will love you a little sweeter every month.",
];

const clean = (list) => (Array.isArray(list) ? list.map((x) => String(x || "").trim()).filter(Boolean) : []);
// laging eksaktong 3, kapag kulang ay pinupunan ng default
const three = (list, defaults) => [0, 1, 2].map((i) => list[i] || defaults[i]);

const recipient = computed(() => props.content.recipient || "Love");
const sender = computed(() => props.content.sender || "Me");
const monthCount = computed(() => Math.max(1, Math.min(999, Math.round(Number(props.content.monthCount) || 1))));
const candleCount = computed(() => Math.min(6, monthCount.value));
const flavors = computed(() => three(clean(props.content.flavors), DEFAULT_FLAVORS));
const promises = computed(() => three(clean(props.content.promises), DEFAULT_PROMISES));
const letter = computed(() => props.content.letter || "Thank you for every sweet month with you. I love you.");
const message = computed(() => props.content.message || "Happy monthsary, my love.");
const captions = computed(() => (Array.isArray(props.content.captions) ? props.content.captions : []));

// iisang listahan ng litrato para sa lahat ng bahagi (hanggang 10)
const photos = computed(() => {
  const list = Array.isArray(props.content.photos) ? props.content.photos.filter(Boolean) : [];
  if (!list.length && props.content.photo) list.push(props.content.photo);
  return list.slice(0, 10);
});

const sceneEl = ref(null);
const fxRef = ref(null);

const phases = ["scoop", "boba", "pie", "candle", "fortune", "stamp"];
const MOODS = { scoop: "peach", boba: "cream", pie: "coral", candle: "dusk", fortune: "gold", stamp: "peach" };
const phase = ref("scoop");
const phaseIndex = computed(() => phases.indexOf(phase.value));
const mood = computed(() => MOODS[phase.value]);
const runKey = ref(0);

function go(next) {
  phase.value = next;
}

/* posisyon sa loob ng eksena (para sa canvas ng confetti).
   Hinahati sa scale kasi pinaliliit ng SurpriseShell ang device preview. */
function localPoint(clientX, clientY) {
  const scene = sceneEl.value.getBoundingClientRect();
  const scale = scene.width / sceneEl.value.offsetWidth || 1;
  return { x: (clientX - scene.left) / scale, y: (clientY - scene.top) / scale };
}

// target ay element, o kaya ay { x, y } na posisyon ng pointer sa screen
function burstAt(target, count) {
  if (!target) return;
  let p;
  if (typeof target.getBoundingClientRect === "function") {
    const rect = target.getBoundingClientRect();
    p = localPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  } else {
    p = localPoint(target.x, target.y);
  }
  fxRef.value?.burst(p.x, p.y, { count, speed: 210 });
}

function onScooped(el) {
  burstAt(el, 80);
  fxRef.value?.rain(2);
}
function onBoba(el) {
  burstAt(el, 80);
  fxRef.value?.rain(2);
}
function onPie(el) {
  burstAt(el, 90);
  fxRef.value?.rain(2);
}
function onWish(el) {
  burstAt(el, 100);
  fxRef.value?.rain(3);
}
function onCracked(el) {
  burstAt(el, 90);
  fxRef.value?.rain(3);
}
function onFinished(el) {
  burstAt(el, 100);
  fxRef.value?.rain(5);
}

function replay() {
  fxRef.value?.reset();
  phase.value = "scoop";
  runKey.value += 1;
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
  const tx = reduced ? 0 : pointerActive ? pointerTarget.x : Math.sin(t * 0.12) * 0.35;
  const ty = reduced ? 0 : pointerActive ? pointerTarget.y * 0.7 : Math.cos(t * 0.1) * 0.2;
  const k = Math.min(1, dt * 1.8);
  parallax.x += (tx - parallax.x) * k;
  parallax.y += (ty - parallax.y) * k;
  sceneEl.value?.style.setProperty("--px", parallax.x.toFixed(3));
  sceneEl.value?.style.setProperty("--py", parallax.y.toFixed(3));
  parallaxFrame = requestAnimationFrame(parallaxTick);
}

onMounted(() => {
  parallaxFrame = requestAnimationFrame(parallaxTick);
});
onBeforeUnmount(() => cancelAnimationFrame(parallaxFrame));
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Caveat:wght@500;600;700&family=Pacifico&display=swap");

.scene-root {
  --ink: #5a2a1f;
  --brown: #8a4b2a;
  --cream: #fff4e0;
  --accent: #ff6b4a;
  --accent2: #ff9a3c;
  --pink: #ff8fa3;
  --mint: #6fcfb8;
  --font-head: "Fredoka", "Trebuchet MS", system-ui, sans-serif;
  --font-body: "Nunito", "Segoe UI", system-ui, sans-serif;
  --font-hand: "Caveat", "Segoe Print", "Comic Sans MS", cursive;
  --font-script: "Pacifico", "Brush Script MT", cursive;
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background: #ffd1a6;
  color: var(--ink);
}
.stages {
  position: absolute;
  z-index: 10;
  inset: 0;
}

/* maliliit na tuldok sa ilalim ng toldo: nasaang hakbang na (6 lahat) */
.steps {
  position: absolute;
  z-index: 15;
  top: 46px;
  left: 50%;
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
  transform: translateX(-50%);
}
.steps li {
  width: 7px;
  height: 7px;
  border: 1.5px solid var(--accent);
  border-radius: 50%;
  background: rgb(255 244 224 / 0.75);
  transition: background 0.6s ease, transform 0.6s ease;
}
.steps li.on {
  background: var(--accent);
  transform: scale(1.2);
}

/* paglipat ng bawat eksena */
.stage-enter-active,
.stage-leave-active {
  transition: opacity 1s ease, filter 1s ease;
}
.stage-enter-from,
.stage-leave-to {
  opacity: 0;
  filter: blur(8px);
}
</style>
