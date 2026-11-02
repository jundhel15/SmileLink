<template>
  <!-- INTERACTIVE PREVIEW ng 03 Golden Hour Scrapbook (top bar + pilian ng device ay nasa SurpriseShell) -->
  <SurpriseShell class="golden-shell" title="03 Golden Hour Scrapbook" @close="emit('close')" @use="emit('use')">
    <GoldenHourScene :content="c" />
  </SurpriseShell>
</template>

<script setup>
import { computed } from "vue";
import SurpriseShell from "./SurpriseShell.vue";
import GoldenHourScene from "./golden-hour/GoldenHourScene.vue";
import birthdayCake from "@/assets/occasions/birthday-cake.webp";

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form:
   recipient/sender,
   memories (3): caption + photo (optional; kung wala, emoji ang lalabas),
   reasons (5): mga dahilan kung bakit mahal siya (lalabas sa bawat lobo),
   beadWord: salita para sa friendship bracelet (hanggang 10 letra) + beadNote (maikling linya pagkatapos),
   letter: sulat sa loob ng sobre,
   message: huling birthday message (lalabas pagkatapos ihipan ang kandila),
   photo: litrato sa dulo (naka-polaroid) */
const sampleContent = {
  recipient: "Bea",
  sender: "Jam",
  memories: [
    { caption: "That night we laughed until our stomachs hurt 😂", emoji: "🌃", photo: "" },
    { caption: "Our 'one more song' that became five", emoji: "🎤", photo: "" },
    { caption: "The day you showed up without me asking", emoji: "🫶", photo: "" },
  ],
  reasons: [
    "You make ordinary days feel like adventures.",
    "You always show up, no matter what.",
    "Your laugh is my favorite sound in the world.",
    "You never let me feel alone.",
    "You believe in me, even when I don't.",
  ],
  beadWord: "BESTIE",
  beadNote: "Through every chapter, you're still my favorite person.",
  letter:
    "I don't say it enough, but you are one of the best things that ever happened to me. You've seen me at my messiest and stayed anyway. I hope this year gives you back every bit of the kindness you give so easily to everyone else.",
  message: "Thank you for being my safe place. Happy birthday, I love you to the moon and back!",
  photo: birthdayCake,
};

const props = defineProps({
  content: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["close", "use"]);

const c = computed(() => ({ ...sampleContent, ...props.content }));
</script>

<style scoped>
.golden-shell {
  --shell-bg:
    radial-gradient(circle at 80% 15%, rgb(255 190 140 / 0.45) 0, transparent 45%),
    linear-gradient(160deg, #4a2340, #7a3a5a 55%, #b2586a);
  --shell-bar: rgb(74 35 64 / 0.78);
  --shell-accent: #e8715f;
  --shell-frame: #3b1d34;
}
</style>