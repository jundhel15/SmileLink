<template>
  <!-- 6) STAMP THE CARD: loyalty card ng Sweet Treat Counter. I-tap ang bawat bilog para ma-stamp; ang bawat stamp
       ay nagiging isa sa inyong mga litrato. Kapag napuno ang card, lalabas ang "PAID IN LOVE" at ang huling mensahe.
       Iisang column (card → caption → mensahe) kaya walang nagsasapawan. -->
  <section class="sc-stage">
    <header class="sc-head">
      <p class="sc-eyebrow">{{ finished ? `Month ${monthCount}` : `${stampedCount} of ${n} stamped` }}</p>
      <h2>{{ finished ? "Our sweet card" : "Stamp our card" }}</h2>
    </header>

    <div class="sc-body">
      <div
        ref="cardEl"
        class="sc-card"
        :class="{ finished, bump }"
        :style="{ '--cols': cols, marginBottom: finished ? shrink + 'px' : '0px' }"
      >
        <div class="sc-top">
          <b class="sc-shop">Sweet Treat Counter</b>
          <small>loyalty card</small>
        </div>
        <div class="sc-meta">
          <span>Member: {{ recipient }}</span>
          <span>Month {{ monthCount }}</span>
        </div>
        <div class="sc-grid">
          <button
            v-for="(src, i) in list"
            :key="i"
            :ref="(el) => (slotEls[i] = el)"
            class="sc-slot"
            :class="{ on: st[i] }"
            type="button"
            :aria-label="`Stamp ${i + 1}`"
            @click="stamp(i)"
          >
            <span v-if="!st[i]" class="sc-num">{{ i + 1 }}</span>
            <template v-else>
              <img v-if="src" class="sc-photo" :src="src" alt="" draggable="false" />
              <span v-else class="sc-photo sc-ph">♥</span>
              <span class="sc-ring" />
            </template>
          </button>
        </div>
        <Transition name="sc-slam">
          <div v-if="finished" class="sc-paid">PAID IN LOVE ♥</div>
        </Transition>
      </div>

      <div v-if="!finished" class="sc-foot">
        <Transition name="sc-cap" mode="out-in">
          <p :key="cap || 'hint'" :class="cap ? 'sc-cap' : 'sc-hint'">{{ cap ? `“${cap}”` : "Tap each circle to stamp it" }}</p>
        </Transition>
      </div>

      <Transition name="sc-rise">
        <div v-if="finished" class="sc-panel">
          <h3>{{ recipient }}</h3>
          <p class="sc-text">{{ message }}</p>
          <p class="sc-from">Forever yours, {{ sender }}</p>
          <button class="sc-replay" type="button" @click="emit('replay')">↻ Replay</button>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  monthCount: { type: Number, default: 1 },
  photos: { type: Array, default: () => [] },
  captions: { type: Array, default: () => [] },
});
const emit = defineEmits(["stamped", "finished", "replay"]);

const DEFAULT_CAPTIONS = [
  "Where it started",
  "Silly us",
  "A day I keep",
  "Just because",
  "My favorite smile",
  "Warm and happy",
  "Our little world",
  "Still laughing",
  "Golden hour",
  "Forever and a day",
];

const list = props.photos.length ? props.photos : ["", "", ""];
const n = list.length;
const cols = n <= 6 ? 3 : n <= 8 ? 4 : 5;

const cardEl = ref(null);
const slotEls = [];
const st = ref(Array(n).fill(false));
const cap = ref("");
const finished = ref(false);
const bump = ref(false);
const shrink = ref(0); // negatibong margin para mabawi ang espasyong iniwan ng lumiit na card
const stampedCount = computed(() => st.value.filter(Boolean).length);
const timers = [];

function stamp(i) {
  if (st.value[i] || finished.value) return;
  st.value[i] = true;
  cap.value = props.captions[i] || DEFAULT_CAPTIONS[i % DEFAULT_CAPTIONS.length];
  navigator.vibrate?.(18);
  bump.value = true;
  timers.push(setTimeout(() => (bump.value = false), 220));
  emit("stamped", slotEls[i]);
  if (stampedCount.value >= n) {
    timers.push(
      setTimeout(() => {
        shrink.value = -Math.round((cardEl.value?.offsetHeight || 0) * 0.2);
        finished.value = true;
        cap.value = "";
        emit("finished", cardEl.value);
      }, 700),
    );
  }
}

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<style scoped>
.sc-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.sc-head {
  position: absolute;
  z-index: 4;
  top: 58px;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  pointer-events: none;
  transform: translateX(-50%);
}
.sc-eyebrow {
  margin: 0;
  color: var(--brown);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}
h2 {
  margin: 4px 0 0;
  color: var(--ink);
  font-family: var(--font-script);
  font-size: clamp(26px, 7.4cqi, 36px);
  font-weight: 400;
  line-height: 1.2;
}

.sc-body {
  position: absolute;
  inset: 138px 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* ===== Loyalty card ===== */
.sc-card {
  position: relative;
  flex: none;
  width: min(88cqi, 340px);
  padding: 12px 14px 14px;
  border: 3px solid #fff;
  border-radius: 14px;
  background:
    radial-gradient(rgb(255 154 60 / 0.12) 1.5px, transparent 2px) 0 0 / 14px 14px,
    linear-gradient(170deg, #fffaf0, #ffe9c9);
  box-shadow: 0 16px 30px rgb(110 42 28 / 0.35);
  transform-origin: 50% 0;
  transition: scale 0.9s cubic-bezier(0.3, 1.2, 0.5, 1), margin 0.9s ease;
}
.sc-card.finished {
  scale: 0.8;
}
.sc-card.bump {
  animation: sc-bump 0.22s ease;
}
.sc-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 6px;
  border-bottom: 2px dashed rgb(255 107 74 / 0.5);
}
.sc-shop {
  color: var(--accent);
  font-family: var(--font-script);
  font-size: 20px;
  font-weight: 400;
}
.sc-top small {
  color: var(--brown);
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.sc-meta {
  display: flex;
  justify-content: space-between;
  margin: 6px 2px 8px;
  color: var(--brown);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
}
.sc-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: 8px;
}
.sc-slot {
  position: relative;
  display: grid;
  aspect-ratio: 1;
  padding: 0;
  place-items: center;
  border: 2.5px dashed rgb(255 107 74 / 0.55);
  border-radius: 50%;
  background: rgb(255 255 255 / 0.55);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.sc-slot:not(.on):hover {
  transform: scale(1.06);
}
.sc-slot:focus-visible {
  outline: 2px dashed var(--ink);
  outline-offset: 3px;
}
.sc-slot.on {
  border: 0;
  cursor: default;
  background: transparent;
}
.sc-num {
  color: rgb(255 107 74 / 0.6);
  font-family: var(--font-head);
  font-size: 22px;
  font-weight: 600;
}
.sc-photo {
  width: 100%;
  height: 100%;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgb(110 42 28 / 0.3);
  object-fit: cover;
  pointer-events: none;
  animation: sc-slam 0.5s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.sc-ph {
  display: grid;
  place-items: center;
  background: #fde4d4;
  color: var(--accent);
  font-size: 24px;
}
.sc-ring {
  position: absolute;
  inset: -3px;
  border: 3px double rgb(255 107 74 / 0.8);
  border-radius: 50%;
  pointer-events: none;
  animation: sc-ring 0.5s ease-out;
}
.sc-paid {
  position: absolute;
  top: 50%;
  left: 50%;
  padding: 8px 18px;
  border: 4px double var(--accent);
  border-radius: 10px;
  background: rgb(255 250 240 / 0.88);
  color: var(--accent);
  font-family: var(--font-head);
  font-size: clamp(22px, 7cqi, 30px);
  font-weight: 700;
  letter-spacing: 0.08em;
  pointer-events: none;
  rotate: -12deg;
  translate: -50% -50%;
  white-space: nowrap;
}
.sc-slam-enter-active {
  transition: opacity 0.3s ease, transform 0.6s cubic-bezier(0.2, 1.6, 0.4, 1);
}
.sc-slam-enter-from {
  opacity: 0;
  transform: scale(2.6);
}

/* ===== Caption / hint ===== */
.sc-foot {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: min(90cqi, 340px);
  min-height: 48px;
}
.sc-cap {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: clamp(24px, 7cqi, 30px);
  line-height: 1.05;
  text-align: center;
}
.sc-hint {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
}
.sc-cap-enter-active,
.sc-cap-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.sc-cap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.sc-cap-leave-to {
  opacity: 0;
}

/* ===== Mensahe ===== */
.sc-panel {
  flex: 1 1 auto;
  width: min(92cqi, 370px);
  min-height: 0;
  padding: 10px 14px 12px;
  overflow-y: auto;
  border: 2px solid #fff;
  border-radius: 18px;
  background: linear-gradient(180deg, rgb(255 250 240 / 0.96), rgb(255 233 201 / 0.96));
  box-shadow: 0 14px 28px rgb(110 42 28 / 0.35);
  text-align: center;
}
.sc-panel h3 {
  margin: 0;
  color: var(--accent);
  font-family: var(--font-hand);
  font-size: clamp(40px, 12cqi, 54px);
  font-weight: 700;
  line-height: 1.05;
}
.sc-text {
  margin: 2px 0 0;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
}
.sc-from {
  margin: 4px 0 0;
  color: var(--brown);
  font-family: var(--font-hand);
  font-size: 26px;
  font-weight: 700;
}
.sc-replay {
  margin-top: 6px;
  padding: 8px 22px;
  border: 2px solid var(--accent);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.7);
  color: var(--accent);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.sc-replay:hover {
  background: #fff;
}
.sc-rise-enter-active {
  transition: opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s;
}
.sc-rise-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

@keyframes sc-slam {
  0% {
    opacity: 0;
    transform: scale(1.9) rotate(-14deg);
  }
  60% {
    opacity: 1;
    transform: scale(0.92) rotate(2deg);
  }
  100% {
    transform: none;
  }
}
@keyframes sc-ring {
  from {
    opacity: 1;
    transform: scale(1.5);
  }
  to {
    opacity: 0.8;
    transform: none;
  }
}
@keyframes sc-bump {
  50% {
    translate: 0 3px;
  }
}
@container (max-height: 620px) {
  .sc-head {
    top: 54px;
  }
  .sc-body {
    top: 122px;
  }
  .sc-panel h3 {
    font-size: 38px;
  }
  .sc-text {
    font-size: 13px;
  }
}
</style>
