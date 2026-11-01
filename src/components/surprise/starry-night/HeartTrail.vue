<template>
  <!-- PUSO na iginuguhit ng liwanag + sparkle na umiikot sa gilid nito -->
  <div class="heart" :class="{ pulsing }" :style="{ width: `${size}px`, height: `${size}px`, '--boost': boost }">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="sn-heart-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff3f8" />
          <stop offset="0.55" stop-color="#f4bcd6" />
          <stop offset="1" stop-color="#e2b07e" />
        </linearGradient>
      </defs>
      <path class="heart-glow" :d="HEART" />
      <path class="heart-line" :d="HEART" pathLength="1" />
      <circle class="spark" r="2.2">
        <animateMotion dur="6s" repeatCount="indefinite" :path="HEART" />
      </circle>
    </svg>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";

// boost = 0–1, lumalakas ang liwanag habang may nahahanap na wish
defineProps({
  size: { type: Number, default: 130 },
  boost: { type: Number, default: 0 },
});

const HEART =
  "M50 84C22 64 10 46 14 32 18 18 38 14 50 30 62 14 82 18 86 32 90 46 78 64 50 84Z";

const pulsing = ref(false);
let pulseTimer = 0;

function pulse() {
  pulsing.value = false;
  clearTimeout(pulseTimer);
  requestAnimationFrame(() => {
    pulsing.value = true;
    pulseTimer = setTimeout(() => (pulsing.value = false), 900);
  });
}

defineExpose({ pulse });
onBeforeUnmount(() => clearTimeout(pulseTimer));
</script>

<style scoped>
.heart svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.heart-glow {
  fill: rgb(244 170 208 / calc(0.04 + var(--boost) * 0.16));
  stroke: #f4aad0;
  stroke-width: 6;
  opacity: calc(0.18 + var(--boost) * 0.5);
  filter: blur(4px);
  transition: opacity 1s ease, fill 1s ease;
}
.heart-line {
  fill: none;
  stroke: url(#sn-heart-line);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 3.2s cubic-bezier(0.45, 0, 0.2, 1) 0.6s forwards;
}
.spark {
  fill: #fffaf0;
  filter: drop-shadow(0 0 3px #fff) drop-shadow(0 0 6px #f4aad0);
  opacity: 0;
  animation: fade-in 1s ease 3.4s forwards;
}
.heart.pulsing {
  animation: pulse 0.9s ease;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes fade-in {
  to {
    opacity: 1;
  }
}
@keyframes pulse {
  40% {
    transform: scale(1.12);
    filter: drop-shadow(0 0 18px rgb(244 170 208 / 0.8));
  }
}
@media (prefers-reduced-motion: reduce) {
  .heart-line {
    animation-duration: 0.6s;
    animation-delay: 0s;
  }
  .spark {
    animation-delay: 0.6s;
  }
}
</style>
