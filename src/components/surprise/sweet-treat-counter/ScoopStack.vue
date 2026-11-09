<template>
  <!-- 1) BUILD OUR CONE: i-tap ang tatlong tub ng ice cream. Bawat scoop ay lumalagpak sa cone at may kasamang
       "lasa" ng pagmamahal. Habang tumataas, mas lumalaki ang ugoy ng cone. Sa dulo, may cherry sa ibabaw.
       Lahat ay nasa iisang column (cone → lasa → tub/Continue) kaya walang nagsasapawan. -->
  <section class="ss-stage">
    <header class="ss-head">
      <p class="ss-eyebrow">{{ done ? "Order up!" : `Scoop ${Math.min(scoops.length + 1, 3)} of 3` }}</p>
      <h2>{{ done ? "Our sweet cone" : "Build our cone" }}</h2>
    </header>

    <div class="ss-body">
      <div ref="towerEl" class="ss-tower" :style="{ '--w': scoops.length, '--fit': fit }">
        <div class="ss-sway">
          <svg class="ss-defs" width="0" height="0" aria-hidden="true">
            <defs>
              <linearGradient id="ss-shade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#fff" stop-opacity="0.24" />
                <stop offset="0.5" stop-color="#fff" stop-opacity="0" />
                <stop offset="1" stop-color="#000" stop-opacity="0.16" />
              </linearGradient>
            </defs>
          </svg>
          <span v-if="cherry" class="ss-cherry" />
          <span
            v-for="(s, i) in scoops"
            :key="s.id"
            class="ss-scoop"
            :style="{ '--c': TUBS[s.tub].c, '--c2': TUBS[s.tub].c2, bottom: 112 + i * 27 + 'px', zIndex: i + 1 }"
          >
            <svg viewBox="0 0 120 90" aria-hidden="true">
              <path class="ss-body" :d="SCOOP" />
              <path :d="SCOOP" fill="url(#ss-shade)" />
              <ellipse cx="46" cy="22" rx="11" ry="6" fill="#fff" opacity="0.42" transform="rotate(-30 46 22)" />
            </svg>
          </span>
          <span class="ss-cone" />
        </div>
      </div>

      <div class="ss-tagbox">
        <Transition name="ss-tag" mode="out-in">
          <p v-if="tag" :key="tag" class="ss-tag">{{ tag }}</p>
        </Transition>
      </div>

      <div class="ss-foot">
        <div v-if="!done" class="ss-tubs">
          <button
            v-for="(t, i) in TUBS"
            :key="t.name"
            class="ss-tub"
            :class="{ used: usedTub(i) }"
            :style="{ '--c': t.c, '--c2': t.c2 }"
            type="button"
            :disabled="usedTub(i)"
            :aria-label="`Scoop ${t.name}`"
            @click="scoop(i)"
          >
            <span class="ss-top" />
            <span class="ss-cup"
              ><b>{{ t.name }}</b></span
            >
          </button>
        </div>
        <p v-if="!done" class="ss-hint">{{ scoops.length ? "Pick the next flavor" : "Tap a tub to scoop" }}</p>
        <button v-else class="ss-next" type="button" @click="emit('done')">Continue ✦</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  flavors: { type: Array, required: true },
});
const emit = defineEmits(["scooped", "finished", "done"]);

// iisang hugis: dome na bumubuka sa malapad na ruffle (5 kulot) na tumatakip sa nasa ilalim
const SCOOP =
  "M2 72C14 66 24 8 60 8C96 8 106 66 118 72A14.5 16 0 0 1 89 72A14.5 16 0 0 1 60 72A14.5 16 0 0 1 31 72A14.5 16 0 0 1 2 72Z";

const TUBS = [
  { name: "Strawberry", c: "#ff9db8", c2: "#ff7aa0" },
  { name: "Mango", c: "#ffbf5e", c2: "#ff9a3c" },
  { name: "Ube", c: "#b79cf2", c2: "#9a7ae0" },
];

const towerEl = ref(null);
const scoops = ref([]);
const tag = ref("");
const cherry = ref(false);
const done = ref(false);
const fit = ref(1);
const timers = [];

const usedTub = (i) => scoops.value.some((s) => s.tub === i);

function scoop(i) {
  if (done.value || usedTub(i) || scoops.value.length >= 3) return;
  scoops.value.push({ id: scoops.value.length, tub: i });
  tag.value = props.flavors[scoops.value.length - 1] || "";
  navigator.vibrate?.(14);
  emit("scooped", towerEl.value);
  if (scoops.value.length >= 3) {
    timers.push(setTimeout(() => (cherry.value = true), 650));
    timers.push(
      setTimeout(() => {
        done.value = true;
        emit("finished", towerEl.value);
      }, 1200),
    );
  }
}

// sinusukat ang espasyo para laging kasya ang cone (lumalaki o lumiliit ayon sa screen)
let observer = null;
function measure() {
  const h = towerEl.value?.clientHeight || 285;
  fit.value = Math.max(0.5, Math.min(1.35, h / 285));
}
onMounted(() => {
  measure();
  observer = new ResizeObserver(measure);
  observer.observe(towerEl.value);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  timers.forEach(clearTimeout);
});
</script>

<style scoped>
.ss-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.ss-head {
  position: absolute;
  top: 58px;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.ss-eyebrow {
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

/* iisang column: cone (lumalaki ayon sa espasyo) → lasa → tub o Continue */
.ss-body {
  position: absolute;
  inset: 138px 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

/* ===== Cone ===== */
.ss-tower {
  position: relative;
  flex: 1 1 0;
  width: 150px;
  min-height: 0;
}
.ss-sway {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 285px;
  transform-origin: 50% 100%;
  scale: var(--fit);
  animation: ss-sway 2.2s ease-in-out infinite alternate;
}
.ss-cone {
  position: absolute;
  z-index: 0;
  left: 50%;
  bottom: 0;
  width: 80px;
  height: 130px;
  margin-left: -40px;
  background:
    repeating-linear-gradient(45deg, transparent 0 7px, rgb(150 90 30 / 0.55) 7px 9px),
    repeating-linear-gradient(-45deg, transparent 0 7px, rgb(150 90 30 / 0.55) 7px 9px),
    linear-gradient(90deg, #f0b36a, #e39a47);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
/* scoop = iisang hugis (dome + flared na ruffle), sarili nitong kulay */
.ss-scoop {
  position: absolute;
  left: 50%;
  width: 100px;
  height: 75px;
  margin-left: -50px;
  filter: drop-shadow(0 3px 3px rgb(110 42 28 / 0.22));
  animation: ss-drop 0.65s cubic-bezier(0.3, 1.2, 0.5, 1);
}
.ss-scoop svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.ss-body {
  fill: var(--c);
  stroke: var(--c2);
  stroke-linejoin: round;
  stroke-width: 2.5;
}
.ss-defs {
  position: absolute;
  pointer-events: none;
}
.ss-cherry {
  position: absolute;
  z-index: 6;
  left: 50%;
  bottom: 232px;
  width: 24px;
  height: 24px;
  margin-left: -12px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ff6b6b, #c4182f);
  box-shadow: 0 3px 6px rgb(90 20 20 / 0.35);
  animation: ss-cherry 0.6s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.ss-cherry::before {
  content: "";
  position: absolute;
  top: -13px;
  left: 14px;
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: #5c8240;
  rotate: 24deg;
}

/* ===== Lasa ng pagmamahal ===== */
.ss-tagbox {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: min(90cqi, 340px);
  min-height: 58px;
}
.ss-tag {
  margin: 0;
  padding: 6px 18px;
  border: 2px dashed var(--accent);
  border-radius: 16px;
  background: rgb(255 244 224 / 0.92);
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: clamp(22px, 6.4cqi, 28px);
  line-height: 1.05;
  text-align: center;
}
.ss-tag-enter-active,
.ss-tag-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.ss-tag-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}
.ss-tag-leave-to {
  opacity: 0;
}

/* ===== Ilalim: mga tub, o Continue kapag tapos na (iisang puwesto, kaya hindi nagsasapawan) ===== */
.ss-foot {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 116px;
}
.ss-tubs {
  display: flex;
  gap: 14px;
  justify-content: center;
}
.ss-tub {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(27cqi, 92px);
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.ss-tub:not(:disabled):hover {
  transform: translateY(-3px);
}
.ss-tub:not(:disabled):active {
  transform: scale(0.94);
}
.ss-tub:disabled {
  cursor: default;
  opacity: 0.5;
}
.ss-tub:focus-visible {
  outline: 2px dashed var(--ink);
  outline-offset: 4px;
}
.ss-top {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 30px;
  margin-bottom: -15px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, var(--c), var(--c2));
  box-shadow: inset 0 -3px 0 rgb(0 0 0 / 0.08);
}
.ss-cup {
  display: grid;
  width: 92%;
  height: 54px;
  padding-bottom: 5px;
  place-items: end center;
  border-radius: 0 0 14px 14px;
  background: linear-gradient(180deg, #fff4e0, #f5dcc0);
  box-shadow:
    inset 0 12px 0 var(--c),
    0 6px 12px rgb(110 42 28 / 0.28);
}
.ss-cup b {
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.ss-hint {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
}
.ss-next {
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
  animation: ss-in 0.7s ease 0.5s both;
}

@keyframes ss-sway {
  from {
    rotate: calc(var(--w) * -1deg);
  }
  to {
    rotate: calc(var(--w) * 1deg);
  }
}
@keyframes ss-drop {
  0% {
    opacity: 0;
    transform: translateY(-150px) scale(0.7, 1.3);
  }
  55% {
    opacity: 1;
    transform: translateY(6px) scale(1.12, 0.88);
  }
  80% {
    transform: translateY(-3px) scale(0.97, 1.04);
  }
  100% {
    transform: none;
  }
}
@keyframes ss-cherry {
  from {
    opacity: 0;
    transform: translateY(-60px) scale(1.5);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes ss-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@container (max-height: 620px) {
  .ss-head {
    top: 54px;
  }
  .ss-body {
    top: 122px;
  }
  .ss-tagbox {
    min-height: 48px;
  }
  .ss-foot {
    min-height: 106px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ss-sway {
    animation: none;
  }
}
</style>
