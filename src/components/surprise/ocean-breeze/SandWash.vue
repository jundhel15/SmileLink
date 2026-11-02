<template>
  <!-- 1) SAND & WAVE: gumuhit gamit ang daliri sa basang buhangin. Kapag sapat na ang iginuhit,
       darating ang alon, buburahin ang lahat, at pag umatras ito, nakaukit sa buhangin ang pangalan. -->
  <section class="sand-stage" :class="{ washed }">
    <header class="head" :class="{ gone: washed }">
      <p class="eyebrow">A day at the beach</p>
      <h2>Draw something in the sand</h2>
    </header>

    <div
      ref="beachEl"
      class="beach"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <canvas ref="canvasEl" class="draw" />
      <div class="reveal" :class="{ on: revealed }">
        <p class="small">Happy birthday</p>
        <p class="big">{{ recipient }}</p>
        <p class="small">with love, {{ sender }}</p>
      </div>
      <div class="wave" :class="waveState" aria-hidden="true" />
      <p v-if="!washed" class="hint">{{ hintText }}</p>
    </div>

    <Transition name="rise">
      <button v-if="revealed" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
});
const emit = defineEmits(["washed", "done"]);

const beachEl = ref(null);
const canvasEl = ref(null);
const progress = ref(0);
const washed = ref(false);
const revealed = ref(false);
const waveState = ref("idle"); // idle | in | out

const hintText = computed(() =>
  progress.value === 0 ? "Use your finger like a stick ✍" : `${Math.round(progress.value * 100)}% · keep drawing`,
);

let ctx = null;
let width = 0;
let height = 0;
let observer = null;
let drawing = false;
let triggered = false;
let length = 0;
const strokes = [];
const timers = [];

function resize() {
  const canvas = canvasEl.value;
  if (!canvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}

// ang preview ay maaaring naka-scale, kaya iko-convert ang pointer papunta sa sariling laki ng canvas
function point(event) {
  const rect = beachEl.value.getBoundingClientRect();
  const sx = rect.width ? beachEl.value.clientWidth / rect.width : 1;
  const sy = rect.height ? beachEl.value.clientHeight / rect.height : 1;
  return { x: (event.clientX - rect.left) * sx, y: (event.clientY - rect.top) * sy };
}

// dalawang pasada: maliwanag na gilid, tapos madilim na uka. Para magmukhang inukit sa basang buhangin.
function redraw() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const passes = [
    ["rgba(255, 243, 214, 0.8)", 12, 1.5, 2],
    ["rgba(122, 86, 42, 0.88)", 7, 0, 0],
  ];
  passes.forEach(([color, lineWidth, ox, oy]) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    strokes.forEach((stroke) => {
      ctx.beginPath();
      stroke.forEach((p, i) => (i ? ctx.lineTo(p.x + ox, p.y + oy) : ctx.moveTo(p.x + ox, p.y + oy)));
      if (stroke.length === 1) ctx.lineTo(stroke[0].x + ox + 0.1, stroke[0].y + oy);
      ctx.stroke();
    });
  });
}

function onDown(event) {
  if (triggered) return;
  drawing = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  strokes.push([point(event)]);
  redraw();
}
function onMove(event) {
  if (!drawing || triggered) return;
  const stroke = strokes[strokes.length - 1];
  const p = point(event);
  const last = stroke[stroke.length - 1];
  const d = Math.hypot(p.x - last.x, p.y - last.y);
  if (d < 3) return;
  stroke.push(p);
  length += d;
  const needed = Math.max(700, width * 2.6);
  progress.value = Math.min(1, length / needed);
  redraw();
  if (length >= needed) trigger();
}
function onUp() {
  drawing = false;
}

function trigger() {
  triggered = true;
  drawing = false;
  navigator.vibrate?.([20, 40, 20]);
  waveState.value = "in";
  timers.push(
    setTimeout(() => {
      // natakpan na ng alon ang lahat: burahin ang guhit
      strokes.length = 0;
      ctx.clearRect(0, 0, width, height);
      washed.value = true;
      waveState.value = "out";
      emit("washed", beachEl.value);
      timers.push(setTimeout(() => (revealed.value = true), 500));
    }, 1500),
  );
}

onMounted(() => {
  ctx = canvasEl.value.getContext("2d");
  resize();
  observer = new ResizeObserver(resize);
  observer.observe(canvasEl.value);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  timers.forEach(clearTimeout);
});
</script>

<style scoped>
.sand-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  user-select: none;
  -webkit-user-select: none;
}
.head {
  position: absolute;
  top: 11%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
  transition: opacity 0.8s ease;
}
.head.gone {
  opacity: 0;
}
.eyebrow {
  margin: 0;
  color: #fff;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.34em;
  text-shadow: 0 2px 10px rgb(5 60 90 / 0.5);
  text-transform: uppercase;
}
h2 {
  margin: 8px 0 0;
  color: #fff;
  font-family: var(--font-head);
  font-size: clamp(28px, 8cqi, 40px);
  font-style: italic;
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 2px 14px rgb(5 60 90 / 0.5);
}

/* ===== Buhangin ===== */
.beach {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 62%;
  overflow: hidden;
  border-radius: 30px 30px 0 0;
  background:
    radial-gradient(rgb(150 110 55 / 0.22) 1px, transparent 1.6px) 0 0 / 10px 10px,
    linear-gradient(180deg, #f6e3bb, #efd3a0 60%, #e6c48a);
  box-shadow: 0 -8px 28px rgb(255 255 255 / 0.35);
  cursor: crosshair;
  touch-action: none;
  transition: filter 1.5s ease;
}
.washed .beach {
  filter: brightness(0.95) saturate(1.05);
}
.draw {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.reveal {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 40px;
  text-align: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 1.8s ease;
}
.reveal.on {
  opacity: 1;
}
.small {
  margin: 0;
  color: rgb(140 98 48 / 0.9);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  text-shadow: 0 1px 0 rgb(255 244 218 / 0.9);
}
.big {
  margin: 4px 0 6px;
  padding: 0 0.1em;
  color: rgb(150 106 52 / 0.92);
  font-family: var(--font-head);
  font-size: clamp(56px, 19cqi, 92px);
  font-style: italic;
  font-weight: 600;
  line-height: 1.1;
  text-shadow:
    0 2px 0 rgb(255 244 218 / 0.9),
    0 -1px 1px rgb(100 68 30 / 0.45);
}

/* ===== Alon ===== */
.wave {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.96) 0,
    rgb(190 240 246 / 0.88) 6%,
    rgb(92 200 215 / 0.82) 40%,
    rgb(60 170 195 / 0.8)
  );
  pointer-events: none;
  transform: translateY(104%);
}
.wave::before {
  content: "";
  position: absolute;
  top: -26px;
  left: 0;
  right: 0;
  height: 30px;
  background: radial-gradient(circle at 19px 26px, #fff 0 12px, transparent 13px) 0 0 / 38px 30px repeat-x;
}
.wave.in {
  transform: translateY(0);
  transition: transform 1.4s cubic-bezier(0.25, 0.7, 0.3, 1);
}
.wave.out {
  transform: translateY(104%);
  transition: transform 2.6s cubic-bezier(0.4, 0.1, 0.3, 1);
}

.hint {
  position: absolute;
  left: 0;
  right: 0;
  top: 18px;
  margin: 0;
  color: rgb(125 88 42 / 0.85);
  font-family: var(--font-body);
  font-size: 15px;
  font-style: italic;
  font-weight: 600;
  text-align: center;
  pointer-events: none;
}
.next {
  position: absolute;
  left: 50%;
  bottom: 6%;
  z-index: 3;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: #ff8a6b;
  box-shadow: 0 10px 22px rgb(180 80 50 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.rise-enter-active {
  transition: opacity 0.9s ease 0.8s, transform 0.9s ease 0.8s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@container (max-height: 620px) {
  .head {
    top: 7%;
  }
  .beach {
    height: 66%;
  }
}
</style>