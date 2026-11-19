<template>
  <!-- PLAY THE STARS: 5 bituin sa langit, bawat isa ay isang nota. I-tap ang umiilaw na bituin para
       tumugtog ang "Happy birthday to you" (dalawang linya, 12 nota) na parang wind chime. -->
  <section
    class="song"
    :class="{ done }"
    role="application"
    tabindex="0"
    :aria-label="done ? 'Song complete' : 'Play the stars. Tap the glowing star, or press Enter'"
    @keydown.enter.prevent="playNext"
    @keydown.space.prevent="playNext"
  >
    <header class="s-head">
      <p class="eyebrow">A song in the stars</p>
      <h2>{{ done ? "Happy birthday to you ♪" : "Play the stars" }}</h2>
      <p class="hint" aria-live="polite">{{ hint }}</p>
    </header>

    <div class="sky">
      <button
        v-for="(s, i) in STARS"
        :key="s.note"
        :ref="(el) => (starEls[i] = el)"
        type="button"
        class="star"
        :class="{ next: !done && i === nextStar, lit: lit[i], miss: miss === i }"
        :style="{ left: `${s.x}%`, top: `${s.y}%`, '--hue': s.hue }"
        :aria-label="`Star note ${s.note}`"
        @pointerdown.prevent="tapStar(i)"
      >
        <span class="halo" aria-hidden="true" />
        <span class="ring" aria-hidden="true" />
        <svg viewBox="-20 -20 40 40" aria-hidden="true"><path d="M0 -17 4 -4 17 0 4 4 0 17 -4 4 -17 0 -4 -4Z" /></svg>
      </button>
      <span
        v-for="n in notes"
        :key="n.id"
        class="note"
        :style="{ left: `${n.x}%`, top: `${n.y}%`, '--dx': `${n.dx}px` }"
        aria-hidden="true"
        @animationend="notes = notes.filter((x) => x.id !== n.id)"
        >{{ n.glyph }}</span
      >
    </div>

    <p class="lyrics" aria-hidden="true">
      <span v-for="(syl, i) in SONG" :key="i" :class="{ sung: i < step, now: !done && i === step }">{{ syl.t }}</span>
    </p>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const emit = defineEmits(["note", "complete", "done"]);

// limang nota (G4 A4 B4 C5 D5), nakaayos na parang arko sa langit
const STARS = [
  { note: "G", f: 392.0, x: 12, y: 62, hue: "#ffe6a8" },
  { note: "A", f: 440.0, x: 31, y: 40, hue: "#ffd6ea" },
  { note: "B", f: 493.88, x: 50, y: 22, hue: "#e7dcff" },
  { note: "C", f: 523.25, x: 69, y: 40, hue: "#d6f0ff" },
  { note: "D", f: 587.33, x: 88, y: 62, hue: "#ffe6a8" },
];
// "Happy birthday to you" × 2 (G G A G C B · G G A G D C)
const SONG = [
  { t: "Hap", s: 0 },
  { t: "py ", s: 0 },
  { t: "birth", s: 1 },
  { t: "day ", s: 0 },
  { t: "to ", s: 3 },
  { t: "you, ", s: 2 },
  { t: "hap", s: 0 },
  { t: "py ", s: 0 },
  { t: "birth", s: 1 },
  { t: "day ", s: 0 },
  { t: "to ", s: 4 },
  { t: "you ♪", s: 3 },
];

const starEls = [];
const step = ref(0);
const done = ref(false);
const lit = ref(STARS.map(() => false));
const miss = ref(-1);
const notes = ref([]);
const nextStar = computed(() => (step.value < SONG.length ? SONG[step.value].s : -1));
const hint = computed(() => {
  if (done.value) return "";
  if (step.value === 0) return "Tap the glowing star ✦";
  return `${step.value} of ${SONG.length} notes`;
});

/* ===== Tunog: malambot na chime (sine + mahinang overtone), walang file na kailangan ===== */
let actx = null;
function tone(freq, when = 0, gain = 0.2) {
  try {
    actx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    const t = actx.currentTime + when;
    const g = actx.createGain();
    const o1 = actx.createOscillator();
    const o2 = actx.createOscillator();
    const g2 = actx.createGain();
    o1.type = "sine";
    o1.frequency.value = freq;
    o2.type = "triangle";
    o2.frequency.value = freq * 2;
    g2.gain.value = 0.16;
    o1.connect(g);
    o2.connect(g2).connect(g);
    g.connect(actx.destination);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    o1.start(t);
    o2.start(t);
    o1.stop(t + 1.9);
    o2.stop(t + 1.9);
  } catch {
    // walang suporta sa audio: tuloy pa rin ang laro, wala lang tunog
  }
}

const timers = [];
let noteId = 0;
function flare(i) {
  lit.value = lit.value.map((v, k) => (k === i ? true : v));
  timers.push(setTimeout(() => (lit.value = lit.value.map((v, k) => (k === i ? false : v))), 420));
  noteId += 1;
  const s = STARS[i];
  notes.value = [...notes.value, { id: noteId, x: s.x, y: s.y, dx: Math.round((Math.random() - 0.5) * 60), glyph: Math.random() < 0.5 ? "♪" : "♫" }];
}

function tapStar(i) {
  tone(STARS[i].f);
  flare(i);
  if (done.value) return;
  if (i !== nextStar.value) {
    // maling bituin: tumutunog pa rin, pero kikislap ang tamang bituin para gabayan
    miss.value = nextStar.value;
    timers.push(setTimeout(() => (miss.value = -1), 500));
    return;
  }
  navigator.vibrate?.(10);
  step.value += 1;
  emit("note", starEls[i]);
  if (step.value >= SONG.length) finish(i);
}
function playNext() {
  if (!done.value && nextStar.value >= 0) tapStar(nextStar.value);
}

function finish(i) {
  done.value = true;
  navigator.vibrate?.([20, 40, 20]);
  // huling chord, pataas (G B D G)
  [392, 493.88, 587.33, 783.99].forEach((f, k) => tone(f, 0.35 + k * 0.12, 0.16));
  timers.push(setTimeout(() => (lit.value = STARS.map(() => true)), 350));
  timers.push(setTimeout(() => emit("complete", starEls[i]), 400));
  timers.push(setTimeout(() => emit("done"), 2600));
}

onBeforeUnmount(() => {
  timers.forEach(clearTimeout);
  actx?.close?.();
});
</script>

<style scoped>
.song {
  position: absolute;
  z-index: 12;
  inset: 0;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
}
.s-head {
  position: absolute;
  top: calc(7% + 92px); /* nasa ilalim ng buwan sa background (top 7%, 78px) */
  left: 50%;
  width: min(100% - 40px, 520px);
  text-align: center;
  transform: translateX(-50%);
  pointer-events: none;
}
.eyebrow {
  margin: 0;
  color: #f1d3a6;
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #f4e9f7;
  font-family: var(--font-serif);
  font-size: clamp(24px, 7.4cqi, 36px);
  font-weight: 400;
  line-height: 1.15;
  text-shadow: 0 0 22px rgb(214 178 240 / 0.5);
}
.hint {
  margin: 8px 0 0;
  color: rgb(253 242 248 / 0.85);
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  text-shadow: 0 2px 8px rgb(10 6 30 / 0.8);
}

/* langit kung saan nakalagay ang 5 bituin */
.sky {
  position: absolute;
  top: 36%;
  left: 50%;
  width: min(100% - 28px, 720px);
  height: 27%;
  transform: translateX(-50%);
}
.star {
  position: absolute;
  width: 62px;
  height: 62px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--hue);
  cursor: pointer;
  touch-action: manipulation;
  translate: -50% -50%;
  -webkit-tap-highlight-color: transparent;
}
.star svg {
  position: absolute;
  inset: 14px;
  width: 34px;
  height: 34px;
  fill: currentColor;
  filter: drop-shadow(0 0 6px currentColor);
  opacity: 0.55;
  transition: opacity 0.3s, scale 0.3s cubic-bezier(0.3, 1.6, 0.5, 1);
  animation: tw 3s ease-in-out infinite;
}
.star:nth-child(2n) svg {
  animation-delay: 0.8s;
}
.halo {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--hue) 55%, transparent), transparent 66%);
  opacity: 0;
  transition: opacity 0.3s;
}
.ring {
  position: absolute;
  inset: 4px;
  border: 1.5px solid var(--hue);
  border-radius: 50%;
  opacity: 0;
}
/* ang susunod na nota: kumikinang at may pumipintig na singsing */
.star.next svg {
  opacity: 1;
  scale: 1.15;
  animation: none;
}
.star.next .halo {
  opacity: 0.9;
  animation: breathe 1.4s ease-in-out infinite;
}
.star.next .ring {
  animation: ring 1.4s ease-out infinite;
}
.star.lit svg {
  opacity: 1;
  scale: 1.5;
}
.star.lit .halo {
  opacity: 1;
}
.star.miss svg {
  animation: nudge 0.45s ease;
}
.done .star svg {
  opacity: 1;
}

/* lumulutang na nota */
.note {
  position: absolute;
  color: #fde7f0;
  font-size: 22px;
  text-shadow: 0 0 12px rgb(244 170 208 / 0.9);
  pointer-events: none;
  translate: -50% -50%;
  animation: float-note 1.6s ease-out forwards;
}

.lyrics {
  position: absolute;
  bottom: 22%;
  left: 50%;
  width: min(100% - 32px, 560px);
  margin: 0;
  color: rgb(253 242 248 / 0.35);
  font-family: var(--font-script);
  font-size: clamp(26px, 8cqi, 40px);
  line-height: 1.25;
  text-align: center;
  white-space: pre-wrap;
  transform: translateX(-50%);
}
.lyrics span {
  transition: color 0.3s, text-shadow 0.3s;
}
.lyrics .sung {
  color: #fde7f0;
  text-shadow: 0 0 14px rgb(244 170 208 / 0.8);
}
.lyrics .now {
  color: rgb(255 230 168 / 0.75);
}

@keyframes tw {
  50% {
    opacity: 0.85;
  }
}
@keyframes breathe {
  50% {
    scale: 1.25;
  }
}
@keyframes ring {
  from {
    opacity: 0.9;
    scale: 0.7;
  }
  to {
    opacity: 0;
    scale: 1.6;
  }
}
@keyframes nudge {
  25% {
    translate: -4px 0;
  }
  75% {
    translate: 4px 0;
  }
}
@keyframes float-note {
  from {
    opacity: 1;
    transform: translate(0, -10px) scale(0.8);
  }
  to {
    opacity: 0;
    transform: translate(var(--dx), -80px) scale(1.2);
  }
}
@container (min-width: 600px) {
  .star {
    width: 76px;
    height: 76px;
  }
  .star svg {
    inset: 17px;
    width: 42px;
    height: 42px;
  }
}
@container (max-height: 620px) {
  .s-head {
    top: calc(7% + 70px);
  }
  .sky {
    top: 40%;
    height: 30%;
  }
  .lyrics {
    bottom: 8%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .star svg,
  .star.next .halo,
  .star.next .ring,
  .note {
    animation: none;
  }
}
</style>
