<template>
  <button class="journey" :class="{ radiant }" type="button" :disabled="disabled" @click="emit('begin')">
    <span class="halo" aria-hidden="true" />
    <svg class="sparkle" viewBox="0 0 24 24" aria-hidden="true"><path :d="SPARKLE" /></svg>
    Begin the Journey
    <svg class="sparkle" viewBox="0 0 24 24" aria-hidden="true"><path :d="SPARKLE" /></svg>
  </button>
</template>

<script setup>
// radiant = mas maliwanag kapag nahanap na lahat ng wish stars
defineProps({
  radiant: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(["begin"]);

const SPARKLE = "M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z";
</script>

<style scoped>
.journey {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 28px;
  border: 1px solid rgb(241 211 166 / 0.7);
  border-radius: 999px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0.04));
  color: #fdf2f8;
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.08em;
  cursor: pointer;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  box-shadow:
    inset 0 0 0 3px rgb(255 255 255 / 0.05),
    0 8px 26px rgb(10 6 30 / 0.45);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}
.journey:hover:not(:disabled) {
  transform: translateY(-2px);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.24), rgb(255 255 255 / 0.08));
}
.journey:focus-visible {
  outline: 2px solid #f4bcd6;
  outline-offset: 4px;
}
.journey:disabled {
  cursor: default;
}
.sparkle {
  width: 12px;
  height: 12px;
  fill: #f1d3a6;
}
.halo {
  position: absolute;
  inset: -10px;
  border-radius: 999px;
  background: radial-gradient(closest-side, rgb(244 188 214 / 0.55), transparent);
  opacity: 0;
  transition: opacity 1s ease;
  pointer-events: none;
  z-index: -1;
}
.radiant {
  border-color: #f6dcb0;
  box-shadow:
    inset 0 0 0 3px rgb(255 255 255 / 0.08),
    0 0 26px rgb(244 188 214 / 0.6),
    0 8px 26px rgb(10 6 30 / 0.45);
}
.radiant .halo {
  opacity: 1;
  animation: breathe 2.4s ease-in-out infinite;
}

@keyframes breathe {
  50% {
    transform: scale(1.12);
    opacity: 0.6;
  }
}
@media (prefers-reduced-motion: reduce) {
  .radiant .halo {
    animation: none;
  }
}
</style>
