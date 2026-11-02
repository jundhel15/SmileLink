<template>
  <canvas ref="canvasEl" class="confetti" aria-hidden="true" />
</template>

<script setup>
/* CONFETTI sa iisang canvas (parihaba, bilog, puso). Kontrolado ng parent gamit ang burst / rain / reset. */
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  reduced: { type: Boolean, default: false },
});

const canvasEl = ref(null);
const COLORS = ["#ff7a7a", "#f4b942", "#2a9d8f", "#f78fb3", "#8e7dff", "#ffffff", "#5ec2f2"];
const rand = (min, max) => min + Math.random() * (max - min);

let ctx = null;
let width = 0;
let height = 0;
let frame = 0;
let last = 0;
let observer = null;
let pieces = [];
let rainUntil = 0;

function make(x, y, vx, vy) {
  const life = rand(2.2, 3.6);
  return {
    x,
    y,
    vx,
    vy,
    size: rand(6, 11),
    rot: rand(0, Math.PI * 2),
    vr: rand(-8, 8),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: Math.floor(Math.random() * 3),
    flip: rand(0, Math.PI * 2),
    life,
    age: 0,
  };
}

/* ===== API para sa parent ===== */
function burst(x, y, { count = 40, speed = 260 } = {}) {
  const total = props.reduced ? Math.ceil(count / 3) : count;
  for (let i = 0; i < total; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * rand(0.3, 1);
    pieces.push(make(x, y, Math.cos(angle) * velocity, Math.sin(angle) * velocity - speed * 0.4));
  }
}

function rain(seconds = 2.5) {
  rainUntil = performance.now() / 1000 + (props.reduced ? seconds / 3 : seconds);
}

function reset() {
  pieces = [];
  rainUntil = 0;
}

defineExpose({ burst, rain, reset });

/* ===== Galaw bawat frame ===== */
function update(dt, now) {
  if (now < rainUntil && pieces.length < 260) {
    for (let i = 0; i < 2; i++) pieces.push(make(rand(0, width), -12, rand(-40, 40), rand(80, 200)));
  }
  pieces.forEach((p) => {
    p.vy += 420 * dt;
    p.vx *= 1 - 1.3 * dt;
    p.vy *= 1 - 0.35 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    p.age += dt;
  });
  pieces = pieces.filter((p) => p.age < p.life && p.y < height + 24);
}

function heart(s) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s * 0.95, -s * 0.2, -s * 0.45, -s * 0.9, 0, -s * 0.3);
  ctx.bezierCurveTo(s * 0.45, -s * 0.9, s * 0.95, -s * 0.2, 0, s * 0.35);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  pieces.forEach((p) => {
    const fade = Math.min(1, (p.life - p.age) / 0.6);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, fade);
    ctx.fillStyle = p.color;
    if (p.shape === 0) {
      ctx.scale(1, Math.cos(p.flip + p.age * 6));
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
    } else if (p.shape === 1) {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      heart(p.size * 0.6);
    }
    ctx.restore();
  });
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
.confetti {
  position: absolute;
  z-index: 20;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>