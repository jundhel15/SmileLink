<template>
  <!-- INTERACTIVE PREVIEW ng 06 Ocean Breeze (pwede sa kaibigan, pamilya o jowa) -->
  <SurpriseShell class="ocean-shell" title="06 Ocean Breeze" @close="emit('close')" @use="emit('use')">
    <OceanBreezeScene :content="c" />
  </SurpriseShell>
</template>

<script setup>
import { computed } from "vue";
import SurpriseShell from "./SurpriseShell.vue";
import OceanBreezeScene from "./ocean-breeze/OceanBreezeScene.vue";
import birthdayCake from "@/assets/occasions/birthday-cake.webp";

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form:
   recipient/sender,
   memories (3): { title, text } mga alaala na lalabas habang sumisid (Deep Dive),
   wishes (3): mga hiling na nakasulat sa bawat papel na bangka,
   words (4): maiikling salita na nakatago sa dilim, matatagpuan ng sinag ng parola (hal. "Kind", "Brave"),
   letter: sulat sa loob ng bote,
   message: huling birthday message (pagkatapos paliparin ang parol),
   photos (3–10): mga litratong ia-upload ng nagbibigay. Lalabas sa pagsisid, sa mga bangka, sa dilim na sinisinagan ng parola,
                  sa sulat, sa loob ng parol, at sa dulo bilang swipeable gallery. Gumagana rin kahit 1 lang. */
const sampleContent = {
  recipient: "Ana",
  sender: "Mika",
  memories: [
    { title: "The day we met", text: "I didn't know it yet, but one of my favorite people had just walked in." },
    { title: "Our inside joke", text: "Still the only thing that makes me laugh until I cry." },
    { title: "The hard times", text: "You stayed. That's when I knew you were home." },
  ],
  wishes: [
    "May every wave bring you something beautiful.",
    "May you always have someone to laugh with.",
    "May this year be gentler and braver than the last.",
  ],
  words: ["Kind", "Brave", "Funny", "Loved"],
  letter:
    "I found you like a message in a bottle: unexpected, a little salty, and exactly what I needed. Thank you for every wave we rode out together and every calm afternoon in between. Whatever tide comes next, I'm glad it's you I'm sharing the shore with.",
  message:
    "May your year be as wide as the sea and as gentle as a morning tide. Happy birthday. I'm so glad you're in my story.",
  photos: [birthdayCake, birthdayCake, birthdayCake, birthdayCake, birthdayCake],
};

const props = defineProps({
  content: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["close", "use"]);

const c = computed(() => ({ ...sampleContent, ...props.content }));
</script>

<style scoped>
.ocean-shell {
  --shell-bg:
    radial-gradient(circle at 80% 10%, rgb(255 214 140 / 0.35) 0, transparent 45%),
    linear-gradient(165deg, #0e6b86, #1597ac 55%, #4cc7d1);
  --shell-bar: rgb(8 54 74 / 0.78);
  --shell-accent: #ff8a6b;
  --shell-frame: #082b3d;
}
</style>