<template>
  <canvas ref="canvasEl" class="rain" :class="{ dim }" aria-hidden="true" />
</template>

<script setup>
/* MATRIX RAIN ng Memory Lane: bumabagsak na letra galing sa pangalan, petsa at ♥ (hindi berdeng code).
   Habang naka-`decoding`, bawat letra ng `message` na madaanan ng ulan ay nagsa-scramble tapos nabubuo.
   Iginuguhit sa canvas; ang trail ay galing sa translucent na fade bawat frame. */
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  glyphs: { type: String, default: "♥✦01" },
  message: { type: Array, default: () => [] }, // mga linya, hal. ["HAPPY", "BIRTHDAY", "MARIA"]
  decoding: { type: Boolean, default: false },
  showMessage: { type: Boolean, default: true },
  dim: { type: Boolean, default: false },
  hearts: { type: Boolean, default: false },
  reduced: { type: Boolean, default: false },
});
const emit = defineEmits(["progress", "decoded"]);

const FONT = '"Space Mono", ui-monospace, Menlo, monospace';
const BG = "18, 10, 26";
const TRAIL_COLORS = ["#ec5f72", "#ffb39b", "#f4c27a", "#e88bb1"];
const HEART_GLYPHS = Array.from("♥♥♥♡✦");
const rand = (min, max) => min + Math.random() * (max - min);

const canvasEl = ref(null);
let ctx = null;
let w = 0;
let h = 0;
let fs = 16;
let rows = 0;
let drops = [];
let letters = [];
let glyphSet = [];
let frame = 0;
let last = 0;
let observer = null;
let decodeTime = 0;
let lockedCount = -1;
let decodedSent = false;

function pick() {
  const set = props.hearts ? HEART_GLYPHS : glyphSet;
  return set[Math.floor(Math.random() * set.length)];
}

function newDrop(scatter) {
  return {
    y: scatter ? rand(-rows, rows) : rand(-rows * 0.5, 0),
    speed: rand(7, 17),
    row: -1,
    glyph: pick(),
    color: TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)],
  };
}

function layout() {
  const canvas = canvasEl.value;
  if (!canvas) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = `rgb(${BG})`;
  ctx.fillRect(0, 0, w, h);
  fs = Math.round(Math.max(14, Math.min(20, w / 24)));
  rows = Math.ceil(h / fs);
  drops = Array.from({ length: Math.ceil(w / fs) }, () => newDrop(true));
  layoutMessage();
}

// puwesto ng bawat letra ng mensahe (nakagitna, bahagyang mataas sa gitna ng screen)
function layoutMessage() {
  if (!ctx || !w) return;
  const lines = props.message.filter(Boolean);
  const longest = Math.max(1, ...lines.map((line) => Array.from(line).length));
  const size = Math.min(64, (w * 0.86) / (longest * 0.62), h * 0.1);
  ctx.font = `700 ${size}px ${FONT}`;
  const advance = ctx.measureText("M").width;
  const lineHeight = size * 1.3;
  const top = h * 0.42 - ((lines.length - 1) * lineHeight) / 2;
  const previous = letters;
  letters = [];
  lines.forEach((line, lineIndex) => {
    const chars = Array.from(line);
    const startX = (w - chars.length * advance) / 2 + advance / 2;
    chars.forEach((ch, i) => {
      if (ch === " ") return;
      letters.push({ ch, x: startX + i * advance, y: top + lineIndex * lineHeight, size, advance, state: 0, t: 0, flick: 0, glyph: pick() });
    });
  });
  // kapag nag-resize habang nagde-decode, ituloy ang progress
  previous.forEach((old, i) => {
    if (letters[i]) letters[i].state = old.state;
  });
}

function step(dt) {
  const speed = (props.decoding ? 2.4 : 1) * (props.dim ? 0.55 : 1) * (props.reduced ? 0.5 : 1);
  ctx.fillStyle = `rgba(${BG}, ${props.hearts ? 0.2 : 0.14})`;
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${fs}px ${FONT}`;

  drops.forEach((drop, col) => {
    drop.y += drop.speed * speed * dt;
    const row = Math.floor(drop.y);
    if (row === drop.row) return;
    const x = col * fs + fs / 2;
    // ang dating ulo ay nagiging trail (kulay ng column)
    if (drop.row >= 0) {
      ctx.fillStyle = `rgb(${BG})`;
      ctx.fillRect(col * fs, drop.row * fs, fs, fs);
      ctx.fillStyle = drop.color;
      ctx.fillText(drop.glyph, x, drop.row * fs + fs / 2);
    }
    drop.row = row;
    drop.glyph = pick();
    if (row >= 0) {
      ctx.fillStyle = `rgb(${BG})`;
      ctx.fillRect(col * fs, row * fs, fs, fs);
      ctx.fillStyle = props.hearts ? "#ffd1dc" : "#fff1e0";
      ctx.fillText(drop.glyph, x, row * fs + fs / 2);
    }
    if (row > rows && Math.random() < 0.08) drops[col] = newDrop(false);
  });

  if (props.showMessage && letters.length) drawMessage(dt);
}

function drawMessage(dt) {
  if (props.decoding) {
    decodeTime += dt;
    // nagsisimulang mag-scramble ang letra kapag dinaanan ng ulo ng ulan
    letters.forEach((letter) => {
      if (letter.state !== 0) return;
      const first = Math.floor((letter.x - letter.advance / 2) / fs);
      const lastCol = Math.floor((letter.x + letter.advance / 2) / fs);
      for (let col = first; col <= lastCol; col++) {
        const drop = drops[col];
        if (!drop) continue;
        const headY = drop.row * fs;
        if (headY >= letter.y - letter.size * 0.6 && headY <= letter.y + letter.size * 0.6) {
          letter.state = 1;
          break;
        }
      }
    });
    // pamalit: siguradong matatapos sa loob ng ilang segundong pagpindot
    if (decodeTime > (props.reduced ? 2 : 4.5)) {
      const next = letters.find((letter) => letter.state === 0);
      if (next) next.state = 1;
    }
  }

  ctx.font = `700 ${letters[0].size}px ${FONT}`;
  letters.forEach((letter) => {
    if (letter.state === 0) return;
    if (letter.state === 1) {
      letter.t += dt;
      letter.flick -= dt;
      if (letter.flick <= 0) {
        letter.glyph = pick();
        letter.flick = 0.06;
      }
      if (letter.t > 0.5) letter.state = 2;
    }
    ctx.fillStyle = `rgb(${BG})`;
    ctx.fillRect(letter.x - letter.advance / 2, letter.y - letter.size * 0.62, letter.advance, letter.size * 1.24);
    if (letter.state === 2) {
      ctx.shadowColor = "#ec5f72";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#fff1e0";
      ctx.fillText(letter.ch, letter.x, letter.y);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = "#ec5f72";
      ctx.fillText(letter.glyph, letter.x, letter.y);
    }
  });

  const locked = letters.reduce((sum, letter) => sum + (letter.state === 2 ? 1 : 0), 0);
  if (locked !== lockedCount) {
    lockedCount = locked;
    emit("progress", locked / letters.length);
    if (locked === letters.length && !decodedSent) {
      decodedSent = true;
      emit("decoded");
    }
  }
}

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  step(dt);
  frame = requestAnimationFrame(tick);
}

watch(
  () => props.glyphs,
  (value) => (glyphSet = Array.from(value.replace(/\s/g, "") || "♥")),
  { immediate: true },
);
watch(() => props.message, layoutMessage);

onMounted(() => {
  ctx = canvasEl.value.getContext("2d");
  layout();
  observer = new ResizeObserver(layout);
  observer.observe(canvasEl.value);
  // sukatin ulit kapag na-load na ang Space Mono (iba ang lapad ng letra)
  document.fonts?.load(`700 20px ${FONT}`).then(() => ctx && layoutMessage());
  frame = requestAnimationFrame(tick);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
  ctx = null;
});
</script>

<style scoped>
.rain {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  transition: opacity 1.2s ease;
}
.rain.dim {
  opacity: 0.35;
}
</style>
