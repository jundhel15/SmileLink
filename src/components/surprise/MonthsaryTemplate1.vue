<template>
  <!-- INTERACTIVE PREVIEW ng Monthsary 01 Love Letter Mailbox -->
  <SurpriseShell class="mailbox-shell" title="01 Love Letter Mailbox" @close="emit('close')" @use="emit('use')">
    <LoveLetterScene :content="c" />
  </SurpriseShell>
</template>

<script setup>
import { computed } from "vue";
import SurpriseShell from "./SurpriseShell.vue";
import LoveLetterScene from "./love-letter-mailbox/LoveLetterScene.vue";
import samplePhoto from "@/assets/occasions/birthday-cake.webp";

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form:
   recipient / sender,
   monthCount: ilang buwan na (halimbawa 5),
   sinceDate (opsyonal): petsa ng simula, hal. "June 2, 2026",
   reasons (5): mga dahilan kung bakit mahal niya ang kapareha; bawat isa ay nasa sariling sulat sa envelope,
   promises (3): mga pangako na lilitaw sa scratch ticket,
   letter: ang pinakamahabang sulat; bubukas pagkabasag ng wax seal,
   message: huling mensahe sa dulo,
   photos (5–10): mga litratong ia-upload ng nagbibigay. Lalabas ang mga ito sa mga sulat,
                  sa clothesline kung saan kailangang makita lahat, at sa huling gallery,
   captions (opsyonal): maikling caption bawat litrato, kapareho ang pagkakasunod-sunod ng photos. */
const sampleContent = {
  recipient: "Mia",
  sender: "Jon",
  monthCount: 5,
  sinceDate: "June 2, 2026",
  reasons: [
    "You make ordinary days feel like holidays.",
    "Your laugh is my favorite sound.",
    "You stayed on the hard days, too.",
    "You love the little things as much as I do.",
    "Home is wherever you are.",
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
.mailbox-shell {
  --shell-bg:
    radial-gradient(circle at 20% 10%, rgb(255 255 255 / 0.45) 0, transparent 45%),
    linear-gradient(165deg, #ff9fbd, #ffc2d4 55%, #ffe3ec);
  --shell-bar: rgb(122 43 69 / 0.82);
  --shell-accent: #ff8fab;
  --shell-frame: #7a2b45;
}
</style>