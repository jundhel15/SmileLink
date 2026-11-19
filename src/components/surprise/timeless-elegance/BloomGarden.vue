<template>
  <!-- 2) BLOOM GARDEN: bouquet ng mga usbong sa vase; i-tap ang bawat usbong para mamukadkad.
       Sa gitna ng bawat bulaklak lalabas ang isang litrato + isang bagay na hinahangaan niya sa kanya. -->
  <section ref="stageEl" class="garden-stage">
    <header class="head">
      <p class="eyebrow">Things I adore about you</p>
      <h2>Let each bud bloom</h2>
    </header>

    <div class="note-slot" aria-live="polite">
      <Transition name="note" mode="out-in">
        <p :key="current" class="note">{{ current >= 0 ? blooms[current] : "Tap a bud to see what it holds." }}</p>
      </Transition>
    </div>

    <svg class="stems" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path
        v-for="(text, i) in blooms"
        :key="i"
        class="stem"
        :class="{ grown: opened.includes(i) }"
        :d="stem(i)"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <div class="vase" aria-hidden="true"><span class="vase-shine" /></div>

    <button
      v-for="(text, i) in blooms"
      :key="`f${i}`"
      class="flower"
      :class="{ open: opened.includes(i) }"
      :style="{
        left: `${spot(i).x}%`,
        top: `${spot(i).y}%`,
        '--c1': PALETTE[i % PALETTE.length][0],
        '--c2': PALETTE[i % PALETTE.length][1],
        '--delay': `${i * 0.2}s`,
      }"
      type="button"
      :aria-label="opened.includes(i) && photoAt(i) ? `View photo ${i + 1}` : `Bloom flower ${i + 1}`"
      @click="onFlower(i, $event)"
    >
      <span class="sway">
        <svg viewBox="-50 -50 100 100" aria-hidden="true">
          <defs>
            <radialGradient :id="`te-bg-p${i}`" cx="0.5" cy="1" r="1">
              <stop offset="0" :stop-color="PALETTE[i % PALETTE.length][1]" />
              <stop offset="0.8" :stop-color="PALETTE[i % PALETTE.length][0]" />
            </radialGradient>
            <clipPath :id="`te-bg-c${i}`"><circle r="17" /></clipPath>
          </defs>
          <!-- dahon sa ilalim -->
          <g class="leaves">
            <path d="M0 8C-14 6-26 14-30 28C-16 28-4 22 0 8Z" fill="#8fa27f" />
            <path d="M0 8C14 6 26 14 30 28C16 28 4 22 0 8Z" fill="#7d9270" />
          </g>
          <!-- labas na hanay ng petal -->
          <g v-for="n in 8" :key="`o${n}`" :transform="`rotate(${(n - 1) * 45})`">
            <g class="pg" :style="{ '--a': '0deg' }">
              <path class="pt" :style="{ '--k': n }" d="M0 0C-12-10-13-34 0-47C13-34 12-10 0 0Z" :fill="`url(#te-bg-p${i})`" />
            </g>
          </g>
          <!-- loob na hanay -->
          <g v-for="n in 8" :key="`n${n}`" :transform="`rotate(${(n - 1) * 45 + 22.5})`">
            <g class="pg inner">
              <path class="pt in" :style="{ '--k': n + 3 }" d="M0 0C-10-8-11-27 0-37C11-27 10-8 0 0Z" :fill="`url(#te-bg-p${i})`" />
            </g>
          </g>
          <!-- gitna: litrato (o gintong butil kung wala) -->
          <g class="center">
            <circle r="19.5" fill="#fffaf0" />
            <circle r="17.5" fill="#d9b46a" />
            <image
              v-if="photoAt(i)"
              :href="photoAt(i)"
              x="-17"
              y="-17"
              width="34"
              height="34"
              preserveAspectRatio="xMidYMid slice"
              :clip-path="`url(#te-bg-c${i})`"
            />
            <circle r="19.5" fill="none" stroke="#b8914f" stroke-width="1.6" />
            <!-- mas malaking sakop para madaling ma-tap ang maliit na litrato -->
            <circle class="pic-hit" r="25" fill="transparent" />
          </g>
        </svg>
      </span>
    </button>

    <p v-if="!allOpen" class="hint">{{ opened.length }} / {{ blooms.length }} in bloom</p>

    <Transition name="rise">
      <button v-if="allOpen" class="next" type="button" @click="onContinue">Continue ✦</button>
    </Transition>

    <!-- Paglaki ng litrato: lumalaki mula sa gitna ng bulaklak, kusang bumabalik at naglalaho. Opsyonal lang ito. -->
    <Transition :css="false" mode="out-in" @enter="onViewerEnter" @leave="onViewerLeave">
      <div v-if="viewer" :key="viewer.i" class="viewer">
        <div class="veil" />
        <figure class="frame" role="button" tabindex="0" aria-label="Close photo" @click="closeViewer" @keydown.enter="closeViewer" @keydown.esc="closeViewer">
          <img :src="viewer.src" alt="" draggable="false" />
        </figure>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  blooms: { type: Array, required: true },
  // litrato para sa gitna ng bawat bulaklak (URL); inuulit kung kulang
  photos: { type: Array, default: () => [] },
});
const emit = defineEmits(["bloomed", "done"]);

// [panlabas, ilalim ng petal]
const PALETTE = [
  ["#fffdf8", "#f0dcc0"],
  ["#fde8e2", "#f0a79a"],
  ["#fff6de", "#ecc873"],
  ["#ffffff", "#cfdcc4"],
  ["#fbe4ec", "#e79bb4"],
];
// 5 bulaklak: isa sa itaas, dalawa sa gilid, dalawa sa ibaba (hindi nagsasapawan sa phone)
const SPOTS = [
  { x: 50, y: 44 },
  { x: 22, y: 55 },
  { x: 78, y: 55 },
  { x: 33, y: 69 },
  { x: 67, y: 69 },
  { x: 14, y: 68 },
  { x: 86, y: 68 },
];
const spot = (i) => SPOTS[i % SPOTS.length];
const photoAt = (i) => (props.photos.length ? props.photos[i % props.photos.length] : "");
// tangkay: mula sa vase (50, 86) papunta sa bulaklak
function stem(i) {
  const { x, y } = spot(i);
  const mid = (86 + y) / 2;
  return `M50 86 C50 ${mid + 6}, ${x} ${mid}, ${x} ${y + 6}`;
}

const opened = ref([]);
const current = ref(-1);
const allOpen = computed(() => opened.value.length === props.blooms.length);

// ===== Paglaki ng litrato =====
const VIEW_MS = 3800; // gaano katagal bago kusang mawala
const stageEl = ref(null);
const viewer = ref(null);
let viewTarget = null; // bilog sa gitna ng bulaklak na pinanggalingan
let viewTimer = 0;
const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function onFlower(i, event) {
  if (!opened.value.includes(i)) return bloom(i, event);
  // bukas na: litrato lang sa gitna ang lalaki (o Enter gamit ang keyboard)
  const onPhoto = event.detail === 0 || event.target.closest?.(".center");
  if (!onPhoto || !photoAt(i)) return;
  if (viewer.value?.i === i) return closeViewer();
  openViewer(i, event.currentTarget);
}
function openViewer(i, button) {
  clearTimeout(viewTimer);
  viewTarget = button.querySelector(".center circle");
  current.value = i; // para tumugma ang sulat sa litratong tinitingnan
  viewer.value = { i, src: photoAt(i) };
}
function closeViewer() {
  clearTimeout(viewTimer);
  viewer.value = null;
}
function originOf(frame) {
  const o = viewTarget.getBoundingClientRect();
  const f = frame.getBoundingClientRect();
  return {
    dx: o.left + o.width / 2 - (f.left + f.width / 2),
    dy: o.top + o.height / 2 - (f.top + f.height / 2),
    s: o.width / f.width,
  };
}
function onViewerEnter(el, done) {
  const frame = el.querySelector(".frame");
  const veil = el.querySelector(".veil");
  if (!viewTarget || reduceMotion()) {
    veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: "both" });
    frame.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: "both" }).finished.then(arm);
    return done();
  }
  const { dx, dy, s } = originOf(frame);
  veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: "ease-out", fill: "both" });
  frame
    .animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${s})`, borderRadius: "50%", opacity: 0.2 },
        { opacity: 1, offset: 0.25 },
        { transform: "translate(0, 0) scale(1)", borderRadius: "10px", opacity: 1 },
      ],
      { duration: 720, easing: "cubic-bezier(0.22, 1.1, 0.36, 1)", fill: "both" },
    )
    .finished.then(arm, () => {});
  done();
  function arm() {
    clearTimeout(viewTimer);
    viewTimer = setTimeout(closeViewer, VIEW_MS);
  }
}
function onViewerLeave(el, done) {
  const frame = el.querySelector(".frame");
  const veil = el.querySelector(".veil");
  const end = () => done();
  if (!viewTarget || !viewTarget.isConnected || reduceMotion()) {
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "both" }).finished.then(end, end);
    return;
  }
  const { dx, dy, s } = originOf(frame);
  veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: "ease-in", fill: "both" });
  frame
    .animate(
      [
        { transform: "translate(0, 0) scale(1)", borderRadius: "10px", opacity: 1, filter: "blur(0)" },
        { opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(${s})`, borderRadius: "50%", opacity: 0, filter: "blur(2px)" },
      ],
      { duration: 650, easing: "cubic-bezier(0.5, 0, 0.75, 0.4)", fill: "both" },
    )
    .finished.then(end, end);
}
function onContinue() {
  closeViewer();
  emit("done");
}
onBeforeUnmount(() => clearTimeout(viewTimer));

function bloom(i, event) {
  if (opened.value.includes(i)) return;
  opened.value = [...opened.value, i];
  current.value = i;
  navigator.vibrate?.(15);
  emit("bloomed", event.currentTarget);
}
</script>

<style scoped>
.garden-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.head {
  position: absolute;
  top: 9%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
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

/* ===== Kard ng sulat ===== */
.note-slot {
  position: absolute;
  top: 21%;
  left: 50%;
  display: grid;
  place-items: center;
  width: min(100% - 56px, 340px);
  min-height: 74px;
  padding: 12px 20px;
  border: 1px solid rgb(184 145 79 / 0.6);
  background: rgb(255 253 247 / 0.85);
  box-shadow:
    0 0 0 4px rgb(255 253 247 / 0.6),
    0 10px 24px rgb(120 90 40 / 0.15);
  transform: translateX(-50%);
}
.note {
  margin: 0;
  color: #3f3a2e;
  font-family: var(--font-serif);
  font-size: clamp(18px, 5.2cqi, 22px);
  font-style: italic;
  line-height: 1.3;
  text-align: center;
}
.note-enter-active,
.note-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.note-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.note-leave-to {
  opacity: 0;
}

/* ===== Tangkay at vase ===== */
.stems {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.stem {
  fill: none;
  stroke: #a3b294;
  stroke-width: 2.6;
  stroke-linecap: round;
  transition: stroke 1s ease;
}
.stem.grown {
  stroke: #6b7c5c;
}
.vase {
  position: absolute;
  left: 50%;
  bottom: 5%;
  z-index: 2;
  width: 92px;
  height: 98px;
  margin-left: -46px;
  border-radius: 16px 16px 44px 44px / 12px 12px 54px 54px;
  background: linear-gradient(90deg, #e6dcc6, #fffdf8 42%, #d9ccb0);
  box-shadow:
    inset 0 -10px 16px rgb(150 120 70 / 0.2),
    0 10px 20px rgb(80 60 30 / 0.25);
}
.vase::before {
  content: "";
  position: absolute;
  top: 14px;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #b8914f, #e6cf9c 50%, #b8914f);
}
.vase-shine {
  position: absolute;
  top: 30px;
  left: 14px;
  width: 9px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.85), transparent);
}

/* ===== Bulaklak: usbong → bukadkad ===== */
.flower {
  position: absolute;
  z-index: 3;
  width: min(100px, 27cqi);
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  cursor: pointer;
  translate: -50% -50%;
  animation: grow-in 1.4s cubic-bezier(0.3, 1.4, 0.5, 1) var(--delay) both;
}
.flower.open {
  cursor: default;
}
.flower.open .center {
  cursor: zoom-in;
}
.flower:focus-visible {
  outline: 2px solid #b8914f;
  outline-offset: 4px;
}
.flower::after {
  /* gintong liwanag pagkabukadkad */
  content: "";
  position: absolute;
  inset: -26%;
  z-index: -1;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(236 200 110 / 0.5), transparent 65%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 1s ease 0.3s;
}
.flower.open::after {
  opacity: 1;
}
.sway {
  position: absolute;
  inset: 0;
  transform-origin: 50% 80%;
  animation: sway 4s ease-in-out var(--delay) infinite alternate;
}
.sway svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 4px 5px rgb(110 80 40 / 0.22));
}
.pt {
  stroke: var(--c2);
  stroke-opacity: 0.55;
  stroke-width: 0.7;
  /* usbong: nakasara at nakaangat */
  transform: scale(0.42, 0.64);
  transition: transform 1.2s cubic-bezier(0.3, 1.35, 0.5, 1) calc(var(--k) * 0.045s);
}
.pg {
  transform: rotate(-24deg);
  transition: transform 1.2s cubic-bezier(0.3, 1.35, 0.5, 1);
}
.open .pt {
  transform: scale(1);
}
.open .pg {
  transform: rotate(0deg);
}
.leaves {
  transition: opacity 0.8s ease 0.3s;
}
.open .leaves {
  opacity: 0;
}
.center {
  transform: scale(0);
  transition: transform 0.9s cubic-bezier(0.3, 1.6, 0.5, 1) 0.55s;
}
.open .center {
  transform: scale(1);
}
/* ===== Paglaki ng litrato ===== */
.viewer {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-items: center;
  padding-bottom: 8%;
  pointer-events: none; /* hindi hinaharangan ang Continue at ibang bulaklak */
}
.veil {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 46%, rgb(255 250 238 / 0.82), rgb(255 250 238 / 0.45) 80%);
}
.frame {
  position: relative;
  box-sizing: border-box;
  width: min(62cqi, 46cqb, 290px);
  aspect-ratio: 1;
  margin: 0;
  padding: 8px;
  border: 1.5px solid #b8914f;
  border-radius: 10px;
  background: #fffdf8;
  box-shadow:
    0 0 0 5px rgb(255 253 247 / 0.7),
    0 22px 48px rgb(90 65 25 / 0.32);
  cursor: zoom-out;
  pointer-events: auto;
  will-change: transform;
}
.frame img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  object-fit: cover;
}
.frame:focus-visible {
  outline: 2px solid #b8914f;
  outline-offset: 5px;
}
.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1.4%;
  z-index: 3;
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  text-align: center;
  pointer-events: none;
}
.next {
  position: absolute;
  left: 50%;
  bottom: 3%;
  z-index: 6;
  padding: 11px 30px;
  white-space: nowrap;
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
  transform: translateX(-50%);
}
.rise-enter-active {
  transition: opacity 0.8s ease 0.8s;
}
.rise-enter-from {
  opacity: 0;
}

@keyframes grow-in {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.4);
  }
}
@keyframes sway {
  from {
    transform: rotate(-3deg);
  }
  to {
    transform: rotate(3deg);
  }
}
@container (max-height: 620px) {
  .head {
    top: 4%;
  }
  .note-slot {
    top: 19%;
    min-height: 56px;
  }
  .hint {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .flower {
    animation-duration: 0.5s;
  }
  .sway {
    animation: none;
  }
}
</style>
