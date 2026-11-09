<template>
  <!-- 6) GIFT KEY: may gintong susi sa ibaba. I-drag ang susi pataas sa kandado ng regalo (o i-tap ang susi):
       iikot ito, bubukas ang takip, at ang lahat ng litrato ay lilipad palabas na parang pamaypay.
       Pagkatapos: final message + mga litrato nila na pwedeng pindutin isa-isa. -->
  <section class="gift-stage" :class="{ opened, near, turning }" :style="{ '--n': fan.length }">
    <Transition name="swap" mode="out-in">
      <div v-if="!showMessage" key="box" class="box-area">
        <header class="head">
          <p class="eyebrow">{{ opened ? "Surprise" : "One last thing" }}</p>
          <h2 v-if="!opened">Unlock your gift</h2>
          <h2 v-else class="pop">Happy birthday, my love</h2>
        </header>

        <div ref="boxEl" class="gift">
          <span class="rays" />

          <figure
            v-for="(ph, k) in fan"
            :key="k"
            class="fly"
            :style="{ '--x': `${ph.x}px`, '--y': `${ph.y}px`, '--r': `${ph.r}deg`, '--k': k }"
            aria-hidden="true"
          >
            <img :src="ph.src" alt="" draggable="false" />
          </figure>

          <div class="body">
            <span class="ribbon-v" />
            <span class="ribbon-h" />
            <span ref="holeEl" class="lock">
              <span class="plate"><span class="hole" /></span>
            </span>
          </div>
          <div class="lid">
            <span class="ribbon-v" />
          </div>
          <div class="bow">
            <span class="loop l" />
            <span class="loop r" />
            <span class="knot" />
          </div>
        </div>

        <div v-if="!opened" class="key-dock">
          <button
            ref="keyEl"
            class="key"
            :class="{ dragging }"
            :style="{ translate: `${tx}px ${ty}px` }"
            type="button"
            aria-label="Golden key. Drag it to the lock, or press Enter to unlock the gift"
            @pointerdown.prevent="onDown"
            @pointermove="onMove"
            @pointerup="onUp"
            @pointercancel="onCancel"
            @contextmenu.prevent
            @click="onKeyClick"
          >
            <svg viewBox="0 0 36 84" aria-hidden="true">
              <defs>
                <linearGradient id="te-key-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#f6e4b0" />
                  <stop offset="0.5" stop-color="#b8914f" />
                  <stop offset="1" stop-color="#e9d3a0" />
                </linearGradient>
              </defs>
              <g class="key-art">
                <path class="teeth" d="M15 6H27V12H21V17H27V23H21V28H15Z" />
                <rect x="15" y="4" width="6" height="52" rx="3" fill="url(#te-key-gold)" />
                <circle cx="18" cy="68" r="13" fill="none" stroke="url(#te-key-gold)" stroke-width="6" />
                <circle cx="18" cy="68" r="4" fill="#fff7dc" />
              </g>
            </svg>
          </button>
          <p class="hint">{{ near ? "Let go to unlock ✦" : "Drag the key to the lock ↑" }}</p>
        </div>
      </div>

      <div v-else key="msg" class="message">
        <p class="eyebrow">Happy birthday</p>
        <div class="photo-oval">
          <Transition name="photo" mode="out-in">
            <img v-if="gallery.length" :key="sel" :src="gallery[sel]" alt="" draggable="false" />
            <span v-else class="heart">♥</span>
          </Transition>
        </div>
        <div v-if="gallery.length > 1" class="thumbs" role="tablist" aria-label="Photos">
          <button
            v-for="(src, k) in gallery"
            :key="k"
            class="thumb"
            :class="{ on: k === sel }"
            type="button"
            :aria-label="`Photo ${k + 1}`"
            @click="pick(k)"
          >
            <img :src="src" alt="" draggable="false" />
          </button>
        </div>
        <h3>{{ recipient }}</h3>
        <p class="text">{{ message }}</p>
        <p class="from">Forever yours, {{ sender }}</p>
        <button class="replay" type="button" @click="emit('replay')">↻ Replay</button>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  photos: { type: Array, default: () => [] }, // 1 hanggang 10 URL
});
const emit = defineEmits(["opened", "replay"]);

const gallery = computed(() => props.photos.filter(Boolean).slice(0, 10));
// mga litratong lilipad palabas sa kahon, naka-pamaypay
const fan = computed(() => {
  const list = gallery.value;
  const n = list.length;
  return list.map((src, k) => {
    const t = n > 1 ? k / (n - 1) - 0.5 : 0;
    return { src, x: Math.round(t * Math.min(230, 40 + n * 24)), y: Math.round(-62 + t * t * 56), r: Math.round(t * 38) };
  });
});

const boxEl = ref(null);
const holeEl = ref(null);
const keyEl = ref(null);
const tx = ref(0);
const ty = ref(0);
const dragging = ref(false);
const near = ref(false);
const turning = ref(false);
const opened = ref(false);
const showMessage = ref(false);
const sel = ref(0);

let startX = 0;
let startY = 0;
let moved = 0;
let busy = false;
const timers = [];
let slideTimer = 0;

/* ang preview ay pinaliliit ng SurpriseShell, kaya hinahati ang layo ng daliri sa scale */
function scaleOf() {
  const el = keyEl.value?.closest(".gift-stage");
  return el ? el.getBoundingClientRect().width / el.offsetWidth || 1 : 1;
}
/* layo (sa lokal na px) mula sa dulo ng susi papunta sa butas ng kandado, at ang kailangang galaw para sumalpak */
function toHole() {
  const k = keyEl.value.getBoundingClientRect();
  const h = holeEl.value.getBoundingClientRect();
  const s = scaleOf();
  const dx = (h.left + h.width / 2 - (k.left + k.width / 2)) / s;
  const dy = (h.top + h.height / 2 - (k.top + 6)) / s;
  return { dx, dy, dist: Math.hypot(dx, dy) };
}

function onDown(event) {
  if (busy || opened.value) return;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  dragging.value = true;
  startX = event.clientX - tx.value * scaleOf();
  startY = event.clientY - ty.value * scaleOf();
  moved = 0;
}
function onMove(event) {
  if (!dragging.value) return;
  const s = scaleOf();
  const nx = (event.clientX - startX) / s;
  const ny = (event.clientY - startY) / s;
  moved = Math.max(moved, Math.hypot(nx, ny));
  tx.value = nx;
  ty.value = ny;
  near.value = toHole().dist < 48;
}
function onUp() {
  if (!dragging.value) return;
  dragging.value = false;
  if (moved < 6 || near.value) unlock();
  else onCancel();
}
function onCancel() {
  dragging.value = false;
  near.value = false;
  if (!busy) {
    tx.value = 0;
    ty.value = 0;
  }
}
// keyboard (Enter/Space) lang ang aabot dito; ang mouse/daliri ay hawak na ng pointer events
function onKeyClick(event) {
  if (event.detail === 0) unlock();
}

function later(fn, ms) {
  timers.push(setTimeout(fn, ms));
}
function unlock() {
  if (busy || opened.value) return;
  busy = true;
  near.value = true;
  const { dx, dy } = toHole();
  tx.value += dx; // sumasalpak sa butas
  ty.value += dy;
  navigator.vibrate?.(20);
  later(() => (turning.value = true), 450); // umiikot ang susi
  later(() => {
    opened.value = true;
    navigator.vibrate?.([30, 50, 30]);
    emit("opened", boxEl.value);
  }, 1000);
  later(() => {
    showMessage.value = true;
    startSlides();
  }, 4200);
}

function startSlides() {
  clearInterval(slideTimer);
  if (gallery.value.length < 2) return;
  slideTimer = setInterval(() => {
    sel.value = (sel.value + 1) % gallery.value.length;
  }, 3200);
}
function pick(k) {
  sel.value = k;
  startSlides();
}

onBeforeUnmount(() => {
  timers.forEach(clearTimeout);
  clearInterval(slideTimer);
});
</script>

<style scoped>
.gift-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 22px 40px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
}
.pop {
  animation: pop-in 1s ease both;
}
.box-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
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

/* ===== Regalo (CSS lang) ===== */
.gift {
  position: relative;
  flex: none;
  width: 240px;
  height: 250px;
  margin-top: 14px;
  transition: margin-top 0.8s ease;
}
.opened .gift {
  margin-top: 54px;
}
.rays {
  position: absolute;
  left: 50%;
  bottom: 70px;
  width: 360px;
  height: 360px;
  margin-left: -180px;
  background: repeating-conic-gradient(rgb(255 232 170 / 0.6) 0 8deg, transparent 8deg 24deg);
  -webkit-mask-image: radial-gradient(circle, #000 15%, transparent 68%);
  mask-image: radial-gradient(circle, #000 15%, transparent 68%);
  opacity: 0;
  transition: opacity 1.4s ease 0.4s;
  animation: spin 18s linear infinite;
  pointer-events: none;
}
.opened .rays {
  opacity: 1;
}
.body {
  position: absolute;
  left: 20px;
  bottom: 0;
  z-index: 3;
  width: 200px;
  height: 116px;
  border-radius: 3px;
  background:
    linear-gradient(180deg, rgb(0 0 0 / 0.06), transparent 30%),
    linear-gradient(90deg, #f1e7d2, #fffaf0 45%, #eadfc6);
  box-shadow: 0 16px 30px rgb(100 75 30 / 0.3);
}
.lid {
  position: absolute;
  left: 8px;
  bottom: 116px;
  z-index: 4;
  width: 224px;
  height: 44px;
  border-radius: 3px;
  background: linear-gradient(180deg, #fffdf7, #f0e5cd);
  box-shadow: 0 6px 14px rgb(100 75 30 / 0.22);
  transition:
    transform 1s cubic-bezier(0.3, 1, 0.4, 1),
    opacity 0.8s ease 0.6s;
}
.opened .lid {
  opacity: 0;
  transform: translate(70px, -90px) rotate(16deg);
}
.ribbon-v,
.ribbon-h {
  position: absolute;
  background: linear-gradient(90deg, #b8914f, #ecd6a0 45%, #b8914f);
}
.ribbon-v {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 30px;
  margin-left: -15px;
}
.ribbon-h {
  top: 40%;
  left: 0;
  right: 0;
  height: 22px;
  background: linear-gradient(180deg, #b8914f, #ecd6a0 45%, #b8914f);
}

/* ===== Kandado ===== */
.lock {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  width: 44px;
  height: 52px;
  margin: -24px 0 0 -22px;
}
.plate {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border: 2px solid #8f6d33;
  border-radius: 10px 10px 18px 18px;
  background: radial-gradient(circle at 35% 25%, #fff0c4, #c9a15a 70%);
  box-shadow: 0 4px 8px rgb(100 75 30 / 0.4);
  transition: box-shadow 0.4s ease, transform 0.4s ease;
}
.near .plate,
.turning .plate {
  box-shadow:
    0 0 0 5px rgb(255 226 140 / 0.45),
    0 0 22px 6px rgb(255 214 112 / 0.9);
  transform: scale(1.08);
}
.hole {
  display: block;
  width: 9px;
  height: 20px;
  border-radius: 5px 5px 2px 2px;
  background: #3d2e12;
  clip-path: polygon(50% 0, 100% 24%, 100% 100%, 0 100%, 0 24%);
}

/* ===== Bow (palamuti na lang) ===== */
.bow {
  position: absolute;
  left: 50%;
  bottom: 150px;
  z-index: 6;
  width: 96px;
  height: 56px;
  margin-left: -48px;
  transition: transform 0.6s ease, opacity 0.6s ease;
}
.opened .bow {
  opacity: 0;
  transform: translateY(-30px) scale(0.6);
}
.loop {
  position: absolute;
  top: 8px;
  width: 50px;
  height: 36px;
  border: 9px solid #c9a15a;
  border-radius: 50%;
  box-shadow: inset 0 2px 3px rgb(255 255 255 / 0.45), 0 3px 6px rgb(100 75 30 / 0.3);
}
.loop.l {
  left: 0;
  transform: rotate(-22deg);
}
.loop.r {
  right: 0;
  transform: rotate(22deg);
}
.knot {
  position: absolute;
  top: 16px;
  left: 50%;
  width: 22px;
  height: 22px;
  margin-left: -11px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff0c4, #b8914f 75%);
  box-shadow: 0 3px 6px rgb(100 75 30 / 0.35);
}

/* ===== Mga litratong lumilipad palabas ===== */
.fly {
  position: absolute;
  left: 50%;
  bottom: 110px;
  z-index: 2;
  width: 64px;
  margin: 0;
  padding: 4px 4px 10px;
  background: #fffdf7;
  box-shadow: 0 8px 16px rgb(100 75 30 / 0.3);
  opacity: 0;
  transform: translate(-50%, 70px) scale(0.3) rotate(0deg);
  transition:
    transform 1.3s cubic-bezier(0.25, 1.15, 0.35, 1) calc(var(--k) * 0.09s + 0.35s),
    opacity 0.5s ease calc(var(--k) * 0.09s + 0.35s);
  pointer-events: none;
}
.fly img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
.opened .fly {
  opacity: 1;
  z-index: calc(2 + var(--k));
  transform: translate(calc(-50% + var(--x)), var(--y)) rotate(var(--r));
}

/* ===== Susi ===== */
.key-dock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
}
.key {
  position: relative;
  z-index: 8;
  width: 46px;
  height: 100px;
  padding: 0;
  border: 0;
  background: none;
  cursor: grab;
  touch-action: none;
  transition: translate 0.55s cubic-bezier(0.3, 1.3, 0.5, 1);
  animation: bob 1.8s ease-in-out infinite alternate;
  filter: drop-shadow(0 6px 6px rgb(100 70 20 / 0.35));
}
.key.dragging {
  cursor: grabbing;
  transition: none;
  animation: none;
}
.key:focus-visible {
  outline: 2px dashed #3f3a2e;
  outline-offset: 4px;
}
.key svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.key-art {
  transform-origin: 18px 10px;
  transition: transform 0.55s cubic-bezier(0.3, 1.2, 0.5, 1);
}
.teeth {
  fill: url(#te-key-gold);
}
.turning .key-art {
  transform: rotate(90deg);
}
.opened .key {
  opacity: 0;
}
.hint {
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  pointer-events: none;
}

/* ===== Mensahe ===== */
.message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  max-width: 400px;
}
.photo-oval {
  position: relative;
  display: grid;
  place-items: center;
  width: 140px;
  height: 180px;
  margin: 8px 0 4px;
  overflow: hidden;
  border: 4px solid #c9a15a;
  border-radius: 50%;
  background: #fffdf7;
  box-shadow:
    0 0 0 5px #fffaf0,
    0 0 0 6.5px #c9a15a,
    0 14px 30px rgb(100 75 30 / 0.35);
  animation: pop-in 1.2s cubic-bezier(0.3, 1.4, 0.5, 1) both;
}
.photo-oval img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.photo-enter-active,
.photo-leave-active {
  transition: opacity 0.7s ease;
}
.photo-enter-from,
.photo-leave-to {
  opacity: 0;
}
.heart {
  color: #c9a15a;
  font-size: 54px;
}
.thumbs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  max-width: 260px;
  margin-bottom: 6px;
}
.thumb {
  width: 32px;
  height: 32px;
  padding: 0;
  overflow: hidden;
  border: 2px solid #fffaf0;
  border-radius: 50%;
  background: #fffdf7;
  box-shadow: 0 0 0 1px rgb(184 145 79 / 0.6);
  cursor: pointer;
  opacity: 0.7;
  transition: transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease;
}
.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.thumb.on {
  opacity: 1;
  transform: scale(1.18);
  box-shadow: 0 0 0 2px #c9a15a, 0 0 10px rgb(255 214 112 / 0.8);
}
.message h3 {
  margin: 0;
  font-family: var(--font-script);
  font-size: clamp(54px, 17cqi, 80px);
  font-weight: 400;
  line-height: 1.1;
  background: linear-gradient(180deg, #e2c48a 5%, #b8914f 55%, #8f6d33 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 2px 6px rgb(120 90 40 / 0.2));
}
.text {
  margin: 0;
  color: #3f3a2e;
  font-family: var(--font-serif);
  font-size: 20px;
  font-style: italic;
  line-height: 1.45;
}
.from {
  margin: 4px 0 0;
  color: #9c7637;
  font-family: var(--font-script);
  font-size: 32px;
  line-height: 1.2;
}
.replay {
  margin-top: 10px;
  padding: 9px 24px;
  border: 1px solid #b8914f;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.7);
  color: #7a5c26;
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
}
.replay:hover {
  background: #fff;
}
.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.8s ease, filter 0.8s ease;
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(8px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes bob {
  to {
    transform: translateY(-6px);
  }
}
@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
}
@container (max-height: 620px) {
  .gift-stage {
    padding: 16px 22px 16px;
  }
  .gift {
    zoom: 0.72;
  }
  .photo-oval {
    width: 100px;
    height: 128px;
    margin: 2px 0;
  }
  .message {
    gap: 3px;
  }
  .message h3 {
    font-size: 44px;
  }
  .text {
    font-size: 15px;
  }
  .from {
    font-size: 26px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .rays,
  .key {
    animation: none;
  }
}
</style>
