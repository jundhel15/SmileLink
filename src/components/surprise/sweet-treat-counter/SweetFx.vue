<template>
  <canvas ref="canvasEl" class="sweet-fx" aria-hidden="true" />
</template>

<script setup>
/* FX sa iisang canvas: sumasabog na sprinkles, bituin at puso (burst) at ulan ng confetti (rain).
   Kontrolado ng parent gamit ang burst / rain / reset. */
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  reduced: { type: Boolean, default: false },
});

const COLORS = ["#ff6b4a", "#ff9a3c", "#ff8fa3", "#ffe08a", "#6fcfb8", "#fff4e0"];
const canvasEl = ref(null);
const rand = (min, max) => min + Math.random() * (max - min);
const pick = () => COLORS[Math.floor(Math.random() * COLORS.length)];

let ctx = null;
let width = 0;
let height = 0;
let frame = 0;
let last = 0;
let observer = null;
let items = [];
let rainUntil = 0;

/* ===== API para sa parent ===== */
function burst(x, y, { count = 40, speed = 200 } = {}) {
  const total = props.reduced ? Math.ceil(count / 3) : count;
  for (let i = 0; i < total; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * rand(0.25, 1);
    const r = Math.random();
    items.push({
      type: r < 0.3 ? "star" : r < 0.5 ? "heart" : "conf",
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - speed * 0.35,
      rot: rand(0, 6.28),
      spin: rand(-8, 8),
      size: rand(5, 11),
      color: pick(),
      phase: rand(0, 6.28),
      age: 0,
      life: rand(1.4, 2.6),
    });
  }
}

function rain(seconds = 3) {
  rainUntil = performance.now() / 1000 + (props.reduced ? seconds / 3 : seconds);
}

function reset() {
  items = [];
  rainUntil = 0;
}

defineExpose({ burst, rain, reset });

/* ===== Galaw bawat frame ===== */
function update(dt, now) {
  if (now < rainUntil && items.length < 260 && Math.random() < 0.6) {
    items.push({
      type: "conf",
      rain: true,
      x: rand(0, width),
      y: -12,
      vx: rand(-14, 14),
      vy: rand(60, 120),
      rot: rand(0, 6.28),
      spin: rand(-5, 5),
      size: rand(5, 10),
      color: pick(),
      phase: rand(0, 6.28),
      age: 0,
      life: 9,
    });
  }
  items.forEach((it) => {
    it.age += dt;
    it.rot += it.spin * dt;
    if (it.rain) {
      it.x += (it.vx + Math.sin(it.age * 2 + it.phase) * 30) * dt;
      it.y += it.vy * dt;
    } else {
      it.vy += 320 * dt;
      it.vx *= 1 - 1.1 * dt;
      it.vy *= 1 - 0.6 * dt;
      it.x += it.vx * dt;
      it.y += it.vy * dt;
    }
  });
  items = items.filter((it) => it.age < it.life && it.y < height + 30);
}

function heart(s) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.9);
  ctx.bezierCurveTo(-s * 1.2, s * 0.1, -s * 0.9, -s * 0.9, 0, -s * 0.35);
  ctx.bezierCurveTo(s * 0.9, -s * 0.9, s * 1.2, s * 0.1, 0, s * 0.9);
  ctx.closePath();
  ctx.fill();
}

function star(s) {
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.15, -s * 0.15, s, 0);
  ctx.quadraticCurveTo(s * 0.15, s * 0.15, 0, s);
  ctx.quadraticCurveTo(-s * 0.15, s * 0.15, -s, 0);
  ctx.quadraticCurveTo(-s * 0.15, -s * 0.15, 0, -s);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  items.forEach((it) => {
    const fade = Math.max(0, Math.min(1, (it.life - it.age) / 0.8));
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot);
    ctx.globalAlpha = 0.95 * fade;
    ctx.fillStyle = it.type === "star" ? "#ffe9a8" : it.color;
    if (it.type === "heart") heart(it.size);
    else if (it.type === "star") star(it.size * 1.2);
    else {
      const flutter = Math.cos(it.age * 9 + it.phase);
      ctx.scale(1, 0.35 + Math.abs(flutter) * 0.65);
      ctx.fillRect(-it.size / 2, -it.size * 0.8, it.size, it.size * 1.6);
    }
    ctx.restore();
  });
  ctx.globalAlpha = 1;
}

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  update(dt, performance.now() / 1000);
  draw();
  frame = requestAnimationFrame(tick);
}

function resize() {
  const canvas = canvasEl.value;
  if (!canvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

onMounted(() => {
  ctx = canvasEl.value.getContext("2d");
  resize();
  observer = new ResizeObserver(resize);
  observer.observe(canvasEl.value);
  frame = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
});
</script>

<style scoped>
.sweet-fx {
  position: absolute;
  z-index: 20;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
