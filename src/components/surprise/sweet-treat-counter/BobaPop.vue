<template>
  <!-- 2) POP THE GOLDEN PEARLS: milk tea na puno ng boba. I-tap ang mga pearl para pumutok. May tatlong gintong pearl
       na may nakatagong pangako. Kapag nahanap lahat, sabay-sabay na papatak ang natitira. -->
  <section class="bp-stage">
    <header class="bp-head">
      <p class="bp-eyebrow">{{ foundList.length }} of {{ n }} promises found</p>
      <h2>{{ done ? "Sweet promises, kept" : "Pop the golden pearls" }}</h2>
    </header>

    <div class="bp-body">
      <div ref="areaEl" class="bp-area">
        <div ref="cupEl" class="bp-box" :style="{ '--fit': fit }">
          <span class="bp-straw" />
          <div class="bp-cup">
            <span class="bp-tea" />
            <template v-for="b in bubbles" :key="b.id">
              <button
                v-if="!b.gone"
                class="bp-b"
                :class="{ gold: b.gold, pop: b.pop }"
                :style="{ left: b.x + '%', top: b.y + '%', '--s': b.s + 'px', '--d': b.d + 's' }"
                type="button"
                :aria-label="b.gold ? 'Golden pearl' : 'Boba pearl'"
                @click="popBubble(b, $event)"
              />
            </template>
            <span class="bp-shine" />
          </div>
          <span class="bp-lid" />
        </div>
      </div>

      <ul class="bp-list">
        <li v-for="k in n" :key="k" :class="{ on: foundList[k - 1] }">
          <b>{{ k }}</b>
          <span>{{ foundList[k - 1] || "Hidden in a golden pearl" }}</span>
        </li>
      </ul>

      <div class="bp-foot">
        <button v-if="done" class="bp-next" type="button" @click="emit('done')">Continue ✦</button>
        <p v-else class="bp-hint">{{ foundList.length ? "Keep popping · find the rest" : "Tap the pearls · look for the golden ones" }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  promises: { type: Array, required: true },
});
const emit = defineEmits(["popped", "found", "finished", "done"]);

const n = Math.min(props.promises.length, 3);

// posisyon ng mga pearl sa loob ng baso (porsyento)
const SPOTS = [
  [36, 16],
  [60, 20],
  [74, 34],
  [30, 32],
  [48, 36],
  [62, 50],
  [26, 48],
  [42, 52],
  [76, 60],
  [34, 66],
  [54, 68],
  [68, 76],
  [28, 82],
  [46, 86],
  [62, 90],
];
const GOLD = [1, 7, 12].slice(0, n);

const bubbles = ref(
  SPOTS.map(([x, y], id) => ({
    id,
    x,
    y,
    s: 28 + ((id * 5) % 7),
    d: ((id * 0.37) % 2.2).toFixed(2),
    gold: GOLD.includes(id),
    pop: false,
    gone: false,
  })),
);

const areaEl = ref(null);
const cupEl = ref(null);
const foundList = ref([]);
const done = ref(false);
const fit = ref(1);

let closing = false;
let observer = null;
const timers = [];

function removeLater(b) {
  b.pop = true;
  timers.push(setTimeout(() => (b.gone = true), 340));
}

function popBubble(b, event) {
  if (closing || b.pop || b.gone) return;
  const el = event.currentTarget;
  removeLater(b);
  navigator.vibrate?.(b.gold ? [20, 30, 20] : 8);
  if (!b.gold) {
    emit("popped", el);
    return;
  }
  foundList.value.push(props.promises[foundList.value.length]);
  emit("found", el);
  if (foundList.value.length >= n) finishAll();
}

// kapag nahanap na ang lahat, sunod-sunod na pumuputok ang natitirang pearl
function finishAll() {
  closing = true;
  bubbles.value
    .filter((x) => !x.pop && !x.gone)
    .forEach((x, k) => timers.push(setTimeout(() => removeLater(x), 150 + k * 70)));
  timers.push(
    setTimeout(() => {
      done.value = true;
      emit("finished", cupEl.value);
    }, 1000),
  );
}

function measure() {
  const h = areaEl.value?.clientHeight || 320;
  fit.value = Math.max(0.5, Math.min(1.25, h / 330));
}
onMounted(() => {
  measure();
  observer = new ResizeObserver(measure);
  observer.observe(areaEl.value);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  timers.forEach(clearTimeout);
});
</script>

<style scoped>
.bp-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.bp-head {
  position: absolute;
  top: 58px;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.bp-eyebrow {
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

.bp-body {
  position: absolute;
  inset: 138px 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.bp-foot {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}
.bp-area {
  display: flex;
  flex: 1 1 0;
  justify-content: center;
  width: 100%;
  min-height: 0;
  padding-top: 8px;
  box-sizing: border-box;
}

/* ===== Baso ===== */
.bp-box {
  position: relative;
  flex: none;
  width: 200px;
  height: 322px;
  transform-origin: 50% 0;
  scale: var(--fit);
  filter: drop-shadow(0 12px 14px rgb(110 42 28 / 0.3));
}
/* nasa likod ng takip at baso, kaya parang pumapasok sa takip */
.bp-straw {
  position: absolute;
  z-index: 0;
  top: 0;
  left: 58%;
  width: 14px;
  height: 120px;
  border-radius: 6px;
  background: repeating-linear-gradient(135deg, #ff6b4a 0 8px, #fff4e0 8px 16px);
  rotate: 8deg;
  pointer-events: none;
}
.bp-cup {
  position: absolute;
  top: 46px;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.6), rgb(255 255 255 / 0.28));
  clip-path: polygon(8% 0, 92% 0, 80% 100%, 20% 100%);
}
.bp-tea {
  position: absolute;
  top: 14%;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(180deg, #e2b583, #b9824f);
}
.bp-shine {
  position: absolute;
  top: 8%;
  bottom: 12%;
  left: 14%;
  width: 7px;
  border-radius: 6px;
  background: rgb(255 255 255 / 0.5);
  pointer-events: none;
}
.bp-lid {
  position: absolute;
  z-index: 2;
  top: 38px;
  left: -4px;
  right: -4px;
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(180deg, #fff, #f3dcc2);
  box-shadow: 0 2px 4px rgb(110 42 28 / 0.25);
  pointer-events: none;
}

/* ===== Mga pearl ===== */
.bp-b {
  position: absolute;
  z-index: 1;
  width: var(--s);
  height: var(--s);
  margin: calc(var(--s) / -2) 0 0 calc(var(--s) / -2);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #7a4b34, #3b2014 70%);
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.3);
  cursor: pointer;
  animation: bp-bob 2.2s ease-in-out var(--d) infinite alternate;
}
.bp-b::after {
  content: "";
  position: absolute;
  top: 18%;
  left: 24%;
  width: 22%;
  height: 22%;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.55);
}
.bp-b.gold {
  background: radial-gradient(circle at 35% 30%, #fff6b8, #ffcf4a 60%, #f0a030);
  box-shadow:
    0 0 0 2px rgb(255 255 255 / 0.8),
    0 0 16px 4px rgb(255 214 90 / 0.8);
  animation:
    bp-bob 2.2s ease-in-out var(--d) infinite alternate,
    bp-glow 0.9s ease-in-out infinite alternate;
}
.bp-b:focus-visible {
  outline: 2px dashed #fff;
  outline-offset: 2px;
}
.bp-b.pop {
  pointer-events: none;
  animation: bp-pop 0.34s ease-out forwards;
}

/* ===== Mga nahanap na pangako ===== */
.bp-list {
  display: grid;
  gap: 6px;
  width: min(92cqi, 360px);
  margin: 0;
  padding: 0;
  list-style: none;
}
.bp-list li {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 42px;
  padding: 3px 12px 3px 8px;
  border: 2px dashed rgb(138 75 42 / 0.4);
  border-radius: 14px;
  background: rgb(255 244 224 / 0.35);
  color: rgb(90 42 31 / 0.55);
  font-family: var(--font-hand);
  font-size: 18px;
  line-height: 1.05;
}
.bp-list li b {
  display: grid;
  flex: none;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 50%;
  background: rgb(138 75 42 / 0.25);
  color: #fff;
  font-family: var(--font-head);
  font-size: 13px;
}
.bp-list li.on {
  border-style: solid;
  border-color: #ffd47a;
  background: rgb(255 244 224 / 0.95);
  box-shadow: 0 6px 12px rgb(110 42 28 / 0.22);
  color: var(--ink);
  font-size: 20px;
  animation: bp-in 0.5s cubic-bezier(0.3, 1.4, 0.5, 1);
}
.bp-list li.on b {
  background: linear-gradient(160deg, #ffcf4a, #f0a030);
}

.bp-hint {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
}
.bp-next {
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 10px 22px rgb(110 42 28 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  animation: bp-next 0.7s ease 0.4s both;
}

@keyframes bp-bob {
  from {
    transform: translateY(-4px);
  }
  to {
    transform: translateY(4px);
  }
}
@keyframes bp-glow {
  to {
    filter: brightness(1.15);
  }
}
@keyframes bp-pop {
  40% {
    opacity: 1;
    transform: scale(1.7);
  }
  100% {
    opacity: 0;
    transform: scale(2.3);
  }
}
@keyframes bp-next {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes bp-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@container (max-height: 620px) {
  .bp-head {
    top: 54px;
  }
  .bp-body {
    top: 122px;
    gap: 5px;
  }
  .bp-list li {
    min-height: 38px;
    font-size: 16px;
  }
  .bp-list li.on {
    font-size: 17px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bp-b,
  .bp-b.gold {
    animation: none;
  }
}
</style>
