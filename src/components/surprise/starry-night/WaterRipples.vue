<template>
  <!-- HIDDEN WORDS IN THE WATER: i-tap ang dagat → ripple; bawat tap ay naglalabas ng isang
       nakatagong salita sa liwanag ng buwan. Pag kumpleto, nabubuo ang pangungusap. -->
  <section class="ripple-stage">
    <header class="head">
      <p class="eyebrow">Touch the water</p>
      <h2>
        <Transition name="swap" mode="out-in">
          <span :key="done">{{ done ? sentence : "Something is written in the moonlight" }}</span>
        </Transition>
      </h2>
    </header>

    <Transition name="rise">
      <button v-if="done" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>

    <div
      ref="waterEl"
      class="water"
      role="button"
      tabindex="0"
      :aria-label="`Touch the water, ${found.length} of ${words.length} words found`"
      @pointerdown="onTap"
      @keydown.enter.prevent="reveal(null)"
      @keydown.space.prevent="reveal(null)"
    >
      <span v-for="ripple in ripples" :key="ripple.id" class="ripple" :style="{ left: `${ripple.x}%`, top: `${ripple.y}%` }" />
      <span
        v-for="(word, index) in words"
        :key="index"
        class="word"
        :class="{ shown: found.includes(index) }"
        :style="{ left: `${slots[index].x}%`, top: `${slots[index].y}%` }"
      >
        {{ word }}
      </span>
      <p v-if="!done" class="hint">{{ found.length }} / {{ words.length }} · tap the water</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  sentence: { type: String, required: true },
});
const emit = defineEmits(["done"]);

const words = computed(() => props.sentence.split(/\s+/).filter(Boolean));
// puwesto ng mga salita sa dagat: 2 hilera, sunod-sunod para mabasa nang tama
const slots = computed(() => {
  const total = words.value.length;
  const firstRow = Math.ceil(total / 2);
  return words.value.map((_, i) => {
    const inFirst = i < firstRow;
    const rowCount = inFirst ? firstRow : total - firstRow;
    const col = inFirst ? i : i - firstRow;
    return { x: ((col + 1) / (rowCount + 1)) * 100, y: inFirst ? 34 : 66 };
  });
});

const waterEl = ref(null);
const found = ref([]);
const ripples = ref([]);
const done = ref(false);
let rippleId = 0;
const timers = new Set();

function later(fn, ms) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    fn();
  }, ms);
  timers.add(timer);
}

function addRipple(x, y) {
  const id = ++rippleId;
  ripples.value = [...ripples.value, { id, x, y }];
  later(() => (ripples.value = ripples.value.filter((ripple) => ripple.id !== id)), 1600);
}

// lilitaw ang pinakamalapit na nakatagong salita sa tinapik (o ang susunod, kapag keyboard)
function reveal(point) {
  if (done.value) return;
  const hidden = slots.value.map((slot, i) => ({ ...slot, i })).filter((slot) => !found.value.includes(slot.i));
  if (!hidden.length) return;
  const target = point
    ? hidden.reduce((best, slot) =>
        Math.hypot(slot.x - point.x, slot.y - point.y) < Math.hypot(best.x - point.x, best.y - point.y) ? slot : best,
      )
    : hidden[0];
  found.value = [...found.value, target.i];
  addRipple(target.x, target.y);
  navigator.vibrate?.(10);
  if (found.value.length === words.value.length) later(() => (done.value = true), 900);
}

// percent ng loob ng dagat (pareho kahit naka-scale ang device preview)
function onTap(event) {
  const rect = waterEl.value.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  addRipple(x, y);
  reveal({ x, y });
}

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<style scoped>
.ripple-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  user-select: none;
  -webkit-user-select: none;
}
.head {
  position: absolute;
  top: 28%;
  left: 50%;
  width: min(100% - 44px, 440px);
  text-align: center;
  transform: translateX(-50%);
}
.eyebrow {
  margin: 0;
  color: #f1d3a6;
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #f4e9f7;
  font-family: var(--font-serif);
  font-size: clamp(24px, 7.4cqi, 36px);
  font-weight: 400;
  line-height: 1.2;
  text-shadow: 0 0 22px rgb(214 178 240 / 0.5);
}
.next {
  position: absolute;
  top: 58%;
  left: 50%;
  padding: 11px 26px;
  border: 1px solid rgb(241 211 166 / 0.7);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.1);
  color: #fdf2f8;
  font-family: var(--font-serif);
  font-size: 17px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transform: translateX(-50%);
}
.next:hover {
  background: rgb(255 255 255 / 0.2);
}

/* ===== Dagat (pareho ang taas sa OceanEnvironment: ibabang 25%) ===== */
.water {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 25%;
  overflow: hidden;
  cursor: pointer;
  touch-action: manipulation;
  outline: none;
  /* bahagyang kislap para alam na puwedeng pindutin */
  background: linear-gradient(180deg, rgb(255 236 214 / 0.06), transparent 40%);
  animation: invite 2.8s ease-in-out infinite alternate;
}
.water:focus-visible {
  box-shadow: inset 0 2px 0 rgb(255 236 214 / 0.6);
}
.ripple {
  position: absolute;
  width: 140px;
  height: 44px;
  margin: -22px 0 0 -70px;
  border: 1.5px solid rgb(255 236 214 / 0.75);
  border-radius: 50%;
  box-shadow: 0 0 10px rgb(255 236 214 / 0.35);
  pointer-events: none;
  animation: ripple 1.6s ease-out forwards;
}
.word {
  position: absolute;
  color: #fde7c4;
  font-family: var(--font-script);
  font-size: clamp(26px, 8cqi, 40px);
  line-height: 1;
  white-space: nowrap;
  opacity: 0;
  filter: blur(8px);
  transform: translate(-50%, -50%) scaleY(0.7);
  text-shadow:
    0 0 14px rgb(255 220 170 / 0.8),
    0 0 30px rgb(244 188 214 / 0.5);
  pointer-events: none;
  transition:
    opacity 1.2s ease,
    filter 1.2s ease,
    transform 1.2s ease;
}
.word.shown {
  opacity: 1;
  filter: blur(0);
  transform: translate(-50%, -50%) scaleY(1);
  animation: waver 3s ease-in-out 1.2s infinite alternate;
}
.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 6px;
  margin: 0;
  color: rgb(253 242 248 / 0.8);
  font-family: var(--font-serif);
  font-size: 14px;
  font-style: italic;
  text-align: center;
  pointer-events: none;
}
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.6s ease, filter 0.6s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(6px);
}
.rise-enter-active {
  transition: opacity 0.8s ease 0.5s;
}
.rise-enter-from {
  opacity: 0;
}

@keyframes ripple {
  from {
    opacity: 1;
    transform: scale(0.1);
  }
  to {
    opacity: 0;
    transform: scale(1.7);
  }
}
@keyframes waver {
  to {
    transform: translate(-50%, -50%) scaleY(0.92) skewX(-3deg);
  }
}
@keyframes invite {
  to {
    background: linear-gradient(180deg, rgb(255 236 214 / 0.14), transparent 50%);
  }
}
@container (max-height: 620px) {
  .head {
    top: 14%;
  }
  .next {
    top: 50%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .water,
  .word.shown {
    animation: none;
  }
}
</style>
