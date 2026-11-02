<template>
  <!-- 1) SCRATCH CARD: kaskasin ng daliri ang gintong foil para lumabas ang "Happy Birthday" at pangalan. -->
  <section class="scratch-stage" :class="{ revealed }">
    <header class="head">
      <p class="eyebrow">A little something for {{ recipient }}</p>
      <h2>
        <Transition name="swap" mode="out-in">
          <span :key="revealed">{{ revealed ? "It's your day!" : "Scratch the gold to reveal" }}</span>
        </Transition>
      </h2>
    </header>

    <div ref="cardEl" class="card">
      <div class="under">
        <p class="small">Happy Birthday</p>
        <p class="name">{{ recipient }}</p>
        <p class="from">with love, {{ sender }} ♥</p>
      </div>
      <canvas
        ref="foilEl"
        class="foil"
        :class="{ gone: revealed }"
        tabindex="0"
        role="img"
        aria-label="Gold foil. Press Enter to reveal."
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
        @keydown.enter.prevent="finish"
        @keydown.space.prevent="finish"
      />
    </div>

    <p v-if="!revealed" class="hint">{{ shown }}% revealed · scratch with your finger</p>

    <Transition name="rise">
      <button v-if="revealed" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
});
const emit = defineEmits(["revealed", "done"]);

const cardEl = ref(null);
const foilEl = ref(null);
const percent = ref(0);
const revealed = ref(false);
const shown = computed(() => Math.min(100, Math.round(percent.value / 0.5)));

const THRESHOLD = 0.5; // kalahati ng foil ang nakaskas = reveal
let ctx = null;
let w = 0;
let h = 0;
let dpr = 1;
let scratching = false;
let last = null;
let lastCheck = 0;

function paintFoil() {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#f6d98a");
  grad.addColorStop(0.3, "#e9b949");
  grad.addColorStop(0.5, "#fff0b8");
  grad.addColorStop(0.75, "#d9a032");
  grad.addColorStop(1, "#f3d27a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? "rgb(255 255 255 / 0.35)" : "rgb(150 100 20 / 0.18)";
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.8 + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgb(120 80 20 / 0.35)";
  ctx.setLineDash([6, 5]);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.setLineDash([]);
  ctx.fillStyle = "rgb(110 70 20 / 0.6)";
  ctx.font = "italic 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("scratch here ✦", w / 2, h / 2);
}

onMounted(() => {
  const canvas = foilEl.value;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  w = cardEl.value.offsetWidth;
  h = cardEl.value.offsetHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.scale(dpr, dpr);
  paintFoil();
});

// client coords → canvas coords (gumagana kahit naka-scale ang device preview)
function point(event) {
  const rect = foilEl.value.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * (w / rect.width), y: (event.clientY - rect.top) * (h / rect.height) };
}

function scratch(a, b) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = 40;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x + 0.01, b.y);
  ctx.stroke();
  ctx.restore();
}

function onDown(event) {
  if (revealed.value) return;
  scratching = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  last = point(event);
  scratch(last, last);
}
function onMove(event) {
  if (!scratching || revealed.value) return;
  const p = point(event);
  scratch(last, p);
  last = p;
  check(false);
}
function onUp() {
  scratching = false;
  last = null;
  check(true);
}

// binibilang kung ilang bahagi ng foil ang transparent na
function check(force) {
  if (revealed.value || !ctx) return;
  const now = performance.now();
  if (!force && now - lastCheck < 120) return;
  lastCheck = now;
  const W = foilEl.value.width;
  const H = foilEl.value.height;
  const data = ctx.getImageData(0, 0, W, H).data;
  const step = Math.max(6, Math.round(10 * dpr));
  let cleared = 0;
  let total = 0;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      total++;
      if (data[(y * W + x) * 4 + 3] < 40) cleared++;
    }
  }
  percent.value = total ? cleared / total : 0;
  if (percent.value >= THRESHOLD) finish();
}

function finish() {
  if (revealed.value) return;
  revealed.value = true;
  navigator.vibrate?.([20, 40, 20]);
  emit("revealed", cardEl.value);
}
</script>

<style scoped>
.scratch-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  padding: 70px 22px 90px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
}
.eyebrow {
  margin: 0;
  color: #b8514a;
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}
h2 {
  margin: 8px 0 0;
  color: #4a2340;
  font-family: var(--font-serif);
  font-size: clamp(26px, 7.6cqi, 38px);
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 1px 0 rgb(255 255 255 / 0.55);
}
.card {
  position: relative;
  width: min(calc(100% - 20px), 340px);
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 20px;
  box-shadow:
    0 18px 40px rgb(110 40 60 / 0.35),
    0 0 0 6px rgb(255 255 255 / 0.55);
  transform: rotate(-1.5deg);
}
.under {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 20% 25%, rgb(247 143 179 / 0.25) 0 8px, transparent 9px),
    radial-gradient(circle at 82% 70%, rgb(42 157 143 / 0.22) 0 10px, transparent 11px),
    radial-gradient(circle at 70% 20%, rgb(244 185 66 / 0.3) 0 6px, transparent 7px),
    linear-gradient(160deg, #fffaf0, #ffeed8);
}
.small {
  margin: 0;
  color: #b8514a;
  font-family: var(--font-serif);
  font-size: 15px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.name {
  margin: 0;
  color: #4a2340;
  font-family: var(--font-hand);
  font-size: clamp(52px, 17cqi, 78px);
  font-weight: 700;
  line-height: 1;
}
.from {
  margin: 4px 0 0;
  color: #7a4a63;
  font-family: var(--font-hand);
  font-size: 22px;
}
.foil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  touch-action: none;
  outline: none;
  transition: opacity 0.9s ease;
}
.foil:focus-visible {
  box-shadow: inset 0 0 0 3px #fff;
}
.foil.gone {
  opacity: 0;
  pointer-events: none;
}
.hint {
  margin: 0;
  color: #6d3a58;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
}
.next {
  padding: 11px 28px;
  border: 1px solid #d9574c;
  border-radius: 999px;
  background: #fff8ee;
  color: #b8403a;
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 8px 20px rgb(217 87 76 / 0.28);
}
.next:hover {
  background: #fff;
}
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.5s ease, filter 0.5s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(6px);
}
.rise-enter-active {
  transition: opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

@container (max-height: 620px) {
  .scratch-stage {
    gap: 12px;
    padding: 36px 22px 40px;
  }
}
</style>