<template>
  <!-- BACKDROP: dessert shop. May toldo (awning) sa itaas, polka dots, at mga lumulutang na matatamis.
       Nagbabago ang kulay ayon sa mood (peach → cream → coral → dusk → gold). -->
  <div class="sb" :class="`m-${mood}`" aria-hidden="true">
    <span class="sb-sky peach" />
    <span class="sb-sky coral" />
    <span class="sb-sky cream" />
    <span class="sb-sky dusk" />
    <span class="sb-sky gold" />
    <span class="sb-dots" />
    <span class="sb-glow" />
    <div class="sb-layer">
      <span v-for="d in doodles" :key="d.id" class="sb-doodle" :style="d.style">{{ d.ch }}</span>
    </div>
    <svg class="sb-awning" viewBox="0 0 320 44" preserveAspectRatio="none">
      <path v-for="(p, i) in scallops" :key="i" :d="p" :fill="i % 2 ? '#fff4e0' : '#ff6b4a'" />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  mood: { type: String, default: "peach" }, // peach | coral | cream | dusk | gold
});

const CHARS = ["🍦", "🍩", "🧁", "🍓", "🍬", "🍪", "🍒", "♥"];
const doodles = Array.from({ length: 12 }, (_, id) => ({
  id,
  ch: CHARS[id % CHARS.length],
  style: {
    left: `${Math.random() * 100}%`,
    fontSize: `${16 + Math.random() * 14}px`,
    animationDuration: `${20 + Math.random() * 18}s`,
    animationDelay: `${-Math.random() * 30}s`,
  },
}));

// walong piraso ng toldo, magkakaiba ang kulay
const scallops = Array.from({ length: 8 }, (_, i) => {
  const x = i * 40;
  return `M${x} 0H${x + 40}V24A20 16 0 0 1 ${x} 24Z`;
});
</script>

<style scoped>
.sb {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  background: #ffd1a6;
}

/* ===== Langit ng tindahan ===== */
.sb-sky {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.8s ease;
}
.sb-sky.peach {
  background: linear-gradient(165deg, #fff0dc 0%, #ffd1a6 55%, #ffab7e 100%);
}
.sb-sky.coral {
  background: linear-gradient(165deg, #ffd5c6 0%, #ff9f86 55%, #ff7a62 100%);
}
.sb-sky.cream {
  background: linear-gradient(165deg, #fff8e8 0%, #ffe6bd 55%, #ffcf91 100%);
}
.sb-sky.dusk {
  background: linear-gradient(170deg, #3c1d33 0%, #7b3646 55%, #c4624d 100%);
}
.sb-sky.gold {
  background: linear-gradient(165deg, #fff3c4 0%, #ffd47a 55%, #ffb04d 100%);
}
.m-peach .sb-sky.peach,
.m-coral .sb-sky.coral,
.m-cream .sb-sky.cream,
.m-dusk .sb-sky.dusk,
.m-gold .sb-sky.gold {
  opacity: 1;
}
.sb-dots {
  position: absolute;
  inset: 0;
  background: radial-gradient(rgb(255 255 255 / 0.32) 2px, transparent 2.6px) 0 0 / 22px 22px;
  opacity: 0.7;
}
.sb-glow {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 0.55), rgb(255 255 255 / 0) 65%);
  transition: left 1.8s ease, top 1.8s ease, opacity 1.8s ease;
  translate: calc(var(--px, 0) * -10px) calc(var(--py, 0) * -8px);
}
.m-coral .sb-glow {
  left: 35%;
  top: -14%;
}
.m-dusk .sb-glow {
  left: 20%;
  top: 30%;
  opacity: 0.2;
}

/* ===== Mga lumulutang na matatamis ===== */
.sb-layer {
  position: absolute;
  inset: 0;
  translate: calc(var(--px, 0) * -8px) calc(var(--py, 0) * -6px);
}
.sb-doodle {
  position: absolute;
  bottom: -30px;
  opacity: 0;
  animation: sb-rise linear infinite;
}

/* ===== Toldo ===== */
.sb-awning {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: 100%;
  height: 44px;
  filter: drop-shadow(0 4px 4px rgb(110 42 28 / 0.28));
}

@keyframes sb-rise {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(-8deg);
  }
  15% {
    opacity: 0.6;
  }
  85% {
    opacity: 0.45;
  }
  100% {
    opacity: 0;
    transform: translateY(-110vh) rotate(12deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .sb-doodle {
    animation: none;
    opacity: 0.25;
    bottom: 30%;
  }
}
</style>
