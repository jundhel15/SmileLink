<template>
  <!-- BACKDROP: ivory na may malambot na sinag mula sa itaas-kaliwa, manipis na gintong frame,
       sanga ng olive/sage na may puting bulaklak sa dalawang kanto, at lumulutang na gintong alikabok. -->
  <div class="backdrop" aria-hidden="true">
    <span class="rays" />
    <span class="frame" />
    <div class="foliage">
      <div v-for="side in ['tl', 'br']" :key="side" class="branch-wrap" :class="side">
        <svg class="branch" viewBox="0 0 220 200">
          <path class="stem" d="M-10 -6C50 20 100 60 140 132" />
          <path
            v-for="(leaf, i) in leaves"
            :key="`l${i}`"
            d="M0 0C8-9 24-9 34 0 24 9 8 9 0 0Z"
            :fill="LEAF_COLORS[leaf.c]"
            :transform="`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(${leaf.s})`"
          />
          <g v-for="(f, i) in flowers" :key="`f${i}`" :transform="`translate(${f.x} ${f.y}) scale(${f.s})`">
            <ellipse
              v-for="a in [0, 72, 144, 216, 288]"
              :key="a"
              cx="0"
              cy="-5"
              rx="3.8"
              ry="5.6"
              fill="#fffdf8"
              stroke="#e5d8bd"
              stroke-width="0.5"
              :transform="`rotate(${a})`"
            />
            <circle r="1.7" fill="#d9b46a" />
          </g>
        </svg>
      </div>
    </div>
    <span v-for="d in dust" :key="d.id" class="dust" :style="d.style" />
  </div>
</template>

<script setup>
const LEAF_COLORS = ["#8d9c7d", "#a7b394"];

// x, y = puwesto sa sanga; r = ikot; s = laki; c = kulay
const leaves = [
  { x: 30, y: 14, r: -20, s: 1, c: 0 },
  { x: 30, y: 14, r: 70, s: 0.9, c: 1 },
  { x: 58, y: 30, r: -10, s: 1.1, c: 1 },
  { x: 58, y: 30, r: 85, s: 1, c: 0 },
  { x: 84, y: 48, r: 5, s: 1.1, c: 0 },
  { x: 84, y: 48, r: 100, s: 1, c: 1 },
  { x: 108, y: 74, r: 20, s: 1, c: 1 },
  { x: 108, y: 74, r: 115, s: 1.1, c: 0 },
  { x: 126, y: 100, r: 30, s: 0.9, c: 0 },
  { x: 126, y: 100, r: 125, s: 1, c: 1 },
  { x: 140, y: 128, r: 60, s: 0.9, c: 1 },
  { x: 140, y: 128, r: 150, s: 0.8, c: 0 },
];
const flowers = [
  { x: 46, y: 42, s: 2.2 },
  { x: 96, y: 66, s: 2.8 },
  { x: 118, y: 112, s: 2 },
  { x: 70, y: 18, s: 1.7 },
  { x: 134, y: 82, s: 1.6 },
];

const dust = Array.from({ length: 22 }, (_, id) => {
  const size = 3 + Math.random() * 7;
  return {
    id,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${6 + Math.random() * 8}s`,
      animationDelay: `${-Math.random() * 12}s`,
    },
  };
});
</script>

<style scoped>
.backdrop {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 38%, #fffaf0 0%, #f6eddc 58%, #e8dac0 100%);
}
.rays {
  position: absolute;
  inset: -20%;
  background: conic-gradient(
    from 160deg at 0% 0%,
    rgb(255 246 222 / 0.7),
    transparent 9%,
    rgb(255 246 222 / 0.45) 14%,
    transparent 24%,
    rgb(255 246 222 / 0.35) 30%,
    transparent 40%
  );
  animation: shimmer 9s ease-in-out infinite alternate;
}
.frame {
  position: absolute;
  inset: 10px;
  border: 1px solid rgb(184 145 79 / 0.5);
  outline: 1px solid rgb(184 145 79 / 0.22);
  outline-offset: 4px;
  pointer-events: none;
}
.foliage {
  position: absolute;
  inset: 0;
  transform: translate3d(calc(var(--px, 0) * 8px), calc(var(--py, 0) * 5px), 0);
}
.branch-wrap {
  position: absolute;
  width: min(42%, 210px);
}
.branch-wrap.tl {
  top: -8px;
  left: -8px;
}
.branch-wrap.br {
  right: -8px;
  bottom: -8px;
  transform: scale(-1, -1);
}
.branch {
  display: block;
  width: 100%;
  overflow: visible;
  transform-origin: 0 0;
  filter: drop-shadow(0 4px 8px rgb(80 70 40 / 0.25));
  animation: sway 8s ease-in-out infinite alternate;
}
.br .branch {
  animation-duration: 10s;
  animation-delay: -3s;
}
.stem {
  fill: none;
  stroke: #6f7f60;
  stroke-width: 3;
  stroke-linecap: round;
}
.dust {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(236 200 110 / 0.95), rgb(236 200 110 / 0) 70%);
  animation: drift ease-in-out infinite alternate;
}

@keyframes shimmer {
  to {
    opacity: 0.55;
    transform: scale(1.06);
  }
}
@keyframes sway {
  from {
    transform: rotate(-1.4deg);
  }
  to {
    transform: rotate(1.4deg);
  }
}
@keyframes drift {
  from {
    opacity: 0.15;
    transform: translate(0, 0);
  }
  50% {
    opacity: 0.95;
  }
  to {
    opacity: 0.1;
    transform: translate(14px, -46px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .rays,
  .branch,
  .dust {
    animation: none;
  }
}
</style>