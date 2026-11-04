<template>
  <!-- INTERACTIVE PREVIEW ng 05 Timeless Elegance (para sa magkasintahan) -->
  <SurpriseShell class="elegant-shell" title="05 Timeless Elegance" @close="emit('close')" @use="emit('use')">
    <TimelessEleganceScene :content="c" />
  </SurpriseShell>
</template>

<script setup>
import { computed } from "vue";
import SurpriseShell from "./SurpriseShell.vue";
import TimelessEleganceScene from "./timeless-elegance/TimelessEleganceScene.vue";
import birthdayCake from "@/assets/occasions/birthday-cake.webp";

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form:
   recipient/sender,
   blooms (5): mga bagay na hinahangaan niya sa kanya (lalabas sa bawat bulaklak),
   milestones (4): { date, label, text } mga mahahalagang sandali ng relasyon (lalabas kapag sinindihan ang memory lights),
   together: maikling linya sa ilalim ng dalawang champagne glass (hal. "Together since 2021"),
   letter: love letter na "isinusulat" habang naka-hold ang pluma,
   message: huling birthday message (lalabas pagkatapos buksan ang regalo gamit ang susi),
   photos: 5-10 litrato nila (URL, o { src }). Lalabas sa gitna ng mga bulaklak, sa memory lights, sa sulat at sa regalo */
const sampleContent = {
  recipient: "Maria",
  sender: "Juan",
  blooms: [
    "The way you laugh at my worst jokes.",
    "How you make any place feel like home.",
    "Your kindness to everyone, even strangers.",
    "The courage you have when you're afraid.",
    "How you choose me, every single day.",
  ],
  milestones: [
    { date: "March 2021", label: "Hello", text: "The day I first saw you smile." },
    { date: "June 2021", label: "First date", text: "Three hours felt like three minutes." },
    { date: "December 2022", label: "I love you", text: "I said it first. I'd say it again." },
    { date: "Today", label: "Still falling", text: "Every day with you is my favorite." },
  ],
  together: "Together since 2021",
  letter:
    "Some people spend their whole lives looking for a place to rest. I found mine in you. Thank you for loving me patiently, for laughing with me, and for staying through every season. Whatever this year brings, I want to face it with your hand in mine.",
  message:
    "You are my favorite hello and my hardest goodbye. Happy birthday, my love. Here's to a lifetime of golden hours with you.",
  // SAMPLE lang: iisang larawan ang inuulit. Papalitan ng mga na-upload ng customer (5 hanggang 10).
  photos: [birthdayCake, birthdayCake, birthdayCake, birthdayCake, birthdayCake],
};

const props = defineProps({
  content: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["close", "use"]);

const c = computed(() => ({ ...sampleContent, ...props.content }));
</script>

<style scoped>
.elegant-shell {
  --shell-bg:
    radial-gradient(circle at 20% 15%, rgb(230 207 156 / 0.35) 0, transparent 45%),
    linear-gradient(160deg, #2f3a2c, #4a5640 55%, #6b7a5c);
  --shell-bar: rgb(47 58 44 / 0.82);
  --shell-accent: #b8914f;
  --shell-frame: #232b21;
}
</style>