<template>
  <!-- 4) LINKED RINGS: dalawang gintong singsing sa magkabilang gilid; i-drag ang daliri papunta sa gitna
       para magsalikop ang mga ito. Pag nagdikit: liwanag + pangalan nilang dalawa. -->
  <section
    class="rings-stage"
    :class="{ linked }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <header class="head">
      <p class="eyebrow">{{ linked ? "Together" : "Two hearts" }}</p>
      <h2>
        <Transition name="swap" mode="out-in">
          <span :key="linked">{{ linked ? "Forever begins here" : "Bring the rings together" }}</span>
        </Transition>
      </h2>
    </header>

    <svg
      ref="svgEl"
      class="rings"
      viewBox="0 0 300 170"
      tabindex="0"
      role="slider"
      aria-label="Bring the rings together"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(p * 100)"
      @keydown.right.prevent="advance(p + 0.12)"
      @keydown.left.prevent="advance(p + 0.12)"
      @keydown.enter.prevent="advance(p + 0.12)"
      @keydown.space.prevent="advance(p + 0.12)"
    >
      <defs>
        <linearGradient id="te-ring-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f6e4b0" />
          <stop offset="0.45" stop-color="#b8914f" />
          <stop offset="1" stop-color="#e9d3a0" />
        </linearGradient>
        <radialGradient id="te-ring-halo">
          <stop offset="0" stop-color="#fff2c4" stop-opacity="0.95" />
          <stop offset="0.5" stop-color="#e8c26a" stop-opacity="0.4" />
          <stop offset="1" stop-color="#e8c26a" stop-opacity="0" />
        </radialGradient>
        <clipPath id="te-ring-over">
          <rect x="134" y="10" width="32" height="75" />
        </clipPath>
      </defs>

      <circle class="halo" :class="{ on: linked }" cx="150" cy="85" r="84" fill="url(#te-ring-halo)" />

      <!-- kaliwang singsing, kanang singsing, tapos ang itaas na bahagi ng kaliwa ulit para magmukhang magkakawing -->
      <g class="ring">
        <ellipse :cx="lx" cy="85" rx="46" ry="54" />
        <ellipse class="shine" :cx="lx" cy="85" rx="44" ry="52" />
      </g>
      <g class="ring">
        <ellipse :cx="rx" cy="85" rx="46" ry="54" />
        <ellipse class="shine" :cx="rx" cy="85" rx="44" ry="52" />
      </g>
      <g class="ring" clip-path="url(#te-ring-over)">
        <ellipse :cx="lx" cy="85" rx="46" ry="54" />
        <ellipse class="shine" :cx="lx" cy="85" rx="44" ry="52" />
      </g>

      <path class="gem" d="M0 -8 L7 0 L0 8 L-7 0Z" :transform="`translate(${lx} 30)`" />
      <path class="gem" d="M0 -8 L7 0 L0 8 L-7 0Z" :transform="`translate(${rx} 30)`" />
    </svg>

    <p v-if="!linked" class="hint">Drag toward the middle · {{ Math.round(p * 100) }}%</p>

    <Transition name="rise">
      <div v-if="linked" class="names">
        <p class="together">{{ together }}</p>
        <p class="pair">{{ recipient }} <span>&amp;</span> {{ sender }}</p>
        <button class="next" type="button" @pointerdown.stop @click="emit('done')">Continue ✦</button>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  together: { type: String, default: "" },
});
const emit = defineEmits(["linked", "done"]);

const svgEl = ref(null);
const p = ref(0); // 0 = magkalayo, 1 = magkawing na
const linked = ref(false);
let dragging = false;

// gitna ng bawat singsing sa viewBox (150 ang gitna); 78 ang layo bago magdikit
const lx = computed(() => 128 - (1 - p.value) * 78);
const rx = computed(() => 172 + (1 - p.value) * 78);

function advance(value) {
  if (linked.value) return;
  const next = Math.min(1, value);
  if (next > p.value) p.value = next;
  if (p.value >= 0.985) {
    p.value = 1;
    linked.value = true;
    navigator.vibrate?.([20, 40, 30]);
    emit("linked", svgEl.value);
  }
}

// sinusundan ng singsing ang daliri (kahit alin sa dalawang singsing ang hinihila)
function fromPointer(event) {
  const rect = svgEl.value.getBoundingClientRect();
  const dist = Math.abs(event.clientX - (rect.left + rect.width / 2));
  const unit = (dist * 300) / rect.width; // sa viewBox units
  const value = Math.max(0, Math.min(1, 1 - (unit - 22) / 78));
  advance(Math.min(value, p.value + 0.25));
}
function onDown(event) {
  if (linked.value) return;
  dragging = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  fromPointer(event);
}
function onMove(event) {
  if (dragging) fromPointer(event);
}
function onUp() {
  dragging = false;
}
</script>

<style scoped>
.rings-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  padding: 70px 18px 90px;
  text-align: center;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.rings-stage:not(.linked) {
  cursor: grab;
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
.rings {
  flex: 0 1 auto;
  width: min(100%, 380px);
  overflow: visible;
  outline: none;
}
.rings:focus-visible {
  outline: 2px dashed #b8914f;
  outline-offset: 6px;
}
.ring ellipse {
  fill: none;
  stroke: url(#te-ring-gold);
  stroke-width: 10;
  filter: drop-shadow(0 4px 6px rgb(100 70 20 / 0.3));
}
.ring ellipse.shine {
  stroke: rgb(255 250 224 / 0.75);
  stroke-width: 1.6;
  filter: none;
}
.halo {
  opacity: 0;
  transition: opacity 1.2s ease;
}
.halo.on {
  opacity: 1;
  animation: breathe 3s ease-in-out infinite;
  transform-origin: 150px 85px;
}
.gem {
  fill: #fffdf3;
  stroke: #b8914f;
  stroke-width: 1.2;
  filter: drop-shadow(0 0 4px rgb(255 240 190 / 0.9));
}
.linked .gem {
  animation: twinkle 1.6s ease-in-out infinite alternate;
}
.hint {
  margin: 0;
  color: #6f5a35;
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  pointer-events: none;
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
.pair span {
  margin: 0 0.1em;
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
  transition: opacity 0.9s ease 0.7s, transform 0.9s ease 0.7s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes breathe {
  50% {
    transform: scale(1.1);
    opacity: 0.75;
  }
}
@keyframes twinkle {
  to {
    transform-box: fill-box;
    filter: drop-shadow(0 0 9px rgb(255 232 160 / 1));
  }
}
@container (max-height: 620px) {
  .rings-stage {
    gap: 8px;
    padding: 30px 18px 36px;
  }
  .rings {
    width: min(100%, 280px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .halo.on,
  .linked .gem {
    animation: none;
  }
}
</style>