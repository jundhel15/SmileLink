<template>
  <!-- EKSENA ng 03 Memory Lane (nasa loob ng SurpriseShell screen):
       1) matrix rain + "Hold to decode" → nabubuo ang HAPPY BIRTHDAY <NAME>
       2) memory lane timeline (i-decrypt ang bawat memory)
       3) terminal letter → "Send a hug" → umuulan ng puso → finale -->
  <div :key="runKey" class="ml-root">
    <MatrixRain
      :glyphs="glyphs"
      :message="messageLines"
      :decoding="holding && phase === 'rain'"
      :show-message="phase === 'rain' || phase === 'decoded'"
      :dim="phase === 'lane' || phase === 'letter'"
      :hearts="phase === 'finale'"
      :reduced="reduced"
      @progress="progress = $event"
      @decoded="onDecoded"
    />

    <!-- walang mode="out-in": naiipit ito kapag component ang umaalis (hindi lumalabas ang kasunod).
         Lahat ng eksena ay position: absolute kaya maayos ang sabay na crossfade. -->
    <Transition name="fade">
      <!-- 1. MATRIX RAIN -->
      <div v-if="phase === 'rain'" key="rain" class="overlay-ui">
        <div class="boot" aria-hidden="true">
          <p style="--d: 0.3s">&gt; memory_lane.exe</p>
          <p style="--d: 1.1s">&gt; 1 encrypted message for {{ upperName }}</p>
          <p style="--d: 1.9s">&gt; awaiting your touch<span class="cursor">▍</span></p>
        </div>
        <div class="hold-area">
          <button
            class="hold-button"
            :class="{ holding }"
            type="button"
            :style="{ '--p': progress }"
            :aria-label="`Hold to decode the message, ${Math.round(progress * 100)} percent`"
            @pointerdown="startHold"
            @pointerup="stopHold"
            @pointercancel="stopHold"
            @lostpointercapture="stopHold"
            @keydown.space.prevent="startHold"
            @keydown.enter.prevent="startHold"
            @keyup.space="stopHold"
            @keyup.enter="stopHold"
            @contextmenu.prevent
          >
            <svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle class="ring-track" cx="50" cy="50" r="45" />
              <circle class="ring-fill" cx="50" cy="50" r="45" pathLength="1" />
            </svg>
            <span class="hold-label">{{ progress > 0 ? `${Math.round(progress * 100)}%` : "♥" }}</span>
          </button>
          <p class="hint">{{ progress > 0 ? "Keep holding..." : "Press & hold to decode" }}</p>
        </div>
      </div>

      <!-- pagkatapos ma-decode -->
      <div v-else-if="phase === 'decoded'" key="decoded" class="overlay-ui decoded-ui">
        <div />
        <div class="hold-area">
          <p class="hint">Message decrypted ♥</p>
          <button class="cta" type="button" @click="phase = 'lane'">
            Rewind the memories <span aria-hidden="true">⟲</span>
          </button>
        </div>
      </div>

      <!-- 2. MEMORY LANE -->
      <MemoryTimeline v-else-if="phase === 'lane'" key="lane" :memories="content.memories" @done="phase = 'letter'" />

      <!-- 3. TERMINAL LETTER -->
      <TerminalLetter
        v-else-if="phase === 'letter'"
        key="letter"
        :recipient="content.recipient"
        :sender="content.sender"
        :message="content.message"
        :reduced="reduced"
        @hug="phase = 'finale'"
      />

      <!-- FINALE -->
      <section v-else key="finale" class="finale">
        <p class="finale-eyebrow">Happy birthday,</p>
        <h2>{{ content.recipient }}</h2>
        <p class="finale-line">{{ content.finaleLine }}</p>
        <p class="finale-from">— {{ content.sender }} ♥</p>
        <button class="replay" type="button" @click="replay">↻ Replay</button>
      </section>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import MatrixRain from "./MatrixRain.vue";
import MemoryTimeline from "./MemoryTimeline.vue";
import TerminalLetter from "./TerminalLetter.vue";

// content = recipient, sender, date, memories [{ year, title, caption, src }], message, finaleLine
const props = defineProps({
  content: { type: Object, required: true },
});

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const upperName = computed(() => props.content.recipient.toUpperCase());
const messageLines = computed(() => ["HAPPY", "BIRTHDAY", upperName.value]);
// mga letra ng ulan: pangalan nilang dalawa + petsa + ♥ ✦ (kaya iba-iba bawat regalo)
const glyphs = computed(() =>
  `${props.content.recipient}${props.content.sender}${props.content.date}♥✦♥✦`.toUpperCase(),
);

const phase = ref("rain"); // rain → decoded → lane → letter → finale
const holding = ref(false);
const progress = ref(0);
const runKey = ref(0);

function startHold(event) {
  if (phase.value !== "rain") return;
  holding.value = true;
  if (event.pointerId !== undefined) event.currentTarget.setPointerCapture?.(event.pointerId);
  navigator.vibrate?.(15);
}
function stopHold() {
  holding.value = false;
}
function onDecoded() {
  holding.value = false;
  navigator.vibrate?.([30, 40, 30]);
  phase.value = "decoded";
}
function replay() {
  phase.value = "rain";
  progress.value = 0;
  holding.value = false;
  runKey.value += 1;
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Fraunces:ital,opsz,wght@1,9..144,500;1,9..144,600&display=swap");

.ml-root {
  --font-mono: "Space Mono", ui-monospace, Menlo, monospace;
  --font-serif: "Fraunces", Georgia, "Times New Roman", serif;
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: rgb(18 10 26);
  color: #fff1e0;
  font-family: var(--sl-font-body, "Nunito", sans-serif);
  user-select: none;
}
.ml-root::after {
  /* vignette + scanlines para sa "lumang screen" na pakiramdam */
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(0deg, rgb(0 0 0 / 0.12) 0 1px, transparent 1px 3px),
    radial-gradient(ellipse at 50% 45%, transparent 50%, rgb(8 4 12 / 0.75) 100%);
}

/* ===== UI sa ibabaw ng ulan ===== */
.overlay-ui {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 22px 54px;
  pointer-events: none;
}
.boot {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
}
.boot p {
  margin: 0 0 4px;
  color: #ffb39b;
  text-shadow: 0 0 8px rgb(236 95 114 / 0.6);
  opacity: 0;
  animation: fade-in 0.5s ease var(--d) forwards;
}
.cursor {
  animation: blink 0.9s steps(1) infinite;
}
.hold-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  pointer-events: auto;
}
.hold-button {
  position: relative;
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(236 95 114 / 0.35), rgb(36 16 40 / 0.9) 70%);
  color: #fff1e0;
  cursor: pointer;
  touch-action: none;
  -webkit-touch-callout: none;
  box-shadow: 0 0 30px rgb(236 95 114 / 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: breathe 2.4s ease-in-out infinite;
}
.hold-button.holding {
  transform: scale(0.94);
  box-shadow: 0 0 50px rgb(236 95 114 / 0.7);
  animation: none;
}
.hold-button:focus-visible {
  outline: 2px solid #ffb39b;
  outline-offset: 4px;
}
.ring {
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
}
.ring-track,
.ring-fill {
  fill: none;
  stroke-width: 4;
}
.ring-track {
  stroke: rgb(255 179 155 / 0.25);
}
.ring-fill {
  stroke: #ec5f72;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: calc(1 - var(--p, 0));
  filter: drop-shadow(0 0 4px #ec5f72);
  transition: stroke-dashoffset 0.2s linear;
}
.hold-label {
  position: relative;
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
}
.hint {
  margin: 0;
  color: rgb(255 241 224 / 0.8);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgb(18 10 26);
}
.cta {
  padding: 14px 28px;
  border: 0;
  border-radius: 999px;
  background: #ec5f72;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 24px rgb(236 95 114 / 0.5);
}

/* ===== Finale (umuulan ng puso sa likod) ===== */
.finale {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px max(24px, calc(50% - 240px));
  text-align: center;
  background: radial-gradient(closest-side, rgb(18 10 26 / 0.75), transparent);
}
.finale-eyebrow {
  margin: 0;
  color: #ffb39b;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.finale h2 {
  margin: 0;
  color: #fff1e0;
  font-family: var(--font-serif);
  font-size: 60px; /* pamalit sa lumang browser na walang cqi */
  font-size: clamp(48px, 15cqi, 96px);
  font-style: italic;
  font-weight: 600;
  line-height: 1;
  text-shadow: 0 0 30px rgb(236 95 114 / 0.7);
  animation: pop 1s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
.finale-line {
  max-width: 340px;
  margin: 8px 0 0;
  font-size: 16px;
  line-height: 1.5;
}
.finale-from {
  margin: 0;
  color: #ffb39b;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
}
.replay {
  margin-top: 18px;
  padding: 10px 24px;
  border: 1px solid rgb(255 179 155 / 0.6);
  border-radius: 999px;
  background: rgb(18 10 26 / 0.6);
  color: #ffb39b;
  font-family: var(--font-mono);
  font-size: 14px;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
@keyframes breathe {
  50% {
    box-shadow: 0 0 46px rgb(236 95 114 / 0.6);
  }
}
@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.7);
    filter: blur(8px);
  }
}
/* maikling screen (landscape): mas siksik */
@container (max-height: 620px) {
  .overlay-ui {
    padding: 20px 22px 22px;
  }
  .hold-button {
    width: 76px;
    height: 76px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hold-button,
  .cursor {
    animation: none;
  }
}
</style>
