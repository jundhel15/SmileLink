<template>
  <!-- 3) BUTTERFLY ALBUM: bawat paru-paro ay may dalang isang litrato. Hulihin sila (i-tap habang lumilipad);
       papasok sila sa album at lilitaw ang litrato na may caption. Ilan man ang litrato (3–10), isang paru-paro bawat isa. -->
  <section ref="stageEl" class="bf-stage" :class="{ done }">
    <header class="head">
      <p class="eyebrow">{{ done ? "A whole album" : "Catch a memory" }}</p>
      <h2>{{ done ? "Every one is a favorite" : "Tap the butterflies" }}</h2>
    </header>

    <div ref="cardEl" class="spot" aria-live="polite">
      <Transition name="card" mode="out-in">
        <figure v-if="current >= 0" :key="current" class="polaroid">
          <img v-if="photoFor(current)" :src="photoFor(current)" alt="" draggable="false" />
          <span v-else class="heart">♥</span>
          <figcaption>{{ captionFor(current) }}</figcaption>
        </figure>
        <p v-else key="idle" class="idle">Each butterfly carries one of our memories.</p>
      </Transition>
    </div>

    <div class="album" :style="{ '--cols': cols }">
      <span
        v-for="i in n"
        :key="i"
        :ref="(el) => (slotEls[i - 1] = el)"
        class="slot"
        :class="{ filled: filled.includes(i - 1) }"
      >
        <template v-if="filled.includes(i - 1)">
          <img v-if="photoFor(i - 1)" :src="photoFor(i - 1)" alt="" draggable="false" />
          <span v-else class="heart small">♥</span>
        </template>
      </span>
    </div>

    <button
      v-for="(m, i) in metas"
      :key="i"
      :ref="(el) => (flyEls[i] = el)"
      class="fly"
      :class="{ ready, pinned: state[i].caught }"
      :style="{ '--c1': m.c1, '--c2': m.c2 }"
      type="button"
      :aria-label="`Catch butterfly ${i + 1}`"
      @pointerdown.prevent="catchFly(i)"
      @keydown.enter.prevent="catchFly(i)"
    >
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <g class="wl">
          <path d="M22 22 C10 4 0 10 2 20 C3 28 14 30 22 24Z" class="top" />
          <path d="M22 24 C12 28 6 40 14 40 C20 40 22 32 22 24Z" class="bot" />
          <circle cx="9" cy="17" r="2.2" class="dot" />
        </g>
        <g class="wr">
          <path d="M22 22 C34 4 44 10 42 20 C41 28 30 30 22 24Z" class="top" />
          <path d="M22 24 C32 28 38 40 30 40 C24 40 22 32 22 24Z" class="bot" />
          <circle cx="35" cy="17" r="2.2" class="dot" />
        </g>
        <ellipse cx="22" cy="24" rx="1.8" ry="9" class="body" />
        <path d="M21 15 C19 10 17 8 15 7 M23 15 C25 10 27 8 29 7" class="ant" />
      </svg>
    </button>

    <p v-if="!done" class="hint">Tap a butterfly · {{ caughtCount }}/{{ n }}</p>

    <Transition name="rise">
      <button v-if="done" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  photos: { type: Array, default: () => [] },
  captions: { type: Array, default: () => [] },
});
const emit = defineEmits(["caught", "finished", "done"]);

const DEFAULT_CAPTIONS = [
  "A moment I keep",
  "Pure joy",
  "Just us",
  "So you",
  "Forever favorite",
  "Laughing again",
  "My happy place",
  "Little things",
  "Golden day",
  "Still smiling",
];
const PALETTES = [
  ["#ff8fab", "#ffc2d1"],
  ["#ffd166", "#ffe8a3"],
  ["#b8a1f0", "#dccffa"],
  ["#7fd6c2", "#bdeee2"],
  ["#ff9e7a", "#ffcbb5"],
  ["#8ec5ff", "#c8e2ff"],
  ["#f6a6e0", "#fbd0f0"],
  ["#a3e08a", "#d2f2c2"],
  ["#ffb36b", "#ffd9ad"],
  ["#9bb4ff", "#cdd8ff"],
];

// isang paru-paro bawat litrato (kahit 3 man ang minimum)
const n = Math.min(10, Math.max(3, props.photos.length));
const metas = Array.from({ length: n }, (_, i) => ({ c1: PALETTES[i % 10][0], c2: PALETTES[i % 10][1] }));
const cols = n <= 5 ? n : Math.ceil(n / 2);
const photoFor = (i) => (props.photos.length ? props.photos[i % props.photos.length] : "");
const captionFor = (i) => props.captions[i] || DEFAULT_CAPTIONS[i % DEFAULT_CAPTIONS.length];

const stageEl = ref(null);
const cardEl = ref(null);
const flyEls = [];
const slotEls = [];
const ready = ref(false);
const current = ref(-1);
const filled = ref([]);
const caughtCount = ref(0);
const done = ref(false);

const rand = (a, b) => a + Math.random() * (b - a);
// walang reactive: dumadaan sa bawat frame
const state = Array.from({ length: n }, () => ({
  x: 0,
  y: 0,
  a: rand(0, Math.PI * 2),
  speed: rand(36, 58),
  ph: rand(0, 6.28),
  caught: false,
}));

let frame = 0;
let last = 0;
const timers = [];

function tick(now) {
  const el = stageEl.value;
  if (!el) return;
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  const t = now / 1000;
  const W = el.clientWidth;
  const H = el.clientHeight;
  state.forEach((s, i) => {
    if (s.caught) return;
    s.a += (Math.sin(t * 0.7 + s.ph) * 1.1 + (Math.random() - 0.5) * 0.6) * dt;
    const vx = Math.cos(s.a) * s.speed;
    const vy = Math.sin(s.a) * s.speed * 0.7;
    s.x += vx * dt;
    s.y += vy * dt + Math.sin(t * 5 + s.ph) * 0.35;
    if ((s.x < 30 && vx < 0) || (s.x > W - 30 && vx > 0)) s.a = Math.PI - s.a;
    if ((s.y < H * 0.18 && vy < 0) || (s.y > H * 0.62 && vy > 0)) s.a = -s.a;
    s.x = Math.max(24, Math.min(W - 24, s.x));
    s.y = Math.max(H * 0.16, Math.min(H * 0.64, s.y));
    const heading = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
    const e = flyEls[i];
    if (e) e.style.transform = `translate(${s.x - 22}px, ${s.y - 22}px) rotate(${heading.toFixed(1)}deg)`;
  });
  frame = requestAnimationFrame(tick);
}

function catchFly(i) {
  const s = state[i];
  if (s.caught) return;
  s.caught = true;
  navigator.vibrate?.(12);
  const stage = stageEl.value.getBoundingClientRect();
  const sc = stage.width ? stageEl.value.clientWidth / stage.width : 1;
  const slot = slotEls[i].getBoundingClientRect();
  const tx = (slot.left + slot.width / 2 - stage.left) * sc;
  const ty = (slot.top + slot.height / 2 - stage.top) * sc;
  const el = flyEls[i];
  el.style.transition = "transform 1.1s cubic-bezier(0.4, 0.1, 0.3, 1)";
  el.style.transform = `translate(${tx - 22}px, ${ty - 36}px) rotate(0deg) scale(0.55)`;
  current.value = i;
  caughtCount.value += 1;
  emit("caught", el);
  timers.push(setTimeout(() => (filled.value = [...filled.value, i]), 900));
  if (caughtCount.value === n) {
    timers.push(
      setTimeout(() => {
        done.value = true;
        navigator.vibrate?.([20, 40, 20]);
        emit("finished", cardEl.value);
      }, 1500),
    );
  }
}

onMounted(() => {
  const W = stageEl.value.clientWidth;
  const H = stageEl.value.clientHeight;
  state.forEach((s) => {
    s.x = rand(40, W - 40);
    s.y = rand(H * 0.22, H * 0.58);
  });
  ready.value = true;
  frame = requestAnimationFrame(tick);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  timers.forEach(clearTimeout);
});
</script>

<style scoped>
.bf-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.head {
  position: absolute;
  top: 8%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.eyebrow {
  margin: 0;
  color: #e0667f;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #2f5d3a;
  font-family: var(--font-head);
  font-size: clamp(26px, 7.6cqi, 38px);
  font-weight: 600;
  line-height: 1.15;
}

/* ===== Malaking litrato ===== */
.spot {
  position: absolute;
  top: 19%;
  left: 50%;
  display: grid;
  place-items: center;
  min-height: 210px;
  translate: -50% 0;
}
.polaroid {
  width: 158px;
  margin: 0;
  padding: 8px 8px 10px;
  background: #fff;
  box-shadow: 0 12px 24px rgb(60 100 70 / 0.3);
  rotate: -3deg;
}
.polaroid img {
  display: block;
  width: 142px;
  height: 142px;
  object-fit: cover;
  pointer-events: none;
}
.polaroid .heart {
  display: grid;
  place-items: center;
  width: 142px;
  height: 142px;
  background: #ffe3ea;
  color: #ff8fab;
  font-size: 54px;
}
.polaroid figcaption {
  padding-top: 7px;
  color: #6b5a47;
  font-family: var(--font-script);
  font-size: 19px;
  line-height: 1.1;
  text-align: center;
}
.idle {
  max-width: 230px;
  margin: 0;
  color: #4d7a5a;
  font-family: var(--font-body);
  font-size: 16px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
}
.card-enter-active,
.card-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.card-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.94);
}
.card-leave-to {
  opacity: 0;
}

/* ===== Album ===== */
.album {
  position: absolute;
  left: 50%;
  bottom: 4%;
  display: grid;
  grid-template-columns: repeat(var(--cols), 62px);
  gap: 8px;
  translate: -50% 0;
}
.slot {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  overflow: hidden;
  border: 2px dashed rgb(255 255 255 / 0.9);
  border-radius: 12px;
  background: rgb(255 255 255 / 0.35);
}
.slot.filled {
  border: 3px solid #fff;
  box-shadow: 0 6px 12px rgb(60 100 70 / 0.25);
}
.slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.heart.small {
  color: #ff8fab;
  font-size: 26px;
}

/* ===== Mga paru-paro ===== */
.fly {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  opacity: 0;
  touch-action: none;
  will-change: transform;
}
.fly.ready {
  opacity: 1;
}
.fly::before {
  content: "";
  position: absolute;
  inset: -12px;
}
.fly.pinned {
  pointer-events: none;
}
.fly:focus-visible {
  outline: 2px dashed #2f5d3a;
  outline-offset: 4px;
}
.fly svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 4px 4px rgb(60 80 60 / 0.3));
}
.top {
  fill: var(--c1);
  stroke: rgb(70 40 60 / 0.35);
  stroke-width: 0.8;
}
.bot {
  fill: var(--c2);
  stroke: rgb(70 40 60 / 0.3);
  stroke-width: 0.8;
}
.dot {
  fill: rgb(255 255 255 / 0.85);
}
.body {
  fill: #4a3b2f;
}
.ant {
  fill: none;
  stroke: #4a3b2f;
  stroke-width: 1;
  stroke-linecap: round;
}
.wl,
.wr {
  transform-box: fill-box;
  animation: flap 0.24s ease-in-out infinite alternate;
}
.wl {
  transform-origin: right center;
}
.wr {
  transform-origin: left center;
}

.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(4% + 140px);
  margin: 0;
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 8px rgb(30 70 40 / 0.6);
  pointer-events: none;
}
.next {
  position: absolute;
  left: 50%;
  bottom: calc(4% + 144px);
  z-index: 6;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: #ff8fab;
  box-shadow: 0 10px 22px rgb(180 60 90 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.rise-enter-active {
  transition: opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes flap {
  from {
    scale: 1 1;
  }
  to {
    scale: 0.3 1;
  }
}
@container (max-height: 620px) {
  .head {
    top: 4%;
  }
  .spot {
    top: 16%;
    scale: 0.82;
    transform-origin: top center;
  }
  .hint {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .wl,
  .wr {
    animation-duration: 0.6s;
  }
}
</style>