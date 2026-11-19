<template>
  <!-- 4) MAKE A WISH (4 hakbang): 1) i-drag ang posporo para sindihan ang 5 kandila,
       2) i-hold ang cake para mag-wish (pupuno ang singsing, aangat ang mga bituin),
       3) i-swipe ang daliri sa mga apoy para hipan, 4) confetti + pangalan; pwede pang i-tap ang cake para sa confetti. -->
  <section class="wish-stage" :class="[`is-${phase}`]">
    <header class="head">
      <p class="eyebrow">{{ copy.eyebrow }}</p>
      <h2>
        <Transition name="swap" mode="out-in">
          <span :key="copy.title">{{ copy.title }}</span>
        </Transition>
      </h2>
    </header>

    <svg
      ref="svgEl"
      class="cake"
      :class="{ holding }"
      viewBox="0 0 300 220"
      tabindex="0"
      role="group"
      aria-label="Birthday cake with candles"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @pointerleave="onUp"
      @keydown.space.prevent="startHold"
      @keyup.space.prevent="stopHold"
      @click="onCakeClick"
    >
      <defs>
        <linearGradient id="te-wish-sponge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#f1e3c4" />
          <stop offset="0.45" stop-color="#fffaf0" />
          <stop offset="1" stop-color="#ead8b2" />
        </linearGradient>
        <linearGradient id="te-wish-icing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff4f2" />
          <stop offset="1" stop-color="#f6cfc8" />
        </linearGradient>
        <linearGradient id="te-wish-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#b8914f" />
          <stop offset="0.5" stop-color="#ecd49a" />
          <stop offset="1" stop-color="#b8914f" />
        </linearGradient>
        <radialGradient id="te-wish-glow">
          <stop offset="0" stop-color="#fff2c4" stop-opacity="0.95" />
          <stop offset="0.5" stop-color="#f0c96c" stop-opacity="0.35" />
          <stop offset="1" stop-color="#f0c96c" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="te-wish-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#f2a33a" />
          <stop offset="0.55" stop-color="#ffd877" />
          <stop offset="1" stop-color="#fff8dc" />
        </linearGradient>
      </defs>

      <circle class="halo" :class="{ on: phase === 'done', warm: holding }" cx="150" cy="110" r="130" fill="url(#te-wish-glow)" />

      <!-- singsing ng wish: pumupuno habang naka-hold -->
      <g v-if="phase === 'wish'" class="ring">
        <ellipse cx="150" cy="128" rx="142" ry="102" class="ring-track" />
        <ellipse cx="150" cy="128" rx="142" ry="102" class="ring-fill" pathLength="100" :stroke-dasharray="`${progress * 100} 100`" />
      </g>

      <!-- plato -->
      <ellipse cx="150" cy="203" rx="124" ry="10" fill="rgb(100 70 20 / 0.16)" />
      <ellipse cx="150" cy="199" rx="120" ry="9" fill="#fffdf8" stroke="#c9a15a" stroke-width="1.2" />

      <g class="cake-body" :class="{ pop: popKey % 2 === 1, pop2: popKey % 2 === 0 && popKey > 0 }">
        <!-- ibabang patong -->
        <rect x="50" y="146" width="200" height="54" rx="8" fill="url(#te-wish-sponge)" stroke="#d6bd8a" stroke-width="1" />
        <rect x="50" y="184" width="200" height="4" fill="url(#te-wish-gold)" />
        <circle v-for="n in 13" :key="`pb${n}`" :cx="50 + n * 14.3" cy="171" r="2.6" :fill="DOTS[n % DOTS.length]" />
        <path :d="icing(50, 250, 146, 8, 10)" fill="url(#te-wish-icing)" stroke="#ecc0b6" stroke-width="0.8" />

        <!-- itaas na patong -->
        <rect x="88" y="100" width="124" height="46" rx="8" fill="url(#te-wish-sponge)" stroke="#d6bd8a" stroke-width="1" />
        <rect x="88" y="130" width="124" height="4" fill="url(#te-wish-gold)" />
        <path :d="icing(88, 212, 100, 5, 9)" fill="url(#te-wish-icing)" stroke="#ecc0b6" stroke-width="0.8" />

      <!-- kandila: kasama sa iisang grupo ng cake para sabay gumalaw -->
      <g v-for="(c, i) in CANDLES" :key="i" :transform="`translate(${c.x} 100)`">
        <circle class="flame-glow" :class="{ on: lit[i] && !out[i] }" cy="-48" :r="17 + progress * 9" fill="url(#te-wish-glow)" />
        <rect x="-3.6" y="-34" width="7.2" height="34" rx="1.6" :fill="c.color" stroke="#c9a15a" stroke-width="0.7" />
        <path d="M-3.6 -27L3.6 -22M-3.6 -18L3.6 -13M-3.6 -9L3.6 -4" stroke="#fffaf0" stroke-width="2" opacity="0.85" />
        <path d="M0 -34V-38" stroke="#6f5a35" stroke-width="1" stroke-linecap="round" />
        <g class="lean" :style="{ '--lean': `${lean}deg` }">
          <g class="wrap" :class="{ lit: lit[i] && !out[i], out: out[i] }">
            <g class="flame" :style="{ '--d': `${1.1 + (i % 3) * 0.25}s` }">
              <path d="M0 -37C-5.5 -43 -4.6 -49 0 -58C4.6 -49 5.5 -43 0 -37Z" fill="url(#te-wish-flame)" />
            </g>
          </g>
        </g>
        <path v-if="out[i]" class="smoke" d="M0 -40C-7 -50 7 -58 0 -72" />
        <!-- malaking sakop para madaling ma-tap (gumagana rin sa keyboard) -->
        <rect
          class="hit"
          x="-12"
          y="-72"
          width="24"
          height="76"
          fill="transparent"
          tabindex="0"
          role="button"
          :aria-label="burning(i) ? `Blow out candle ${i + 1}` : `Light candle ${i + 1}`"
          @click.stop="tapCandle(i)"
          @keydown.enter.prevent="tapCandle(i, true)"
        />
      </g>
      </g>

      <!-- mga bituin ng wish -->
      <g class="wishes" aria-hidden="true">
        <g v-for="w in wishes" :key="w.id" :transform="`translate(${w.x} 108)`">
          <path class="wish-star" :d="STAR" :style="{ '--dx': `${w.dx}px`, '--rise': `${w.rise}px`, '--d': `${w.d}s`, '--s': w.s }" />
        </g>
      </g>

      <!-- hangin ng hipan -->
      <g class="gusts" aria-hidden="true">
        <g v-for="g in gusts" :key="g.id" :transform="`translate(${g.x} ${g.y}) scale(${g.dir} 1)`">
          <path class="gust" d="M0 0C12 -7 24 7 38 0" />
        </g>
      </g>

      <!-- posporo: sumusunod sa daliri -->
      <g v-if="phase === 'light' || phase === 'done'" class="match" :class="{ idle: !match }" :transform="`translate(${matchPos.x} ${matchPos.y})`" aria-hidden="true">
        <circle class="match-glow" cy="-6" r="18" fill="url(#te-wish-glow)" />
        <path d="M0 2C-4 -2 -3.4 -7 0 -14C3.4 -7 4 -2 0 2Z" fill="url(#te-wish-flame)" class="match-flame" />
        <path d="M0 5L-9 38" stroke="#c9a15a" stroke-width="3" stroke-linecap="round" />
        <circle cy="4" r="3.6" fill="#a8452f" />
      </g>
    </svg>

    <p class="hint" :class="{ pulse: phase === 'wish' && !holding }">{{ copy.hint }}</p>

    <Transition name="rise">
      <div v-if="phase === 'done'" class="names">
        <p class="together">Happy birthday</p>
        <p class="pair">{{ recipient }}</p>
        <p class="from">with all my love, {{ sender }}</p>
        <button class="next" type="button" @click="emit('done')">Continue ✦</button>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
});
const emit = defineEmits(["blown", "wished", "done", "pop"]);

const CANDLES = [
  { x: 102, color: "#fbe4ec" },
  { x: 126, color: "#fff6de" },
  { x: 150, color: "#fde8e2" },
  { x: 174, color: "#e3ecd9" },
  { x: 198, color: "#fbe4ec" },
];
const DOTS = ["#e79bb4", "#d9b46a", "#a3b294"];
const STAR = "M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z";
const HOLD_MS = 2200; // gaano katagal i-hold para matapos ang wish
const WICK_Y = 62; // taas ng mitsa sa viewBox
const MATCH_LIFT = 24; // nasa itaas ng daliri ang apoy ng posporo para hindi matakpan
const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// puting icing na may kulot na patak sa gilid
function icing(x0, x1, y, count, depth) {
  const w = (x1 - x0) / count;
  let d = `M${x0} ${y + 6}Q${x0} ${y - 2} ${x0 + 8} ${y - 2}H${x1 - 8}Q${x1} ${y - 2} ${x1} ${y + 6}`;
  for (let k = 0; k < count; k++) {
    const xe = x1 - (k + 1) * w;
    const drop = depth + (k % 2 ? 4 : 0);
    d += `Q${x1 - k * w - w / 2} ${y + 6 + drop * 2} ${xe} ${y + 6}`;
  }
  return `${d}Z`;
}

const svgEl = ref(null);
const phase = ref("light"); // light → wish → blow → done
const lit = ref(CANDLES.map(() => false));
const out = ref(CANDLES.map(() => false));
// bilang ng kandilang may apoy ngayon (nagbabago kapag sinindihan o pinatay ulit)
const left = computed(() => CANDLES.filter((_, i) => lit.value[i] && !out.value[i]).length);
const litCount = left;

const copy = computed(() => {
  switch (phase.value) {
    case "light":
      return {
        eyebrow: "Step one",
        title: "Light the candles",
        hint: `Drag the match to each wick, or tap a candle · ${litCount.value} / ${CANDLES.length} lit`,
      };
    case "wish":
      return {
        eyebrow: "Make a wish",
        title: "Close your eyes…",
        hint: holding.value ? "Keep holding… wishing ✦" : "Press and hold the cake to make your wish",
      };
    case "blow":
      return {
        eyebrow: "Now blow!",
        title: "Swipe across the flames",
        hint: `${left.value} ${left.value === 1 ? "flame" : "flames"} left · swipe to blow`,
      };
    default:
      return { eyebrow: "Wish made", title: "Happy birthday!", hint: "Drag the match to light · swipe to blow · tap the cake for confetti ✦" };
  }
});

const timers = new Set();
function later(fn, ms) {
  const id = setTimeout(() => {
    timers.delete(id);
    fn();
  }, ms);
  timers.add(id);
}

/* ===== posisyon ng daliri sa viewBox ===== */
function local(event) {
  const svg = svgEl.value;
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: p.x, y: p.y };
}

/* ===== 1) Sindihan (gumagana ulit kahit tapos na ang wish) ===== */
let downAt = null; // saan nagsimula ang daliri; para malaman kung drag o tap
let dragged = false;
let downTime = 0;
let gesture = null; // "match" o "swipe"
let lastBlowAt = 0;
const REST = { x: 34, y: 150 }; // saan nakapahinga ang posporo
const match = ref(null); // null = nakapahinga sa kaliwa
const matchPos = computed(() => (match.value ? { x: match.value.x, y: match.value.y - MATCH_LIFT } : REST));

const burning = (i) => lit.value[i] && !out.value[i];

function light(i) {
  if (burning(i)) return;
  lit.value = lit.value.map((v, k) => (k === i ? true : v));
  out.value = out.value.map((v, k) => (k === i ? false : v)); // pwedeng sindihan ulit kahit kailan
  navigator.vibrate?.(10);
  emit("blown", svgEl.value);
  if (phase.value === "light" && litCount.value === CANDLES.length) {
    later(() => {
      match.value = null;
      phase.value = "wish";
    }, 700);
  }
}
function dragMatch(p) {
  match.value = p;
  if (downAt && Math.hypot(p.x - downAt.x, p.y - downAt.y) > 8) dragged = true;
  const fx = p.x;
  const fy = p.y - MATCH_LIFT - 6;
  if (!dragged) return; // tap lang: ang click sa kandila ang bahala (para hindi sindi-tapos-hipan agad)
  CANDLES.forEach((c, i) => {
    if (!burning(i) && Math.hypot(fx - c.x, fy - WICK_Y) < 17) light(i);
  });
}

/* ===== 2) Wish: i-hold ===== */
const progress = ref(0);
const holding = ref(false);
const wishes = ref([]);
let wishId = 0;
let raf = 0;
let lastT = 0;
let spawnAcc = 0;

function addWish() {
  const id = ++wishId;
  wishes.value = [
    ...wishes.value.slice(-16),
    { id, x: 70 + Math.random() * 160, dx: (Math.random() - 0.5) * 70, rise: 110 + Math.random() * 90, d: 1.6 + Math.random() * 1.2, s: 0.6 + Math.random() * 0.9 },
  ];
  later(() => (wishes.value = wishes.value.filter((w) => w.id !== id)), 3200);
}
function startHold() {
  if (phase.value !== "wish" || holding.value) return;
  holding.value = true;
  lastT = performance.now();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(holdTick);
}
function stopHold() {
  holding.value = false;
}
function holdTick(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
  lastT = now;
  if (holding.value) {
    progress.value = Math.min(1, progress.value + (dt * 1000) / HOLD_MS);
    spawnAcc += dt;
    const every = reduce ? 0.4 : 0.11;
    while (spawnAcc > every) {
      spawnAcc -= every;
      addWish();
    }
    if (progress.value >= 1) return finishWish();
  } else {
    progress.value = Math.max(0, progress.value - dt / 0.8); // nauubos kapag binitawan nang maaga
  }
  if (holding.value || progress.value > 0) raf = requestAnimationFrame(holdTick);
}
function finishWish() {
  holding.value = false;
  phase.value = "blow";
  navigator.vibrate?.([15, 30, 15]);
  emit("blown", svgEl.value);
  for (let k = 0; k < 6; k++) later(addWish, k * 90);
  later(() => (progress.value = 0), 600);
  if (left.value === 0) later(() => phase.value === "blow" && finish(), 800); // naipatay na lahat noong nag-wish
}

/* ===== 3) Hipan: i-swipe ===== */
const lean = ref(0);
const gusts = ref([]);
let gustId = 0;
let lastGust = 0;
let lastX = null;
let leanTimer = 0;

function blow(i) {
  if (!burning(i)) return;
  out.value = out.value.map((v, k) => (k === i ? true : v));
  navigator.vibrate?.(12);
  emit("blown", svgEl.value);
  if (phase.value === "blow" && left.value === 0) later(finish, 800);
}
function finish() {
  phase.value = "done";
  lean.value = 0;
  navigator.vibrate?.([20, 40, 30]);
  emit("wished", svgEl.value);
  for (let k = 0; k < 10; k++) later(addWish, k * 120);
}
function gust(p, dx) {
  lean.value = Math.max(-38, Math.min(38, dx * 3));
  clearTimeout(leanTimer);
  leanTimer = setTimeout(() => (lean.value = 0), 260);
  const now = performance.now();
  if (now - lastGust < 55) return;
  lastGust = now;
  const id = ++gustId;
  gusts.value = [...gusts.value.slice(-8), { id, x: p.x - 18, y: p.y, dir: dx >= 0 ? 1 : -1 }];
  later(() => (gusts.value = gusts.value.filter((g) => g.id !== id)), 650);
}
function swipe(p) {
  const dx = lastX === null ? 0 : p.x - lastX;
  lastX = p.x;
  gust(p, dx);
  // ang daliring dumaan sa ibabaw/paligid ng kandila ay humihipan nito
  if (p.y < 118) {
    CANDLES.forEach((c, i) => {
      if (burning(i) && Math.abs(p.x - c.x) < 14) {
        lastBlowAt = performance.now(); // para hindi ito masundan ng "click" na magsisindi ulit
        blow(i);
      }
    });
  }
}

/* ===== Mga event ng daliri/mouse ===== */
function onDown(event) {
  const p = local(event);
  downAt = p;
  downTime = performance.now();
  dragged = false;
  lastX = p.x;
  if (phase.value === "light") {
    gesture = "match";
    dragMatch(p);
  } else if (phase.value === "done") {
    // sa posporo nagsimula = i-drag ang posporo; saan pa man = swipe para humipan
    gesture = Math.hypot(p.x - REST.x, p.y - REST.y) < 38 ? "match" : "swipe";
    if (gesture === "match") dragMatch(p);
  } else if (phase.value === "wish") startHold();
  // sa "blow" hindi humihipan sa mismong pagdampi, sa paggalaw lang (para hindi magsindi ulit ang click)
}
function onMove(event) {
  const p = local(event);
  const pressed = event.pointerType !== "mouse" || event.buttons > 0;
  if (phase.value === "light" && pressed) dragMatch(p);
  else if (phase.value === "blow") swipe(p);
  else if (phase.value === "done" && pressed) {
    if (gesture === "match") dragMatch(p);
    else if (gesture === "swipe") swipe(p);
  }
}
function onUp() {
  if (phase.value === "light" || phase.value === "done") match.value = null;
  if (phase.value === "wish") stopHold();
  gesture = null;
  lastX = null;
}
// fallback: i-tap ang kandila (keyboard o hindi marunong mag-drag)
function tapCandle(i, fromKey = false) {
  // hindi tap kapag drag o matagal na hold (wish); doon hindi dapat magbago ang kandila
  if (!fromKey && (dragged || performance.now() - downTime > 450 || performance.now() - lastBlowAt < 500)) return;
  if (burning(i)) blow(i);
  else light(i);
}

/* ===== 4) Tapos na: i-tap ang cake para sa confetti ===== */
const popKey = ref(0);
function onCakeClick() {
  if (phase.value !== "done" || dragged) return; // hindi pop kapag nag-drag ng posporo
  popKey.value += 1;
  navigator.vibrate?.(10);
  emit("pop", svgEl.value);
  for (let k = 0; k < 5; k++) later(addWish, k * 70);
}

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  clearTimeout(leanTimer);
  timers.forEach(clearTimeout);
});
</script>

<style scoped>
.wish-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 70px 18px 90px;
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
.cake {
  flex: 0 1 auto;
  width: min(100%, 380px);
  overflow: visible;
  outline: none;
  touch-action: none;
  filter: drop-shadow(0 8px 10px rgb(100 70 20 / 0.12));
}
.is-light .cake,
.is-blow .cake {
  cursor: grab;
}
.is-wish .cake {
  cursor: pointer;
}
.is-done .cake {
  cursor: pointer;
}
.cake:focus-visible {
  outline: 2px dashed #b8914f;
  outline-offset: 6px;
}
.hit {
  cursor: pointer;
  outline: none;
}
.hit.done {
  pointer-events: none;
}
.hit:focus-visible {
  stroke: #b8914f;
  stroke-width: 1.2;
  stroke-dasharray: 3 3;
}

/* apoy: lean (hangin) > wrap (sindi/patay) > flame (kumikislap) */
.lean {
  transform-origin: 0 -37px;
  transform: rotate(var(--lean, 0deg));
  transition: transform 0.25s ease-out;
}
.wrap {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  transform: scale(0);
  opacity: 0;
}
.wrap.lit {
  transform: scale(1);
  opacity: 1;
  transition: transform 0.45s cubic-bezier(0.3, 1.8, 0.5, 1), opacity 0.2s ease;
}
.wrap.out {
  transform: scale(0.1, 0.4) translateY(-4px);
  opacity: 0;
  transition: transform 0.35s ease-in, opacity 0.35s ease-in;
}
.flame {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flicker var(--d) ease-in-out infinite alternate;
}
.flame-glow {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: 50% 50%;
  transition: opacity 0.45s ease;
}
.flame-glow.on {
  opacity: 1;
  animation: breathe 2.4s ease-in-out infinite;
}

/* posporo */
.match {
  pointer-events: none;
  transition: transform 0.45s cubic-bezier(0.3, 1.2, 0.5, 1);
}
.match:not(.idle) {
  transition: none;
}
.match.idle {
  animation: bob 1.8s ease-in-out infinite;
}
.match-flame {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flicker 0.5s ease-in-out infinite alternate;
}

/* singsing at bituin ng wish */
.ring {
  pointer-events: none;
}
.ring-track {
  fill: none;
  stroke: rgb(184 145 79 / 0.22);
  stroke-width: 1.4;
  stroke-dasharray: 2 5;
}
.ring-fill {
  fill: none;
  stroke: #d9b46a;
  stroke-width: 2.6;
  stroke-linecap: round;
  filter: drop-shadow(0 0 5px rgb(236 200 110 / 0.9));
}
.wish-star {
  fill: #f3d487;
  stroke: #fff8dc;
  stroke-width: 0.6;
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: wish-up var(--d) ease-out forwards;
}
.cake-body {
  /* iisang pivot (paanan ng cake) para sabay gumalaw ang cake at mga kandila */
  transform-box: view-box;
  transform-origin: 150px 200px;
}
.cake.holding .cake-body {
  animation: tremble 0.18s linear infinite;
}
.cake-body.pop {
  animation: pop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.cake-body.pop2 {
  animation: pop2 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.gusts,
.wishes {
  pointer-events: none;
}
.gust {
  fill: none;
  stroke: rgb(184 145 79 / 0.55);
  stroke-width: 1.6;
  stroke-linecap: round;
  animation: gust 0.65s ease-out forwards;
}
.smoke {
  fill: none;
  stroke: rgb(120 100 70 / 0.55);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-dasharray: 40;
  pointer-events: none;
  animation: smoke 1.8s ease-out forwards;
}
.halo {
  opacity: 0;
  transition: opacity 1.4s ease;
}
.halo.warm {
  opacity: 0.6;
}
.halo.on {
  opacity: 1;
  animation: breathe 3s ease-in-out infinite;
  transform-origin: 150px 110px;
}

.hint {
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  pointer-events: none;
}
.hint.pulse {
  animation: pulse 1.6s ease-in-out infinite;
}
.names {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.together {
  margin: 0;
  color: #b8914f;
  font-family: var(--font-serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.pair {
  margin: 0;
  font-family: var(--font-script);
  font-size: clamp(40px, 12cqi, 58px);
  line-height: 1.2;
  background: linear-gradient(180deg, #e2c48a 5%, #b8914f 60%, #8f6d33 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.from {
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 17px;
  font-style: italic;
}
.next {
  margin-top: 14px;
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
.swap-leave-active {
  transition: opacity 0.5s ease, filter 0.5s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(6px);
}
.rise-enter-active {
  transition: opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes flicker {
  from {
    transform: scale(1, 1) rotate(-2deg);
  }
  to {
    transform: scale(0.92, 1.08) rotate(2deg);
  }
}
@keyframes breathe {
  50% {
    transform: scale(1.12);
    opacity: 0.75;
  }
}
@keyframes bob {
  50% {
    transform: translate(34px, 144px);
  }
}
@keyframes wish-up {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.2);
  }
  15% {
    opacity: 1;
    transform: translate(0, -10px) scale(var(--s));
  }
  100% {
    opacity: 0;
    transform: translate(var(--dx), calc(var(--rise) * -1)) scale(calc(var(--s) * 0.6)) rotate(90deg);
  }
}
@keyframes tremble {
  25% {
    transform: translateX(-0.6px);
  }
  75% {
    transform: translateX(0.6px);
  }
}
@keyframes pop {
  40% {
    transform: scale(1.06, 0.94);
  }
  70% {
    transform: scale(0.97, 1.04);
  }
}
@keyframes pop2 {
  40% {
    transform: scale(1.06, 0.94);
  }
  70% {
    transform: scale(0.97, 1.04);
  }
}
@keyframes gust {
  from {
    opacity: 0.9;
  }
  to {
    opacity: 0;
    transform: translate(20px, -4px);
  }
}
@keyframes pulse {
  50% {
    opacity: 0.45;
  }
}
@keyframes smoke {
  from {
    opacity: 0;
    stroke-dashoffset: 40;
    transform: translateY(6px);
  }
  25% {
    opacity: 0.8;
  }
  to {
    opacity: 0;
    stroke-dashoffset: 0;
    transform: translateY(-14px);
  }
}
@container (max-height: 620px) {
  .wish-stage {
    gap: 8px;
    padding: 30px 18px 36px;
  }
  .cake {
    width: min(100%, 250px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .flame,
  .flame-glow.on,
  .halo.on,
  .match,
  .match-flame,
  .cake.holding .cake-body,
  .smoke {
    animation: none;
  }
}
</style>
