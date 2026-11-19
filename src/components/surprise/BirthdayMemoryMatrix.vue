<template>
  <!-- INTERACTIVE PREVIEW ng 03 Memory Matrix (top bar + pilian ng device ay nasa SurpriseShell) -->
  <SurpriseShell class="memory-shell" title="03 Memory Matrix" @close="emit('close')" @use="emit('use')">
    <MemoryMatrixScene :content="c" />
  </SurpriseShell>
</template>

<script setup>
import { computed } from "vue";
import SurpriseShell from "./SurpriseShell.vue";
import MemoryMatrixScene from "./memory-matrix/MemoryMatrixScene.vue";
import birthdayCake from "@/assets/occasions/birthday-cake.webp";
import sampleMemoryPhoto from "@/assets/templates/birthday/sample-memory-photo.webp";
import happyVibesFull from "@/assets/templates/birthday/birthday-happy-vibes-full.webp";
import gardenBloomFull from "@/assets/templates/birthday/birthday-garden-bloom-full.webp";
import oceanBreezeFull from "@/assets/templates/birthday/birthday-ocean-breeze-full.webp";
import cozyCornerFull from "@/assets/templates/birthday/birthday-cozy-corner-full.webp";

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form:
   recipient/sender, petsa MMDD (matrix rain + binary switches), photos (6–10, may caption),
   4 memories (taon, title, caption; litrato = photos[0..3]), message */
const sampleContent = {
  recipient: "Maria",
  sender: "Juan",
  date: "0214",
  photos: [
    { src: sampleMemoryPhoto, caption: "The day we met" },
    { src: gardenBloomFull, caption: "Our first trip" },
    { src: happyVibesFull, caption: "Your best smile" },
    { src: birthdayCake, caption: "Another chapter" },
    { src: oceanBreezeFull, caption: "That beach day" },
    { src: cozyCornerFull, caption: "Lazy Sundays with you" },
  ],
  memories: [
    { year: "2019", title: "The day we met", caption: "You laughed at my terrible joke. I knew." },
    { year: "2021", title: "Our first trip", caption: "Lost, sunburnt, and the happiest I've been." },
    { year: "2023", title: "Your best smile", caption: "This one lives rent-free in my head." },
    { year: "2025", title: "Another chapter", caption: "Here's to every year after this one." },
  ],
  message:
    "Every memory with you is my favorite one. Thank you for another year of laughter, adventures and quiet moments. I can't wait to make more.",
  finaleLine: "Here's to all the memories we haven't made yet.",
};

const props = defineProps({
  content: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["close", "use"]);

const c = computed(() => ({ ...sampleContent, ...props.content }));
</script>

<style scoped>
.memory-shell {
  --shell-bg:
    radial-gradient(circle at 85% 15%, rgb(236 95 114 / 0.2) 0, transparent 40%),
    linear-gradient(160deg, #0d0712, #1f0f24 55%, #2e1420);
  --shell-bar: rgb(13 7 18 / 0.75);
  --shell-use-bg: #ec5f72;
  --shell-use-ink: #fff;
  --shell-frame: #0d0712;
}
</style>
