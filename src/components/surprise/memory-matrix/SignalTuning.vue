<template>
  <!-- SIGNAL TUNING: lumang TV na puro static. I-drag ang tuner (slider) hanggang lumilinaw ang litrato.
       Kapag nanatili sa tamang frequency sandali: "locked" ang channel. 3 channel = 3 litrato. -->
  <section class="tune">
    <header class="t-head">
      <p class="eyebrow">memory_tv · CH {{ channel + 1 }} of {{ channels.length }}</p>
      <h2>{{ allDone ? "All channels found ♥" : "Tune in to us" }}</h2>
      <p class="sub">{{ allDone ? "" : locked ? "Signal locked ✓" : "Drag the tuner until the picture is clear" }}</p>
    </header>

    <div class="tv" :class="{ locked }">
      <div class="screen">
        <img
          v-if="current"
          :key="channel"
          class="photo"
          :src="current.src"
          :alt="current.caption || `Memory channel ${channel + 1}`"
          draggable="false"
          :style="{ '--clear': clarity }"
        />
        <canvas ref="noiseEl" class="noise" width="96" height="72" aria-hidden="true" :style="{ opacity: 1 - clarity * 0.96 }" />
        <span class="roll" aria-hidden="true" :style="{ opacity: (1 - clarity) * 0.8 }" />
        <span class="osd" aria-hidden="true">CH {{ String(channel + 1).padStart(2, "0") }} · {{ freq.toFixed(1) }} MHz</span>
        <Transition name="cap">
          <p v-if="locked && current?.caption" :key="channel" class="caption">{{ current.caption }}</p>
        </Transition>
      </div>
      <div class="tv-base" aria-hidden="true">
        <span class="knob" :style="{ '--a': `${(freq - MIN) * 13}deg` }" />
        <span class="meter"><span :style="{ width: `${clarity * 100}%` }" /></span>
      </div>
    </div>

    <label class="tuner">
      <span class="scale" aria-hidden="true"><span>{{ MIN }}</span><span>{{ (MIN + MAX) / 2 }}</span><span>{{ MAX }}</span></span>
      <input
        v-model.number="freq"
        type="range"
        :min="MIN"
        :max="MAX"
        step="0.1"
        :disabled="allDone"
        aria-label="Tuner frequency"
      />
    </label>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  // 3 litrato ({ src, caption }) na isa-isang lalabas sa bawat channel
  photos: { type: Array, default: () => [] },
  reduced: { type: Boolean, default: false },
});
const emit = defineEmits(["locked", "done"]);

const MIN = 88;
const MAX = 108;
const TARGETS = [97.3, 91.4, 104.6]; // malayo sa isa't isa, para kailangang mag-tune ulit
const channels = computed(() => props.photos.slice(0, 3));
const channel = ref(0);
const freq = ref(100.5);
const locked = ref(false);
const allDone = ref(false);
const current = computed(() => channels.value[channel.value]);
const target = computed(() => TARGETS[channel.value % TARGETS.length]);
// 0 = puro static, 1 = malinaw (lumilinaw sa loob ng ±4 MHz); naka-lock kapag nasa ±0.8 MHz nang ~0.5s
const LOCK_RANGE = 0.8;
const clarity = computed(() => (locked.value || allDone.value ? 1 : Math.max(0, 1 - Math.abs(freq.value - target.value) / 4) ** 1.6));

const timers = [];
let lockTimer = 0;
watch(freq, () => {
  if (locked.value || allDone.value) return;
  clearTimeout(lockTimer);
  if (Math.abs(freq.value - target.value) <= LOCK_RANGE) {
    // nasa tamang frequency nang ~0.5s: locked
    lockTimer = setTimeout(lock, props.reduced ? 100 : 500);
  }
});
function lock() {
  locked.value = true;
  freq.value = target.value;
  navigator.vibrate?.([12, 30, 12]);
  emit("locked");
  timers.push(
    setTimeout(() => {
      if (channel.value < channels.value.length - 1) {
        channel.value += 1;
        locked.value = false;
      } else {
        allDone.value = true;
        timers.push(setTimeout(() => emit("done"), 1400));
      }
    }, 1900),
  );
}

/* static: random na grey na pixel bawat frame (maliit na canvas, pinalaki sa CSS) */
const noiseEl = ref(null);
let raf = 0;
let frame = 0;
function drawNoise() {
  raf = requestAnimationFrame(drawNoise);
  frame += 1;
  if (frame % 2) return;
  const cv = noiseEl.value;
  if (!cv) return;
  const g = cv.getContext("2d");
  const img = g.createImageData(cv.width, cv.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = v;
    img.data[i + 1] = v * 0.9;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
}
onMounted(() => {
  if (channels.value.length === 0) {
    allDone.value = true;
    emit("done");
    return;
  }
  drawNoise();
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  clearTimeout(lockTimer);
  timers.forEach(clearTimeout);
});
</script>

<style scoped>
.tune {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 50px 20px 40px;
  text-align: center;
}
.eyebrow {
  margin: 0;
  color: #ffb39b;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
}
h2 {
  margin: 6px 0 0;
  color: #fff1e0;
  font-family: var(--font-serif);
  font-size: clamp(26px, 8cqi, 40px);
  font-style: italic;
  font-weight: 600;
  text-shadow: 0 0 18px rgb(236 95 114 / 0.6);
}
.sub {
  min-height: 1.4em;
  margin: 8px 0 0;
  color: rgb(255 241 224 / 0.85);
  font-family: var(--font-mono);
  font-size: 12px;
}

/* lumang TV */
.tv {
  width: min(100%, 360px);
  padding: 14px 14px 10px;
  border-radius: 22px;
  background: linear-gradient(180deg, #4a2a3a, #2c1824);
  box-shadow: 0 18px 40px rgb(0 0 0 / 0.5), inset 0 2px 0 rgb(255 255 255 / 0.08);
}
.screen {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border-radius: 16px / 22px;
  background: #111;
  box-shadow: inset 0 0 30px rgb(0 0 0 / 0.9);
}
.photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(calc((1 - var(--clear)) * 8px)) saturate(calc(0.3 + var(--clear) * 0.8)) hue-rotate(calc((1 - var(--clear)) * 60deg));
  transform: translateX(calc((1 - var(--clear)) * 6px)) skewX(calc((1 - var(--clear)) * -4deg));
}
.noise {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  mix-blend-mode: screen;
  pointer-events: none;
}
.roll {
  position: absolute;
  left: 0;
  right: 0;
  height: 22%;
  background: linear-gradient(180deg, transparent, rgb(255 255 255 / 0.25), transparent);
  animation: roll 1.6s linear infinite;
  pointer-events: none;
}
.screen::after {
  /* scanlines + kurba ng lumang screen */
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(0deg, rgb(0 0 0 / 0.18) 0 1px, transparent 1px 3px),
    radial-gradient(ellipse at 50% 50%, transparent 60%, rgb(0 0 0 / 0.55) 100%);
  pointer-events: none;
}
.osd {
  position: absolute;
  top: 8px;
  left: 10px;
  color: #8affc4;
  font-family: var(--font-mono);
  font-size: 11px;
  text-shadow: 0 0 6px #8affc4;
}
.caption {
  position: absolute;
  right: 10px;
  bottom: 10px;
  left: 10px;
  margin: 0;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgb(0 0 0 / 0.55);
  color: #fff1e0;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
}
.tv.locked .screen {
  box-shadow: inset 0 0 30px rgb(0 0 0 / 0.6), 0 0 24px rgb(120 255 190 / 0.35);
}
.tv-base {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  padding: 0 4px;
}
.knob {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: conic-gradient(from var(--a), #ffb39b 0 8deg, #5c3546 8deg 360deg);
  box-shadow: inset 0 0 0 3px #2c1824, 0 2px 4px rgb(0 0 0 / 0.5);
}
.meter {
  flex: 1;
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: rgb(0 0 0 / 0.4);
}
.meter span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #ec5f72, #8affc4);
  transition: width 0.15s;
}

/* tuner slider */
.tuner {
  display: block;
  width: min(100%, 380px);
}
.scale {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  color: rgb(255 179 155 / 0.7);
  font-family: var(--font-mono);
  font-size: 10px;
}
.tuner input {
  width: 100%;
  height: 36px;
  margin: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  touch-action: pan-y;
}
.tuner input::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 4px;
  background: repeating-linear-gradient(90deg, rgb(255 179 155 / 0.5) 0 1px, transparent 1px 10px), rgb(0 0 0 / 0.45);
}
.tuner input::-webkit-slider-thumb {
  width: 30px;
  height: 30px;
  margin-top: -11px;
  border: 2px solid #fff1e0;
  border-radius: 50%;
  background: radial-gradient(circle, #ff8fa3, #ec5f72);
  box-shadow: 0 0 14px rgb(236 95 114 / 0.8);
  appearance: none;
}
.tuner input::-moz-range-track {
  height: 8px;
  border-radius: 4px;
  background: rgb(0 0 0 / 0.45);
}
.tuner input::-moz-range-thumb {
  width: 26px;
  height: 26px;
  border: 2px solid #fff1e0;
  border-radius: 50%;
  background: #ec5f72;
}
.cap-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.cap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
@keyframes roll {
  from {
    top: -22%;
  }
  to {
    top: 100%;
  }
}
/* laptop/iPad: mas malaking TV */
@container (min-width: 700px) and (min-height: 621px) {
  .tv {
    width: min(100%, 500px);
  }
  .tuner {
    width: min(100%, 520px);
  }
}
@container (max-height: 620px) {
  .tune {
    gap: 10px;
    padding: 20px 20px 16px;
  }
  .tv {
    width: min(100%, 300px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .roll {
    animation: none;
  }
}
</style>
