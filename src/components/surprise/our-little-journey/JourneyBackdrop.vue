<template>
  <!-- BACKDROP: kraft paper na scrapbook. Nagbabago ang kulay ayon sa mood (day → map → warm → night → kraft).
       May washi tape sa sulok, tahi sa gilid, at mga doodle (eroplano, bituin, puso) na dahan-dahang lumulutang. -->
  <div class="jb" :class="`m-${mood}`" aria-hidden="true">
    <span class="jb-sky day" />
    <span class="jb-sky map" />
    <span class="jb-sky warm" />
    <span class="jb-sky night" />
    <span class="jb-sky kraft" />
    <span class="jb-paper" />
    <span class="jb-glow" />
    <span class="jb-stars"><i v-for="s in stars" :key="s.id" :style="s.style" /></span>
    <div class="jb-layer">
      <span v-for="d in doodles" :key="d.id" class="jb-doodle" :style="d.style">{{ d.ch }}</span>
    </div>
    <span class="jb-tape a" />
    <span class="jb-tape b" />
    <span class="jb-stitch" />
  </div>
</template>

<script setup>
defineProps({
  mood: { type: String, default: "day" }, // day | map | warm | night | kraft
});

const CHARS = ["✈", "✦", "♥", "☁", "⚑", "✿"];
const doodles = Array.from({ length: 14 }, (_, id) => ({
  id,
  ch: CHARS[id % CHARS.length],
  style: {
    left: `${Math.random() * 100}%`,
    fontSize: `${14 + Math.random() * 16}px`,
    animationDuration: `${20 + Math.random() * 18}s`,
    animationDelay: `${-Math.random() * 30}s`,
  },
}));

const stars = Array.from({ length: 34 }, (_, id) => {
  const size = 1.5 + Math.random() * 2.5;
  return {
    id,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 70}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${2 + Math.random() * 3}s`,
      animationDelay: `${-Math.random() * 4}s`,
    },
  };
});
</script>

<style scoped>
.jb {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  background: #ecd3a4;
}

/* ===== Papel ===== */
.jb-sky {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.8s ease;
}
.jb-sky.day {
  background: linear-gradient(160deg, #fff3d6 0%, #f4d9a8 55%, #e3b97f 100%);
}
.jb-sky.map {
  background: linear-gradient(160deg, #f6e6c4 0%, #e2c295 55%, #cda676 100%);
}
.jb-sky.warm {
  background: linear-gradient(160deg, #ffe9cc 0%, #ffcf9f 55%, #f4a779 100%);
}
.jb-sky.night {
  background: linear-gradient(170deg, #1d1a33 0%, #3a2c4d 55%, #6b4a4a 100%);
}
.jb-sky.kraft {
  background: linear-gradient(160deg, #ecd3a4 0%, #d6ac73 55%, #bb8a58 100%);
}
.m-day .jb-sky.day,
.m-map .jb-sky.map,
.m-warm .jb-sky.warm,
.m-night .jb-sky.night,
.m-kraft .jb-sky.kraft {
  opacity: 1;
}
.jb-paper {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(0deg, rgb(255 255 255 / 0.05) 0 2px, transparent 2px 5px),
    repeating-linear-gradient(90deg, rgb(74 47 28 / 0.03) 0 1px, transparent 1px 7px);
  mix-blend-mode: soft-light;
}
.jb-glow {
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
.m-warm .jb-glow {
  left: 35%;
  top: -14%;
}
.m-night .jb-glow {
  left: 20%;
  top: 6%;
  opacity: 0.2;
}

.jb-stars {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.8s ease;
}
.m-night .jb-stars {
  opacity: 1;
}
.jb-stars i {
  position: absolute;
  border-radius: 50%;
  background: #fff7d6;
  animation: jb-twinkle ease-in-out infinite alternate;
}

/* ===== Mga doodle ===== */
.jb-layer {
  position: absolute;
  inset: 0;
  translate: calc(var(--px, 0) * -8px) calc(var(--py, 0) * -6px);
}
.jb-doodle {
  position: absolute;
  bottom: -30px;
  color: rgb(255 247 230 / 0.8);
  opacity: 0;
  animation: jb-rise linear infinite;
}

/* ===== Washi tape at tahi ===== */
.jb-tape {
  position: absolute;
  width: 96px;
  height: 22px;
  background: repeating-linear-gradient(45deg, rgb(232 169 58 / 0.8) 0 8px, rgb(255 213 128 / 0.8) 8px 16px);
  box-shadow: 0 2px 4px rgb(74 47 28 / 0.25);
  opacity: 0.85;
}
.jb-tape.a {
  top: 14px;
  left: -22px;
  rotate: -38deg;
}
.jb-tape.b {
  right: -22px;
  bottom: 18px;
  rotate: -38deg;
}
.jb-stitch {
  position: absolute;
  inset: 10px;
  border: 2px dashed rgb(255 247 230 / 0.55);
  border-radius: 18px;
}

@keyframes jb-twinkle {
  from {
    opacity: 0.25;
  }
  to {
    opacity: 1;
  }
}
@keyframes jb-rise {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(-8deg);
  }
  15% {
    opacity: 0.55;
  }
  85% {
    opacity: 0.4;
  }
  100% {
    opacity: 0;
    transform: translateY(-110vh) rotate(12deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .jb-doodle,
  .jb-stars i {
    animation: none;
  }
  .jb-doodle {
    opacity: 0.25;
    bottom: 30%;
  }
}
</style>