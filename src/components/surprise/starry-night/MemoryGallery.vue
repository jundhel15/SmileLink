<template>
  <!-- STARLIT MEMORIES: swipeable na carousel ng 5-10 litrato (polaroid na may bituin), may dots at arrows -->
  <section class="gallery" aria-label="Photo memories">
    <header class="g-head">
      <p class="eyebrow">{{ recipient }}'s memories</p>
      <h2>Every photo is a <em>star</em></h2>
    </header>

    <div class="track-wrap">
      <button class="arrow left" type="button" aria-label="Previous photo" :disabled="active === 0" @click="go(active - 1)">‹</button>
      <div ref="trackEl" class="track" @scroll.passive="onScroll">
        <figure
          v-for="(p, i) in items"
          :key="i"
          class="card"
          :class="{ on: i === active }"
          :style="{ '--tilt': `${i % 2 ? 2.2 : -2.2}deg`, '--i': i }"
          @click="go(i)"
        >
          <span class="pin" aria-hidden="true">✦</span>
          <div class="frame">
            <img :src="p.src" :alt="p.caption || `Memory ${i + 1}`" draggable="false" loading="lazy" />
          </div>
          <figcaption>{{ p.caption || " " }}</figcaption>
        </figure>
      </div>
      <button class="arrow right" type="button" aria-label="Next photo" :disabled="active === items.length - 1" @click="go(active + 1)">›</button>
    </div>

    <div class="dots" role="tablist" aria-label="Choose a photo">
      <button
        v-for="(p, i) in items"
        :key="i"
        type="button"
        class="dot"
        :class="{ on: i === active }"
        :aria-label="`Photo ${i + 1}`"
        :aria-selected="i === active"
        @click="go(i)"
      />
    </div>
    <p class="count">{{ active + 1 }} / {{ items.length }} · swipe through the stars</p>
    <button class="replay" type="button" @click="emit('replay')">↻ Replay</button>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

const props = defineProps({
  recipient: { type: String, default: "" },
  // array ng URL (string) o { src, caption }. Hanggang 10 lang ang ipinapakita.
  photos: { type: Array, default: () => [] },
});
const emit = defineEmits(["replay"]);

const items = computed(() =>
  props.photos
    .filter(Boolean)
    .slice(0, 10)
    .map((p) => (typeof p === "string" ? { src: p, caption: "" } : { src: p.src, caption: p.caption || "" })),
);

const trackEl = ref(null);
const active = ref(0);

function step() {
  const kids = trackEl.value?.children;
  if (!kids || kids.length < 2) return kids?.[0]?.offsetWidth || 1;
  return kids[1].offsetLeft - kids[0].offsetLeft || 1;
}
function onScroll() {
  const i = Math.round(trackEl.value.scrollLeft / step());
  active.value = Math.min(items.value.length - 1, Math.max(0, i));
}
function go(i) {
  const n = Math.min(items.value.length - 1, Math.max(0, i));
  active.value = n;
  trackEl.value?.scrollTo({ left: n * step(), behavior: "smooth" });
}
onMounted(() => {
  if (trackEl.value) trackEl.value.scrollLeft = 0;
});
</script>

<style scoped>
.gallery {
  --card-w: min(64cqi, 250px);
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 36px 0 28px;
  text-align: center;
}
.g-head {
  padding: 0 22px;
}
.eyebrow {
  margin: 0;
  color: #f1d3a6;
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #f4e9f7;
  font-family: var(--font-serif);
  font-size: clamp(22px, 6.6cqi, 34px);
  font-weight: 400;
  line-height: 1.15;
  text-shadow: 0 0 22px rgb(214 178 240 / 0.5);
}
h2 em {
  font-family: var(--font-script);
  font-size: 1.35em;
  font-style: normal;
  color: #fde7f0;
}
.track-wrap {
  position: relative;
  width: 100%;
  flex: 0 1 auto;
}
.track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 18px calc(50% - var(--card-w) / 2) 22px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  touch-action: pan-x;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}
.track::-webkit-scrollbar {
  display: none;
}
.card {
  position: relative;
  flex: none;
  width: var(--card-w);
  margin: 0;
  padding: 10px 10px 8px;
  border-radius: 6px;
  background: linear-gradient(180deg, #fffaf3, #f1e4d3);
  box-shadow:
    0 14px 30px rgb(8 4 26 / 0.55),
    0 0 0 1px rgb(255 255 255 / 0.4) inset;
  scroll-snap-align: center;
  transform: rotate(var(--tilt)) scale(0.86);
  opacity: 0.55;
  transition:
    transform 0.6s cubic-bezier(0.3, 1.3, 0.5, 1),
    opacity 0.5s ease,
    box-shadow 0.5s ease;
  cursor: pointer;
  animation: card-in 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) calc(var(--i) * 0.08s) both;
}
.card.on {
  transform: rotate(0deg) scale(1);
  opacity: 1;
  box-shadow:
    0 18px 38px rgb(8 4 26 / 0.6),
    0 0 36px rgb(244 200 230 / 0.45);
}
.pin {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffd98a;
  font-size: 22px;
  line-height: 1;
  text-shadow: 0 0 12px rgb(255 217 138 / 0.9);
  animation: twinkle 2.6s ease-in-out infinite;
}
.frame {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 3px;
  background: #2a2150;
}
.frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}
figcaption {
  min-height: 1.5em;
  margin-top: 8px;
  color: #5a3d52;
  font-family: var(--font-script);
  font-size: 22px;
  line-height: 1.2;
}
.arrow {
  position: absolute;
  z-index: 2;
  top: 50%;
  width: 36px;
  height: 36px;
  transform: translateY(-50%);
  border: 1px solid rgb(241 211 166 / 0.5);
  border-radius: 50%;
  background: rgb(18 14 46 / 0.55);
  color: #fdf2f8;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: none;
}
.arrow.left {
  left: 8px;
}
.arrow.right {
  right: 8px;
}
.arrow:disabled {
  opacity: 0.25;
  cursor: default;
}
@media (hover: hover) and (pointer: fine) {
  .arrow {
    display: block;
  }
}
.dots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: 0 22px;
}
.dot {
  width: 9px;
  height: 9px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgb(253 242 248 / 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}
.dot.on {
  width: 22px;
  border-radius: 6px;
  background: #ffd98a;
  box-shadow: 0 0 10px rgb(255 217 138 / 0.8);
}
.count {
  margin: 0;
  color: rgb(253 242 248 / 0.85);
  font-family: var(--font-serif);
  font-size: 14px;
  font-style: italic;
  text-shadow: 0 2px 8px rgb(10 6 30 / 0.8);
}
.replay {
  padding: 9px 22px;
  border: 1px solid rgb(241 211 166 / 0.6);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.08);
  color: #fdf2f8;
  font-family: var(--font-serif);
  font-size: 16px;
  cursor: pointer;
}
.replay:hover {
  background: rgb(255 255 255 / 0.18);
}
@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(30px) rotate(var(--tilt)) scale(0.8);
  }
}
@keyframes twinkle {
  50% {
    opacity: 0.55;
    transform: translateX(-50%) scale(0.85);
  }
}
@container (max-height: 620px) {
  .gallery {
    --card-w: min(34cqh, 190px);
    gap: 6px;
    padding: 12px 0 14px;
  }
  .g-head {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .card {
    animation: none;
    transition: opacity 0.2s ease;
  }
  .pin {
    animation: none;
  }
}
</style>
