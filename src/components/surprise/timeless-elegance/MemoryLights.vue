<template>
  <!-- 3) MEMORY LIGHTS: dalawang hilera ng gintong string lights; bawat ilaw ay may nakasabit na polaroid.
       I-tap ang ilaw (o ang litrato) para sindihan: lilinaw ang litrato at lalabas ang isang mahalagang sandali ninyo. -->
  <section class="lights-stage" :class="{ done }">
    <header class="head">
      <p class="eyebrow">{{ done ? "Every moment, kept" : "Our story" }}</p>
      <h2>
        <Transition name="swap" mode="out-in">
          <span :key="done">{{ done ? "Our story shines bright" : "Light up our memories" }}</span>
        </Transition>
      </h2>
    </header>

    <div class="note-slot" aria-live="polite">
      <Transition name="note" mode="out-in">
        <div :key="current" class="note">
          <template v-if="current >= 0">
            <p class="when">{{ milestones[current].date }} · {{ milestones[current].label }}</p>
            <p class="what">{{ milestones[current].text }}</p>
          </template>
          <p v-else class="what">Tap each light to bring a memory back.</p>
        </div>
      </Transition>
    </div>

    <div class="board">
      <button
        v-for="(m, i) in milestones"
        :key="i"
        class="item"
        :class="{ lit: lit.includes(i) }"
        :style="{ '--i': i }"
        type="button"
        :aria-label="`Light up memory ${i + 1}: ${m.label}`"
        :aria-pressed="lit.includes(i)"
        @click="light(i, $event)"
      >
        <span class="bulb"><span class="glass" /></span>
        <span class="cord" />
        <span class="polaroid">
          <span class="pic">
            <img v-if="photoAt(i)" :src="photoAt(i)" alt="" draggable="false" />
            <span v-else class="heart">♥</span>
            <span class="veil" />
          </span>
          <span class="cap">{{ lit.includes(i) ? m.label : m.date }}</span>
        </span>
      </button>
    </div>

    <p v-if="!done" class="hint">{{ lit.length }} / {{ milestones.length }} lit</p>

    <Transition name="rise">
      <button v-if="done" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  milestones: { type: Array, required: true }, // { date, label, text }
  photos: { type: Array, default: () => [] }, // URL; inuulit kung kulang
});
const emit = defineEmits(["milestone", "finished", "done"]);

const lit = ref([]);
const current = ref(-1);
const done = computed(() => lit.value.length === props.milestones.length);
const photoAt = (i) => (props.photos.length ? props.photos[i % props.photos.length] : "");

function light(i, event) {
  if (lit.value.includes(i)) {
    current.value = i; // pwedeng balikan ang sandaling nasindihan na
    return;
  }
  lit.value = [...lit.value, i];
  current.value = i;
  navigator.vibrate?.(15);
  emit("milestone", event.currentTarget);
  if (done.value) emit("finished", event.currentTarget);
}
</script>

<style scoped>
.lights-stage {
  --cw: min(37cqi, 150px);
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 9% 18px 40px;
  overflow: hidden;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
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
.note-slot {
  display: grid;
  place-items: center;
  width: min(100%, 340px);
  min-height: 74px;
  padding: 10px 18px;
  border: 1px solid rgb(184 145 79 / 0.6);
  background: rgb(255 253 247 / 0.85);
  box-shadow:
    0 0 0 4px rgb(255 253 247 / 0.6),
    0 10px 24px rgb(120 90 40 / 0.15);
}
.when {
  margin: 0 0 2px;
  color: #b8914f;
  font-family: var(--font-serif);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.what {
  margin: 0;
  color: #3f3a2e;
  font-family: var(--font-serif);
  font-size: clamp(17px, 4.8cqi, 21px);
  font-style: italic;
  line-height: 1.3;
}
.note-enter-active,
.note-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.note-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.note-leave-to {
  opacity: 0;
}

/* ===== Mga ilaw (2 x 2) ===== */
.board {
  display: grid;
  grid-template-columns: repeat(2, var(--cw));
  gap: 22px 22px;
  margin-top: 4px;
}
.item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  animation: drop-in 0.9s cubic-bezier(0.3, 1.3, 0.5, 1) calc(var(--i) * 0.12s) both;
}
.item:focus-visible {
  outline: 2px solid #b8914f;
  outline-offset: 4px;
}
/* ang alambre na dumadaan sa lahat ng ilaw sa hilera */
.item::before {
  content: "";
  position: absolute;
  top: 9px;
  left: -11px;
  right: -11px;
  height: 2px;
  background: linear-gradient(90deg, #b8914f, #e6cf9c, #b8914f);
  border-radius: 2px;
}
.item:nth-child(odd)::before {
  left: -30px;
}
.item:nth-child(even)::before {
  right: -30px;
}
.bulb {
  position: relative;
  z-index: 1;
  width: 18px;
  height: 22px;
}
.glass {
  position: absolute;
  inset: 3px 0 0;
  border-radius: 50% 50% 46% 46% / 40% 40% 60% 60%;
  background: radial-gradient(circle at 35% 30%, #f6efe0, #cfc3a8);
  border: 1px solid #b8914f;
  transition: background 0.5s ease, box-shadow 0.6s ease;
}
.lit .glass {
  background: radial-gradient(circle at 35% 30%, #fffbe8, #ffd978 60%, #f0b84a);
  box-shadow:
    0 0 10px 3px rgb(255 214 112 / 0.9),
    0 0 26px 8px rgb(255 214 112 / 0.5);
}
.cord {
  width: 1.6px;
  height: 18px;
  background: #b8914f;
}
.polaroid {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 7px 7px 5px;
  border-radius: 3px;
  background: linear-gradient(180deg, #fffdf7, #f2e6cf);
  box-shadow: 0 8px 18px rgb(100 75 30 / 0.22);
  transform-origin: 50% 0;
  transform: rotate(calc(var(--i) * 2deg - 3deg));
}
.lit .polaroid {
  animation: swing 2.6s ease-out both;
  box-shadow:
    0 10px 22px rgb(100 75 30 / 0.28),
    0 0 22px rgb(255 214 112 / 0.5);
}
.pic {
  position: relative;
  display: block;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 2px;
  background: #e8dcc2;
}
.pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(7px) grayscale(0.7) brightness(0.95);
  transform: scale(1.15);
  transition: filter 1.1s ease, transform 1.1s ease;
  pointer-events: none;
}
.lit .pic img {
  filter: none;
  transform: none;
}
.veil {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(60 50 30 / 0.28);
  transition: opacity 0.9s ease;
}
.veil::after {
  content: "✦";
  color: #fff3cc;
  font-size: 22px;
  text-shadow: 0 0 10px rgb(255 214 112 / 0.9);
  animation: twinkle 2s ease-in-out infinite;
}
.lit .veil {
  opacity: 0;
}
.heart {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: #c9a15a;
  font-size: 40px;
}
.cap {
  margin-top: 5px;
  color: #6f5a35;
  font-family: var(--font-script);
  font-size: 17px;
  line-height: 1.2;
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
.swap-enter-active,
.swap-leave-active,
.rise-enter-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.swap-enter-from,
.swap-leave-to,
.rise-enter-from {
  opacity: 0;
}
.rise-enter-from {
  transform: translateY(10px);
}

@keyframes drop-in {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
}
@keyframes swing {
  0% {
    transform: rotate(9deg);
  }
  25% {
    transform: rotate(-6deg);
  }
  50% {
    transform: rotate(4deg);
  }
  75% {
    transform: rotate(-2deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
@keyframes twinkle {
  50% {
    opacity: 0.45;
    transform: scale(0.8);
  }
}
@container (max-height: 620px) {
  .lights-stage {
    --cw: min(22cqh, 110px);
    gap: 6px;
    padding-top: 4%;
  }
  .board {
    grid-template-columns: repeat(4, var(--cw));
    gap: 12px;
  }
  .item::before {
    left: -6px !important;
    right: -6px !important;
  }
  .note-slot {
    min-height: 54px;
  }
  .hint {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .item,
  .lit .polaroid,
  .veil::after {
    animation: none;
  }
}
</style>
