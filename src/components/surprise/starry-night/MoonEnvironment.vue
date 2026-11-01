<template>
  <!-- LANGIT: gradient + kumikislap na bituin + buwan (sa gitna, sa pagitan ng sakura) + malambot na ulap
       + paminsan-minsang shooting star. Ang --moon-x ay pareho sa repleksyon sa OceanEnvironment. -->
  <div class="sky" aria-hidden="true">
    <span v-for="star in stars" :key="star.id" class="star" :style="star.style" />
    <span class="shooting shooting-1" />
    <span class="shooting shooting-2" />
    <div class="moon-wrap" :class="{ hidden: hideMoon }" :style="{ '--glow': glow }">
      <span class="moon-halo" />
      <span class="moon" />
    </div>
    <span class="cloud cloud-1" />
    <span class="cloud cloud-2" />
    <span class="cloud cloud-3" />
  </div>
</template>

<script setup>
// glow = liwanag ng buwan (0–1), lumalakas habang nahahanap ang wish stars
// hideMoon = itago ang maliit na buwan (kapag ang malaking buwan ng MoonReveal ang nasa screen)
defineProps({
  glow: { type: Number, default: 0.3 },
  hideMoon: { type: Boolean, default: false },
});

const stars = Array.from({ length: 80 }, (_, id) => {
  const size = Math.random() < 0.15 ? 2.4 : 0.6 + Math.random() * 1.4;
  return {
    id,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 70}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${-Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 4}s`,
    },
  };
});
</script>

<style scoped>
.sky {
  position: absolute;
  z-index: 0;
  inset: -12px;
  background:
    radial-gradient(ellipse 70% 40% at var(--moon-x, 50%) 10%, rgb(120 96 190 / 0.35), transparent 70%),
    linear-gradient(180deg, #0c0826 0%, #1f1650 34%, #43306e 58%, #8a6194 73%, #2a1f58 76%);
  transform: translate3d(calc(var(--px, 0) * -6px), calc(var(--py, 0) * -4px), 0);
}
.star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 4px rgb(255 255 255 / 0.8);
  animation: twinkle ease-in-out infinite alternate;
}

/* ===== Buwan (nakagitna sa --moon-x) ===== */
.moon-wrap {
  position: absolute;
  top: 7%;
  left: calc(var(--moon-x, 50%) - 39px);
  width: 78px;
  height: 78px;
  transition:
    opacity 1.2s ease,
    transform 1.2s ease;
}
.moon-wrap.hidden {
  opacity: 0;
  transform: scale(0.6);
}
.moon {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 62%, rgb(214 190 170 / 0.45) 0 7%, transparent 8%),
    radial-gradient(circle at 64% 32%, rgb(214 190 170 / 0.35) 0 9%, transparent 10%),
    radial-gradient(circle at 56% 70%, rgb(214 190 170 / 0.3) 0 5%, transparent 6%),
    radial-gradient(circle at 38% 36%, #fffaf0, #f6e7cf 55%, #e3cdb4);
  box-shadow: 0 0 calc(24px + var(--glow) * 40px) rgb(255 236 214 / calc(0.35 + var(--glow) * 0.5));
  transition: box-shadow 1.4s ease;
}
.moon-halo {
  position: absolute;
  inset: -80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(246 220 255 / 0.32), transparent 65%);
  opacity: calc(0.5 + var(--glow) * 0.5);
  transition: opacity 1.4s ease;
}

/* ===== Malambot na ulap (ellipse na kumukupas sa gilid, hindi parihaba) ===== */
.cloud {
  position: absolute;
  height: 70px;
  border-radius: 50%;
  background: radial-gradient(ellipse closest-side, rgb(214 184 236 / 0.22), transparent);
  animation: drift linear infinite alternate;
}
.cloud-1 {
  top: 22%;
  left: -20%;
  width: 75%;
  animation-duration: 38s;
}
.cloud-2 {
  top: 36%;
  right: -24%;
  width: 80%;
  animation-duration: 46s;
  animation-direction: alternate-reverse;
}
.cloud-3 {
  top: 60%;
  left: 0;
  width: 100%;
  height: 54px;
  background: radial-gradient(ellipse closest-side, rgb(255 196 220 / 0.2), transparent);
  animation-duration: 52s;
}

/* ===== Shooting star: manipis na guhit na dumadaan paminsan-minsan ===== */
.shooting {
  position: absolute;
  width: 90px;
  height: 1.5px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgb(255 255 255 / 0), #fff);
  filter: drop-shadow(0 0 4px #fff);
  opacity: 0;
  transform: rotate(-24deg);
  animation: shoot 9s ease-in infinite;
}
.shooting-1 {
  top: 14%;
  left: 8%;
  animation-delay: 3s;
}
.shooting-2 {
  top: 28%;
  left: 46%;
  animation-delay: 7.5s;
  animation-duration: 11s;
}

@keyframes twinkle {
  from {
    opacity: 0.25;
  }
  to {
    opacity: 1;
  }
}
@keyframes drift {
  to {
    transform: translateX(40px);
  }
}
@keyframes shoot {
  0%,
  88% {
    opacity: 0;
    transform: rotate(-24deg) translateX(0);
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(-24deg) translateX(-180px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .star,
  .cloud,
  .shooting {
    animation: none;
  }
}
</style>
