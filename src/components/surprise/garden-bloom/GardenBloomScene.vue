<template>
  <!-- EKSENA ng 07 Garden Bloom (nasa loob ng SurpriseShell screen):
       1) seed: i-drag ang butil sa lupa, tapos kuskusin ang pandilig → tutubo ang halaman at karatula na may pangalan
       2) dandelion: i-swipe ang dandelion para hipan ang mga buto → mga hiling
       3) butterflies: hulihin ang bawat paru-paro → maiipit sa album ang bawat litrato (3–10)
       4) vine: sundan ang kumikinang na tuldok para palaguin ang baging → bubukas ang gate, lalabas ang sulat
       5) bouquet: i-drag ang mga bulaklak sa balot → ribbon, tapos gallery ng lahat ng litrato at huling mensahe -->
  <div ref="sceneEl" class="scene-root" @pointermove="onPointerMove" @pointerleave="pointerActive = false">
    <MeadowBackdrop :mood="mood" />

    <ol class="steps" aria-hidden="true">
      <li v-for="(name, i) in phases" :key="name" :class="{ on: i <= phaseIndex }" />
    </ol>

    <div :key="runKey" class="stages">
      <Transition name="stage">
        <SeedSprout
          v-if="phase === 'seed'"
          :recipient="content.recipient"
          @planted="burstAt($event, 18)"
          @grown="onGrown"
          @done="go('dandelion')"
        />
      </Transition>
      <Transition name="stage">
        <DandelionWish
          v-if="phase === 'dandelion'"
          :wishes="content.wishes"
          @finished="burstAt($event, 50)"
          @done="go('butterflies')"
        />
      </Transition>
      <Transition name="stage">
        <ButterflyAlbum
          v-if="phase === 'butterflies'"
          :photos="photos"
          :captions="content.captions || []"
          @caught="burstAt($event, 16)"
          @finished="burstAt($event, 60)"
          @done="go('vine')"
        />
      </Transition>
      <Transition name="stage">
        <VineGate
          v-if="phase === 'vine'"
          :recipient="content.recipient"
          :sender="content.sender"
          :letter="content.letter"
          :photo="photos[0] || ''"
          @opened="onOpened"
          @done="go('bouquet')"
        />
      </Transition>
      <Transition name="stage">
        <BouquetFinale
          v-if="phase === 'bouquet'"
          :recipient="content.recipient"
          :sender="content.sender"
          :message="content.message"
          :reasons="content.reasons"
          :photos="photos"
          @placed="burstAt($event, 14)"
          @complete="onComplete"
          @replay="replay"
        />
      </Transition>
    </div>

    <PetalFx ref="fxRef" :reduced="reduced" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import MeadowBackdrop from "./MeadowBackdrop.vue";
import PetalFx from "./PetalFx.vue";
import SeedSprout from "./SeedSprout.vue";
import DandelionWish from "./DandelionWish.vue";
import ButterflyAlbum from "./ButterflyAlbum.vue";
import VineGate from "./VineGate.vue";
import BouquetFinale from "./BouquetFinale.vue";

// content = recipient, sender, wishes (3), reasons (5), letter, message,
//           photos (3–10 na URL; kung may lumang `photo` lang, ito ang gagamitin), captions (opsyonal)
const props = defineProps({
  content: { type: Object, required: true },
});

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// iisang listahan ng litrato para sa lahat ng bahagi (hanggang 10)
const photos = computed(() => {
  const list = Array.isArray(props.content.photos) ? props.content.photos.filter(Boolean) : [];
  if (!list.length && props.content.photo) list.push(props.content.photo);
  return list.slice(0, 10);
});

const sceneEl = ref(null);
const fxRef = ref(null);

const phases = ["seed", "dandelion", "butterflies", "vine", "bouquet"];
const MOODS = { seed: "morning", dandelion: "noon", butterflies: "noon", vine: "golden", bouquet: "dusk" };
const phase = ref("seed");
const phaseIndex = computed(() => phases.indexOf(phase.value));
const mood = computed(() => MOODS[phase.value]);
const runKey = ref(0);

function go(next) {
  phase.value = next;
}

/* gitna ng isang element, relative sa loob ng eksena (para sa canvas ng talulot at kislap).
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

function onGrown(el) {
  burstAt(el, 70);
  fxRef.value?.rain(2);
}
function onOpened(el) {
  burstAt(el, 80);
  fxRef.value?.rain(3);
}
function onComplete(el) {
  burstAt(el, 100);
  fxRef.value?.rain(6);
}

function replay() {
  fxRef.value?.reset();
  phase.value = "seed";
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
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Yellowtail&display=swap");

.scene-root {
  --font-head: "Fredoka", "Trebuchet MS", system-ui, sans-serif;
  --font-body: "Nunito", "Segoe UI", system-ui, sans-serif;
  --font-script: "Yellowtail", "Segoe Script", cursive;
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background: #bfe9ff;
  color: #2f5d3a;
}
.stages {
  position: absolute;
  z-index: 10;
  inset: 0;
}

/* maliliit na tuldok sa itaas: nasaang hakbang na (5 lahat) */
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
  border: 1.5px solid #ff8fab;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.6);
  transition: background 0.6s ease, transform 0.6s ease;
}
.steps li.on {
  background: #ff8fab;
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