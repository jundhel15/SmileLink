<template>
  <!-- 6) POP THE BALLOONS: lumulutang na mga lobo (isa bawat litrato). I-tap ang bawat lobo para pumutok:
       may kumakalat na confetti at lilipad ang litrato papunta sa tumpok sa ibaba.
       Kapag pumutok na ang lahat: liwanag + confetti, tapos final message at mga litrato nila na pwedeng pindutin isa-isa. -->
  <section class="gift-stage" :class="{ opened }" :style="{ '--n': fan.length }">
    <Transition name="swap" mode="out-in">
      <div v-if="!showMessage" key="box" class="box-area">
        <header class="head">
          <p class="eyebrow">{{ opened ? "Surprise" : "One last thing" }}</p>
          <h2 v-if="!opened">Pop the balloons</h2>
          <h2 v-else class="pop">Happy birthday, my love</h2>
        </header>

        <div ref="fieldEl" class="field">
          <span class="rays" />

          <!-- mga litrato: lumilipad mula sa lobo papunta sa tumpok -->
          <figure
            v-for="(ph, k) in fan"
            :key="`ph${k}`"
            class="fly"
            :class="{ shown: gone[k] }"
            :style="{ '--x': `${ph.x}px`, '--y': `${ph.y}px`, '--r': `${ph.r}deg`, '--fx': `${balloons[k].x - CX}px`, '--fy': `${balloons[k].y - CY}px`, '--k': k }"
            aria-hidden="true"
          >
            <img :src="ph.src" alt="" draggable="false" />
          </figure>

          <!-- mga lobo -->
          <button
            v-for="(b, k) in balloons"
            :key="`b${k}`"
            class="balloon"
            :class="{ gone: gone[k] }"
            :style="{ left: `${b.x}px`, top: `${b.y - 33}px`, '--c': b.color, '--dur': `${b.dur}s`, '--del': `${b.del}s`, zIndex: 3 + (k % 2) }"
            type="button"
            :disabled="gone[k]"
            :aria-label="`Pop balloon ${k + 1}`"
            @pointerdown.prevent="pop(k, $event)"
            @pointerenter="$event.buttons > 0 && pop(k, $event)"
            @keydown.enter.prevent="pop(k, $event)"
            @keydown.space.prevent="pop(k, $event)"
          >
            <span class="sway">
              <svg viewBox="0 0 54 120" aria-hidden="true">
                <defs>
                  <linearGradient :id="`te-bl-shade-${k}`" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0.45" stop-color="#fff" stop-opacity="0" />
                    <stop offset="1" stop-color="#6b3a2a" stop-opacity="0.22" />
                  </linearGradient>
                </defs>
                <path d="M27 72C20 84 34 94 27 106C22 114 30 116 27 120" fill="none" stroke="#b8a27a" stroke-width="1.2" stroke-linecap="round" />
                <path d="M27 2C10 2 2 18 2 32C2 50 14 62 27 66C40 62 52 50 52 32C52 18 44 2 27 2Z" :fill="b.color" />
                <path d="M27 2C10 2 2 18 2 32C2 50 14 62 27 66C40 62 52 50 52 32C52 18 44 2 27 2Z" :fill="`url(#te-bl-shade-${k})`" />
                <path d="M26 64L21 73H33Z" :fill="b.color" />
                <path d="M26 64L21 73H33Z" fill="#000" opacity="0.12" />
                <ellipse cx="17" cy="19" rx="5" ry="9" fill="#fff" opacity="0.5" transform="rotate(24 17 19)" />
                <path v-if="b.star" d="M27 22Q28 31 37 32Q28 33 27 42Q26 33 17 32Q26 31 27 22Z" fill="#fff8dc" opacity="0.85" />
              </svg>
            </span>
          </button>

          <!-- pagputok -->
          <span v-for="f in fx" :key="f.id" class="burst" :style="{ left: `${f.x}px`, top: `${f.y}px`, '--c': f.color }" aria-hidden="true">
            <i class="ring" />
            <i v-for="n in 12" :key="n" class="shard" :style="{ '--a': `${n * 30 + (f.id % 3) * 7}deg`, '--d': `${34 + ((n * 7) % 5) * 9}px` }" />
          </span>
        </div>

        <p v-if="!opened" class="hint">{{ goneCount }} / {{ total }} popped · tap a balloon</p>
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
const emit = defineEmits(["popped", "opened", "replay"]);

const gallery = computed(() => props.photos.filter(Boolean).slice(0, 10));
const total = computed(() => gallery.value.length || 5); // isang lobo bawat litrato (5 kung walang litrato)

// sukat ng field (px) at gitna ng tumpok ng litrato
const W = 320;
const CX = W / 2;
const CY = 238;
const COLORS = ["#f0a79a", "#f4c9c0", "#e79bb4", "#ecc873", "#a3b294", "#cfdcc4", "#d9b46a", "#f6dca0", "#e8b4c4", "#b9c9a8"];

// posisyon ng mga lobo: isang hilera kung 5 pababa; dalawang hilera kapag mas marami
const balloons = computed(() => {
  const n = total.value;
  return Array.from({ length: n }, (_, i) => {
    let x;
    let y;
    if (n <= 5) {
      const t = n > 1 ? i / (n - 1) : 0.5;
      x = n > 1 ? 52 + t * 216 : CX;
      y = 76 + (i % 2 ? 22 : -6);
    } else {
      const row = i % 2;
      const idx = Math.floor(i / 2);
      const count = Math.ceil((n - row) / 2);
      const t = count > 1 ? idx / (count - 1) : 0.5;
      x = 48 + t * 224 + (row ? 0 : 0);
      y = row ? 112 : 58;
    }
    return { x: Math.round(x), y: Math.round(y), color: COLORS[i % COLORS.length], dur: 2.6 + (i % 4) * 0.45, del: -(i * 0.6), star: i % 3 === 1 };
  });
});

// mga litratong bumabagsak sa tumpok, naka-pamaypay
const fan = computed(() => {
  const list = gallery.value;
  const n = list.length;
  return list.map((src, k) => {
    const t = n > 1 ? k / (n - 1) - 0.5 : 0;
    return { src, x: Math.round(t * Math.min(230, 40 + n * 24)), y: Math.round(-8 + t * t * 56), r: Math.round(t * 34) };
  });
});

const fieldEl = ref(null);
const gone = ref([]);
const fx = ref([]);
const goneCount = computed(() => gone.value.filter(Boolean).length);
const opened = ref(false);
const showMessage = ref(false);
const sel = ref(0);
let fxId = 0;
let busy = false;
const timers = [];
let slideTimer = 0;

function later(fn, ms) {
  timers.push(setTimeout(fn, ms));
}

function pop(k, event) {
  if (gone.value[k] || opened.value) return;
  const next = [...gone.value];
  next[k] = true;
  gone.value = next;
  const b = balloons.value[k];
  const id = ++fxId;
  fx.value = [...fx.value, { id, x: b.x, y: b.y, color: b.color }];
  later(() => (fx.value = fx.value.filter((f) => f.id !== id)), 900);
  navigator.vibrate?.(14);
  // confetti ng pagputok: mula mismo sa katawan ng lobo
  emit("popped", event?.currentTarget?.querySelector?.("path:nth-of-type(2)") || fieldEl.value);

  if (goneCount.value >= total.value && !busy) {
    busy = true;
    later(() => {
      opened.value = true;
      navigator.vibrate?.([30, 50, 30]);
      emit("opened", fieldEl.value);
    }, 700);
    later(() => {
      showMessage.value = true;
      startSlides();
    }, 3800);
  }
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
.hint {
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  pointer-events: none;
}

/* ===== Field ng mga lobo ===== */
.field {
  position: relative;
  flex: none;
  width: 320px;
  height: 300px;
  margin-top: 6px;
  touch-action: none;
}
.rays {
  position: absolute;
  left: 50%;
  top: 238px;
  width: 360px;
  height: 360px;
  margin: -180px 0 0 -180px;
  background: repeating-conic-gradient(rgb(255 232 170 / 0.6) 0 8deg, transparent 8deg 24deg);
  -webkit-mask-image: radial-gradient(circle, #000 15%, transparent 68%);
  mask-image: radial-gradient(circle, #000 15%, transparent 68%);
  opacity: 0;
  transition: opacity 1.4s ease 0.2s;
  animation: spin 18s linear infinite;
  pointer-events: none;
}
.opened .rays {
  opacity: 1;
}

.balloon {
  position: absolute;
  width: 54px;
  height: 120px;
  margin-left: -27px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  filter: drop-shadow(0 6px 5px rgb(100 75 30 / 0.22));
  transition: transform 0.12s ease-out, opacity 0.12s ease-out;
}
.balloon:focus-visible {
  outline: 2px dashed #3f3a2e;
  outline-offset: 4px;
}
.balloon:active:not(.gone) {
  transform: scale(1.12);
}
.balloon.gone {
  opacity: 0;
  transform: scale(1.5);
  pointer-events: none;
}
.sway {
  display: block;
  width: 100%;
  height: 100%;
  transform-origin: 50% 100%;
  animation: float var(--dur) ease-in-out var(--del) infinite alternate;
}
.sway svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* ===== Pagputok ===== */
.burst {
  position: absolute;
  z-index: 8;
  width: 0;
  height: 0;
  pointer-events: none;
}
.ring {
  position: absolute;
  left: -26px;
  top: -26px;
  width: 52px;
  height: 52px;
  border: 3px solid var(--c);
  border-radius: 50%;
  opacity: 0;
  animation: ring 0.5s ease-out;
}
.shard {
  position: absolute;
  left: -4px;
  top: -3px;
  width: 8px;
  height: 6px;
  border-radius: 2px;
  background: var(--c);
  opacity: 0;
  animation: shard 0.8s cubic-bezier(0.2, 0.8, 0.3, 1) both;
}

/* ===== Mga litratong lumilipad papunta sa tumpok ===== */
.fly {
  position: absolute;
  left: 50%;
  top: 238px;
  z-index: 2;
  width: 64px;
  margin: 0;
  padding: 4px 4px 10px;
  background: #fffdf7;
  box-shadow: 0 8px 16px rgb(100 75 30 / 0.3);
  opacity: 0;
  transform: translate(calc(-50% + var(--fx)), calc(-50% + var(--fy))) scale(0.2) rotate(-20deg);
  pointer-events: none;
}
.fly img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
.fly.shown {
  opacity: 1;
  z-index: calc(2 + var(--k));
  transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) rotate(var(--r));
  transition:
    transform 1.1s cubic-bezier(0.25, 1.2, 0.35, 1),
    opacity 0.4s ease;
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
@keyframes float {
  from {
    transform: translateY(0) rotate(-3deg);
  }
  to {
    transform: translateY(-9px) rotate(3deg);
  }
}
@keyframes ring {
  from {
    opacity: 0.9;
    transform: scale(0.3);
  }
  to {
    opacity: 0;
    transform: scale(1.7);
  }
}
@keyframes shard {
  0% {
    opacity: 1;
    transform: rotate(var(--a)) translateX(4px) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: rotate(var(--a)) translateX(var(--d)) rotate(280deg) translateY(10px);
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
  .field {
    transform: scale(0.72);
    transform-origin: top center;
    margin-bottom: -84px; /* bawi sa espasyong naiwan ng scale */
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
  .sway {
    animation: none;
  }
}
</style>
