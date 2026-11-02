<template>
  <!-- BACKDROP: bukirin sa tagsibol. Nagbabago ang langit at kulay ng mga burol ayon sa mood
       (morning → noon → golden → dusk). May araw, mga ulap, tatlong layer ng burol at lumulutang na pollen. -->
  <div class="mb" :class="`m-${mood}`" aria-hidden="true">
    <span class="sky morning" />
    <span class="sky noon" />
    <span class="sky golden" />
    <span class="sky dusk" />
    <span class="sun" />
    <span v-for="c in clouds" :key="c.id" class="cloud" :style="c.style" />
    <div class="hills">
      <svg v-for="n in 3" :key="n" class="hill" :class="`h${n}`" viewBox="0 0 600 120" preserveAspectRatio="none">
        <path :d="HILLS[n - 1]" />
      </svg>
    </div>
    <span v-for="p in pollen" :key="p.id" class="pollen" :style="p.style" />
  </div>
</template>

<script setup>
defineProps({
  mood: { type: String, default: "morning" }, // morning | noon | golden | dusk
});

const HILLS = [
  "M0 70 Q120 10 260 50 T520 40 T600 55 V120 H0Z",
  "M0 60 Q150 20 300 60 T600 45 V120 H0Z",
  "M0 45 Q100 10 220 40 T450 35 T600 50 V120 H0Z",
];

const clouds = [
  { id: 0, top: 9, w: 120, dur: 70, delay: -10 },
  { id: 1, top: 20, w: 90, dur: 95, delay: -48 },
  { id: 2, top: 31, w: 140, dur: 120, delay: -80 },
].map((c) => ({
  id: c.id,
  style: { top: `${c.top}%`, width: `${c.w}px`, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` },
}));

const pollen = Array.from({ length: 20 }, (_, id) => {
  const size = 3 + Math.random() * 6;
  return {
    id,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${30 + Math.random() * 60}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${6 + Math.random() * 8}s`,
      animationDelay: `${-Math.random() * 12}s`,
    },
  };
});
</script>

<style scoped>
.mb {
  --c1: #a8dba0;
  --c2: #7cc486;
  --c3: #4faa6a;
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  background: #bfe9ff;
}
.m-noon {
  --c1: #9bd98c;
  --c2: #6cc07a;
  --c3: #3e9f58;
}
.m-golden {
  --c1: #c9d98a;
  --c2: #9cc46a;
  --c3: #6aa84a;
}
.m-dusk {
  --c1: #c7c58a;
  --c2: #9aa867;
  --c3: #6c8d52;
}

/* ===== Langit ===== */
.sky {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.8s ease;
}
.sky.morning {
  background: linear-gradient(180deg, #bfe9ff 0%, #e8f8f0 55%, #fff6dc 100%);
}
.sky.noon {
  background: linear-gradient(180deg, #8fd3f4 0%, #d4f1fb 55%, #f2fbe9 100%);
}
.sky.golden {
  background: linear-gradient(180deg, #ffd9a8 0%, #ffe9c4 50%, #f9f3d8 100%);
}
.sky.dusk {
  background: linear-gradient(180deg, #c9b6f2 0%, #ffb4a2 45%, #ffe3b8 100%);
}
.m-morning .sky.morning,
.m-noon .sky.noon,
.m-golden .sky.golden,
.m-dusk .sky.dusk {
  opacity: 1;
}

.sun {
  position: absolute;
  top: 8%;
  right: 12%;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: radial-gradient(circle, #fffbe0 0 38%, #ffe27a 62%, rgb(255 226 122 / 0) 74%);
  transition: top 1.8s ease, right 1.8s ease, filter 1.8s ease;
  translate: calc(var(--px, 0) * -6px) calc(var(--py, 0) * -4px);
}
.m-golden .sun {
  top: 20%;
  right: 20%;
  filter: hue-rotate(-15deg) saturate(1.3);
}
.m-dusk .sun {
  top: 34%;
  right: 30%;
  filter: hue-rotate(-30deg) saturate(1.6);
}

.cloud {
  position: absolute;
  left: -200px;
  height: 34px;
  border-radius: 30px;
  background: #fff;
  opacity: 0.85;
  animation: cloud-drift linear infinite;
}
.cloud::before,
.cloud::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  background: #fff;
}
.cloud::before {
  top: -18px;
  left: 18px;
  width: 52px;
  height: 52px;
}
.cloud::after {
  top: -26px;
  left: 54px;
  width: 46px;
  height: 46px;
}

/* ===== Mga burol ===== */
.hills {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 46%;
  translate: calc(var(--px, 0) * -8px) 0;
}
.hill {
  position: absolute;
  left: -3%;
  bottom: 0;
  width: 106%;
}
.hill path {
  transition: fill 1.8s ease;
}
.h1 {
  height: 100%;
}
.h1 path {
  fill: var(--c1);
}
.h2 {
  height: 74%;
}
.h2 path {
  fill: var(--c2);
}
.h3 {
  height: 52%;
}
.h3 path {
  fill: var(--c3);
}

.pollen {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 240 150 / 0.95), rgb(255 240 150 / 0) 70%);
  animation: pollen-drift ease-in-out infinite alternate;
}

@keyframes cloud-drift {
  to {
    translate: 130vw 0;
  }
}
@keyframes pollen-drift {
  from {
    opacity: 0.2;
    transform: translate(0, 0);
  }
  50% {
    opacity: 0.95;
  }
  to {
    opacity: 0.1;
    transform: translate(16px, -40px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .cloud,
  .pollen {
    animation: none;
  }
}
</style>