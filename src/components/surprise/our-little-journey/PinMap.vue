<template>
  <!-- 2) PIN OUR MEMORIES: hilahin ang pin papunta sa kumikislap na bilog sa mapa. Pag tama ang lugar, tatanim ito,
       guguhit ang ruta, at lalabas ang litrato at ang sandaling iyon. -->
  <section class="pm-stage">
    <header class="pm-head">
      <p class="pm-eyebrow">Stop {{ Math.min(placed + 1, n) }} of {{ n }}</p>
      <h2>{{ allPlaced ? "Every stop, pinned" : "Pin our memories" }}</h2>
    </header>

    <div ref="mapEl" class="pm-map">
      <svg class="pm-art" viewBox="0 0 300 260" aria-hidden="true">
        <path class="pm-gridline" d="M0 65H300M0 130H300M0 195H300M75 0V260M150 0V260M225 0V260" />
        <path class="pm-lake" d="M205 205Q225 185 250 201Q268 215 246 231Q220 243 205 205Z" />
        <path class="pm-hill" d="M10 40Q40 10 80 30Q100 50 70 70Q30 80 10 40Z" />
        <path class="pm-hill" d="M215 20Q250 0 285 25Q295 50 260 60Q225 55 215 20Z" />
        <path class="pm-mount" d="M110 80L128 52L146 80Z M130 84L152 46L174 84Z" />
        <path class="pm-snow" d="M122 61L128 52L134 61Z M146 58L152 46L158 58Z" />
        <circle class="pm-tree" cx="30" cy="150" r="7" />
        <circle class="pm-tree" cx="46" cy="160" r="6" />
        <circle class="pm-tree" cx="120" cy="225" r="7" />
        <circle class="pm-tree" cx="268" cy="115" r="6" />
        <g class="pm-rose" transform="translate(268 36)">
          <circle r="14" />
          <path d="M0 -12L3 0L0 12L-3 0Z" />
          <text y="-17">N</text>
        </g>
        <path v-for="(seg, k) in segs" :key="`g${k}`" :d="seg" class="pm-ghost" />
        <path v-for="(seg, k) in segs" :key="`r${k}`" :d="seg" pathLength="1" class="pm-route" :class="{ on: placed > k + 1 }" />
      </svg>

      <span
        v-for="(s, i) in spots"
        :key="`s${i}`"
        :ref="(el) => (spotEls[i] = el)"
        class="pm-spot"
        :class="{ next: i === placed && !allPlaced, done: i < placed }"
        :style="{ left: (s.x / 300) * 100 + '%', top: (s.y / 260) * 100 + '%' }"
      >
        <b>{{ i + 1 }}</b>
      </span>
      <span
        v-for="i in placed"
        :key="`p${i}`"
        class="pm-planted"
        :style="{ left: (spots[i - 1].x / 300) * 100 + '%', top: (spots[i - 1].y / 260) * 100 + '%' }"
      >
        <i>{{ i }}</i>
      </span>
    </div>

    <div v-if="!allPlaced" class="pm-tray">
      <button
        :key="placed"
        ref="pinEl"
        class="pm-pin"
        :class="{ drag: dragging, bad: wobble }"
        :style="pinStyle"
        type="button"
        :aria-label="`Drag pin ${placed + 1} to the glowing circle on the map`"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
        @keydown.enter.prevent="plant"
        @keydown.space.prevent="plant"
      >
        <span class="pm-pinhead">{{ placed + 1 }}</span>
        <span class="pm-needle" />
      </button>
      <span class="pm-note">Drag pin #{{ placed + 1 }} to the glowing circle</span>
    </div>

    <Transition name="pm-pop">
      <div v-if="cardOpen" class="pm-veil">
        <article class="pm-card">
          <span class="pm-tape" />
          <figure class="pm-photo">
            <img v-if="photoFor(cur)" :src="photoFor(cur)" alt="" draggable="false" />
            <span v-else class="pm-heart">♥</span>
            <figcaption v-if="captions[cur]">{{ captions[cur] }}</figcaption>
          </figure>
          <p class="pm-num">Stop {{ cur + 1 }}</p>
          <p class="pm-text">{{ milestones[cur] }}</p>
          <button class="pm-keep" type="button" @click="closeCard">{{ cur + 1 < n ? "Next stop →" : "Finish ✦" }}</button>
        </article>
      </div>
    </Transition>

    <Transition name="pm-rise">
      <button v-if="allPlaced && !cardOpen" class="pm-next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  milestones: { type: Array, required: true },
  photos: { type: Array, default: () => [] },
  captions: { type: Array, default: () => [] },
});
const emit = defineEmits(["placed", "finished", "done"]);

// mga lugar sa mapa (viewBox 300 x 260), sunod-sunod ang ruta
const SPOTS = [
  { x: 42, y: 205 },
  { x: 92, y: 128 },
  { x: 160, y: 188 },
  { x: 212, y: 108 },
  { x: 258, y: 176 },
  { x: 168, y: 52 },
];
const n = Math.min(props.milestones.length, SPOTS.length);
const spots = SPOTS.slice(0, n);

// kurbadang ruta sa pagitan ng bawat dalawang lugar
const segs = spots.slice(1).map((s, k) => {
  const a = spots[k];
  const mx = (a.x + s.x) / 2;
  const my = (a.y + s.y) / 2;
  const dx = s.x - a.x;
  const dy = s.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const off = (k % 2 ? 1 : -1) * 20;
  return `M${a.x} ${a.y} Q${(mx - (dy / len) * off).toFixed(1)} ${(my + (dx / len) * off).toFixed(1)} ${s.x} ${s.y}`;
});

const mapEl = ref(null);
const pinEl = ref(null);
const spotEls = [];
const placed = ref(0);
const cur = ref(0);
const cardOpen = ref(false);
const dragging = ref(false);
const wobble = ref(false);
const dx = ref(0);
const dy = ref(0);
const allPlaced = computed(() => placed.value >= n);

const photoFor = (i) => (props.photos.length ? props.photos[i % props.photos.length] : "");
const pinStyle = computed(() => ({
  translate: `${dx.value}px ${dy.value}px`,
  rotate: dragging.value ? "-6deg" : "0deg",
}));

let start = null;
let scale = 1;
const timers = [];

function down(event) {
  if (cardOpen.value) return;
  const r = pinEl.value.getBoundingClientRect();
  scale = r.width / (pinEl.value.offsetWidth || 1) || 1;
  start = { x: event.clientX, y: event.clientY };
  dragging.value = true;
  pinEl.value.setPointerCapture?.(event.pointerId);
}
function move(event) {
  if (!start) return;
  dx.value = (event.clientX - start.x) / scale;
  dy.value = (event.clientY - start.y) / scale;
}
function up() {
  if (!start) return;
  start = null;
  dragging.value = false;
  tryDrop();
}

// tama ba ang pinagbagsakan? sinusukat ang dulo ng karayom sa gitna ng susunod na lugar
function tryDrop() {
  const pin = pinEl.value.getBoundingClientRect();
  const tip = { x: pin.left + pin.width / 2, y: pin.bottom - 2 };
  const spot = spotEls[placed.value].getBoundingClientRect();
  const c = { x: spot.left + spot.width / 2, y: spot.top + spot.height / 2 };
  const map = mapEl.value.getBoundingClientRect();
  if (Math.hypot(tip.x - c.x, tip.y - c.y) < map.width * 0.17) plant();
  else {
    dx.value = 0;
    dy.value = 0;
    wobble.value = true;
    timers.push(setTimeout(() => (wobble.value = false), 500));
  }
}

function plant() {
  if (cardOpen.value || allPlaced.value) return;
  cur.value = placed.value;
  placed.value += 1;
  dx.value = 0;
  dy.value = 0;
  cardOpen.value = true;
  navigator.vibrate?.([20, 30, 20]);
  emit("placed", spotEls[cur.value]);
}

function closeCard(event) {
  cardOpen.value = false;
  if (placed.value >= n) emit("finished", event.currentTarget);
}

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<style scoped>
.pm-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.pm-head {
  position: absolute;
  top: 8%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.pm-eyebrow {
  margin: 0;
  color: var(--brown);
  font-family: var(--font-type);
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: var(--ink);
  font-family: var(--font-head);
  font-size: clamp(28px, 8.4cqi, 42px);
  font-weight: 600;
  line-height: 1.15;
}

/* ===== Mapa ===== */
.pm-map {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 19%;
  width: min(90cqi, 360px);
  aspect-ratio: 300 / 260;
  border: 3px solid #fff7e6;
  border-radius: 14px;
  background: linear-gradient(160deg, #f8ebcd, #efd9ac);
  box-shadow: 0 14px 28px rgb(74 47 28 / 0.3);
  translate: -50% 0;
}
.pm-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.pm-gridline {
  fill: none;
  stroke: rgb(122 75 42 / 0.14);
  stroke-width: 1;
}
.pm-lake {
  fill: #a9d6d2;
  stroke: #7fb7b2;
  stroke-width: 1.5;
}
.pm-hill {
  fill: #cddba0;
  stroke: #a9bd74;
  stroke-width: 1.5;
}
.pm-mount {
  fill: #b49670;
  stroke: #8a6b46;
  stroke-width: 1.5;
}
.pm-snow {
  fill: #fff7e6;
}
.pm-tree {
  fill: #7aa35a;
  stroke: #5c8240;
  stroke-width: 1.5;
}
.pm-rose circle {
  fill: rgb(255 247 230 / 0.8);
  stroke: #8a6b46;
  stroke-width: 1.5;
}
.pm-rose path {
  fill: var(--accent);
}
.pm-rose text {
  fill: #8a6b46;
  font: 700 9px var(--font-head);
  text-anchor: middle;
}
.pm-ghost {
  fill: none;
  stroke: rgb(122 75 42 / 0.45);
  stroke-width: 2;
  stroke-dasharray: 2 6;
  stroke-linecap: round;
}
.pm-route {
  fill: none;
  stroke: var(--accent);
  stroke-width: 3.2;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1s ease;
}
.pm-route.on {
  stroke-dashoffset: 0;
}

.pm-spot {
  position: absolute;
  display: grid;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  place-items: center;
  border: 2.5px dashed rgb(122 75 42 / 0.55);
  border-radius: 50%;
  color: rgb(122 75 42 / 0.75);
  font: 700 13px var(--font-head);
}
.pm-spot.next {
  border-color: var(--accent);
  background: rgb(224 112 79 / 0.2);
  color: var(--accent);
  animation: pm-pulse 1s ease-in-out infinite alternate;
}
.pm-spot.done {
  opacity: 0;
}
.pm-planted {
  position: absolute;
  width: 26px;
  margin: 0;
  translate: -50% -86%;
  animation: pm-drop 0.45s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.pm-planted i {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ff8c6b, #c4476b);
  box-shadow: 0 3px 6px rgb(74 47 28 / 0.4);
  color: #fff;
  font: 700 12px var(--font-head);
}
.pm-planted::after {
  content: "";
  display: block;
  width: 3px;
  height: 11px;
  margin: -1px auto 0;
  border-radius: 0 0 2px 2px;
  background: linear-gradient(#ddd, #777);
}

/* ===== Lalagyan ng pin ===== */
.pm-tray {
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: 8%;
  display: grid;
  width: min(90cqi, 360px);
  height: 92px;
  place-items: center;
  border: 2px dashed rgb(122 75 42 / 0.45);
  border-radius: 14px;
  background: rgb(255 247 230 / 0.5);
  translate: -50% 0;
}
.pm-note {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -26px;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 13px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
  pointer-events: none;
}
.pm-pin {
  position: relative;
  width: 40px;
  height: 56px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: grab;
  touch-action: none;
  transition: translate 0.35s cubic-bezier(0.3, 1.5, 0.5, 1), rotate 0.2s ease;
  animation: pm-in 0.5s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.pm-pin.drag {
  cursor: grabbing;
  transition: none;
  animation: none;
}
.pm-pin.bad {
  animation: pm-shake 0.4s ease;
}
.pm-pin:focus-visible {
  outline: 2px dashed var(--ink);
  outline-offset: 4px;
}
.pm-pinhead {
  display: grid;
  width: 38px;
  height: 38px;
  margin: 0 auto;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ff8c6b, #c4476b);
  box-shadow: 0 5px 10px rgb(74 47 28 / 0.4);
  color: #fff;
  font: 700 17px var(--font-head);
}
.pm-needle {
  display: block;
  width: 4px;
  height: 16px;
  margin: -2px auto 0;
  border-radius: 0 0 2px 2px;
  background: linear-gradient(#e6e6e6, #777);
}

/* ===== Alaala ===== */
.pm-veil {
  position: absolute;
  z-index: 8;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(74 47 28 / 0.42);
  backdrop-filter: blur(3px);
}
.pm-card {
  position: relative;
  width: min(88cqi, 330px);
  max-height: 74cqh;
  padding: 22px 20px 16px;
  overflow: hidden auto;
  border-radius: 6px;
  background:
    repeating-linear-gradient(0deg, transparent 0 27px, rgb(122 75 42 / 0.13) 27px 28px),
    linear-gradient(180deg, #fffaf0, #fbefd6);
  box-shadow: 0 18px 34px rgb(40 22 8 / 0.45);
}
.pm-tape {
  position: absolute;
  top: -10px;
  left: 50%;
  width: 84px;
  height: 22px;
  background: repeating-linear-gradient(45deg, rgb(232 169 58 / 0.85) 0 8px, rgb(255 213 128 / 0.85) 8px 16px);
  rotate: -3deg;
  translate: -50% 0;
}
.pm-photo {
  float: right;
  width: 104px;
  margin: 0 0 8px 12px;
  padding: 6px 6px 8px;
  background: #fff;
  box-shadow: 0 6px 12px rgb(74 47 28 / 0.28);
  rotate: 4deg;
}
.pm-photo img {
  display: block;
  width: 92px;
  height: 92px;
  object-fit: cover;
  pointer-events: none;
}
.pm-heart {
  display: grid;
  width: 92px;
  height: 92px;
  place-items: center;
  background: #fde4d4;
  color: var(--accent);
  font-size: 40px;
}
.pm-photo figcaption {
  padding-top: 5px;
  color: #6b5a47;
  font-family: var(--font-hand);
  font-size: 15px;
  line-height: 1.1;
  text-align: center;
}
.pm-num {
  margin: 0 0 4px;
  color: var(--accent);
  font-family: var(--font-type);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.pm-text {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: clamp(25px, 7.4cqi, 32px);
  line-height: 1.15;
}
.pm-keep {
  display: block;
  clear: both;
  margin: 12px auto 0;
  padding: 10px 26px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 8px 16px rgb(74 47 28 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.pm-pop-enter-active,
.pm-pop-leave-active {
  transition: opacity 0.35s ease;
}
.pm-pop-enter-active .pm-card {
  animation: pm-card-in 0.5s cubic-bezier(0.2, 1.2, 0.4, 1);
}
.pm-pop-enter-from,
.pm-pop-leave-to {
  opacity: 0;
}

.pm-next {
  position: absolute;
  z-index: 9;
  left: 50%;
  bottom: 4%;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 10px 22px rgb(74 47 28 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.pm-rise-enter-active {
  transition: opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s;
}
.pm-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes pm-pulse {
  to {
    scale: 1.18;
    box-shadow: 0 0 0 8px rgb(224 112 79 / 0.18);
  }
}
@keyframes pm-drop {
  from {
    opacity: 0;
    transform: translateY(-34px) scale(1.4);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes pm-in {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.5);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes pm-shake {
  25% {
    rotate: -12deg;
  }
  75% {
    rotate: 12deg;
  }
}
@keyframes pm-card-in {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.7) rotate(-4deg);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@container (max-height: 620px) {
  .pm-head {
    top: 4%;
  }
  .pm-map {
    top: 17%;
    width: min(74cqi, 290px);
  }
  .pm-tray {
    bottom: 6%;
    height: 78px;
    width: min(80cqi, 320px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pm-spot.next,
  .pm-pin {
    animation: none;
  }
}
</style>