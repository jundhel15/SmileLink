<template>
  <!-- EKSENA ng Monthsary 01 Love Letter Mailbox (nasa loob ng SurpriseShell screen):
       1) catch: i-tap ang mga lumulutang na sulat para saluhin → dahilan at litrato
       2) trace: gumuhit ng puso gamit ang daliri para masindihan ang mga bituin
       3) crank: paikutin ang music box para mabuklat ang mahabang sulat
       4) scratch: kaskasin ang foil ng ticket → tatlong pangako
       5) line: hilahin ang sampayan para "ma-develop" ang lahat ng litrato
       6) finale: mag-tap sa langit para magpaputok → huling gallery at mensahe -->
  <div ref="sceneEl" class="scene-root" @pointermove="onPointerMove" @pointerleave="pointerActive = false">
    <LoveBackdrop :mood="mood" />

    <ol class="steps" aria-hidden="true">
      <li v-for="(name, i) in phases" :key="name" :class="{ on: i <= phaseIndex }" />
    </ol>

    <div :key="runKey" class="stages">
      <Transition name="stage">
        <LetterCatch
          v-if="phase === 'catch'"
          :sender="sender"
          :reasons="reasons"
          :photos="photos"
          :captions="captions"
          @caught="burstAt($event, 26)"
          @finished="burstAt($event, 60)"
          @done="go('trace')"
        />
      </Transition>
      <Transition name="stage">
        <HeartTrace
          v-if="phase === 'trace'"
          :recipient="recipient"
          :sender="sender"
          :month-count="monthCount"
          :since-date="sinceDate"
          @completed="onTraced"
          @done="go('crank')"
        />
      </Transition>
      <Transition name="stage">
        <MusicCrank
          v-if="phase === 'crank'"
          :recipient="recipient"
          :sender="sender"
          :letter="letter"
          :month-count="monthCount"
          :photo="photos[0] || ''"
          @unrolled="onUnrolled"
          @done="go('scratch')"
        />
      </Transition>
      <Transition name="stage">
        <ScratchTicket
          v-if="phase === 'scratch'"
          :promises="promises"
          :month-count="monthCount"
          :since-date="sinceDate"
          @revealed="burstAt($event, 24)"
          @finished="onScratched"
          @done="go('line')"
        />
      </Transition>
      <Transition name="stage">
        <PhotoLine
          v-if="phase === 'line'"
          :photos="photos"
          :captions="captions"
          @finished="burstAt($event, 60)"
          @done="go('finale')"
        />
      </Transition>
      <Transition name="stage">
        <FireworkFinale
          v-if="phase === 'finale'"
          :recipient="recipient"
          :sender="sender"
          :message="message"
          :month-count="monthCount"
          :photos="photos"
          :captions="captions"
          @fire="fireAt"
          @finale="onFinale"
          @replay="replay"
        />
      </Transition>
    </div>

    <HeartFx ref="fxRef" :reduced="reduced" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import LoveBackdrop from "./LoveBackdrop.vue";
import HeartFx from "./HeartFx.vue";
import LetterCatch from "./LetterCatch.vue";
import HeartTrace from "./HeartTrace.vue";
import MusicCrank from "./MusicCrank.vue";
import ScratchTicket from "./ScratchTicket.vue";
import PhotoLine from "./PhotoLine.vue";
import FireworkFinale from "./FireworkFinale.vue";

// content = recipient, sender, monthCount, sinceDate, reasons (5), promises (3), letter, message,
//           photos (5–10 na URL; kung may lumang `photo` lang, ito ang gagamitin), captions (opsyonal)
const props = defineProps({
  content: { type: Object, required: true },
});

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DEFAULT_REASONS = [
  "You make ordinary days feel special.",
  "Your laugh is my favorite sound.",
  "You stay, even on the hard days.",
  "You make me want to be better.",
  "Home is wherever you are.",
];
const DEFAULT_PROMISES = [
  "I will always choose you.",
  "I will keep making you laugh.",
  "I will love you a little more every month.",
];

const clean = (list) => (Array.isArray(list) ? list.map((x) => String(x || "").trim()).filter(Boolean) : []);

const recipient = computed(() => props.content.recipient || "Love");
const sender = computed(() => props.content.sender || "Me");
const monthCount = computed(() => Math.max(1, Math.min(999, Math.round(Number(props.content.monthCount) || 1))));
const sinceDate = computed(() => String(props.content.sinceDate || ""));
const reasons = computed(() => {
  const list = clean(props.content.reasons).slice(0, 6);
  return list.length ? list : DEFAULT_REASONS;
});
const promises = computed(() => {
  const list = clean(props.content.promises).slice(0, 3);
  return list.length ? list : DEFAULT_PROMISES;
});
const letter = computed(() => props.content.letter || "Thank you for every month with you. I love you.");
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

const phases = ["catch", "trace", "crank", "scratch", "line", "finale"];
const MOODS = { catch: "rose", trace: "night", crank: "peach", scratch: "lilac", line: "night", finale: "night" };
const phase = ref("catch");
const phaseIndex = computed(() => phases.indexOf(phase.value));
const mood = computed(() => MOODS[phase.value]);
const runKey = ref(0);

function go(next) {
  phase.value = next;
}

/* gitna ng isang element, relative sa loob ng eksena (para sa canvas ng puso at kislap).
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

function burstAt(el, count) {
  if (!el) return;
  const { x, y } = localCenter(el);
  fxRef.value?.burst(x, y, { count, speed: 200 });
}

function onTraced(el) {
  burstAt(el, 90);
  fxRef.value?.rain(3);
}
function onUnrolled(el) {
  burstAt(el, 70);
  fxRef.value?.rain(2);
}
function onScratched(el) {
  burstAt(el, 90);
  fxRef.value?.rain(3);
}
// paputok: ang x,y ay nasa loob na ng eksena
function fireAt({ x, y }) {
  fxRef.value?.burst(x, y, { count: 70, speed: 250 });
}
function onFinale() {
  fxRef.value?.rain(6);
}

function replay() {
  fxRef.value?.reset();
  phase.value = "catch";
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
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Dancing+Script:wght@600;700&family=Caveat:wght@500;600;700&display=swap");

.scene-root {
  --font-head: "Fredoka", "Trebuchet MS", system-ui, sans-serif;
  --font-body: "Nunito", "Segoe UI", system-ui, sans-serif;
  --font-script: "Dancing Script", "Segoe Script", cursive;
  --font-hand: "Caveat", "Segoe Print", "Comic Sans MS", cursive;
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background: #ffc2d4;
  color: #7a2b45;
}
.stages {
  position: absolute;
  z-index: 10;
  inset: 0;
}

/* maliliit na tuldok sa itaas: nasaang hakbang na (6 lahat) */
.steps {
  position: absolute;
  z-index: 15;
  top: 20px;
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
  border: 1.5px solid #e0667f;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.6);
  transition: background 0.6s ease, transform 0.6s ease;
}
.steps li.on {
  background: #e0667f;
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