<template>
  <!-- 4) SCRATCH TICKET: kaskasin ng daliri ang kumikinang na foil ng tatlong panel para malaman ang mga pangako
       niya sa iyo. Kapag halos nakaskas na ang isang panel, kusa nang lalabas ang buong pangako. -->
  <section class="sc-stage">
    <header class="sc-head">
      <p class="sc-eyebrow">Month {{ monthCount }}<template v-if="sinceDate"> · since {{ sinceDate }}</template></p>
      <h2>{{ allDone ? "Promises, kept for you" : "Scratch to reveal" }}</h2>
    </header>

    <div class="sc-ticket">
      <p class="sc-top">Our {{ monthCount }} {{ monthCount === 1 ? "month" : "months" }} together</p>
      <div v-for="(t, i) in promises" :key="i" class="sc-row">
        <span class="sc-label">Promise {{ i + 1 }}</span>
        <div :ref="(el) => (panelEls[i] = el)" class="sc-panel" :class="{ open: revealed[i] }">
          <p class="sc-text">{{ t }}</p>
          <canvas
            :ref="(el) => (canvases[i] = el)"
            class="sc-foil"
            tabindex="0"
            :aria-label="`Scratch promise ${i + 1}`"
            @pointerdown="down(i, $event)"
            @pointermove="move(i, $event)"
            @pointerup="up(i)"
            @pointercancel="up(i)"
            @keydown.enter.prevent="reveal(i)"
            @keydown.space.prevent="reveal(i)"
          />
        </div>
      </div>
    </div>

    <p v-if="!allDone" class="sc-hint">Scratch each panel · {{ doneCount }}/{{ promises.length }}</p>

    <Transition name="sc-rise">
      <button v-if="allDone" class="sc-next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  promises: { type: Array, required: true },
  monthCount: { type: Number, default: 1 },
  sinceDate: { type: String, default: "" },
});
const emit = defineEmits(["revealed", "finished", "done"]);

const canvases = [];
const panelEls = [];
const revealed = ref(props.promises.map(() => false));
const doneCount = computed(() => revealed.value.filter(Boolean).length);
const allDone = computed(() => doneCount.value === props.promises.length);

let drawing = -1;
let lastPt = null;
let moves = 0;
let timer = 0;

function paint(c) {
  c.width = c.offsetWidth || 300;
  c.height = c.offsetHeight || 76;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  const w = c.width;
  const h = c.height;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#f4b6c8");
  g.addColorStop(0.5, "#ffe3c2");
  g.addColorStop(1, "#f19fb8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  for (let x = 8; x < w; x += 22) {
    for (let y = 8; y < h; y += 22) ctx.fillRect(x, y, 2, 2);
  }
  ctx.fillStyle = "#b4506f";
  ctx.font = `700 ${Math.round(h * 0.28)}px Fredoka, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✦ scratch here ✦", w / 2, h / 2);
}

function point(c, event) {
  const r = c.getBoundingClientRect();
  return {
    x: ((event.clientX - r.left) * c.width) / (r.width || 1),
    y: ((event.clientY - r.top) * c.height) / (r.height || 1),
  };
}

function down(i, event) {
  if (revealed.value[i]) return;
  const c = canvases[i];
  drawing = i;
  c.setPointerCapture?.(event.pointerId);
  lastPt = point(c, event);
  stroke(c, lastPt, lastPt);
}
function move(i, event) {
  if (drawing !== i) return;
  const c = canvases[i];
  const p = point(c, event);
  stroke(c, lastPt, p);
  lastPt = p;
  moves += 1;
  if (moves % 6 === 0) check(i);
}
function up(i) {
  if (drawing !== i) return;
  drawing = -1;
  lastPt = null;
  check(i);
}

function stroke(c, a, b) {
  const ctx = c.getContext("2d");
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(26, c.height * 0.42);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

// tantiyahin kung ilang porsyento na ng foil ang nakaskas
function check(i) {
  if (revealed.value[i]) return;
  const c = canvases[i];
  const ctx = c.getContext("2d", { willReadFrequently: true });
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  let clear = 0;
  let total = 0;
  for (let y = 0; y < c.height; y += 6) {
    for (let x = 0; x < c.width; x += 6) {
      total += 1;
      if (data[(y * c.width + x) * 4 + 3] < 40) clear += 1;
    }
  }
  if (total && clear / total > 0.5) reveal(i);
}

function reveal(i) {
  if (revealed.value[i]) return;
  revealed.value[i] = true;
  drawing = -1;
  navigator.vibrate?.(18);
  emit("revealed", panelEls[i]);
  if (revealed.value.every(Boolean)) {
    timer = setTimeout(() => emit("finished", panelEls[i]), 500);
  }
}

onMounted(() => canvases.forEach((c) => c && paint(c)));
onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
.sc-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.sc-head {
  position: absolute;
  top: 8%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.sc-eyebrow {
  margin: 0;
  color: #d94b70;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: #7a2b45;
  font-family: var(--font-head);
  font-size: clamp(26px, 7.6cqi, 38px);
  font-weight: 600;
  line-height: 1.15;
}

/* ===== Ticket ===== */
.sc-ticket {
  position: absolute;
  left: 50%;
  top: 22%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(88cqi, 350px);
  padding: 16px 18px 18px;
  border-radius: 18px;
  background:
    radial-gradient(circle at 0 50%, transparent 9px, #fff6ee 10px) left / 51% 100% no-repeat,
    radial-gradient(circle at 100% 50%, transparent 9px, #fff6ee 10px) right / 51% 100% no-repeat;
  filter: drop-shadow(0 16px 24px rgb(122 43 69 / 0.28));
  translate: -50% 0;
}
.sc-top {
  margin: 0;
  color: #d94b70;
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 600;
  text-align: center;
}
.sc-top::after {
  content: "";
  display: block;
  margin-top: 10px;
  border-top: 2px dashed rgb(224 102 127 / 0.45);
}
.sc-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sc-label {
  color: #b4506f;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.sc-panel {
  position: relative;
  display: grid;
  min-height: 76px;
  place-items: center;
  overflow: hidden;
  border: 2px solid #ffc2d4;
  border-radius: 12px;
  background: #fff;
}
.sc-text {
  margin: 0;
  padding: 8px 14px;
  color: #5c2a3c;
  font-family: var(--font-hand);
  font-size: clamp(20px, 5.8cqi, 24px);
  line-height: 1.15;
  text-align: center;
}
.sc-foil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  touch-action: none;
  transition: opacity 0.6s ease;
}
.sc-foil:focus-visible {
  outline: 2px dashed #7a2b45;
  outline-offset: -4px;
}
.sc-panel.open .sc-foil {
  opacity: 0;
  pointer-events: none;
}
.sc-panel.open {
  border-color: #e0667f;
  animation: sc-glow 1s ease;
}

.sc-hint {
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
  text-shadow: 0 2px 8px rgb(122 43 69 / 0.55);
  pointer-events: none;
}
.sc-next {
  position: absolute;
  left: 50%;
  bottom: 3.5%;
  z-index: 4;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: #e9677c;
  box-shadow: 0 10px 22px rgb(180 60 90 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.sc-rise-enter-active {
  transition: opacity 0.9s ease 0.8s, transform 0.9s ease 0.8s;
}
.sc-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes sc-glow {
  from {
    box-shadow: 0 0 0 0 rgb(255 120 160 / 0.8);
  }
  to {
    box-shadow: 0 0 0 16px rgb(255 120 160 / 0);
  }
}
@container (max-height: 620px) {
  .sc-head {
    top: 4%;
  }
  .sc-ticket {
    top: 19%;
    gap: 8px;
    padding-block: 12px;
  }
  .sc-panel {
    min-height: 62px;
  }
}
</style>