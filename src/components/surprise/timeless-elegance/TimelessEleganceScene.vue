<template>
  <!-- EKSENA ng 05 Timeless Elegance (para sa magkasintahan; nasa loob ng SurpriseShell screen):
       1) curtains: hilahin pahalang ang olive-green na kurtina → lilitaw ang pangalan
       2) bloom garden: i-tap ang 5 usbong sa vase → mamumukadkad, may bagay na hinahangaan sa kanya
       3) memory lights: i-tap ang mga ilaw → sisindi, lilinaw ang polaroid + mahalagang sandali ninyo
       4) cheers: i-drag ang dalawang champagne glass papunta sa gitna → clink + pangalan nilang dalawa
       5) ink letter: i-hold ang PLUMA (hindi ang papel) → isinusulat ang love letter
       6) gift key: i-drag ang gintong susi sa kandado → bubukas ang regalo, lilipad ang mga litrato + final message
       Litrato (5-10): sa gitna ng mga bulaklak (1-5), sa memory lights (6-9), sa sulat (10), at lahat sa regalo -->
  <div ref="sceneEl" class="scene-root" @pointermove="onPointerMove" @pointerleave="pointerActive = false">
    <ElegantBackdrop />

    <ol class="steps" aria-hidden="true">
      <li v-for="(name, i) in phases" :key="name" :class="{ on: i <= phaseIndex }" />
    </ol>

    <div :key="runKey" class="stages">
      <Transition name="stage">
        <CurtainReveal
          v-if="phase === 'curtains'"
          :recipient="content.recipient"
          :sender="content.sender"
          @opened="burstAt($event, 60)"
          @done="go('garden')"
        />
      </Transition>
      <Transition name="stage">
        <BloomGarden
          v-if="phase === 'garden'"
          :blooms="content.blooms"
          :photos="photos"
          @bloomed="burstAt($event, 22)"
          @done="go('lights')"
        />
      </Transition>
      <Transition name="stage">
        <MemoryLights
          v-if="phase === 'lights'"
          :milestones="content.milestones"
          :photos="lightPhotos"
          @milestone="burstAt($event, 18)"
          @finished="burstAt($event, 60)"
          @done="go('toast')"
        />
      </Transition>
      <Transition name="stage">
        <CheersToast
          v-if="phase === 'toast'"
          :recipient="content.recipient"
          :sender="content.sender"
          :together="content.together"
          @linked="onLinked"
          @done="go('letter')"
        />
      </Transition>
      <Transition name="stage">
        <InkLetter
          v-if="phase === 'letter'"
          :recipient="content.recipient"
          :sender="content.sender"
          :text="content.letter"
          :photo="letterPhoto"
          @written="burstAt($event, 36)"
          @done="go('gift')"
        />
      </Transition>
      <Transition name="stage">
        <GiftKey
          v-if="phase === 'gift'"
          :recipient="content.recipient"
          :sender="content.sender"
          :message="content.message"
          :photos="photos"
          @opened="onOpened"
          @replay="replay"
        />
      </Transition>
    </div>

    <GoldDust ref="dustRef" :reduced="reduced" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import ElegantBackdrop from "./ElegantBackdrop.vue";
import GoldDust from "./GoldDust.vue";
import CurtainReveal from "./CurtainReveal.vue";
import BloomGarden from "./BloomGarden.vue";
import MemoryLights from "./MemoryLights.vue";
import CheersToast from "./CheersToast.vue";
import InkLetter from "./InkLetter.vue";
import GiftKey from "./GiftKey.vue";

// content = recipient, sender, blooms (5), milestones (4: { date, label, text }),
//           together, letter, message,
//           photos (5-10 litrato: URL o { src }), photo (luma, 1 litrato; gumagana pa rin kung wala ang photos)
const props = defineProps({
  content: { type: Object, required: true },
});

/* lahat ng litrato bilang listahan ng URL (hanggang 10); inuulit sa mga eksena kapag kulang */
const photos = computed(() => {
  const raw = Array.isArray(props.content.photos) && props.content.photos.length ? props.content.photos : [props.content.photo];
  return raw
    .map((p) => (typeof p === "string" ? p : p?.src))
    .filter(Boolean)
    .slice(0, 10);
});
const pickPhoto = (k) => (photos.value.length ? photos.value[k % photos.value.length] : "");
const lightPhotos = computed(() => Array.from({ length: 4 }, (_, i) => pickPhoto(5 + i)));
const letterPhoto = computed(() => pickPhoto(9));

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sceneEl = ref(null);
const dustRef = ref(null);

const phases = ["curtains", "garden", "lights", "toast", "letter", "gift"];
const phase = ref("curtains");
const phaseIndex = computed(() => phases.indexOf(phase.value));
const runKey = ref(0);

function go(next) {
  phase.value = next;
}

/* gitna ng isang element, relative sa loob ng eksena (para sa canvas ng gintong alikabok).
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
  dustRef.value?.burst(x, y, { count, speed: 210 });
}

function onLinked(el) {
  burstAt(el, 80);
  dustRef.value?.petals(2.6);
}

function onOpened(el) {
  burstAt(el, 100);
  dustRef.value?.petals(5);
}

function replay() {
  dustRef.value?.reset();
  phase.value = "curtains";
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
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Pinyon+Script&display=swap");

.scene-root {
  --font-serif: "Cormorant Garamond", Georgia, "Times New Roman", serif;
  --font-script: "Pinyon Script", "Great Vibes", "Segoe Script", cursive;
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background: #f6eddc;
  color: #3f3a2e;
}
.stages {
  position: absolute;
  z-index: 10;
  inset: 0;
}

/* maliliit na gintong tuldok sa itaas: nasaang hakbang na (6 lahat) */
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
  border: 1px solid #b8914f;
  border-radius: 50%;
  background: transparent;
  transition: background 0.6s ease, transform 0.6s ease;
}
.steps li.on {
  background: #b8914f;
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