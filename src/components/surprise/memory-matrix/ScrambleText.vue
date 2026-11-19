<template>
  <span :aria-label="text">{{ shown }}</span>
</template>

<script setup>
/* text na nagsa-scramble muna bago mabuo (kapag naging `active`) */
import { onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  text: { type: String, required: true },
  active: { type: Boolean, default: false },
  duration: { type: Number, default: 800 },
});

const GLYPHS = "♥✦01#%&*<>/ABCDEFGHJKMNPRSTUVWXYZ";
const shown = ref("");
let frame = 0;

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function run() {
  cancelAnimationFrame(frame);
  const chars = Array.from(props.text);
  const start = performance.now();
  const loop = (now) => {
    const progress = Math.min(1, (now - start) / props.duration);
    const fixed = Math.floor(progress * chars.length);
    shown.value = chars.map((ch, i) => (i < fixed || ch === " " ? ch : randomGlyph())).join("");
    if (progress < 1) frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);
}

watch(
  () => props.active,
  (active) => {
    if (active) run();
    else shown.value = "";
  },
  { immediate: true },
);
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>
