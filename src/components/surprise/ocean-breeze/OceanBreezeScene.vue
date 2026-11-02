<template>
  <!-- EKSENA ng 06 Ocean Breeze (nasa loob ng SurpriseShell screen):
       1) sand: gumuhit sa buhangin → darating ang alon at lilitaw ang pangalan
       2) dive: mag-swipe pababa para sumisid → mga alaala kasama ng litrato, perlas sa ilalim
       3) boats: i-drag ang mga bangkang papel papunta sa dagat → mga hiling
       4) bottle: hilahin ang bote sa pampang at bunutin ang tapon → sulat
       5) lighthouse: ikutin ang sinag ng parola → mga nakatagong litrato at salita sa dilim
       6) lantern: i-swipe pataas ang parol → lilipad ang mga parol at lalabas ang gallery ng lahat ng litrato -->
  <div ref="sceneEl" class="scene-root" @pointermove="onPointerMove" @pointerleave="pointerActive = false">
    <OceanBackdrop :mood="mood" />

    <ol class="steps" aria-hidden="true">
      <li v-for="(name, i) in phases" :key="name" :class="{ on: i <= phaseIndex }" />
    </ol>

    <div :key="runKey" class="stages">
      <Transition name="stage">
        <SandWash
          v-if="phase === 'sand'"
          :recipient="content.recipient"
          :sender="content.sender"
          @washed="burstAt($event, 70)"
          @done="go('dive')"
        />
      </Transition>
      <Transition name="stage">
        <DeepDive
          v-if="phase === 'dive'"
          :memories="content.memories"
          :photos="photos"
          @stop="burstAt($event, 16)"
          @finished="burstAt($event, 60)"
          @done="go('boats')"
        />
      </Transition>
      <Transition name="stage">
        <PaperBoats
          v-if="phase === 'boats'"
          :wishes="content.wishes"
          :photos="photos"
          @sailed="burstAt($event, 18)"
          @done="go('bottle')"
        />
      </Transition>
      <Transition name="stage">
        <MessageBottle
          v-if="phase === 'bottle'"
          :recipient="content.recipient"
          :sender="content.sender"
          :text="content.letter"
          :photo="photos[photos.length - 1] || ''"
          @tap="burstAt($event, 10)"
          @caught="burstAt($event, 30)"
          @opened="burstAt($event, 70)"
          @done="go('lighthouse')"
        />
      </Transition>
      <Transition name="stage">
        <LighthouseBeam
          v-if="phase === 'lighthouse'"
          :words="content.words"
          :photos="photos"
          @found="burstAt($event, 14)"
          @finished="burstAt($event, 70)"
          @done="go('lantern')"
        />
      </Transition>
      <Transition name="stage">
        <LanternRelease
          v-if="phase === 'lantern'"
          :recipient="content.recipient"
          :sender="content.sender"
          :message="content.message"
          :photos="photos"
          @released="onReleased"
          @replay="replay"
        />
      </Transition>
    </div>

    <OceanFx ref="fxRef" :reduced="reduced" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import OceanBackdrop from "./OceanBackdrop.vue";
import OceanFx from "./OceanFx.vue";
import SandWash from "./SandWash.vue";
import DeepDive from "./DeepDive.vue";
import PaperBoats from "./PaperBoats.vue";
import MessageBottle from "./MessageBottle.vue";
import LighthouseBeam from "./LighthouseBeam.vue";
import LanternRelease from "./LanternRelease.vue";

// content = recipient, sender, memories (3: { title, text }), wishes (3), words (4), letter, message,
//           photos (3–10 na URL; kung may lumang `photo` lang, ito ang gagamitin)
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

const phases = ["sand", "dive", "boats", "bottle", "lighthouse", "lantern"];
const MOODS = { sand: "day", dive: "deep", boats: "dusk", bottle: "dusk", lighthouse: "night", lantern: "night" };
const phase = ref("sand");
const phaseIndex = computed(() => phases.indexOf(phase.value));
const mood = computed(() => MOODS[phase.value]);
const runKey = ref(0);

function go(next) {
  phase.value = next;
}

/* gitna ng isang element, relative sa loob ng eksena (para sa canvas ng bula at kislap).
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

function onReleased(el) {
  burstAt(el, 90);
  fxRef.value?.lanterns(8);
}

function replay() {
  fxRef.value?.reset();
  phase.value = "sand";
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
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,500;1,600&family=Quicksand:wght@400;500;600;700&display=swap");

.scene-root {
  --font-head: "Playfair Display", Georgia, "Times New Roman", serif;
  --font-body: "Quicksand", "Segoe UI", system-ui, sans-serif;
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background: #0a2d4a;
  color: #fff;
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
  width: 6px;
  height: 6px;
  border: 1px solid rgb(255 255 255 / 0.9);
  border-radius: 50%;
  background: transparent;
  transition: background 0.6s ease, transform 0.6s ease;
}
.steps li.on {
  background: #fff;
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