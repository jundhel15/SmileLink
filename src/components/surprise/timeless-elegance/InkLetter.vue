<template>
  <!-- 5) INK LETTER: i-press and hold ang PLUMA (ang papel ay hindi gumagana) at "isusulat" nito ang love letter,
       letra por letra, hanggang matapos at lumabas ang pirma. May litrato na unti-unting luminaw habang sumusulat. -->
  <section class="ink-stage" :class="{ done, holding }">
    <header v-if="!done" class="head">
      <p class="eyebrow">Let me write to you</p>
      <h2>Hold the pen</h2>
    </header>

    <div class="paper-wrap">
    <article ref="paperEl" class="paper">
      <p class="to">My dearest {{ recipient }},</p>
      <p class="body" aria-hidden="true">
        <span v-for="(word, wi) in words" :key="wi" class="w">
          <span v-for="(char, ci) in word.chars" :key="ci" class="c" :class="{ on: word.start + ci < shown }">{{ char }}</span>
          <span class="sp"> </span>
        </span>
      </p>
      <span class="sr-only">{{ text }}</span>
      <p class="sig" :class="{ on: done }">With all my love, {{ sender }}</p>
    </article>
    <figure v-if="photo" class="snap" :style="{ '--d': Math.min(1, progress * 1.25) }" aria-hidden="true">
      <span class="tape" />
      <img :src="photo" alt="" draggable="false" />
    </figure>
    </div>

    <button
      v-if="!done"
      class="nib"
      type="button"
      aria-label="Hold the pen to write the letter"
      @pointerdown.prevent="onDown"
      @pointerup="stopHold"
      @pointercancel="stopHold"
      @pointerleave="stopHold"
      @contextmenu.prevent
      @keydown.space.prevent="startHold"
      @keyup.space="stopHold"
      @keydown.enter.prevent="startHold"
      @keyup.enter="stopHold"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.7 3.3c-4.8.4-9.2 3.6-11.6 8.1L6 18l-.9 3.4L8.5 20l1.2-1.6c3.8-.9 7.5-3.8 9.3-7.8.9-2 1.5-4.4 1.7-7.3Z" />
        <path class="vein" d="M5.5 20.5 15 11" />
      </svg>
    </button>
    <p v-if="!done" class="hint">{{ Math.round(progress * 100) }}% · press and hold the pen</p>

    <Transition name="rise">
      <button v-if="done" class="next" type="button" @pointerdown.stop @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  photo: { type: String, default: "" },
});
const emit = defineEmits(["written", "done"]);

// hinahati sa mga salita para hindi mabali ang salita sa gitna ng linya; sinusubaybayan ang index ng bawat letra
const words = computed(() => {
  let start = 0;
  return props.text.split(/\s+/).filter(Boolean).map((word) => {
    const chars = [...word];
    const entry = { chars, start };
    start += chars.length + 1;
    return entry;
  });
});
const total = computed(() => words.value.reduce((sum, word) => sum + word.chars.length + 1, 0));

const paperEl = ref(null);
const shown = ref(0); // ilang letra na ang nakasulat
const holding = ref(false);
const done = ref(false);
const progress = computed(() => Math.min(1, shown.value / (total.value || 1)));

const SPEED = 30; // letra kada segundo habang naka-hold
let frame = 0;
let lastTime = 0;

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  if (!holding.value) {
    frame = 0;
    return;
  }
  shown.value = Math.min(total.value, shown.value + dt * SPEED);
  if (shown.value >= total.value) {
    finish();
    return;
  }
  frame = requestAnimationFrame(loop);
}

function startHold() {
  if (done.value || holding.value) return;
  holding.value = true;
  lastTime = performance.now();
  frame = requestAnimationFrame(loop);
}
function stopHold() {
  holding.value = false;
}
function onDown(event) {
  if (done.value) return;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  startHold();
}

function finish() {
  holding.value = false;
  done.value = true;
  navigator.vibrate?.([20, 40, 20]);
  emit("written", paperEl.value);
}

onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<style scoped>
.ink-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 64px 18px 60px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.eyebrow {
  margin: 0;
  color: #b8914f;
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.34em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #3f3a2e;
  font-family: var(--font-serif);
  font-size: clamp(26px, 7.6cqi, 38px);
  font-weight: 500;
  line-height: 1.15;
}

/* ===== Papel ===== */
.paper-wrap {
  position: relative;
  width: min(100% - 8px, 390px);
}
.snap {
  position: absolute;
  bottom: -34px;
  right: -12px;
  z-index: 2;
  width: 76px;
  margin: 0;
  padding: 5px 5px 14px;
  background: #fffdf7;
  box-shadow: 0 8px 16px rgb(100 75 30 / 0.28);
  transform: rotate(-6deg);
  pointer-events: none;
}
.snap img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  opacity: calc(0.15 + var(--d) * 0.85);
  filter: blur(calc((1 - var(--d)) * 6px)) sepia(calc((1 - var(--d)) * 0.7));
}
.tape {
  position: absolute;
  top: -8px;
  left: 50%;
  width: 30px;
  height: 14px;
  background: rgb(232 214 170 / 0.8);
  transform: translateX(-50%) rotate(-4deg);
}
.paper {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-height: 58cqh;
  padding: 24px 24px 20px;
  overflow-y: auto;
  border: 1px solid rgb(184 145 79 / 0.65);
  background:
    radial-gradient(ellipse at 30% 10%, rgb(255 255 255 / 0.8), transparent 60%),
    linear-gradient(180deg, #fffdf7, #f8efdb);
  box-shadow:
    0 0 0 5px rgb(255 253 247 / 0.65),
    0 0 0 6px rgb(184 145 79 / 0.35),
    0 18px 40px rgb(100 75 30 / 0.22);
  text-align: left;
}
.to {
  margin: 0 0 8px;
  font-family: var(--font-script);
  font-size: 34px;
  line-height: 1.2;
  background: linear-gradient(180deg, #d4b070, #9c7637);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.body {
  margin: 0;
  color: #3f3a2e;
  font-family: var(--font-serif);
  font-size: 20px;
  font-style: italic;
  line-height: 1.5;
}
.w {
  display: inline-block;
  white-space: nowrap;
}
.c {
  opacity: 0;
  filter: blur(3px);
  transition: opacity 0.6s ease, filter 0.6s ease;
}
.c.on {
  opacity: 1;
  filter: none;
}
.sp {
  white-space: pre;
}
.sig {
  margin: 10px 0 0;
  font-family: var(--font-script);
  font-size: 30px;
  line-height: 1.2;
  text-align: right;
  background: linear-gradient(180deg, #d4b070, #9c7637);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 1.4s ease 0.3s, transform 1.4s ease 0.3s;
}
.sig.on {
  opacity: 1;
  transform: none;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

/* ===== Pluma ===== */
.nib {
  display: grid;
  place-items: center;
  width: 70px;
  height: 70px;
  padding: 0;
  border: 1.5px solid #b8914f;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fffdf6, #f1e4c6);
  box-shadow: 0 8px 20px rgb(120 90 40 / 0.25);
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  animation: invite 1.6s ease-in-out infinite alternate;
}
.nib:focus-visible {
  outline: 2px solid #3f3a2e;
  outline-offset: 4px;
}
.nib svg {
  width: 32px;
  height: 32px;
  fill: #b8914f;
}
.nib .vein {
  fill: none;
  stroke: #fffdf6;
  stroke-width: 1.2;
  stroke-linecap: round;
}
.holding .nib {
  animation: write 0.5s ease-in-out infinite alternate;
  box-shadow: 0 0 0 8px rgb(232 194 106 / 0.28), 0 8px 24px rgb(120 90 40 / 0.35);
}
.hint {
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  pointer-events: none;
}
.next {
  padding: 11px 30px;
  border: 1px solid #b8914f;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.85);
  color: #7a5c26;
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 8px 20px rgb(120 90 40 / 0.18);
}
.rise-enter-active {
  transition: opacity 0.9s ease 1.2s, transform 0.9s ease 1.2s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes invite {
  to {
    transform: translateY(-4px);
  }
}
@keyframes write {
  from {
    transform: rotate(-8deg) translate(-2px, 0);
  }
  to {
    transform: rotate(8deg) translate(2px, -3px);
  }
}
@container (max-height: 620px) {
  .ink-stage {
    gap: 8px;
    padding: 28px 18px 24px;
  }
  .paper {
    max-height: 52cqh;
  }
  .body {
    font-size: 17px;
  }
  .hint {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .nib,
  .holding .nib {
    animation: none;
  }
}
</style>