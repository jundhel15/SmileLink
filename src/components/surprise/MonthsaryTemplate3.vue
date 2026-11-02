<template>
  <!-- INTERACTIVE PREVIEW ng Monthsary 03 Sweet Treat Counter -->
  <SurpriseShell class="sweet-shell" title="03 Sweet Treat Counter" @close="emit('close')" @use="emit('use')">
    <SweetScene :content="c" />
  </SurpriseShell>
</template>

<script setup>
import { computed } from "vue";
import SurpriseShell from "./SurpriseShell.vue";
import SweetScene from "./sweet-treat-counter/SweetScene.vue";
import samplePhoto from "@/assets/occasions/birthday-cake.webp";

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form:
   recipient / sender,
   monthCount: ilang buwan na (halimbawa 5),
   flavors (3): maikling "lasa" ng pagmamahal; lalabas sa bawat scoop ng ice cream,
   promises (3): mga pangako na nakatago sa mga gintong boba pearl,
   letter: ang mahabang sulat; nasa loob ng fortune cookie,
   message: huling mensahe sa dulo ng loyalty card,
   photos (5–10): mga litratong ia-upload ng nagbibigay. Lalabas ang mga ito sa pie
                  at LAHAT sa huling loyalty card,
   captions (opsyonal): maikling caption bawat litrato, kapareho ang pagkakasunod-sunod ng photos. */
const sampleContent = {
  recipient: "Mia",
  sender: "Jon",
  monthCount: 5,
  flavors: ["Sweet like your laugh.", "Warm like your hugs.", "Never enough of you."],
  promises: [
    "I will always save the last bite for you.",
    "I will keep making you smile, one silly joke at a time.",
    "I will love you a little sweeter every month.",
  ],
  letter:
    "Five months ago I didn't know that someone could make ordinary days taste this sweet. Thank you for the late-night talks, the shared snacks, and the way you make me feel at home. Every month with you is my favorite flavor, and I can't wait to try the next one together.",
  message:
    "Happy monthsary, my love. Thank you for being my favorite person, my sweetest habit, and my home. Here's to many more months, and to the rest of our story.",
  photos: [samplePhoto, samplePhoto, samplePhoto, samplePhoto, samplePhoto],
  captions: ["Our first date", "Silly us", "That one trip", "Just because", "My favorite day"],
};

const props = defineProps({
  content: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["close", "use"]);

const c = computed(() => ({ ...sampleContent, ...props.content }));
</script>

<style scoped>
.sweet-shell {
  --shell-bg:
    radial-gradient(circle at 20% 10%, rgb(255 255 255 / 0.35) 0, transparent 45%),
    linear-gradient(165deg, #ffd1a6, #ff9a6c 55%, #ff6b4a);
  --shell-bar: rgb(110 42 28 / 0.85);
  --shell-accent: #ff9a3c;
  --shell-frame: #6e2a1c;
}
</style>
