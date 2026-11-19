<template>
  <!-- VHS REWIND: lumang video tape. I-drag pakaliwa ang play-head para i-rewind; habang nire-rewind,
       dumadaan ang mga litrato na may VHS glitch. Pagdating sa simula: ▶ PLAY, montage ng LAHAT ng litrato. -->
  <section class="vhs">
    <header class="v-head">
      <p class="eyebrow">tape_01 · {{ frames.length }} memories</p>
      <h2>{{ mode === "play" ? "Now playing: us ♥" : "Rewind the tape" }}</h2>
      <p class="sub">{{ mode === "play" ? "" : "Drag the tape all the way back ◀◀" }}</p>
    </header>

    <div class="tv" :class="[`is-${mode}`, { fast: speed > 0.4 }]">
      <div class="screen">
        <img
          v-if="frame"
          :key="index"
          class="photo"
          :src="frame.src"
          :alt="frame.caption || `Memory ${index + 1}`"
          draggable="false"
        />
        <span class="tracking" aria-hidden="true" :style="{ opacity: mode === 'play' ? 0.15 : 0.35 + speed * 0.6 }" />
        <span class="osd tl" aria-hidden="true">{{ mode === "play" ? "▶ PLAY" : mode === "rew" ? "◀◀ REW" : "■ STOP" }}</span>
        <span class="osd tr" aria-hidden="true">{{ timecode }}</span>
        <span class="osd bl" aria-hidden="true"><i class="rec" /> SP</span>
        <Transition name="cap">
          <p v-if="mode === 'play' && frame?.caption" :key="index" class="caption">{{ frame.caption }}</p>
        </Transition>
      </div>

      <!-- tape bar: i-drag ang play-head pakaliwa -->
      <div
        ref="barEl"
        class="tape"
        role="slider"
        tabindex="0"
        aria-label="Tape position. Drag left or press the left arrow to rewind"
        :aria-valuenow="Math.round(pos * 100)"
        aria-valuemin="0"
        aria-valuemax="100"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
        @keydown.left.prevent="nudge(-0.08)"
        @keydown.right.prevent="nudge(0.08)"
      >
        <span class="reel l" aria-hidden="true" :style="{ '--r': `${spin}deg` }" />
        <span class="track" aria-hidden="true">
          <span class="fill" :style="{ width: `${pos * 100}%` }" />
          <span v-for="k in Math.max(0, frames.length - 1)" :key="k" class="tick" :style="{ left: `${(k / frames.length) * 100}%` }" />
          <span class="head" :style="{ left: `${pos * 100}%` }">◀◀</span>
        </span>
        <span class="reel r" aria-hidden="true" :style="{ '--r': `${spin}deg` }" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  // lahat ng litrato ({ src, caption }), 6–10
  photos: { type: Array, default: () => [] },
  reduced: { type: Boolean, default: false },
});
const emit = defineEmits(["rewound", "done"]);

const frames = computed(() => props.photos.slice(0, 10));
const pos = ref(1); // 1 = dulo ng tape, 0 = simula
const mode = ref("stop"); // stop → rew → play
const speed = ref(0);
const spin = ref(0);
const playIndex = ref(0);
const index = computed(() => (mode.value === "play" ? playIndex.value : Math.min(frames.value.length - 1, Math.floor(pos.value * frames.value.length))));
const frame = computed(() => frames.value[index.value]);
const timecode = computed(() => {
  const total = frames.value.length * 12; // ~12 segundo bawat alaala
  const t = mode.value === "play" ? (playIndex.value / Math.max(1, frames.value.length)) * total : pos.value * total;
  const s = Math.floor(t);
  return `0:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
});

const barEl = ref(null);
let dragging = false;
let lastX = 0;
let lastT = 0;
let decay = 0;

function setPos(p) {
  if (mode.value === "play") return;
  const prev = pos.value;
  // pakaliwa lang (rewind); hindi babalik pakanan nang lampas sa dati
  pos.value = Math.max(0, Math.min(prev, p));
  spin.value -= (prev - pos.value) * 900;
  if (pos.value < prev) mode.value = "rew";
  if (pos.value <= 0.005) startPlay();
}
function ratioAt(event) {
  const r = barEl.value.getBoundingClientRect();
  return (event.clientX - r.left - r.width * 0.12) / (r.width * 0.76);
}
function down(event) {
  if (mode.value === "play") return;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  dragging = true;
  lastX = event.clientX;
  lastT = performance.now();
}
function move(event) {
  if (!dragging) return;
  const now = performance.now();
  speed.value = Math.min(1, Math.abs(event.clientX - lastX) / Math.max(8, now - lastT) / 1.5);
  lastX = event.clientX;
  lastT = now;
  // kahit saan sa bar: ang galaw pakaliwa ang nagre-rewind (hindi kailangang hawakan mismo ang head)
  setPos(Math.min(pos.value, ratioAt(event)));
  clearTimeout(decay);
  decay = setTimeout(() => (speed.value = 0), 120);
}
function up() {
  dragging = false;
  if (mode.value === "rew") mode.value = "stop";
}
function nudge(d) {
  setPos(pos.value + d);
  if (mode.value === "rew") mode.value = "stop";
}

let playTimer = 0;
function startPlay() {
  if (mode.value === "play") return;
  dragging = false;
  mode.value = "play";
  playIndex.value = 0;
  speed.value = 0;
  navigator.vibrate?.([15, 30, 15]);
  emit("rewound");
  const stepMs = props.reduced ? 1800 : 1500;
  const next = () => {
    if (playIndex.value < frames.value.length - 1) {
      playIndex.value += 1;
      pos.value = playIndex.value / Math.max(1, frames.value.length - 1);
      playTimer = setTimeout(next, stepMs);
    } else {
      pos.value = 1;
      playTimer = setTimeout(() => emit("done"), 1500);
    }
  };
  playTimer = setTimeout(next, stepMs);
}
onBeforeUnmount(() => {
  clearTimeout(playTimer);
  clearTimeout(decay);
});
</script>

<style scoped>
.vhs {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 50px 20px 40px;
  text-align: center;
}
.eyebrow {
  margin: 0;
  color: #ffb39b;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
}
h2 {
  margin: 6px 0 0;
  color: #fff1e0;
  font-family: var(--font-serif);
  font-size: clamp(26px, 8cqi, 40px);
  font-style: italic;
  font-weight: 600;
  text-shadow: 0 0 18px rgb(236 95 114 / 0.6);
}
.sub {
  min-height: 1.4em;
  margin: 8px 0 0;
  color: rgb(255 241 224 / 0.85);
  font-family: var(--font-mono);
  font-size: 12px;
}
.tv {
  width: min(100%, 380px);
  padding: 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, #2b2030, #19121d);
  box-shadow: 0 18px 40px rgb(0 0 0 / 0.5), inset 0 2px 0 rgb(255 255 255 / 0.06);
}
.screen {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border-radius: 10px;
  background: #0b0b0b;
}
.photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.15) contrast(1.05);
}
.is-rew .photo,
.is-stop .photo {
  filter: saturate(0.85) contrast(1.1) sepia(0.15);
}
.fast .photo {
  animation: jitter 0.12s steps(2) infinite;
}
.is-play .photo {
  animation: fade-frame 0.5s ease;
}
.tracking {
  position: absolute;
  left: 0;
  right: 0;
  height: 18%;
  background:
    repeating-linear-gradient(90deg, rgb(255 255 255 / 0.6) 0 2px, transparent 2px 6px),
    linear-gradient(180deg, transparent, rgb(255 255 255 / 0.35), transparent);
  mix-blend-mode: screen;
  animation: track 1.2s linear infinite;
  pointer-events: none;
}
.screen::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(0deg, rgb(0 0 0 / 0.2) 0 1px, transparent 1px 3px),
    radial-gradient(ellipse at 50% 50%, transparent 60%, rgb(0 0 0 / 0.5) 100%);
  pointer-events: none;
}
.osd {
  position: absolute;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  text-shadow: 2px 0 0 rgb(255 0 80 / 0.6), -2px 0 0 rgb(0 200 255 / 0.6);
}
.tl {
  top: 8px;
  left: 10px;
}
.tr {
  top: 8px;
  right: 10px;
}
.bl {
  bottom: 8px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.rec {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff3b5c;
  animation: blink 1s steps(1) infinite;
}
.caption {
  position: absolute;
  right: 10px;
  bottom: 26px;
  left: 10px;
  margin: 0;
  color: #fff;
  font-family: var(--font-serif);
  font-size: 17px;
  font-style: italic;
  text-shadow: 0 2px 6px rgb(0 0 0 / 0.9);
}

/* tape */
.tape {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 8px;
  border-radius: 10px;
  background: #120c15;
  cursor: grab;
  touch-action: none;
  outline: none;
}
.tape:focus-visible {
  box-shadow: 0 0 0 2px #ffb39b;
}
.is-play .tape {
  cursor: default;
}
.reel {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: repeating-conic-gradient(from var(--r), #3a2a3f 0 30deg, #20162a 30deg 60deg);
  box-shadow: inset 0 0 0 4px #4b3550, inset 0 0 0 9px #120c15;
}
.track {
  position: relative;
  flex: 1;
  height: 10px;
  border-radius: 5px;
  background: rgb(255 255 255 / 0.08);
}
.fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 5px;
  background: linear-gradient(90deg, #ec5f72, #ffb39b);
}
.tick {
  position: absolute;
  top: -3px;
  width: 1px;
  height: 16px;
  background: rgb(255 255 255 / 0.25);
}
.head {
  position: absolute;
  top: 50%;
  display: grid;
  place-items: center;
  width: 40px;
  height: 28px;
  border: 2px solid #fff1e0;
  border-radius: 8px;
  background: #ec5f72;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 11px;
  translate: -50% -50%;
  box-shadow: 0 0 14px rgb(236 95 114 / 0.8);
}
.is-stop .head {
  animation: nudge 1.6s ease-in-out infinite;
}
.is-play .head {
  font-size: 0;
  width: 14px;
  background: #8affc4;
  border-color: #8affc4;
}
.cap-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.cap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
@keyframes jitter {
  50% {
    transform: translate(-3px, 2px) skewX(-2deg);
  }
}
@keyframes fade-frame {
  from {
    opacity: 0.2;
    filter: brightness(1.8) blur(2px);
  }
}
@keyframes track {
  from {
    top: -18%;
  }
  to {
    top: 100%;
  }
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
@keyframes nudge {
  0%,
  100% {
    translate: -50% -50%;
  }
  50% {
    translate: calc(-50% - 8px) -50%;
  }
}
/* laptop/iPad: mas malaking TV */
@container (min-width: 700px) and (min-height: 621px) {
  .tv {
    width: min(100%, 520px);
  }
}
@container (max-height: 620px) {
  .vhs {
    gap: 10px;
    padding: 20px 20px 16px;
  }
  .tv {
    width: min(100%, 320px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .tracking,
  .fast .photo,
  .is-stop .head,
  .rec {
    animation: none;
  }
}
</style>
