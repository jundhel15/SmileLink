<template>
  <!-- EKSENA ng Monthsary 02 Our Little Journey (nasa loob ng SurpriseShell screen):
       1) globe: i-flick ang globo hanggang makaikot ng isang buo
       2) pins: i-drag ang mga pin sa mapa; bawat tama ay may litrato at sandali
       3) match: hanapin ang magkaparehang card ng litrato at sticker
       4) lantern: hanapin sa dilim ang mga nakatagong pangako gamit ang parol
       5) sunrise: hilahin pataas ang araw → lalabas ang mahabang sulat
       6) toss: i-flick ang lahat ng litrato sa corkboard → mensahe sa dulo -->
  <div ref="sceneEl" class="scene-root" @pointermove="onPointerMove" @pointerleave="pointerActive = false">
    <JourneyBackdrop :mood="mood" />

    <ol class="steps" aria-hidden="true">
      <li v-for="(name, i) in phases" :key="name" :class="{ on: i <= phaseIndex }" />
    </ol>

    <div :key="runKey" class="stages">
      <Transition name="stage">
        <GlobeSpin v-if="phase === 'globe'" :month-count="monthCount" :since-date="sinceDate" @spun="onSpun" @done="go('pins')" />
      </Transition>
      <Transition name="stage">
        <PinMap
          v-if="phase === 'pins'"
          :milestones="milestones"
          :photos="photos"
          :captions="captions"
          @placed="burstAt($event, 28)"
          @finished="burstAt($event, 70)"
          @done="go('match')"
        />
      </Transition>
      <Transition name="stage">
        <MemoryMatch
          v-if="phase === 'match'"
          :photos="photos"
          :captions="captions"
          @matched="burstAt($event, 30)"
          @finished="onMatched"
          @done="go('lantern')"
        />
      </Transition>
      <Transition name="stage">
        <LanternDark
          v-if="phase === 'lantern'"
          :promises="promises"
          @found="burstAt($event, 26)"
          @finished="burstAt($event, 60)"
          @done="go('sunrise')"
        />
      </Transition>
      <Transition name="stage">
        <SunRise
          v-if="phase === 'sunrise'"
          :recipient="recipient"
          :sender="sender"
          :letter="letter"
          :month-count="monthCount"
          :photo="photos[0] || ''"
          @risen="onRisen"
          @done="go('toss')"
        />
      </Transition>
      <Transition name="stage">
        <TossBoard
          v-if="phase === 'toss'"
          :recipient="recipient"
          :sender="sender"
          :message="message"
          :month-count="monthCount"
          :photos="photos"
          :captions="captions"
          @tossed="burstAt($event, 26)"
          @finished="onFinished"
          @replay="replay"
        />
      </Transition>
    </div>

    <JourneyFx ref="fxRef" :reduced="reduced" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import JourneyBackdrop from "./JourneyBackdrop.vue";
import JourneyFx from "./JourneyFx.vue";
import GlobeSpin from "./GlobeSpin.vue";
import PinMap from "./PinMap.vue";
import MemoryMatch from "./MemoryMatch.vue";
import LanternDark from "./LanternDark.vue";
import SunRise from "./SunRise.vue";
import TossBoard from "./TossBoard.vue";

// content = recipient, sender, monthCount, sinceDate, milestones (3–6), promises (3), letter, message,
//           photos (5–10 na URL; kung may lumang `photo` lang, ito ang gagamitin), captions (opsyonal)
const props = defineProps({
  content: { type: Object, required: true },
});

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DEFAULT_MILESTONES = [
  "The day we met.",
  "Our first real laugh together.",
  "The day we became us.",
  "Our favorite little adventure.",
  "Today, still choosing you.",
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
const milestones = computed(() => {
  const list = clean(props.content.milestones).slice(0, 6);
  return list.length ? list : DEFAULT_MILESTONES;
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

const phases = ["globe", "pins", "match", "lantern", "sunrise", "toss"];
const MOODS = { globe: "day", pins: "map", match: "warm", lantern: "night", sunrise: "night", toss: "kraft" };
const phase = ref("globe");
const phaseIndex = computed(() => phases.indexOf(phase.value));
const mood = computed(() => MOODS[phase.value]);
const runKey = ref(0);

function go(next) {
  phase.value = next;
}

/* gitna ng isang element, relative sa loob ng eksena (para sa canvas ng confetti).
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
  fxRef.value?.burst(x, y, { count, speed: 210 });
}

function onSpun(el) {
  burstAt(el, 70);
  fxRef.value?.rain(2);
}
function onMatched(el) {
  burstAt(el, 80);
  fxRef.value?.rain(2);
}
function onRisen(el) {
  burstAt(el, 90);
  fxRef.value?.rain(3);
}
function onFinished(el) {
  burstAt(el, 100);
  fxRef.value?.rain(5);
}

function replay() {
  fxRef.value?.reset();
  phase.value = "globe";
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
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Caveat:wght@500;600;700&family=Special+Elite&display=swap");

.scene-root {
  --ink: #4a2f1c;
  --brown: #7a4b2a;
  --paper: #fff7e6;
  --accent: #e0704f;
  --font-head: "Fredoka", "Trebuchet MS", system-ui, sans-serif;
  --font-body: "Nunito", "Segoe UI", system-ui, sans-serif;
  --font-hand: "Caveat", "Segoe Print", "Comic Sans MS", cursive;
  --font-type: "Special Elite", "Courier New", monospace;
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background: #ecd3a4;
  color: var(--ink);
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
  border: 1.5px solid var(--accent);
  border-radius: 50%;
  background: rgb(255 247 230 / 0.7);
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