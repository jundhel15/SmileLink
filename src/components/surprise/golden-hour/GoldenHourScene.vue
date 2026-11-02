<template>
  <!-- EKSENA ng 03 Golden Hour Scrapbook (nasa loob ng SurpriseShell screen):
       1) scratch card: kaskasin ang gintong foil → "Happy Birthday, {name}"
       2) polaroid: i-hold ang 3 litrato para ma-develop → may caption
       3) balloon pop: pumutok ang mga lobo → bawat isa may dahilan kung bakit mahal siya
       4) friendship bracelet: i-drag sa tali → nasasampa ang mga bead na bumubuo ng salita
       5) sealed letter: basagin ang wax seal → hilahin ang sulat → basahin
       6) cake wish: sindihan ang mga kandila → i-hold para hipan → confetti + litrato + final message -->
  <div ref="sceneEl" class="scene-root" @pointermove="onPointerMove" @pointerleave="pointerActive = false">
    <WarmBackdrop />

    <ol class="steps" aria-hidden="true">
      <li v-for="(name, i) in phases" :key="name" :class="{ on: i <= phaseIndex }" />
    </ol>

    <div :key="runKey" class="stages">
      <Transition name="stage">
        <ScratchReveal
          v-if="phase === 'scratch'"
          :recipient="content.recipient"
          :sender="content.sender"
          @revealed="burstAt($event, 60)"
          @done="go('polaroids')"
        />
      </Transition>
      <Transition name="stage">
        <PolaroidDevelop
          v-if="phase === 'polaroids'"
          :memories="content.memories"
          @developed="burstAt($event, 18)"
          @done="go('balloons')"
        />
      </Transition>
      <Transition name="stage">
        <BalloonPop v-if="phase === 'balloons'" :reasons="content.reasons" @popped="burstAt($event, 22)" @done="go('beads')" />
      </Transition>
      <Transition name="stage">
        <BeadThread
          v-if="phase === 'beads'"
          :word="content.beadWord"
          :note="content.beadNote"
          @threaded="burstAt($event, 50)"
          @done="go('letter')"
        />
      </Transition>
      <Transition name="stage">
        <SealedLetter
          v-if="phase === 'letter'"
          :recipient="content.recipient"
          :sender="content.sender"
          :text="content.letter"
          @opened="burstAt($event, 36)"
          @done="go('cake')"
        />
      </Transition>
      <Transition name="stage">
        <CakeWish
          v-if="phase === 'cake'"
          :recipient="content.recipient"
          :sender="content.sender"
          :message="content.message"
          :photo="content.photo"
          @blown="onBlown"
          @replay="replay"
        />
      </Transition>
    </div>

    <ConfettiCanvas ref="confettiRef" :reduced="reduced" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import WarmBackdrop from "./WarmBackdrop.vue";
import ConfettiCanvas from "./ConfettiCanvas.vue";
import ScratchReveal from "./ScratchReveal.vue";
import PolaroidDevelop from "./PolaroidDevelop.vue";
import BalloonPop from "./BalloonPop.vue";
import BeadThread from "./BeadThread.vue";
import SealedLetter from "./SealedLetter.vue";
import CakeWish from "./CakeWish.vue";

// content = recipient, sender, memories (3), reasons (5), beadWord, beadNote, letter, message, photo
defineProps({
  content: { type: Object, required: true },
});

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sceneEl = ref(null);
const confettiRef = ref(null);

const phases = ["scratch", "polaroids", "balloons", "beads", "letter", "cake"];
const phase = ref("scratch");
const phaseIndex = computed(() => phases.indexOf(phase.value));
const runKey = ref(0);

function go(next) {
  phase.value = next;
}

/* gitna ng isang element, relative sa loob ng eksena (para sa confetti canvas).
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
  confettiRef.value?.burst(x, y, { count, speed: 280 });
}

function onBlown(el) {
  burstAt(el, 90);
  confettiRef.value?.rain(3.2);
}

function replay() {
  confettiRef.value?.reset();
  phase.value = "scratch";
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
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Fraunces:wght@400;600&display=swap");

.scene-root {
  --font-serif: "Fraunces", Georgia, "Times New Roman", serif;
  --font-hand: "Caveat", "Segoe Print", "Comic Sans MS", cursive;
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background: #ffc2a1;
  color: #4a2340;
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
  top: 14px;
  left: 50%;
  display: flex;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
  transform: translateX(-50%);
}
.steps li {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgb(74 35 64 / 0.22);
  transition: background 0.6s ease, transform 0.6s ease;
}
.steps li.on {
  background: #d9574c;
  transform: scale(1.25);
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