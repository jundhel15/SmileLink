<template>
  <!-- BACKDROP: paglubog ng araw (gradient) + malaking araw sa ibaba + lumulutang na bokeh + manipis na grain ng papel -->
  <div class="backdrop" aria-hidden="true">
    <span class="sun" />
    <div class="bokeh-layer">
      <span v-for="b in bokeh" :key="b.id" class="bokeh" :style="b.style" />
    </div>
    <span class="grain" />
  </div>
</template>

<script setup>
const COLORS = ["255 244 214", "255 190 160", "255 150 180", "200 160 255", "255 226 150"];

const bokeh = Array.from({ length: 16 }, (_, id) => {
  const size = 30 + Math.random() * 90;
  return {
    id,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: `radial-gradient(circle, rgb(${COLORS[id % COLORS.length]} / 0.55), transparent 70%)`,
      animationDuration: `${9 + Math.random() * 10}s`,
      animationDelay: `${-Math.random() * 12}s`,
    },
  };
});
</script>

<style scoped>
.backdrop {
  position: absolute;
  z-index: 0;
  inset: -12px;
  overflow: hidden;
  background: linear-gradient(180deg, #ffe6c0 0%, #ffc7a3 36%, #f8a5b7 70%, #c98bc4 100%);
}
.sun {
  position: absolute;
  left: 50%;
  top: 82%;
  width: 130%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 248 220 / 0.95), rgb(255 205 150 / 0.45) 34%, transparent 64%);
  transform: translate(-50%, -50%);
  animation: breathe 7s ease-in-out infinite alternate;
}
.bokeh-layer {
  position: absolute;
  inset: 0;
  transform: translate3d(calc(var(--px, 0) * -10px), calc(var(--py, 0) * -6px), 0);
}
.bokeh {
  position: absolute;
  border-radius: 50%;
  animation: floaty ease-in-out infinite alternate;
}
.grain {
  position: absolute;
  inset: 0;
  opacity: 0.16;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .3 0 0 0 0 .2 0 0 0 0 .2 0 0 0 .5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

@keyframes breathe {
  to {
    transform: translate(-50%, -50%) scale(1.07);
    opacity: 0.85;
  }
}
@keyframes floaty {
  from {
    opacity: 0.35;
    transform: translateY(0) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(-28px) scale(1.12);
  }
}
@media (prefers-reduced-motion: reduce) {
  .sun,
  .bokeh {
    animation: none;
  }
}
</style>