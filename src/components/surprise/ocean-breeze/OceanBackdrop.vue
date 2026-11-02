<template>
  <!-- BACKDROP: nagbabago ang langit at dagat ayon sa mood (day → deep → dusk → night).
       May araw/buwan, bituin, sinag sa ilalim ng tubig, bula, at tatlong layer ng alon. -->
  <div class="bd" :class="`m-${mood}`" aria-hidden="true">
    <span class="sky day" />
    <span class="sky dusk" />
    <span class="sky night" />
    <span class="sky deep" />
    <span class="sun" />
    <span class="moon" />
    <span v-for="s in stars" :key="s.id" class="star" :style="s.style" />
    <span class="rays" />
    <div class="sea">
      <svg v-for="n in 3" :key="n" class="wave" :class="`w${n}`" viewBox="0 0 2400 120" preserveAspectRatio="none">
        <path
          d="M0 60 Q150 20 300 60 T600 60 T900 60 T1200 60 T1500 60 T1800 60 T2100 60 T2400 60 V120 H0Z"
        />
      </svg>
    </div>
    <span v-for="b in bubbles" :key="b.id" class="bub" :style="b.style" />
  </div>
</template>

<script setup>
defineProps({
  mood: { type: String, default: "day" }, // day | deep | dusk | night
});

const stars = Array.from({ length: 38 }, (_, id) => ({
  id,
  style: {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 54}%`,
    animationDelay: `${-Math.random() * 4}s`,
    animationDuration: `${2 + Math.random() * 3}s`,
  },
}));
const bubbles = Array.from({ length: 14 }, (_, id) => {
  const size = 5 + Math.random() * 12;
  return {
    id,
    style: {
      left: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${7 + Math.random() * 8}s`,
      animationDelay: `${-Math.random() * 12}s`,
    },
  };
});
</script>

<style scoped>
.bd {
  --w1: #7fd8e6;
  --w2: #3fb7cc;
  --w3: #1d90ad;
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  background: #0a2d4a;
}
.m-dusk {
  --w1: #f0a79a;
  --w2: #8a6fa6;
  --w3: #3f4f8a;
}
.m-night {
  --w1: #2f68a0;
  --w2: #1b3f6b;
  --w3: #102a4d;
}
.m-deep {
  --w1: #0f4a6b;
  --w2: #0b3a5c;
  --w3: #082c4a;
}

/* ===== Langit ===== */
.sky {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.8s ease;
}
.sky.day {
  background: linear-gradient(180deg, #76d3ee 0%, #bdeff5 50%, #fff3d6 62%);
}
.sky.dusk {
  background: linear-gradient(180deg, #3d4a8f 0%, #c3649a 38%, #ff9d7a 60%, #ffd39a 68%);
}
.sky.night {
  background: linear-gradient(180deg, #040f26 0%, #0a2348 50%, #16385f 64%);
}
.sky.deep {
  background: linear-gradient(180deg, #57cfe3 0%, #1c8db0 25%, #0c4468 60%, #051a30 100%);
}
.m-day .sky.day,
.m-dusk .sky.dusk,
.m-night .sky.night,
.m-deep .sky.deep {
  opacity: 1;
}

.sun {
  position: absolute;
  left: 68%;
  top: 14%;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, #fffbe0 0 35%, #ffe58a 58%, rgb(255 229 138 / 0) 72%);
  transition: top 1.8s ease, left 1.8s ease, opacity 1.8s ease;
  translate: calc(var(--px, 0) * -6px) calc(var(--py, 0) * -4px);
}
.m-dusk .sun {
  top: 49%;
  left: 60%;
  background: radial-gradient(circle, #fff0d0 0 30%, #ff9a5c 58%, rgb(255 154 92 / 0) 72%);
}
.m-night .sun,
.m-deep .sun {
  top: 70%;
  opacity: 0;
}
.moon {
  position: absolute;
  right: 14%;
  top: 11%;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fffdf0, #e8ecf5 60%, #cfd8ea);
  box-shadow: 0 0 40px 10px rgb(220 235 255 / 0.35);
  opacity: 0;
  transition: opacity 1.8s ease;
}
.m-night .moon {
  opacity: 1;
}
.star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #fff;
  opacity: 0;
  transition: opacity 1.8s ease;
  animation: twinkle 3s ease-in-out infinite alternate;
}
.m-night .star {
  opacity: 0.9;
}
.m-dusk .star {
  opacity: 0.3;
}

/* ===== Sinag sa ilalim ng tubig at bula ===== */
.rays {
  position: absolute;
  inset: -10% -10% 20% -10%;
  background: repeating-conic-gradient(from 195deg at 50% -10%, rgb(255 255 255 / 0.22) 0 6deg, transparent 6deg 18deg);
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 80%);
  mask-image: linear-gradient(180deg, #000, transparent 80%);
  opacity: 0;
  transition: opacity 1.8s ease;
  animation: ray-sway 9s ease-in-out infinite alternate;
}
.m-deep .rays {
  opacity: 1;
}
.bub {
  position: absolute;
  bottom: -30px;
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 50%;
  background: rgb(255 255 255 / 0.12);
  opacity: 0;
}
.m-deep .bub {
  animation: bub-rise linear infinite;
}

/* ===== Alon ===== */
.sea {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 42%;
  transition: transform 1.8s cubic-bezier(0.4, 0, 0.2, 1);
  translate: calc(var(--px, 0) * -6px) 0;
}
.m-deep .sea {
  transform: translateY(105%);
}
.wave {
  position: absolute;
  left: 0;
  width: 200%;
  animation: wave-run 14s linear infinite;
}
.wave path {
  transition: fill 1.8s ease;
}
.w1 {
  top: 0;
  height: 100%;
}
.w1 path {
  fill: var(--w1);
}
.w2 {
  top: 14%;
  height: 86%;
  animation-duration: 10s;
  animation-direction: reverse;
}
.w2 path {
  fill: var(--w2);
}
.w3 {
  top: 32%;
  height: 68%;
  animation-duration: 8s;
}
.w3 path {
  fill: var(--w3);
}

@keyframes wave-run {
  to {
    transform: translateX(-50%);
  }
}
@keyframes twinkle {
  to {
    transform: scale(1.9);
  }
}
@keyframes ray-sway {
  from {
    transform: rotate(-3deg);
  }
  to {
    transform: rotate(3deg);
  }
}
@keyframes bub-rise {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  15% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translateY(-900px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .wave,
  .star,
  .rays,
  .m-deep .bub {
    animation: none;
  }
}
</style>