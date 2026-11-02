<template>
  <!-- 5) PHOTO CLOTHESLINE: hilahin ang sampayan pakaliwa para makita ang mga litratong nakasabit. Malabo at
       itim-puti ang bawat isa habang malayo, at "nagde-develop" ito kapag dumating sa gitna. Kailangang makita
       lahat bago tumuloy. -->
  <section class="pl-stage">
    <header class="pl-head">
      <p class="pl-eyebrow">{{ seenCount }} of {{ list.length }} memories</p>
      <h2>{{ allSeen ? "Every memory, developed" : "Slide the clothesline" }}</h2>
    </header>

    <div
      ref="trackEl"
      class="pl-track"
      :class="{ grabbing }"
      @scroll.passive="onScroll"
      @pointerdown="dragDown"
      @pointermove="dragMove"
      @pointerup="dragUp"
      @pointercancel="dragUp"
    >
      <div class="pl-inner">
        <figure
          v-for="(src, i) in list"
          :key="i"
          :ref="(el) => (items[i] = el)"
          class="pl-item"
          :style="{ '--tilt': (i % 2 ? 2.5 : -2.5) + 'deg' }"
        >
          <span class="pl-peg" aria-hidden="true">♥</span>
          <span class="pl-frame">
            <img v-if="src" :src="src" alt="" draggable="false" />
            <span v-else class="pl-heart">♥</span>
          </span>
          <figcaption>{{ captionFor(i) }}</figcaption>
        </figure>
      </div>
    </div>

    <p v-if="!allSeen" class="pl-hint">Swipe sideways ↔</p>

    <Transition name="pl-rise">
      <button v-if="allSeen" class="pl-next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  photos: { type: Array, default: () => [] },
  captions: { type: Array, default: () => [] },
});
const emit = defineEmits(["finished", "done"]);

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

const list = computed(() => (props.photos.length ? props.photos : [""]));
const captionFor = (i) => props.captions[i] || DEFAULT_CAPTIONS[i % DEFAULT_CAPTIONS.length];

const trackEl = ref(null);
const items = [];
const seen = new Set();
const seenCount = ref(0);
const allSeen = computed(() => seenCount.value >= list.value.length);
const grabbing = ref(false);

let raf = 0;
let finished = false;
let drag = null;

function update() {
  raf = 0;
  const t = trackEl.value;
  if (!t) return;
  const rect = t.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  items.forEach((el, i) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const d = Math.min(1, Math.abs(r.left + r.width / 2 - cx) / ((rect.width || 1) * 0.55));
    el.style.setProperty("--d", d.toFixed(3));
    if (d < 0.2 && !seen.has(i)) {
      seen.add(i);
      seenCount.value = seen.size;
    }
  });
  if (!finished && seen.size >= list.value.length) {
    finished = true;
    navigator.vibrate?.([20, 40, 20]);
    emit("finished", trackEl.value);
  }
}
function onScroll() {
  if (!raf) raf = requestAnimationFrame(update);
}

// para sa mouse: hilahin ang sampayan gamit ang pointer
function dragDown(event) {
  if (event.pointerType !== "mouse") return;
  drag = { x: event.clientX, left: trackEl.value.scrollLeft };
  grabbing.value = true;
  trackEl.value.setPointerCapture?.(event.pointerId);
}
function dragMove(event) {
  if (!drag) return;
  trackEl.value.scrollLeft = drag.left - (event.clientX - drag.x);
}
function dragUp() {
  drag = null;
  grabbing.value = false;
}

onMounted(async () => {
  await nextTick();
  requestAnimationFrame(update);
});
onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<style scoped>
.pl-stage {
  --w: clamp(150px, 56cqi, 230px);
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.pl-head {
  position: absolute;
  top: 8%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.pl-eyebrow {
  margin: 0;
  color: #ffd6e4;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #fff;
  font-family: var(--font-head);
  font-size: clamp(26px, 7.6cqi, 38px);
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 2px 12px rgb(43 23 69 / 0.5);
}

/* ===== Sampayan ===== */
.pl-track {
  position: absolute;
  left: 0;
  right: 0;
  top: 21%;
  height: 58%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  touch-action: pan-x;
  cursor: grab;
}
.pl-track::-webkit-scrollbar {
  display: none;
}
.pl-track.grabbing {
  scroll-snap-type: none;
  cursor: grabbing;
}
.pl-inner {
  position: relative;
  display: flex;
  gap: 18px;
  width: max-content;
  min-width: 100%;
  height: 100%;
  padding: 26px calc(50cqi - var(--w) / 2) 0;
}
.pl-inner::before {
  content: "";
  position: absolute;
  top: 12px;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 2px;
  background: #e3b28c;
  box-shadow: 0 2px 4px rgb(43 23 69 / 0.4);
}
.pl-inner::after {
  content: "";
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 14px;
  background: radial-gradient(circle, #ffe9a8 0 3px, rgb(255 233 168 / 0.35) 4px, transparent 7px) 0 0 / 34px 14px repeat-x;
  animation: pl-bulbs 2.4s ease-in-out infinite alternate;
}
.pl-item {
  position: relative;
  flex: 0 0 var(--w);
  width: var(--w);
  margin: 0;
  padding-top: 14px;
  scroll-snap-align: center;
  opacity: calc(1 - var(--d, 1) * 0.35);
  scale: calc(1 - var(--d, 1) * 0.12);
  transform-origin: 50% 0;
  rotate: var(--tilt);
}
.pl-peg {
  position: absolute;
  top: -2px;
  left: 50%;
  z-index: 2;
  display: grid;
  width: 22px;
  height: 26px;
  place-items: center;
  border-radius: 6px;
  background: #ff8fab;
  box-shadow: 0 3px 5px rgb(43 23 69 / 0.4);
  color: #fff;
  font-size: 12px;
  translate: -50% 0;
}
.pl-frame {
  display: block;
  padding: 9px 9px 12px;
  background: #fff;
  box-shadow: 0 14px 26px rgb(43 23 69 / 0.45);
}
.pl-frame img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  pointer-events: none;
  filter: blur(calc(var(--d, 1) * 7px)) saturate(calc(1 - var(--d, 1) * 0.9)) brightness(calc(1.08 - var(--d, 1) * 0.15));
}
.pl-heart {
  display: grid;
  width: 100%;
  aspect-ratio: 1;
  place-items: center;
  background: #ffe3ea;
  color: #ff8fab;
  font-size: 54px;
}
.pl-item figcaption {
  padding: 8px 4px 0;
  color: #fff;
  font-family: var(--font-hand);
  font-size: clamp(20px, 5.6cqi, 24px);
  line-height: 1.1;
  text-align: center;
  text-shadow: 0 2px 8px rgb(43 23 69 / 0.6);
}

.pl-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1.6%;
  margin: 0;
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 8px rgb(43 23 69 / 0.6);
  pointer-events: none;
}
.pl-next {
  position: absolute;
  left: 50%;
  bottom: 3.5%;
  z-index: 4;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: #e9677c;
  box-shadow: 0 10px 22px rgb(0 0 0 / 0.3);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.pl-rise-enter-active {
  transition: opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s;
}
.pl-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes pl-bulbs {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}
@container (max-height: 620px) {
  .pl-head {
    top: 4%;
  }
  .pl-track {
    top: 19%;
    height: 62%;
  }
  .pl-stage {
    --w: clamp(130px, 46cqi, 190px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pl-inner::after {
    animation: none;
  }
}
</style>