<template>
  <!-- 2) POLAROID: i-press and hold ang bawat litrato para "ma-develop" (luminaw ang larawan at lumalabas ang caption). -->
  <section class="polaroid-stage">
    <header class="head">
      <p class="eyebrow">Our little memories</p>
      <h2>Hold each photo to develop it</h2>
    </header>

    <div class="board">
      <div
        v-for="(memory, i) in memories"
        :key="i"
        class="polaroid"
        :class="[`p${i}`, { done: levels[i] >= 1 }]"
        :style="{ '--d': levels[i] }"
        tabindex="0"
        role="button"
        :aria-label="levels[i] >= 1 ? memory.caption : `Hold to develop photo ${i + 1}`"
        @pointerdown="start(i, $event)"
        @pointerup="stop(i)"
        @pointercancel="stop(i)"
        @contextmenu.prevent
        @keydown.space.prevent="start(i, $event)"
        @keyup.space="stop(i)"
        @keydown.enter.prevent="start(i, $event)"
        @keyup.enter="stop(i)"
      >
        <div class="frame">
          <div class="picture">
            <img v-if="memory.photo" :src="memory.photo" alt="" draggable="false" />
            <span v-else class="emoji">{{ memory.emoji || "📷" }}</span>
          </div>
          <span class="film" />
        </div>
        <p class="caption">
          <span class="wait">hold…</span>
          <span class="text">{{ memory.caption }}</span>
        </p>
      </div>
    </div>

    <p class="hint">{{ doneCount }} / {{ memories.length }} developed</p>

    <Transition name="rise">
      <button v-if="allDone" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  memories: { type: Array, required: true }, // [{ caption, photo?, emoji? }]
});
const emit = defineEmits(["developed", "done"]);

const levels = ref(props.memories.map(() => 0));
const doneCount = computed(() => levels.value.filter((level) => level >= 1).length);
const allDone = computed(() => levels.value.length > 0 && doneCount.value === levels.value.length);

const held = new Map(); // index → element na hinahawakan
let frame = 0;
let lastTime = 0;

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  held.forEach((el, i) => {
    const next = Math.min(1, levels.value[i] + dt / 1.6);
    levels.value[i] = next;
    if (next >= 1) {
      held.delete(i);
      navigator.vibrate?.(20);
      emit("developed", el);
    }
  });
  frame = held.size ? requestAnimationFrame(loop) : 0;
}

function start(i, event) {
  if (levels.value[i] >= 1) return;
  held.set(i, event.currentTarget);
  if (event.pointerId !== undefined) event.currentTarget.setPointerCapture?.(event.pointerId);
  if (!frame) {
    lastTime = performance.now();
    frame = requestAnimationFrame(loop);
  }
}
function stop(i) {
  held.delete(i);
}

onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<style scoped>
.polaroid-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 60px 16px 70px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
}
.eyebrow {
  margin: 0;
  color: #b8514a;
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #4a2340;
  font-family: var(--font-serif);
  font-size: clamp(22px, 6.6cqi, 32px);
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 1px 0 rgb(255 255 255 / 0.55);
}

/* ===== Board ng 3 polaroid (magkakatabi, bahagyang nakahilig) ===== */
.board {
  --pw: clamp(112px, 34cqi, 140px);
  position: relative;
  flex: none;
  width: min(100%, 340px);
  height: calc(var(--pw) * 2.95);
}
.polaroid {
  position: absolute;
  width: var(--pw);
  padding: 8px 8px 0;
  border-radius: 4px;
  background: #fffdf8;
  box-shadow:
    0 10px 24px rgb(90 40 60 / 0.3),
    0 0 0 1px rgb(0 0 0 / 0.04);
  cursor: pointer;
  touch-action: none;
  outline: none;
  -webkit-touch-callout: none;
  transition: transform 0.4s cubic-bezier(0.3, 1.4, 0.5, 1);
}
.polaroid::before {
  /* washi tape */
  content: "";
  position: absolute;
  top: -9px;
  left: 50%;
  width: 46px;
  height: 16px;
  background: rgb(244 185 66 / 0.7);
  transform: translateX(-50%) rotate(-3deg);
}
.polaroid:focus-visible {
  box-shadow: 0 0 0 3px #d9574c;
}
.p0 {
  left: 2%;
  top: 0;
  transform: rotate(-5deg);
}
.p1 {
  right: 2%;
  top: calc(var(--pw) * 0.85);
  transform: rotate(4deg);
}
.p2 {
  left: 8%;
  top: calc(var(--pw) * 1.5);
  transform: rotate(-2deg);
}
.polaroid:active:not(.done) {
  scale: 1.05;
}
.done {
  cursor: default;
}

.frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #2a2a2a;
}
.picture {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(150deg, #ffd9a8, #f8a5b7 60%, #c98bc4);
  filter: blur(calc((1 - var(--d)) * 9px)) saturate(calc(0.2 + var(--d) * 0.8)) brightness(calc(0.45 + var(--d) * 0.55));
}
.picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.emoji {
  font-size: calc(var(--pw) * 0.42);
}
.film {
  /* kemikal na maberde-itim na unti-unting nawawala */
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, #2f4a40, #17201c);
  opacity: calc((1 - var(--d)) * 0.88);
  pointer-events: none;
}
.caption {
  position: relative;
  display: grid;
  place-items: center;
  min-height: calc(var(--pw) * 0.42);
  margin: 0;
  padding: 4px 2px 6px;
  color: #4a2340;
  font-family: var(--font-hand);
  font-size: clamp(14px, 4.4cqi, 17px);
  font-weight: 700;
  line-height: 1.1;
}
.caption span {
  grid-area: 1 / 1;
}
.wait {
  color: #b8a090;
  font-weight: 500;
  opacity: calc(1 - var(--d) * 2);
}
.text {
  opacity: calc((var(--d) - 0.7) * 3.3);
}
.hint {
  margin: 0;
  color: #6d3a58;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
}
.next {
  padding: 10px 26px;
  border: 1px solid #d9574c;
  border-radius: 999px;
  background: #fff8ee;
  color: #b8403a;
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 8px 20px rgb(217 87 76 / 0.28);
}
.rise-enter-active {
  transition: opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

@container (max-height: 620px) {
  .polaroid-stage {
    gap: 6px;
    padding: 34px 16px 30px;
  }
  .board {
    --pw: 96px;
  }
}
</style>