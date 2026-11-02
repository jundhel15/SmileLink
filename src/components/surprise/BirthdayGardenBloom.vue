<template>
  <!-- INTERACTIVE PREVIEW ng 07 Garden Bloom (pwede sa kaibigan, pamilya o jowa) -->
  <SurpriseShell class="garden-shell" title="07 Garden Bloom" @close="emit('close')" @use="emit('use')">
    <GardenBloomScene :content="c" />
  </SurpriseShell>
</template>

<script setup>
import { computed } from "vue";
import SurpriseShell from "./SurpriseShell.vue";
import GardenBloomScene from "./garden-bloom/GardenBloomScene.vue";
import birthdayCake from "@/assets/occasions/birthday-cake.webp";

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form:
   recipient/sender,
   wishes (3): mga hiling na lilitaw habang hinihipan ang dandelion,
   reasons (5): bakit espesyal siya; bawat isa ay nakakabit sa isang bulaklak sa bouquet,
   letter: sulat na lalabas sa likod ng bakod pagkabukas ng gate,
   message: huling birthday message,
   photos (3–10): mga litratong ia-upload ng nagbibigay. Bawat litrato ay may sariling paru-paro na mahuhuli
                  at maiipit sa album, tapos lalabas din sa sulat at sa dulo bilang swipeable gallery.
   captions (opsyonal): maikling caption bawat litrato, kapareho ang pagkakasunod-sunod ng photos. */
const sampleContent = {
  recipient: "Lia",
  sender: "Jon",
  wishes: [
    "May your days be full of sunshine.",
    "May love find you in the smallest things.",
    "May this year bloom brighter than the last.",
  ],
  reasons: [
    "Your laugh makes any day brighter.",
    "You listen like it's the only thing that matters.",
    "You make ordinary moments feel special.",
    "Your kindness grows everywhere you go.",
    "You're my favorite person to be silly with.",
  ],
  letter:
    "Some people are like gardens: you don't notice how much they've grown you until you look back. Thank you for the sunshine, for the rain you stood through with me, and for every season in between. I'm so proud of who you are, and so lucky to watch you bloom.",
  message:
    "May your year be full of sunshine, soft rain, and everything good growing. Happy birthday. I love having you in my garden.",
  photos: [birthdayCake, birthdayCake, birthdayCake, birthdayCake, birthdayCake],
  captions: ["Pure joy", "Just us", "A day I keep", "So you", "Forever favorite"],
};

const props = defineProps({
  content: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["close", "use"]);

const c = computed(() => ({ ...sampleContent, ...props.content }));
</script>

<style scoped>
.garden-shell {
  --shell-bg:
    radial-gradient(circle at 20% 10%, rgb(255 224 138 / 0.4) 0, transparent 45%),
    linear-gradient(165deg, #4aa35f, #7bc47f 55%, #b8e0a0);
  --shell-bar: rgb(35 74 47 / 0.8);
  --shell-accent: #ff8fab;
  --shell-frame: #234a2f;
}
</style>