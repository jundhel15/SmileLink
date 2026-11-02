<template>
  <canvas ref="canvasEl" class="ocean-fx" aria-hidden="true" />
</template>

<script setup>
/* OCEAN FX sa iisang canvas: bumubulwak na bula at kislap (burst) at umaakyat na mga parol (lanterns).
   Kontrolado ng parent gamit ang burst / lanterns / reset. */
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
let lanternUntil = 0;

function makeGlow(core, edge) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const g = canvas.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${core}, 1)`);
  grad.addColorStop(0.35, `rgba(${edge}, 0.55)`);
  grad.addColorStop(1, `rgba(${edge}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return canvas;
}
const glow = makeGlow("255, 252, 232", "170, 235, 245");
const warm = makeGlow("255, 226, 170", "255, 150, 70");

/* ===== API para sa parent ===== */
function burst(x, y, { count = 40, speed = 190 } = {}) {
  const total = props.reduced ? Math.ceil(count / 3) : count;
  for (let i = 0; i < total; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * rand(0.25, 1);
    if (Math.random() < 0.4) {
      items.push({
        type: "spark",
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - speed * 0.2,
        size: rand(6, 13),
        rot: rand(0, Math.PI),
        spin: rand(-3, 3),
        life: rand(1.0, 2.0),
        age: 0,
      });
    } else {
      items.push({
        type: "bubble",
        x,
        y,
        vx: Math.cos(angle) * velocity * 0.7,
        vy: Math.sin(angle) * velocity * 0.7 - speed * 0.15,
        r: rand(3, 9),
        wob: rand(0, Math.PI * 2),
        life: rand(1.4, 2.6),
        age: 0,
      });
    }
  }
}

function lanterns(seconds = 5) {
  lanternUntil = performance.now() / 1000 + (props.reduced ? seconds / 3 : seconds);
}

function reset() {
  items = [];
  lanternUntil = 0;
}

defineExpose({ burst, lanterns, reset });

/* ===== Galaw bawat frame ===== */
function update(dt, now) {
  if (now < lanternUntil && items.length < 160 && Math.random() < 0.09) {
    items.push({
      type: "lantern",
      x: rand(width * 0.08, width * 0.92),
      y: height + 30,
      vy: -rand(40, 75),
      wob: rand(0, Math.PI * 2),
      size: rand(18, 30),
      life: 14,
      age: 0,
    });
  }
  items.forEach((item) => {
    item.age += dt;
    if (item.type === "spark") {
      item.vy += 80 * dt;
      item.vx *= 1 - 1.4 * dt;
      item.vy *= 1 - 1.1 * dt;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.rot += item.spin * dt;
    } else if (item.type === "bubble") {
      item.vx *= 1 - 1.8 * dt;
      item.vy += -45 * dt;
      item.vy *= 1 - 0.6 * dt;
      item.x += (item.vx + Math.sin(item.age * 5 + item.wob) * 14) * dt;
      item.y += item.vy * dt;
    } else {
      item.x += Math.sin(item.age * 1.1 + item.wob) * 16 * dt;
      item.y += item.vy * dt;
    }
  });
  items = items.filter((item) => item.age < item.life && item.y > -80 && item.y < height + 60);
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

function draw() {
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
      ctx.fillStyle = "#ffffff";
      star(item.size * 0.5);
      ctx.restore();
    } else if (item.type === "bubble") {
      const fade = Math.min(1, (item.life - item.age) / 0.8);
      ctx.globalAlpha = 0.85 * Math.max(0, fade);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(item.x - item.r * 0.35, item.y - item.r * 0.35, item.r * 0.22, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const fade = Math.min(1, item.age / 0.8) * Math.max(0, Math.min(1, (item.life - item.age) / 1.5));
      ctx.globalAlpha = fade;
      const g = item.size * 4;
      ctx.drawImage(warm, item.x - g / 2, item.y - g / 2, g, g);
      const w = item.size * 0.8;
      const h = item.size;
      ctx.fillStyle = "#ffb866";
      ctx.fillRect(item.x - w / 2, item.y - h / 2, w, h);
      ctx.fillStyle = "#c2763a";
      ctx.fillRect(item.x - w / 2, item.y - h / 2, w, h * 0.12);
      ctx.fillStyle = "#fff2c4";
      ctx.fillRect(item.x - w * 0.22, item.y - h * 0.18, w * 0.44, h * 0.4);
    }
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
.ocean-fx {
  position: absolute;
  z-index: 20;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>