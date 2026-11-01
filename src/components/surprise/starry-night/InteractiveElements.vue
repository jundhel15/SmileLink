<template>
  <!-- 5 WISH STARS: lalabas pagkatapos ng title; bawat pindot = isang wish ng customer -->
  <div class="interactive" :class="{ ready }">
    <button
      v-for="(spot, index) in spots"
      :key="index"
      class="wish-star"
      :class="{ found: found.includes(index) }"
      :style="{ left: `${spot.x}%`, top: `${spot.y}%`, '--d': `${index * 0.35}s` }"
      type="button"
      :disabled="!ready || found.includes(index)"
      :aria-label="`Wish star ${index + 1}`"
      @click="find(index, $event)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z" />
      </svg>
    </button>

    <p v-if="ready" class="whisper" aria-live="polite">
      <Transition name="whisper" mode="out-in">
        <span :key="message">{{ message }}</span>
      </Transition>
      <small>{{ found.length }} / {{ spots.length }} wishes found</small>
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  ready: { type: Boolean, default: false },
  wishes: { type: Array, default: () => [] },
});
const emit = defineEmits(["found", "complete"]);

// puwesto ng mga bituin (% ng phone); iniiwasan ang gitna kung nasaan ang title at button
const spots = [
  { x: 14, y: 22 },
  { x: 86, y: 28 },
  { x: 9, y: 60 },
  { x: 90, y: 66 },
  { x: 74, y: 82 },
];

const found = ref([]);
const message = computed(() => {
  if (found.value.length === spots.length) return "All five wishes found ✨";
  const lastIndex = found.value[found.value.length - 1];
  return lastIndex === undefined ? "Tap the glowing stars ✦" : `✦ ${props.wishes[lastIndex] ?? ""}`;
});

function find(index, event) {
  if (found.value.includes(index)) return;
  found.value = [...found.value, index];
  emit("found", { index, el: event.currentTarget });
  if (found.value.length === spots.length) emit("complete");
}
</script>

<style scoped>
.interactive {
  position: absolute;
  z-index: 12;
  inset: 0;
  pointer-events: none;
}
.wish-star {
  position: absolute;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 236 214 / 0.35), transparent 70%);
  opacity: 0;
  transform: scale(0.4);
  cursor: pointer;
  transition:
    opacity 0.9s ease var(--d),
    transform 0.9s cubic-bezier(0.3, 1.5, 0.5, 1) var(--d);
}
.ready .wish-star {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}
.wish-star svg {
  width: 20px;
  height: 20px;
  fill: #fff6e6;
  filter: drop-shadow(0 0 4px #fff) drop-shadow(0 0 10px #f4bcd6);
  animation: glimmer 2.2s ease-in-out infinite alternate;
}
.wish-star:focus-visible {
  outline: 2px solid #f4bcd6;
}
.ready .wish-star.found {
  opacity: 0;
  transform: scale(1.8);
  pointer-events: none;
  transition-delay: 0s;
}
.whisper {
  position: absolute;
  left: 50%;
  bottom: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: calc(100% - 44px);
  margin: 0;
  transform: translateX(-50%);
  color: #fdf2f8;
  font-family: var(--font-serif);
  font-size: 17px;
  font-style: italic;
  line-height: 1.3;
  text-align: center;
  text-shadow: 0 0 12px rgb(244 170 208 / 0.6), 0 2px 8px rgb(10 6 30 / 0.8);
  animation: fade-in 1.2s ease both;
}
.whisper small {
  color: rgb(241 211 166 / 0.85);
  font-family: var(--sl-font-body, sans-serif);
  font-size: 11px;
  font-style: normal;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.whisper-enter-active,
.whisper-leave-active {
  transition: opacity 0.5s ease, filter 0.5s ease;
}
.whisper-enter-from,
.whisper-leave-to {
  opacity: 0;
  filter: blur(6px);
}

@keyframes glimmer {
  from {
    transform: scale(0.85) rotate(0deg);
    opacity: 0.7;
  }
  to {
    transform: scale(1.1) rotate(20deg);
    opacity: 1;
  }
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .wish-star svg {
    animation: none;
  }
}
</style>
