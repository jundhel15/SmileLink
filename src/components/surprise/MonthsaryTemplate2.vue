<template>
  <!-- INTERACTIVE PREVIEW ng Monthsary 02 Our Little Journey -->
  <SurpriseShell class="journey-shell" title="02 Our Little Journey" @close="emit('close')" @use="emit('use')">
    <JourneyScene :content="c" />
  </SurpriseShell>
</template>

<script setup>
import { computed } from "vue";
import SurpriseShell from "./SurpriseShell.vue";
import JourneyScene from "./our-little-journey/JourneyScene.vue";
import samplePhoto from "@/assets/occasions/birthday-cake.webp";

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form:
   recipient / sender,
   monthCount: ilang buwan na (halimbawa 5),
   sinceDate (opsyonal): petsa ng simula, hal. "June 2, 2026",
   milestones (3–6): mga mahahalagang sandali; bawat isa ay isang "stop" sa mapa na ipipin ng kapareha,
   promises (3): mga pangako na nakatago sa dilim at hahanapin gamit ang parol,
   letter: ang pinakamahabang sulat; lalabas pagsikat ng araw,
   message: huling mensahe sa dulo,
   photos (5–10): mga litratong ia-upload ng nagbibigay. Lalabas ang mga ito sa mapa, sa memory game,
                  at LAHAT sa huling pisara,
   captions (opsyonal): maikling caption bawat litrato, kapareho ang pagkakasunod-sunod ng photos. */
const sampleContent = {
  recipient: "Mia",
  sender: "Jon",
  monthCount: 5,
  sinceDate: "June 2, 2026",
  milestones: [
    "The day we first said hello.",
    "The first time you made me laugh so hard.",
    "The day we became us.",
    "Our favorite little adventure.",
    "Today, and still choosing you.",
  ],
  promises: [
    "I will always choose you, even on the quiet days.",
    "I will keep making you laugh until we're old.",
    "I will love you a little more every month.",
  ],
  letter:
    "Five months ago, I didn't know how much my days could change. Thank you for the late-night talks, the silly photos, and the way you make me feel safe. Every month with you is my favorite chapter, and I can't wait to read the next one with you.",
  message:
    "Happy monthsary, my love. Thank you for being my favorite person, my calm, and my home. Here's to many more months, and to the rest of our story.",
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
.journey-shell {
  --shell-bg:
    radial-gradient(circle at 20% 10%, rgb(255 255 255 / 0.35) 0, transparent 45%),
    linear-gradient(165deg, #ecd3a4, #d9b27a 55%, #bf8f5d);
  --shell-bar: rgb(74 47 28 / 0.85);
  --shell-accent: #e8a93a;
  --shell-frame: #4a2f1c;
}
</style>