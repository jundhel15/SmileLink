<template>
  <!-- DAGAT sa ibaba: alon (gumagalaw na guhit) + repleksyon ng buwan -->
  <div class="ocean" aria-hidden="true">
    <span class="waves" />
    <div class="reflection">
      <span v-for="n in 9" :key="n" :style="{ '--n': n }" />
    </div>
  </div>
</template>

<style scoped>
.ocean {
  position: absolute;
  z-index: 1;
  left: -12px;
  right: -12px;
  bottom: 0;
  height: 25%;
  overflow: hidden;
  background: linear-gradient(180deg, #6a4d8a 0%, #2c2160 22%, #150f36 70%, #0c0924 100%);
  box-shadow: 0 -1px 14px rgb(246 200 230 / 0.35);
  transform: translate3d(calc(var(--px, 0) * -3px), 0, 0);
}
.waves {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    180deg,
    transparent 0 9px,
    rgb(220 190 245 / 0.1) 9px 10px
  );
  mask-image: linear-gradient(180deg, #000, transparent);
  animation: waves 6s linear infinite;
}
/* sakto sa ilalim ng buwan (pareho ang --moon-x at ang lapad ng langit at dagat) */
.reflection {
  position: absolute;
  top: 6px;
  left: var(--moon-x, 50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  transform: translateX(-50%);
}
.reflection span {
  width: calc(64px - var(--n) * 5px);
  height: 2px;
  border-radius: 999px;
  background: rgb(255 236 214 / calc(0.75 - var(--n) * 0.07));
  box-shadow: 0 0 6px rgb(255 236 214 / 0.5);
  animation: shimmer 2.6s ease-in-out infinite alternate;
  animation-delay: calc(var(--n) * -0.3s);
}

@keyframes waves {
  to {
    background-position: 0 20px;
  }
}
@keyframes shimmer {
  from {
    opacity: 0.45;
    transform: scaleX(0.75);
  }
  to {
    opacity: 1;
    transform: scaleX(1.1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .waves,
  .reflection span {
    animation: none;
  }
}
</style>
