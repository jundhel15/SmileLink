<template>
  <canvas ref="canvasEl" class="petal-fx" aria-hidden="true" />
</template>

<script setup>
/* PETAL FX sa iisang canvas: sumasabog na talulot at kislap (burst) at ulan ng talulot (rain).
   Kontrolado ng parent gamit ang burst / rain / reset. */
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  reduced: { type: Boolean, default: false },
});

const COLORS = ["#ffb3c7", "#ff8fab", "#ffffff", "#ffe08a", "#d8c4ff", "#ffc9a8"];
const canvasEl = ref(null);
const rand = (min, max) => min + Math.random() * (max - min);

let ctx = null;
let width = 0;
let height = 0;
let frame = 0;
let last = 0;
let observer = null;
let items = [];
let rainUntil = 0;

const glow = (() => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const g = canvas.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 252, 226, 1)");
  grad.addColorStop(0.35, "rgba(255, 224, 138, 0.55)");
  grad.addColorStop(1, "rgba(255, 224, 138, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return canvas;
})();

/* ===== API para sa parent ===== */
function burst(x, y, { count = 40, speed = 190 } = {}) {
  const total = props.reduced ? Math.ceil(count / 3) : count;
  for (let i = 0; i < total; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * rand(0.25, 1);
    const common = {
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - speed * 0.2,
      rot: rand(0, Math.PI * 2),
      spin: rand(-3, 3),
      age: 0,
    };
    if (Math.random() < 0.35) {
      items.push({ ...common, type: "spark", size: rand(6, 13), life: rand(1.0, 2.0) });
    } else {
      items.push({
        ...common,
        type: "petal",
        size: rand(7, 13),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        flip: rand(0, Math.PI * 2),
        phase: rand(0, Math.PI * 2),
        life: rand(1.8, 3.0),
        rain: false,
      });
    }
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
  if (now < rainUntil && items.length < 220 && Math.random() < 0.55) {
    items.push({
      type: "petal",
      rain: true,
      x: rand(0, width),
      y: -16,
      vx: rand(-12, 28),
      vy: rand(40, 90),
      size: rand(8, 14),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: rand(0, Math.PI * 2),
      spin: rand(-2, 2),
      flip: rand(0, Math.PI * 2),
      phase: rand(0, Math.PI * 2),
      life: 9,
      age: 0,
    });
  }
  items.forEach((item) => {
    item.age += dt;
    item.rot += item.spin * dt;
    if (item.type === "spark") {
      item.vy += 80 * dt;
      item.vx *= 1 - 1.4 * dt;
      item.vy *= 1 - 1.1 * dt;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
    } else if (item.rain) {
      item.x += (item.vx + Math.sin(item.age * 1.6 + item.phase) * 30) * dt;
      item.y += item.vy * dt;
    } else {
      item.vx *= 1 - 1.2 * dt;
      item.vy = item.vy * (1 - 0.8 * dt) + 60 * dt;
      item.x += (item.vx + Math.sin(item.age * 3 + item.phase) * 14) * dt;
      item.y += item.vy * dt;
    }
  });
  items = items.filter((item) => item.age < item.life && item.y < height + 30);
}

function star(s) {
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0);
  ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s);
  ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0);
  ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s);
  ctx.fill();
}

function draw(t) {
  ctx.clearRect(0, 0, width, height);
  items.forEach((item) => {
    if (item.type === "spark") {
      const fade = Math.max(0, 1 - item.age / item.life);
      ctx.globalAlpha = fade * (0.65 + 0.35 * Math.sin(item.age * 18 + item.rot * 4));
      const g = item.size * 3;
      ctx.drawImage(glow, item.x - g / 2, item.y - g / 2, g, g);
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rot);
      ctx.fillStyle = "#fffbe8";
      star(item.size * 0.5);
      ctx.restore();
    } else {
      const fade = Math.max(0, Math.min(1, (item.life - item.age) / 1.2));
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rot);
      ctx.scale(0.5 + 0.5 * Math.abs(Math.cos(t * 1.6 + item.flip)), 1);
      ctx.globalAlpha = 0.92 * fade;
      ctx.fillStyle = item.color;
      ctx.strokeStyle = "rgba(190, 120, 140, 0.35)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, item.size * 0.5, item.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  });
  ctx.globalAlpha = 1;
}

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  update(dt, performance.now() / 1000);
  draw(now / 1000);
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
.petal-fx {
  position: absolute;
  z-index: 20;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>