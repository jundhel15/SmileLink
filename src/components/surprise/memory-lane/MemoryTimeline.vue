<template>
  <!-- MEMORY LANE: daan na may mga taon; bawat memory ay "encrypted" (hex code ng title) hanggang i-tap -->
  <section class="timeline">
    <header class="timeline-head">
      <p class="eyebrow">memory_lane / {{ opened.length }} of {{ memories.length }} unlocked</p>
      <h2>Walk down memory lane</h2>
      <p class="sub">Tap each memory to decrypt it.</p>
    </header>

    <ol class="lane">
      <li v-for="(memory, index) in memories" :key="index" class="stop" :class="{ open: opened.includes(index) }">
        <span class="year">{{ memory.year }}</span>
        <button
          class="card"
          type="button"
          :aria-label="opened.includes(index) ? memory.title : `Decrypt memory from ${memory.year}`"
          :aria-pressed="opened.includes(index)"
          @click="unlock(index)"
        >
          <span class="card-inner">
            <span class="face back" aria-hidden="true">
              <span class="code">{{ hexOf(memory.title) }}</span>
              <span class="tap">tap to decrypt ✦</span>
            </span>
            <span class="face front">
              <img :src="memory.src" :alt="memory.title" loading="lazy" />
              <strong><ScrambleText :text="memory.title" :active="opened.includes(index)" /></strong>
              <small>{{ memory.caption }}</small>
            </span>
          </span>
        </button>
      </li>
    </ol>

    <Transition name="rise">
      <button v-if="allOpen" class="cta" type="button" @click="emit('done')">
        Open the message <span aria-hidden="true">→</span>
      </button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import ScrambleText from "./ScrambleText.vue";

// memories = [{ year, title, caption, src }]
const props = defineProps({
  memories: { type: Array, required: true },
});
const emit = defineEmits(["done"]);

const opened = ref([]);
const allOpen = computed(() => opened.value.length === props.memories.length);

// "encrypted" na itsura: hex code ng bawat letra ng title
function hexOf(text) {
  return Array.from(text)
    .map((ch) => ch.codePointAt(0).toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
}

function unlock(index) {
  if (!opened.value.includes(index)) opened.value = [...opened.value, index];
}
</script>

<style scoped>
.timeline {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: 56px max(20px, calc(50% - 230px)) 40px;
  color: #fff1e0;
  -webkit-overflow-scrolling: touch;
}
.timeline-head {
  text-align: center;
}
.eyebrow {
  margin: 0;
  color: #ec5f72;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
h2 {
  margin: 8px 0 4px;
  font-family: var(--font-serif);
  font-size: 30px;
  font-style: italic;
  font-weight: 600;
  line-height: 1.1;
}
.sub {
  margin: 0;
  color: rgb(255 241 224 / 0.7);
  font-size: 14px;
}

/* ===== Ang daan (dashed na linya + tuldok bawat taon) ===== */
.lane {
  position: relative;
  margin: 26px 0 0;
  padding: 0 0 0 34px;
  list-style: none;
}
.lane::before {
  content: "";
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 11px;
  border-left: 2px dashed rgb(236 95 114 / 0.5);
}
.stop {
  position: relative;
  margin-bottom: 26px;
}
.stop::before {
  content: "";
  position: absolute;
  top: 3px;
  left: -29px;
  width: 12px;
  height: 12px;
  border: 2px solid #ec5f72;
  border-radius: 50%;
  background: rgb(18 10 26);
  box-shadow: 0 0 10px rgb(236 95 114 / 0.6);
  transition: background 0.4s ease;
}
.stop.open::before {
  background: #fff1e0;
}
.year {
  display: block;
  margin-bottom: 8px;
  color: #ffb39b;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

/* ===== Card na nagfi-flip (likod = code, harap = litrato) ===== */
.card {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  text-align: left;
  cursor: pointer;
  perspective: 1000px;
}
.card:focus-visible {
  outline: 2px solid #ffb39b;
  outline-offset: 4px;
  border-radius: 16px;
}
.card-inner {
  display: grid;
  transition: transform 0.8s cubic-bezier(0.3, 1.2, 0.5, 1);
  transform-style: preserve-3d;
}
.open .card-inner {
  transform: rotateY(180deg);
}
.face {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.back {
  justify-content: space-between;
  gap: 14px;
  min-height: 150px;
  padding: 18px;
  border: 1px solid rgb(236 95 114 / 0.45);
  background:
    repeating-linear-gradient(0deg, rgb(255 255 255 / 0.03) 0 1px, transparent 1px 4px),
    rgb(36 16 40 / 0.85);
  box-shadow: inset 0 0 30px rgb(236 95 114 / 0.15);
}
.code {
  color: #ec5f72;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0.08em;
  word-break: break-all;
}
.tap {
  align-self: flex-start;
  padding: 6px 12px;
  border: 1px solid rgb(255 179 155 / 0.6);
  border-radius: 999px;
  color: #ffb39b;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  animation: blink 1.6s ease-in-out infinite;
}
.front {
  gap: 4px;
  padding: 10px 10px 14px;
  background: #fff6ec;
  color: #2a1530;
  box-shadow: 0 16px 30px rgb(0 0 0 / 0.35);
  transform: rotateY(180deg);
}
.front img {
  width: 100%;
  aspect-ratio: 4 / 3;
  margin-bottom: 6px;
  border-radius: 10px;
  object-fit: cover;
}
.front strong {
  padding: 0 4px;
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
}
.front small {
  padding: 0 4px;
  color: #6b5160;
  font-size: 14px;
  line-height: 1.4;
}

.cta {
  display: block;
  margin: 6px auto 0;
  padding: 14px 28px;
  border: 0;
  border-radius: 999px;
  background: #ec5f72;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 24px rgb(236 95 114 / 0.5);
}
.rise-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes blink {
  50% {
    opacity: 0.45;
  }
}
@media (prefers-reduced-motion: reduce) {
  .card-inner {
    transition-duration: 0.01s;
  }
  .tap {
    animation: none;
  }
}
</style>
