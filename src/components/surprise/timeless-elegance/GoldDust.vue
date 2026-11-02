<template>
  <canvas ref="canvasEl" class="gold-dust" aria-hidden="true" />
</template>

<script setup>
/* GOLD DUST + PETALS sa iisang canvas: kumikislap na gintong bituin (burst) at bumabagsak na puting petals (petals).
   Kontrolado ng parent gamit ang burst / petals / reset. */
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  reduced: { type: Boolean, default: false },
});

const canvasEl = ref(null);
const rand = (min, max) => min + Math.random() * (max - min);

let ctx = null;
let width = 0;
let height = 0;
let frame = 0;
let last = 0;
let observer = null;
let items = [];
let petalUntil = 0;

/* sprite ng kinang: iginuguhit isang beses lang */
const glow = makeGlowSprite();

function makeGlowSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const g = canvas.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 246, 208, 1)");
  grad.addColorStop(0.3, "rgba(236, 196, 100, 0.7)");
  grad.addColorStop(1, "rgba(200, 150, 60, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return canvas;
}

/* ===== API para sa parent ===== */
function burst(x, y, { count = 40, speed = 200 } = {}) {
  const total = props.reduced ? Math.ceil(count / 3) : count;
  for (let i = 0; i < total; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * rand(0.25, 1);
    const life = rand(1.1, 2.2);
    items.push({
      type: "spark",
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - speed * 0.25,
      size: rand(6, 14),
      rot: rand(0, Math.PI),
      spin: rand(-3, 3),
      life,
      age: 0,
    });
  }
}

function petals(seconds = 3) {
  petalUntil = performance.now() / 1000 + (props.reduced ? seconds / 3 : seconds);
}

function reset() {
  items = [];
  petalUntil = 0;
}

defineExpose({ burst, petals, reset });

/* ===== Galaw bawat frame ===== */
function update(dt, now) {
  if (now < petalUntil && items.length < 220 && Math.random() < 0.55) {
    items.push({
      type: "petal",
      x: rand(0, width),
      y: -16,
      vx: rand(-12, 28),
      vy: rand(40, 90),
      size: rand(8, 14),
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
    if (item.type === "spark") {
      item.vy += 90 * dt;
      item.vx *= 1 - 1.4 * dt;
      item.vy *= 1 - 1.1 * dt;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.rot += item.spin * dt;
    } else {
      item.x += (item.vx + Math.sin(item.age * 1.6 + item.phase) * 30) * dt;
      item.y += item.vy * dt;
      item.rot += item.spin * dt;
    }
  });
  items = items.filter((item) => item.age < item.life && item.y < height + 30);
}

function star(s) {
  // apat-na-dulong bituin
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
      const twinkle = 0.65 + 0.35 * Math.sin(item.age * 18 + item.rot * 4);
      ctx.globalAlpha = fade * twinkle;
      const g = item.size * 3;
      ctx.drawImage(glow, item.x - g / 2, item.y - g / 2, g, g);
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rot);
      ctx.fillStyle = "#fff8dc";
      star(item.size * 0.55);
      ctx.restore();
    } else {
      const fade = Math.min(1, (item.life - item.age) / 1.2);
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rot);
      ctx.scale(0.5 + 0.5 * Math.abs(Math.cos(t * 1.4 + item.flip)), 1);
      ctx.globalAlpha = 0.92 * fade;
      ctx.fillStyle = "#fffaf3";
      ctx.strokeStyle = "rgba(200, 170, 130, 0.5)";
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
.gold-dust {
  position: absolute;
  z-index: 20;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>