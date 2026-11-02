<template>
  <!-- BACKDROP: malambot na rosas na langit na nagbabago ayon sa mood (rose → blush → peach → lilac → night).
       May glow, mga bituin sa gabi, mga lumulutang na puso at dalawang layer ng ulap sa ibaba. -->
  <div class="lb" :class="`m-${mood}`" aria-hidden="true">
    <span class="lb-sky rose" />
    <span class="lb-sky blush" />
    <span class="lb-sky peach" />
    <span class="lb-sky lilac" />
    <span class="lb-sky night" />
    <span class="lb-glow" />
    <span class="lb-stars"><i v-for="s in stars" :key="s.id" :style="s.style" /></span>
    <span v-for="h in hearts" :key="h.id" class="lb-heart" :style="h.style">♥</span>
    <div class="lb-clouds">
      <svg v-for="n in 2" :key="n" class="lb-cloud" :class="`c${n}`" viewBox="0 0 600 120" preserveAspectRatio="none">
        <path :d="CLOUDS[n - 1]" />
      </svg>
    </div>
  </div>
</template>

<script setup>
defineProps({
  mood: { type: String, default: "rose" }, // rose | blush | peach | lilac | night
});

const CLOUDS = [
  "M0 120 V78 Q20 40 60 62 Q85 20 130 52 Q170 22 205 58 Q245 30 285 62 Q320 28 365 58 Q405 26 440 60 Q480 32 520 60 Q560 40 600 70 V120Z",
  "M0 120 V90 Q30 58 70 78 Q110 44 150 76 Q195 50 235 80 Q280 52 325 82 Q370 56 415 82 Q465 54 505 82 Q550 62 600 86 V120Z",
];

const HEART_COLORS = ["#ff8fab", "#ff5c8a", "#ffffff", "#ffb3c7", "#ffd166"];
const hearts = Array.from({ length: 16 }, (_, id) => ({
  id,
  style: {
    left: `${Math.random() * 100}%`,
    fontSize: `${10 + Math.random() * 16}px`,
    color: HEART_COLORS[id % HEART_COLORS.length],
    animationDuration: `${14 + Math.random() * 12}s`,
    animationDelay: `${-Math.random() * 24}s`,
  },
}));

const stars = Array.from({ length: 36 }, (_, id) => {
  const size = 1.5 + Math.random() * 2.5;
  return {
    id,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 62}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${2 + Math.random() * 3}s`,
      animationDelay: `${-Math.random() * 4}s`,
    },
  };
});
</script>

<style scoped>
.lb {
  --cl1: rgb(255 255 255 / 0.8);
  --cl2: rgb(255 236 244 / 0.95);
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  background: #ffc2d4;
}
.m-night {
  --cl1: rgb(255 190 215 / 0.28);
  --cl2: rgb(255 170 205 / 0.4);
}

/* ===== Langit ===== */
.lb-sky {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.8s ease;
}
.lb-sky.rose {
  background: linear-gradient(160deg, #ffe3ec 0%, #ffc2d4 55%, #ff9fbd 100%);
}
.lb-sky.blush {
  background: linear-gradient(160deg, #fff0f4 0%, #ffd6e2 60%, #ffb8cc 100%);
}
.lb-sky.peach {
  background: linear-gradient(160deg, #fff1e0 0%, #ffd5bf 55%, #ffb3a7 100%);
}
.lb-sky.lilac {
  background: linear-gradient(160deg, #f3e3ff 0%, #ffcfe3 55%, #ffa6c9 100%);
}
.lb-sky.night {
  background: linear-gradient(170deg, #2b1745 0%, #5a2a63 50%, #b8527f 100%);
}
.m-rose .lb-sky.rose,
.m-blush .lb-sky.blush,
.m-peach .lb-sky.peach,
.m-lilac .lb-sky.lilac,
.m-night .lb-sky.night {
  opacity: 1;
}

.lb-glow {
  position: absolute;
  top: -8%;
  left: -10%;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 0.7), rgb(255 255 255 / 0) 65%);
  transition: left 1.8s ease, top 1.8s ease, opacity 1.8s ease;
  translate: calc(var(--px, 0) * -10px) calc(var(--py, 0) * -8px);
}
.m-peach .lb-glow {
  left: 30%;
  top: -14%;
}
.m-lilac .lb-glow {
  left: 40%;
  top: 4%;
}
.m-night .lb-glow {
  left: 20%;
  top: 8%;
  opacity: 0.35;
}

.lb-stars {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.8s ease;
}
.m-night .lb-stars {
  opacity: 1;
}
.lb-stars i {
  position: absolute;
  border-radius: 50%;
  background: #fff7d6;
  animation: lb-twinkle ease-in-out infinite alternate;
}

.lb-heart {
  position: absolute;
  bottom: -30px;
  opacity: 0;
  animation: lb-rise linear infinite;
}

/* ===== Ulap ===== */
.lb-clouds {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 22%;
  translate: calc(var(--px, 0) * -10px) 0;
}
.lb-cloud {
  position: absolute;
  left: -3%;
  bottom: 0;
  width: 106%;
}
.lb-cloud path {
  transition: fill 1.8s ease;
}
.lb-cloud.c1 {
  height: 100%;
}
.lb-cloud.c1 path {
  fill: var(--cl1);
}
.lb-cloud.c2 {
  height: 70%;
}
.lb-cloud.c2 path {
  fill: var(--cl2);
}

@keyframes lb-twinkle {
  from {
    opacity: 0.25;
  }
  to {
    opacity: 1;
  }
}
@keyframes lb-rise {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(-8deg);
  }
  15% {
    opacity: 0.7;
  }
  85% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
    transform: translateY(-110vh) rotate(10deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .lb-heart,
  .lb-stars i {
    animation: none;
  }
  .lb-heart {
    opacity: 0.3;
    bottom: 30%;
  }
}
</style>