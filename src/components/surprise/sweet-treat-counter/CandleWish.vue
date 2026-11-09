<template>
  <!-- 4) LIGHT, WISH, BLOW: I-drag ang posporo at itapat sa bawat kandila para sindihan. Kapag nasindihan lahat,
       dumidilim ang kuwarto at magwi-wish. Pagkatapos, i-TAP ang bawat apoy (o i-swipe sa mga ito) para hipan.
       Walang nagsasapawan: cake sa gitna, hint o Continue sa iisang puwesto sa ilalim. -->
  <section
    ref="stageEl"
    class="cw-stage"
    :class="`is-${mode}`"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="up"
    @pointercancel="up"
  >
    <span class="cw-dim" />

    <header class="cw-head">
      <p class="cw-eyebrow">{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
    </header>

    <div class="cw-body">
      <div ref="areaEl" class="cw-area">
        <div ref="cakeEl" class="cw-cake" :style="{ '--fit': fit }">
          <div class="cw-candles">
            <div
              v-for="(c, i) in candles"
              :key="i"
              class="cw-candle"
              :style="{ left: c.x + '%', '--h': c.h + 'px', '--c1': c.c1, '--c2': c.c2 }"
            >
              <span :ref="(el) => (wickEls[i] = el)" class="cw-wick">
                <i v-if="lit[i] && !out[i]" class="cw-flame" />
                <i v-if="lit[i] && !out[i] && mode === 'blow'" class="cw-ring" />
                <i v-if="out[i]" class="cw-smoke" />
              </span>
            </div>
          </div>
          <div class="cw-tier t2"><span class="cw-frost" /></div>
          <div class="cw-tier t1">
            <span class="cw-frost" />
            <b class="cw-plaque">Month {{ monthCount }}</b>
          </div>
          <div class="cw-plate" />
        </div>
      </div>

      <div class="cw-foot">
        <button v-if="mode === 'done'" class="cw-next" type="button" @click.stop="emit('done')" @pointerdown.stop>Continue ✦</button>
        <p v-else class="cw-hint">{{ hint }}</p>
      </div>
    </div>

    <div v-if="mode === 'light'" class="cw-match" :style="{ left: mx + 'px', top: my + 'px' }" aria-hidden="true">
      <i class="cw-mflame" />
      <b class="cw-stick" />
    </div>
    <span v-for="p in puffs" :key="p.id" class="cw-puff" :style="{ left: p.x + 'px', top: p.y + 'px' }" aria-hidden="true" />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  count: { type: Number, default: 5 },
  monthCount: { type: Number, default: 1 },
});
const emit = defineEmits(["lit", "out", "finished", "done"]);

const n = Math.max(1, Math.min(6, props.count)); // dami ng kandila

const candles = Array.from({ length: n }, (_, i) => ({
  x: ((i + 1) / (n + 1)) * 100,
  h: 36 + ((i * 7) % 4) * 3,
  c1: i % 2 ? "#fff4e0" : "#ff8fa3",
  c2: i % 2 ? "#ffd3b8" : "#ff6b4a",
}));

const stageEl = ref(null);
const areaEl = ref(null);
const cakeEl = ref(null);
const wickEls = [];
const lit = ref(Array(n).fill(false));
const out = ref(Array(n).fill(false));
const mode = ref("light"); // light → wish → blow → done
const mx = ref(0);
const my = ref(0);
const puffs = ref([]);
const fit = ref(1);
const dragging = ref(false);
const timers = [];
let puffId = 0;

const litCount = computed(() => lit.value.filter(Boolean).length);
const outCount = computed(() => out.value.filter(Boolean).length);

const eyebrow = computed(() => {
  if (mode.value === "light") return `${litCount.value} of ${n} lit`;
  if (mode.value === "wish") return "Close your eyes";
  if (mode.value === "blow") return `${n - outCount.value} flame${n - outCount.value === 1 ? "" : "s"} left`;
  return `Month ${props.monthCount}`;
});
const title = computed(() => {
  if (mode.value === "light") return "Light the candles";
  if (mode.value === "wish") return "Make a wish";
  if (mode.value === "blow") return "Blow them out";
  return "Wish made ✦";
});
const hint = computed(() => {
  if (mode.value === "light") return "Drag the match to each wick";
  if (mode.value === "wish") return "Make a wish…";
  return "Tap each flame to blow it out";
});

// posisyon ng daliri sa loob ng eksena (hinahati sa scale ng preview)
function frame(event) {
  const r = stageEl.value.getBoundingClientRect();
  const s = r.width / (stageEl.value.offsetWidth || 1) || 1;
  return { r, s, x: (event.clientX - r.left) / s, y: (event.clientY - r.top) / s };
}
function wickPos(i, f) {
  const w = wickEls[i]?.getBoundingClientRect();
  if (!w) return null;
  return { x: (w.left + w.width / 2 - f.r.left) / f.s, y: (w.top - f.r.top) / f.s };
}

function track(event) {
  const f = frame(event);
  if (mode.value === "light") {
    const lift = event.pointerType === "touch" ? 40 : 0; // para hindi matakpan ng daliri
    mx.value = f.x;
    my.value = f.y - lift;
    for (let i = 0; i < n; i++) {
      if (lit.value[i]) continue;
      const p = wickPos(i, f);
      if (p && Math.hypot(mx.value - p.x, my.value - (p.y - 8)) < 30) light(i);
    }
  } else if (mode.value === "blow") {
    // tap o swipe: kahit saan sa paligid ng apoy
    for (let i = 0; i < n; i++) {
      if (!lit.value[i] || out.value[i]) continue;
      const p = wickPos(i, f);
      if (p && Math.hypot(f.x - p.x, f.y - (p.y - 8)) < 46) blowOut(i, p);
    }
  }
}

function down(event) {
  if (mode.value !== "light" && mode.value !== "blow") return;
  dragging.value = true;
  stageEl.value.setPointerCapture?.(event.pointerId);
  track(event);
}
function move(event) {
  // sa mouse, sumusunod ang posporo kahit hindi pinipindot; ang paghipan ay kailangang pindot/swipe
  if (dragging.value || (event.pointerType === "mouse" && mode.value === "light")) track(event);
}
function up() {
  dragging.value = false;
}

function light(i) {
  lit.value[i] = true;
  navigator.vibrate?.(12);
  emit("lit", wickEls[i]);
  if (litCount.value >= n) {
    mode.value = "wish";
    timers.push(
      setTimeout(() => {
        if (mode.value === "wish") mode.value = "blow";
      }, 1900),
    );
  }
}

function blowOut(i, p) {
  out.value[i] = true;
  navigator.vibrate?.(10);
  emit("out", wickEls[i]);
  const id = (puffId += 1);
  puffs.value.push({ id, x: p.x, y: p.y - 8 });
  timers.push(setTimeout(() => (puffs.value = puffs.value.filter((x) => x.id !== id)), 750));
  if (outCount.value >= n) {
    timers.push(
      setTimeout(() => {
        mode.value = "done";
        emit("finished", cakeEl.value);
      }, 550),
    );
  }
}

// sinusukat ang espasyo para laging kasya ang cake
let observer = null;
function measure() {
  const h = areaEl.value?.clientHeight || 250;
  fit.value = Math.max(0.6, Math.min(1.2, h / 255));
}

onMounted(() => {
  mx.value = stageEl.value.offsetWidth * 0.5;
  my.value = stageEl.value.offsetHeight * 0.84;
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
.cw-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.cw-stage.is-blow {
  cursor: pointer;
}
.cw-dim {
  position: absolute;
  z-index: 1;
  inset: 0;
  background: rgb(22 6 18 / 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 1.4s ease;
}
.is-wish .cw-dim,
.is-blow .cw-dim {
  opacity: 1;
}

.cw-head {
  position: absolute;
  z-index: 5;
  top: 58px;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  pointer-events: none;
  transform: translateX(-50%);
}
.cw-eyebrow {
  margin: 0;
  color: #ffd9a0;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}
h2 {
  margin: 4px 0 0;
  color: #fff4e0;
  font-family: var(--font-script);
  font-size: clamp(26px, 7.4cqi, 36px);
  font-weight: 400;
  line-height: 1.2;
  text-shadow: 0 2px 12px rgb(20 6 16 / 0.6);
}

/* iisang column: cake sa gitna, hint o Continue sa ilalim */
.cw-body {
  position: absolute;
  z-index: 2;
  inset: 138px 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}
.cw-area {
  display: flex;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
}
.cw-foot {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-height: 52px;
}

/* ===== Cake ===== */
.cw-cake {
  position: relative;
  z-index: 4;
  flex: none;
  width: min(78cqi, 280px);
  scale: var(--fit);
}
.cw-cake::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: -30% -25% -5%;
  background: radial-gradient(circle at 50% 28%, rgb(255 170 80 / 0.4), transparent 62%);
  opacity: 0;
  transition: opacity 1.4s ease;
}
.is-wish .cw-cake::before,
.is-blow .cw-cake::before {
  opacity: 1;
}
.cw-candles {
  position: relative;
  width: 62%;
  height: 80px;
  margin: 0 auto;
}
.cw-candle {
  position: absolute;
  bottom: 0;
  width: 9px;
  height: var(--h);
  margin-left: -4.5px;
  border-radius: 3px 3px 0 0;
  background: repeating-linear-gradient(135deg, var(--c1) 0 6px, var(--c2) 6px 12px);
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.2);
  transition: filter 1.4s ease;
}
.cw-wick {
  position: absolute;
  top: -8px;
  left: 50%;
  width: 2px;
  height: 8px;
  margin-left: -1px;
  background: #3b2014;
}
.cw-flame {
  position: absolute;
  z-index: 4;
  bottom: 4px;
  left: 50%;
  width: 13px;
  height: 22px;
  margin-left: -6.5px;
  border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: radial-gradient(ellipse at 50% 70%, #fff6c0, #ffc247 55%, #ff7a2f);
  box-shadow: 0 0 26px 12px rgb(255 190 90 / 0.6);
  transform-origin: 50% 100%;
  animation: cw-flicker 0.5s ease-in-out infinite alternate;
}
/* bilog na nagsasabing puwedeng i-tap ang apoy */
.cw-ring {
  position: absolute;
  z-index: 4;
  bottom: -6px;
  left: 50%;
  width: 40px;
  height: 40px;
  margin-left: -20px;
  border: 2px dashed rgb(255 233 168 / 0.85);
  border-radius: 50%;
  animation: cw-ring 1s ease-in-out infinite alternate;
}
.cw-smoke {
  position: absolute;
  z-index: 4;
  bottom: 4px;
  left: 50%;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.7);
  filter: blur(3px);
  animation: cw-smoke 1.6s ease-out forwards;
}
.cw-tier {
  position: relative;
  margin: 0 auto;
  border-radius: 10px 10px 6px 6px;
  transition: filter 1.4s ease;
}
.cw-tier.t2 {
  width: 62%;
  height: 64px;
  background: linear-gradient(180deg, #ffb199, #ff8f73);
}
.cw-tier.t1 {
  width: 92%;
  height: 78px;
  background: linear-gradient(180deg, #ff9a7a, #ff7a5c);
  box-shadow: 0 8px 14px rgb(0 0 0 / 0.25);
}
.cw-frost {
  position: absolute;
  top: -4px;
  right: -2px;
  left: -2px;
  height: 20px;
  border-radius: 12px 12px 0 0;
  background: #fff4e0;
}
.cw-frost::after {
  content: "";
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  height: 16px;
  background: radial-gradient(circle at 14px 0, #fff4e0 12px, transparent 13px) 0 0 / 28px 16px repeat-x;
}
.cw-plaque {
  position: absolute;
  right: 0;
  bottom: 12px;
  left: 0;
  color: #fff;
  font-family: var(--font-script);
  font-size: 22px;
  font-weight: 400;
  text-align: center;
  text-shadow: 0 2px 4px rgb(110 42 28 / 0.5);
}
.cw-plate {
  width: 112%;
  height: 16px;
  margin: -4px 0 0 -6%;
  border-radius: 50%;
  background: linear-gradient(#fff, #e9d5bd);
  box-shadow: 0 8px 14px rgb(0 0 0 / 0.3);
  transition: filter 1.4s ease;
}
/* sa dilim, medyo dumidilim ang cake pero hindi nagiging abo */
.is-wish .cw-tier,
.is-wish .cw-plate,
.is-wish .cw-candle,
.is-blow .cw-tier,
.is-blow .cw-plate,
.is-blow .cw-candle {
  filter: brightness(0.72) saturate(1.05);
}

/* ===== Posporo ===== */
.cw-match {
  position: absolute;
  z-index: 6;
  width: 0;
  height: 0;
  pointer-events: none;
}
.cw-mflame {
  position: absolute;
  top: -20px;
  left: -8px;
  width: 16px;
  height: 26px;
  border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: radial-gradient(ellipse at 50% 70%, #fff6c0, #ffc247 55%, #ff7a2f);
  box-shadow: 0 0 22px 8px rgb(255 190 90 / 0.65);
  animation: cw-flicker 0.4s ease-in-out infinite alternate;
}
.cw-stick {
  position: absolute;
  top: 4px;
  left: -3px;
  width: 6px;
  height: 78px;
  border-radius: 3px;
  background: linear-gradient(90deg, #e9b878, #b97f3f);
  box-shadow: 0 3px 6px rgb(0 0 0 / 0.3);
  transform-origin: 50% 0;
  rotate: 14deg;
}
.cw-stick::before {
  content: "";
  position: absolute;
  top: -5px;
  left: -2px;
  width: 10px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ff6b4a, #a8231a);
}
/* malambot na ripple kapag namatay ang apoy */
.cw-puff {
  position: absolute;
  z-index: 6;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 0.85), rgb(255 255 255 / 0) 70%);
  pointer-events: none;
  animation: cw-puff 0.7s ease-out forwards;
}

.cw-hint {
  margin: 0;
  color: #fff4e0;
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 8px rgb(20 6 16 / 0.7);
}
.cw-next {
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 10px 22px rgb(0 0 0 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  pointer-events: auto;
  animation: cw-in 0.8s ease 0.6s both;
}

@keyframes cw-flicker {
  from {
    scale: 1 1;
    rotate: -3deg;
  }
  to {
    scale: 0.92 1.08;
    rotate: 3deg;
  }
}
@keyframes cw-ring {
  from {
    opacity: 0.5;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1.1);
  }
}
@keyframes cw-smoke {
  from {
    opacity: 0.9;
    transform: translateY(0) scale(0.6);
  }
  to {
    opacity: 0;
    transform: translateY(-46px) scale(2.4);
  }
}
@keyframes cw-puff {
  to {
    opacity: 0;
    transform: scale(4.5);
  }
}
@keyframes cw-in {
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
  .cw-head {
    top: 54px;
  }
  .cw-body {
    top: 122px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .cw-flame,
  .cw-mflame,
  .cw-ring {
    animation: none;
  }
}
</style>
