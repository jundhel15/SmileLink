<template>
  <!-- INTERACTIVE PREVIEW ng 08 Cozy Corner: "Konstelasyon" na maikling pelikula ng mga bituin
       (galaxy → isang bituin → "Maligayang kaarawan" → puso → mga polaroid na alaala).
       Top bar + pilian ng device ay nasa SurpriseShell. -->
  <SurpriseShell class="cozy-shell" title="08 Cozy Corner" @close="emit('close')" @use="emit('use')">
    <KonstelasyonFilm :name="c.recipient" />
  </SurpriseShell>
</template>

<script setup>
import { computed } from "vue";
import SurpriseShell from "./SurpriseShell.vue";
import KonstelasyonFilm from "./cozy-corner/KonstelasyonFilm.vue";

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form */
const sampleContent = {
  recipient: "Maria",
};

const props = defineProps({
  content: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["close", "use"]);

const c = computed(() => ({ ...sampleContent, ...props.content }));
</script>

<style scoped>
.cozy-shell {
  --shell-bg:
    radial-gradient(circle at 80% 15%, rgb(255 217 138 / 0.12) 0, transparent 40%),
    linear-gradient(160deg, #0b0a18, #1a1530 55%, #2b211b);
  --shell-bar: rgb(11 10 24 / 0.7);
  --shell-accent: #2b211b;
  --shell-frame: #05050d;
}
</style>
