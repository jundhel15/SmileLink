<template>
  <!-- SANGA NG SAKURA sa dalawang kanto sa itaas (kanan = naka-mirror) -->
  <div class="branches" aria-hidden="true">
    <svg class="svg-defs" width="0" height="0">
      <symbol id="sn-blossom" viewBox="-10 -10 20 20">
        <ellipse
          v-for="angle in [0, 72, 144, 216, 288]"
          :key="angle"
          cx="0"
          cy="-4.8"
          rx="3.6"
          ry="5"
          fill="#f9c8dc"
          stroke="#eda3c2"
          stroke-width="0.5"
          :transform="`rotate(${angle})`"
        />
        <circle r="1.8" fill="#f5dc9a" />
      </symbol>
    </svg>
    <div v-for="side in ['left', 'right']" :key="side" class="branch-wrap" :class="side">
      <svg class="branch" viewBox="0 0 200 150">
        <g fill="none" stroke="#2f1d3d" stroke-linecap="round">
          <path d="M-10 18C40 28 82 46 156 44" stroke-width="6" />
          <path d="M58 34c18 22 30 40 58 54" stroke-width="3.5" />
          <path d="M104 44c18-14 38-24 70-28" stroke-width="3" />
          <path d="M28 24c10 22 22 38 42 48" stroke-width="2.5" />
          <path d="M116 88c10 8 18 18 22 30" stroke-width="2" />
        </g>
        <use
          v-for="(b, index) in blossoms"
          :key="index"
          href="#sn-blossom"
          :x="b.x - b.s / 2"
          :y="b.y - b.s / 2"
          :width="b.s"
          :height="b.s"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
// x, y = puwesto ng bulaklak sa sanga; s = laki
const blossoms = [
  { x: 40, y: 28, s: 16 },
  { x: 70, y: 72, s: 18 },
  { x: 88, y: 76, s: 13 },
  { x: 116, y: 88, s: 18 },
  { x: 138, y: 118, s: 15 },
  { x: 132, y: 40, s: 17 },
  { x: 156, y: 44, s: 20 },
  { x: 174, y: 16, s: 16 },
  { x: 150, y: 24, s: 12 },
  { x: 60, y: 34, s: 12 },
  { x: 100, y: 58, s: 11 },
];
</script>

<style scoped>
.branches {
  position: absolute;
  z-index: 3;
  inset: 0;
  pointer-events: none;
  transform: translate3d(calc(var(--px, 0) * 10px), calc(var(--py, 0) * 6px), 0);
}
.svg-defs {
  position: absolute;
}
.branch-wrap {
  position: absolute;
  top: -10px;
  /* may puwang sa gitna para sa buwan; hindi lumalaki nang sobra sa malapad na screen */
  width: min(48%, 240px);
}
.branch-wrap.left {
  left: -10px;
}
.branch-wrap.right {
  right: -10px;
  transform: scaleX(-1);
}
.branch {
  display: block;
  width: 100%;
  overflow: visible;
  transform-origin: 0 0;
  filter: drop-shadow(0 4px 10px rgb(10 6 30 / 0.45));
  animation: sway 7s ease-in-out infinite alternate;
}
.right .branch {
  animation-duration: 8.5s;
  animation-delay: -2s;
}

@keyframes sway {
  from {
    transform: rotate(-1.5deg);
  }
  to {
    transform: rotate(1.5deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .branch {
    animation: none;
  }
}
</style>
