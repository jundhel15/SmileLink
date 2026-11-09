<template>
  <!-- INTERACTIVE PREVIEW ng 02 Starry Night (top bar + pilian ng device ay nasa SurpriseShell) -->
  <SurpriseShell class="starry-shell" title="02 Starry Night" @close="emit('close')" @use="emit('use')">
    <StarryNightScene :content="c" />
  </SurpriseShell>
</template>

<script setup>
import { computed } from "vue";
import SurpriseShell from "./SurpriseShell.vue";
import StarryNightScene from "./starry-night/StarryNightScene.vue";
import birthdayCake from "@/assets/occasions/birthday-cake.webp";

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form:
   recipient/sender, 5 wishes, 3 lantern notes, waterWords (pangungusap sa dagat),
   bottleNote (sulat sa bote), message,
   photos: 5-10 litrato (URL, o { src, caption }). Lalabas sa loob ng full moon + sa gallery */
const sampleContent = {
  recipient: "Maria",
  sender: "Juan",
  wishes: [
    "May all your dreams come true this year.",
    "More laughter than ever, every single day.",
    "Good health, peace and endless joy.",
    "New adventures with the people you love.",
    "Cake that never runs out 🍰",
  ],
  lanterns: ["For every dream you're chasing ✨", "For the laughs we haven't had yet", "For you, always ♥"],
  waterWords: "You are my favorite view",
  bottleNote:
    "If this bottle found you, it means the sea knew where to go. Wherever life takes you this year, I hope you always find your way back to the people who love you.",
  message: "Thank you for making every day brighter. I'm so lucky to celebrate you today!",
  // SAMPLE lang: iisang larawan ang inuulit. Papalitan ng mga na-upload ng customer (5 hanggang 10).
  photos: [
    { src: birthdayCake, caption: "Our first adventure" },
    { src: birthdayCake, caption: "That silly day" },
    { src: birthdayCake, caption: "Sunset with you" },
    { src: birthdayCake, caption: "Just us" },
    { src: birthdayCake, caption: "Forever favorite" },
  ],
};

const props = defineProps({
  content: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["close", "use"]);

const c = computed(() => ({ ...sampleContent, ...props.content }));
</script>

<style scoped>
.starry-shell {
  --shell-bg:
    radial-gradient(circle at 15% 20%, rgb(120 92 170 / 0.35) 0, transparent 40%),
    linear-gradient(160deg, #120e2e, #241a52 55%, #352760);
  --shell-bar: rgb(18 14 46 / 0.7);
  --shell-accent: #292b70;
  --shell-frame: #0b0920;
}
</style>
