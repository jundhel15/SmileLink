<template>
  <!-- 3) PAPER BOATS: bawat bangkang papel ay may dalang isang hiling. I-drag (o i-flick) papunta sa dagat para
       paalisin; habang naglalayag ito, lalabas ang hiling kasama ng isang litrato. -->
  <section class="boats-stage" :class="{ all: allSent }">
    <header class="head">
      <p class="eyebrow">Make a wish</p>
      <h2>Send each wish out to sea</h2>
    </header>

    <div class="wish-slot" aria-live="polite">
      <Transition name="card" mode="out-in">
        <div v-if="current >= 0" :key="current" class="wish">
          <img v-if="photoFor(current)" class="thumb" :src="photoFor(current)" alt="" draggable="false" />
          <p class="wish-text">{{ wishes[current] }}</p>
        </div>
        <p v-else key="idle" class="idle">Each little boat carries one wish.</p>
      </Transition>
    </div>

    <div
      v-for="(w, i) in wishes"
      :key="i"
      :ref="(el) => (boatEls[i] = el)"
      class="boat"
      :class="{ sailed: st[i].sailed, dragging: drag === i }"
      :style="boatStyle(i)"
      role="button"
      tabindex="0"
      :aria-label="`Send wish ${i + 1} out to sea`"
      @pointerdown="down(i, $event)"
      @pointermove="move(i, $event)"
      @pointerup="up(i, $event)"
      @pointercancel="up(i, $event)"
      @keydown.enter.prevent="launch(i, 0, -1)"
      @keydown.space.prevent="launch(i, 0, -1)"
    >
      <span class="bobber" :style="{ animationDelay: `${i * 0.7}s` }">
        <svg viewBox="0 0 100 90" aria-hidden="true">
          <path d="M8 58 H92 L78 80 H22Z" :fill="COLORS[i % COLORS.length][1]" stroke="#fff" stroke-width="1.5" />
          <path d="M50 8 L50 54 H16Z" :fill="COLORS[i % COLORS.length][0]" stroke="#e9d9cc" stroke-width="1" />
          <path d="M54 22 L54 54 H86Z" :fill="COLORS[i % COLORS.length][0]" stroke="#e9d9cc" stroke-width="1" opacity="0.92" />
          <path d="M22 58 L50 70 L78 58" fill="none" stroke="#d9c3b0" stroke-width="1.2" />
        </svg>
      </span>
    </div>

    <p v-if="!allSent" class="hint">Drag a boat out to sea · {{ sent }}/{{ wishes.length }} sent</p>

    <Transition name="rise">
      <button v-if="allSent" class="next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  wishes: { type: Array, required: true }, // mga hiling (bawat isa = isang bangka)
  photos: { type: Array, default: () => [] },
});
const emit = defineEmits(["sailed", "done"]);

const COLORS = [
  ["#ffffff", "#ffe1d6"],
  ["#fff8e0", "#ffe9a8"],
  ["#f1fbff", "#cdeefa"],
];
const photoFor = (i) => (props.photos.length ? props.photos[(i + 3) % props.photos.length] : "");

const boatEls = [];
const st = ref(props.wishes.map(() => ({ dx: 0, dy: 0, tx: 0, ty: 0, sailed: false })));
const drag = ref(-1);
const current = ref(-1);
const sent = ref(0);
const allSent = computed(() => sent.value === props.wishes.length);

let start = null;
let scale = 1;

function spot(i) {
  const n = props.wishes.length;
  return { left: ((i + 1) / (n + 1)) * 100, top: i % 2 ? 81 : 76 };
}
function boatStyle(i) {
  const { left, top } = spot(i);
  const s = st.value[i];
  const base = { left: `${left}%`, top: `${top}%` };
  if (s.sailed) return { ...base, "--tx": `${s.tx}px`, "--ty": `${s.ty}px` };
  return { ...base, translate: `${s.dx}px ${s.dy}px` };
}

function launch(i, dx, dy) {
  const s = st.value[i];
  if (s.sailed) return;
  s.tx = Math.max(-170, Math.min(170, dx * 2.2));
  s.ty = -Math.max(230, -dy * 2.6); // laging papunta sa abot-tanaw
  s.dx = 0;
  s.dy = 0;
  s.sailed = true;
  current.value = i;
  sent.value += 1;
  navigator.vibrate?.(20);
  emit("sailed", boatEls[i]);
}

function down(i, event) {
  if (st.value[i].sailed) return;
  drag.value = i;
  start = { x: event.clientX, y: event.clientY };
  const el = event.currentTarget;
  scale = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
  el.setPointerCapture?.(event.pointerId);
}
function move(i, event) {
  if (drag.value !== i || !start) return;
  st.value[i].dx = (event.clientX - start.x) / (scale || 1);
  st.value[i].dy = (event.clientY - start.y) / (scale || 1);
}
function up(i) {
  if (drag.value !== i) return;
  const s = st.value[i];
  drag.value = -1;
  start = null;
  if (Math.hypot(s.dx, s.dy) >= 70) launch(i, s.dx, s.dy);
  else {
    s.dx = 0;
    s.dy = 0;
  }
}
</script>

<style scoped>
.boats-stage {
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
  color: #ffe9d6;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.34em;
  text-shadow: 0 2px 10px rgb(60 20 70 / 0.5);
  text-transform: uppercase;
}
h2 {
  margin: 8px 0 0;
  color: #fff;
  font-family: var(--font-head);
  font-size: clamp(26px, 7.6cqi, 38px);
  font-style: italic;
  font-weight: 600;
  line-height: 1.15;
  text-shadow: 0 2px 14px rgb(60 20 70 / 0.55);
}

/* ===== Kard ng hiling ===== */
.wish-slot {
  position: absolute;
  top: 24%;
  left: 50%;
  display: grid;
  place-items: center;
  width: min(100% - 52px, 320px);
  min-height: 130px;
  transform: translateX(-50%);
}
.wish {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 14px 18px;
  border: 1px solid rgb(255 255 255 / 0.45);
  border-radius: 22px;
  background: rgb(255 255 255 / 0.2);
  box-shadow: 0 12px 30px rgb(60 20 70 / 0.25);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  text-align: center;
}
.thumb {
  width: 66px;
  height: 66px;
  border: 3px solid #fff;
  border-radius: 14px;
  box-shadow: 0 6px 14px rgb(60 20 70 / 0.35);
  object-fit: cover;
  pointer-events: none;
  rotate: -4deg;
}
.wish-text {
  margin: 0;
  color: #fff;
  font-family: var(--font-head);
  font-size: clamp(18px, 5.2cqi, 22px);
  font-style: italic;
  font-weight: 600;
  line-height: 1.3;
}
.idle {
  margin: 0;
  color: #fff4ea;
  font-family: var(--font-head);
  font-size: 19px;
  font-style: italic;
}
.card-enter-active,
.card-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.card-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.card-leave-to {
  opacity: 0;
}

/* ===== Mga bangka ===== */
.boat {
  position: absolute;
  width: 84px;
  height: 76px;
  margin: -38px 0 0 -42px;
  cursor: grab;
  outline: none;
  touch-action: none;
}
.boat:focus-visible {
  outline: 2px dashed #fff;
  outline-offset: 6px;
}
.boat:not(.dragging):not(.sailed) {
  transition: translate 0.5s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.boat.dragging {
  cursor: grabbing;
  z-index: 3;
}
.boat.sailed {
  pointer-events: none;
  translate: var(--tx) var(--ty);
  scale: 0.3;
  opacity: 0;
  transition:
    translate 5s cubic-bezier(0.2, 0.6, 0.3, 1),
    scale 5s ease-in,
    opacity 1.2s ease 3.8s;
}
.bobber {
  display: block;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 8px 8px rgb(40 20 70 / 0.35));
  animation: bob 2.6s ease-in-out infinite alternate;
}
.bobber svg {
  display: block;
  width: 100%;
  height: 100%;
}

.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3%;
  margin: 0;
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 2px 8px rgb(40 20 70 / 0.6);
  pointer-events: none;
}
.next {
  position: absolute;
  left: 50%;
  bottom: 3%;
  z-index: 4;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 10px 22px rgb(40 20 70 / 0.35);
  color: #c4573d;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.rise-enter-active {
  transition: opacity 0.9s ease 1.6s, transform 0.9s ease 1.6s;
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes bob {
  from {
    transform: translateY(-3px) rotate(-3deg);
  }
  to {
    transform: translateY(4px) rotate(3deg);
  }
}
@container (max-height: 620px) {
  .head {
    top: 5%;
  }
  .wish-slot {
    top: 21%;
    min-height: 104px;
  }
  .thumb {
    width: 48px;
    height: 48px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bobber {
    animation: none;
  }
}
</style>