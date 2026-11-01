<template>
  <canvas ref="canvasEl" class="particles" aria-hidden="true" />
</template>

<script setup>
/* PARTICLES ng Starry Night: sakura petals + magical dust sa iisang canvas (mas magaan kaysa DOM).
   Kontrolado ng parent gamit ang mga exposed na function (burst, gatherTo, dissolve, vortex, reset). */
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
let petals = [];
let dust = [];
let mode = "fall"; // fall → gather → gone
const target = { x: 0, y: 0 };
const vortex = { active: false, release: 0, x: 0, y: 0 };

const petalCount = () => (props.reduced ? 10 : 26);
const ambientCount = () => (props.reduced ? 14 : 36);

/* sprite na iginuguhit isang beses lang, tapos kino-copy na lang bawat frame */
const petalSprite = makePetalSprite();
const dustSprite = makeDustSprite();

function makePetalSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 48;
  const g = canvas.getContext("2d");
  g.translate(24, 24);
  const grad = g.createLinearGradient(0, -20, 0, 20);
  grad.addColorStop(0, "#fff2f7");
  grad.addColorStop(0.6, "#f7bcd4");
  grad.addColorStop(1, "#e88bb1");
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, 20);
  g.bezierCurveTo(-18, 8, -14, -16, -4, -20);
  g.lineTo(0, -14);
  g.lineTo(4, -20);
  g.bezierCurveTo(14, -16, 18, 8, 0, 20);
  g.fill();
  return canvas;
}

function makeDustSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const g = canvas.getContext("2d");
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(255, 252, 240, 1)");
  grad.addColorStop(0.25, "rgba(246, 214, 255, 0.75)");
  grad.addColorStop(1, "rgba(190, 150, 240, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return canvas;
}

function newPetal(fromTop) {
  return {
    x: rand(-10, width + 10),
    y: fromTop ? rand(-60, -10) : rand(0, height),
    vx: 0,
    vy: 0,
    size: rand(7, 13),
    rot: rand(0, Math.PI * 2),
    vr: rand(-1.2, 1.2),
    fall: rand(16, 32),
    sway: rand(0.6, 1.4),
    phase: rand(0, Math.PI * 2),
    flip: rand(0, Math.PI * 2),
    alpha: rand(0.65, 0.95),
  };
}

function newAmbient() {
  const life = rand(4, 9);
  return {
    ambient: true,
    x: rand(0, width),
    y: rand(height * 0.15, height),
    vx: rand(-4, 4),
    vy: rand(-10, -3),
    life,
    max: life,
    size: rand(1.2, 2.6),
    drag: 0,
    phase: rand(0, Math.PI * 2),
  };
}

function seedPetals() {
  petals = Array.from({ length: petalCount() }, () => newPetal(false));
}

/* ===== API para sa parent ===== */
function burst(x, y, { count = 24, speed = 80, life = 1.4, size = 1 } = {}) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * rand(0.3, 1);
    const span = life * rand(0.6, 1);
    dust.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: span,
      max: span,
      size: size * rand(2, 4.5),
      drag: 1.6,
    });
  }
}

function gatherTo(x, y) {
  mode = "gather";
  target.x = x;
  target.y = y;
}

// bawat petal ay nagiging alikabok na liwanag
function dissolve() {
  petals.forEach((petal) => {
    for (let i = 0; i < 6; i++) {
      const span = rand(1.2, 2.2);
      dust.push({
        x: petal.x + rand(-6, 6),
        y: petal.y + rand(-6, 6),
        vx: rand(-20, 20),
        vy: rand(-20, 20),
        life: span,
        max: span,
        size: rand(1.6, 3.2),
        drag: 0.8,
      });
    }
  });
  petals = [];
  mode = "gone";
}

function startVortex(x, y) {
  vortex.active = true;
  vortex.x = x;
  vortex.y = y;
}

function releaseVortex() {
  vortex.active = false;
  vortex.release = 1.2;
}

function reset() {
  mode = "fall";
  vortex.active = false;
  vortex.release = 0;
  dust = [];
  seedPetals();
}

defineExpose({ burst, gatherTo, dissolve, startVortex, releaseVortex, reset });

/* ===== Galaw bawat frame ===== */
function update(dt, t) {
  petals.forEach((p) => {
    if (mode === "gather") {
      // spring papunta sa gitna + konting ikot para parang ipo-ipo
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      p.vx += (dx * 1.4 - dy * 0.9) * dt;
      p.vy += (dy * 1.4 + dx * 0.9) * dt;
      p.vx *= 1 - 1.6 * dt;
      p.vy *= 1 - 1.6 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * 3 * dt;
      return;
    }
    p.x += (Math.sin(t * p.sway + p.phase) * 18 + 6) * dt;
    p.y += p.fall * dt;
    p.rot += p.vr * dt;
    if (p.y > height + 20) Object.assign(p, newPetal(true));
    if (p.x > width + 20) p.x = -20;
  });

  dust.forEach((d) => {
    if (vortex.active || vortex.release > 0) {
      const dx = vortex.x - d.x;
      const dy = vortex.y - d.y;
      const dist = Math.max(20, Math.hypot(dx, dy));
      if (vortex.active) {
        d.vx += ((-dy / dist) * 120 + (dx / dist) * 60) * dt;
        d.vy += ((dx / dist) * 120 + (dy / dist) * 60) * dt;
      } else {
        d.vx -= (dx / dist) * 260 * dt;
        d.vy -= (dy / dist) * 260 * dt;
      }
    }
    d.vx *= 1 - (d.drag || 0.4) * dt;
    d.vy *= 1 - (d.drag || 0.4) * dt;
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    d.life -= dt;
  });
  dust = dust.filter((d) => d.life > 0);
  vortex.release = Math.max(0, vortex.release - dt);

  let ambient = dust.reduce((sum, d) => sum + (d.ambient ? 1 : 0), 0);
  while (ambient < ambientCount()) {
    dust.push(newAmbient());
    ambient++;
  }
}

function draw(t) {
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  petals.forEach((p) => {
    const scale = p.size / 20;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    // pag-scale sa X = parang umiikot ang petal sa hangin
    ctx.scale(scale * (0.45 + 0.55 * Math.abs(Math.cos(t * 1.3 + p.flip))), scale);
    ctx.globalAlpha = p.alpha;
    ctx.drawImage(petalSprite, -24, -24);
    ctx.restore();
  });

  ctx.globalCompositeOperation = "lighter";
  dust.forEach((d) => {
    const fade = d.ambient
      ? (0.35 + 0.35 * Math.sin(t * 2 + d.phase)) * Math.min(1, d.life, d.max - d.life)
      : d.life / d.max;
    const size = d.size * 4;
    ctx.globalAlpha = Math.max(0, fade);
    ctx.drawImage(dustSprite, d.x - size / 2, d.y - size / 2, size, size);
  });
  ctx.globalAlpha = 1;
}

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  update(dt, now / 1000);
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
  if (!petals.length && mode === "fall") seedPetals();
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
.particles {
  position: absolute;
  z-index: 4;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
