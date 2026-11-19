<template>
  <!-- FIREFLY JAR: madilim ang buong screen, ang kumikinang na garapon lang ang kita. Buksan ang takip
       (i-drag pataas o i-tap) para lumaya ang mga alitaptap. Kung saan sila lumilipad, lumiliwanag ang
       dilim at lumilitaw ang mga litrato. I-hold para sumunod sila, o i-tap ang litrato para doon sila
       pumunta. Kapag maliwanag na lahat ng litrato: mawawala ang dilim at lalabas ang mensahe. -->
  <section
    ref="stageEl"
    class="jar-stage"
    :class="[`is-${stage}`]"
    role="application"
    tabindex="0"
    :aria-label="ariaLabel"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
    @keydown.enter.prevent="onKey"
    @keydown.space.prevent="onKey"
    @keydown.esc="viewing = -1"
  >
    <!-- mga litratong nakatago sa dilim -->
    <figure
      v-for="(s, i) in slots"
      :key="i"
      class="memory"
      :class="{ lit: s.lit, open: stage === 'done' }"
      :style="{ left: `${s.x}px`, top: `${s.y}px`, width: `${s.size}px`, '--tilt': `${s.tilt}deg` }"
      :role="stage === 'done' ? 'button' : undefined"
      :tabindex="stage === 'done' ? 0 : -1"
      :aria-label="stage === 'done' ? `Open photo ${i + 1}: ${s.caption}` : undefined"
      @click="stage === 'done' && (viewing = i)"
      @keydown.enter.stop.prevent="stage === 'done' && (viewing = i)"
    >
      <img :src="s.src" :alt="s.caption || `Memory ${i + 1}`" draggable="false" />
      <figcaption>{{ s.caption }}</figcaption>
    </figure>

    <canvas ref="canvasEl" class="night" aria-hidden="true" />

    <header class="j-head" :class="{ out: stage === 'done' }">
      <p class="eyebrow">A jar full of light</p>
      <h2>{{ stage === "closed" ? "Open the jar" : "Light up our memories" }}</h2>
      <p class="hint" aria-live="polite">{{ hint }}</p>
    </header>

    <div ref="jarEl" class="jar" :class="{ open: stage !== 'closed' }" aria-hidden="true">
      <span class="jar-light" />
      <svg viewBox="0 0 120 160">
        <defs>
          <linearGradient id="fj-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#fff" stop-opacity="0.22" />
            <stop offset="0.45" stop-color="#fff" stop-opacity="0.05" />
            <stop offset="1" stop-color="#fff" stop-opacity="0.16" />
          </linearGradient>
          <linearGradient id="fj-lid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffe2a6" />
            <stop offset="1" stop-color="#c9954a" />
          </linearGradient>
        </defs>
        <path
          d="M34 30h52v10c14 6 22 18 22 34v58c0 12-8 20-20 20H32c-12 0-20-8-20-20V74c0-16 8-28 22-34Z"
          fill="url(#fj-glass)"
          stroke="rgb(255 255 255 / 0.55)"
          stroke-width="2"
        />
        <path d="M24 82c0-10 4-18 12-24" fill="none" stroke="rgb(255 255 255 / 0.5)" stroke-width="3" stroke-linecap="round" />
        <path d="M86 42c10 2 16 10 14 20" fill="none" stroke="#e9b8cf" stroke-width="2" />
        <rect x="86" y="58" width="26" height="18" rx="3" fill="#fbe8f0" transform="rotate(10 99 67)" />
        <path d="M95 64c-2-2-5-1-4 1 0 2 4 4 4 4s4-2 4-4c1-2-2-3-4-1Z" fill="#e0789d" transform="rotate(10 99 67)" />
      </svg>
      <!-- takip: i-drag pataas o i-tap para buksan -->
      <button
        class="lid"
        type="button"
        :tabindex="stage === 'closed' ? 0 : -1"
        aria-label="Open the jar"
        @pointerdown.stop="lidDown"
        @pointermove.stop="lidMove"
        @pointerup.stop="lidUp"
        @pointercancel.stop="lidUp"
        @keydown.enter.stop.prevent="openJar"
      >
        <svg viewBox="0 0 60 18" aria-hidden="true"><rect width="60" height="16" rx="4" fill="url(#fj-lid)" /></svg>
      </button>
    </div>

    <Transition name="rise">
      <div v-if="stage === 'done'" class="message" @pointerdown.stop>
        <h3>{{ recipient }}</h3>
        <p class="text">{{ message }}</p>
        <p class="from">— {{ sender }}</p>
        <div class="actions">
          <button class="replay" type="button" @click="emit('replay')">↻ Replay</button>
        </div>
      </div>
    </Transition>

    <!-- LIGHTBOX: malaking bersyon ng na-tap na litrato -->
    <Transition name="zoom">
      <div v-if="viewing >= 0 && slots[viewing]" class="viewer" role="dialog" aria-label="Photo viewer" @pointerdown.stop @click.self="viewing = -1">
        <figure class="viewer-pol">
          <img :src="slots[viewing].src" :alt="slots[viewing].caption || `Memory ${viewing + 1}`" draggable="false" />
          <figcaption>{{ slots[viewing].caption }}</figcaption>
          <span class="viewer-no">{{ viewing + 1 }} / {{ slots.length }}</span>
        </figure>
        <div class="viewer-nav">
          <button type="button" aria-label="Previous photo" @click="step(-1)">‹</button>
          <button type="button" aria-label="Close photo" @click="viewing = -1">✕</button>
          <button type="button" aria-label="Next photo" @click="step(1)">›</button>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  // 6–10 litrato (URL o { src, caption }); bawat isa ay lumiliwanag kapag dinaanan ng alitaptap
  photos: { type: Array, default: () => [] },
  reduced: { type: Boolean, default: false },
});
const emit = defineEmits(["opened", "lit", "complete", "replay"]);

const FLY_COUNT = 14;
const stageEl = ref(null);
const canvasEl = ref(null);
const jarEl = ref(null);
const stage = ref("closed"); // closed → free → done
const slots = ref([]); // { x, y, size, tilt, src, caption, lit }
const litCount = computed(() => slots.value.filter((s) => s.lit).length);
const viewing = ref(-1); // index ng litratong nakabukas sa lightbox (-1 = wala)
function step(d) {
  const n = slots.value.length;
  if (n) viewing.value = (viewing.value + d + n) % n;
}
const hint = computed(() => {
  if (stage.value === "closed") return "Lift the lid to set the fireflies free ✨";
  if (stage.value === "done") return "";
  if (litCount.value === 0) return "Hold to guide them, or tap a dark spot";
  return `${litCount.value} of ${slots.value.length} memories glowing`;
});
const ariaLabel = computed(() => {
  if (stage.value === "closed") return "A glowing jar of fireflies. Press Enter to open it.";
  if (stage.value === "done") return `Happy birthday, ${props.recipient}`;
  return "Guide the fireflies to light up the photos. Press Enter to light the next one.";
});

const pics = computed(() =>
  props.photos
    .filter(Boolean)
    .slice(0, 10)
    .map((p) => (typeof p === "string" ? { src: p, caption: "" } : { src: p.src, caption: p.caption || "" })),
);

/* ===== Puwesto ng mga litrato: grid na may kaunting tagilid, sa pagitan ng title at garapon ===== */
let W = 0;
let H = 0;
let dpr = 1;
let ctx = null;
function layout() {
  const el = stageEl.value;
  W = el.clientWidth;
  H = el.clientHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvasEl.value.width = Math.round(W * dpr);
  canvasEl.value.height = Math.round(H * dpr);
  ctx = canvasEl.value.getContext("2d");
  const n = pics.value.length;
  const wide = W >= 600;
  // pahiga (laptop): hanggang 2 hanay lang (6 = 1 hanay, 10 = 2 × 5) para hindi matakpan ng mensahe;
  // patayo (cellphone/iPad): 3 bawat hanay, o 4 sa iPad kapag higit 6
  const landscape = W > H;
  const cols = landscape ? (n <= 6 ? n : Math.ceil(n / 2)) : Math.min(n, n > 6 && wide ? 4 : 3);
  const rows = Math.ceil(n / cols) || 1;
  const top = H * 0.07 + 92 + 96; // ilalim ng header
  const bottom = H * (landscape ? 0.58 : 0.64);
  const zoneW = Math.min(W - 24, wide ? 900 : W);
  const cellW = zoneW / cols;
  const cellH = Math.max(40, (bottom - top) / rows);
  const size = Math.max(54, Math.min(cellW * 0.78, cellH * 0.74, wide ? 150 : 110));
  const prev = slots.value;
  slots.value = pics.value.map((p, i) => {
    const r = Math.floor(i / cols);
    const inRow = r === rows - 1 ? n - r * cols : cols; // ang huling hanay ay nakagitna
    const c = i % cols;
    const rowW = inRow * cellW;
    return {
      x: (W - rowW) / 2 + c * cellW + cellW / 2,
      y: top + r * cellH + cellH / 2,
      size,
      tilt: ((i * 37) % 9) - 4,
      src: p.src,
      caption: p.caption,
      lit: prev[i]?.lit || false,
      charge: 0,
      glow: prev[i]?.lit ? 1 : 0,
    };
  });
}

/* ===== Alitaptap ===== */
const flies = []; // { x, y, vx, vy, seed, spot }
let raf = 0;
let last = 0;
let holding = false;
const ptr = { x: 0, y: 0 };
let tapTarget = null; // { x, y, until }
let darkness = 1; // sarado: ganap na madilim, garapon lang ang kita

function jarBox() {
  const s = stageEl.value.getBoundingClientRect();
  const j = jarEl.value.getBoundingClientRect();
  const k = s.width / stageEl.value.offsetWidth || 1;
  return { x: (j.left + j.width / 2 - s.left) / k, y: (j.top + j.height / 2 - s.top) / k, w: j.width / k, h: j.height / k };
}
function local(event) {
  const r = stageEl.value.getBoundingClientRect();
  const k = r.width / stageEl.value.offsetWidth || 1;
  return { x: (event.clientX - r.left) / k, y: (event.clientY - r.top) / k };
}

/* ===== Takip ===== */
let lidStart = null;
function lidDown(event) {
  if (stage.value !== "closed") return;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  lidStart = event.clientY;
}
function lidMove(event) {
  if (lidStart === null) return;
  if (lidStart - event.clientY > 24) openJar();
}
function lidUp() {
  if (lidStart !== null && stage.value === "closed") openJar(); // tap sa takip
  lidStart = null;
}
function openJar() {
  if (stage.value !== "closed") return;
  lidStart = null;
  stage.value = "free";
  navigator.vibrate?.([12, 30, 12]);
  emit("opened", jarEl.value);
  // lalabas ang mga alitaptap pataas at kakalat
  for (const f of flies) {
    f.spot = null;
    f.vx = (Math.random() - 0.5) * 5;
    f.vy = -3 - Math.random() * 4;
  }
}

/* ===== Paggabay ===== */
function onDown(event) {
  if (stage.value !== "free") return;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  Object.assign(ptr, local(event));
  holding = true;
}
function onMove(event) {
  if (holding) Object.assign(ptr, local(event));
}
function onUp() {
  if (!holding) return;
  holding = false;
  // pupunta pa rin sandali sa huling puwesto ng daliri (para sa tap)
  tapTarget = { x: ptr.x, y: ptr.y, until: performance.now() + 2600 };
}
function onKey() {
  if (stage.value === "closed") return openJar();
  if (stage.value !== "free") return;
  const s = slots.value.find((x) => !x.lit);
  if (s) tapTarget = { x: s.x, y: s.y, until: performance.now() + 3000 };
}

function lightSlot(s) {
  s.lit = true;
  slots.value = [...slots.value];
  navigator.vibrate?.(10);
  emit("lit");
  if (slots.value.every((x) => x.lit)) {
    stage.value = "done";
    navigator.vibrate?.([20, 40, 20]);
    setTimeout(() => emit("complete", stageEl.value), 400);
  }
}

function tick(now) {
  raf = 0;
  if (!ctx) return;
  const dt = Math.min(2.5, (now - last) / 16.67 || 1);
  last = now;
  const t = now / 1000;
  const jar = jarBox();
  const guide = holding ? ptr : tapTarget && now < tapTarget.until ? tapTarget : null;

  for (const f of flies) {
    if (stage.value === "closed") {
      // nasa loob ng garapon, umiikot nang dahan-dahan
      const tx = jar.x + f.spot.x * jar.w + Math.sin(t * 1.3 + f.seed) * 3;
      const ty = jar.y + f.spot.y * jar.h + Math.cos(t * 1.1 + f.seed) * 3;
      f.x += (tx - f.x) * Math.min(1, 0.15 * dt);
      f.y += (ty - f.y) * Math.min(1, 0.15 * dt);
      continue;
    }
    if (guide) {
      const ang = f.seed + t * 2;
      const orbit = 14 + (f.seed % 1) * 34;
      f.vx += (guide.x + Math.cos(ang) * orbit - f.x) * 0.01 * dt;
      f.vy += (guide.y + Math.sin(ang) * orbit - f.y) * 0.01 * dt;
      f.vx *= 0.9 ** dt;
      f.vy *= 0.9 ** dt;
    } else {
      f.vx += Math.sin(t * 0.7 + f.seed) * 0.03 * dt;
      f.vy += Math.cos(t * 0.6 + f.seed * 1.3) * 0.03 * dt;
      f.vx *= 0.97 ** dt;
      f.vy *= 0.97 ** dt;
      if (f.x < 20) f.vx += 0.06 * dt;
      if (f.x > W - 20) f.vx -= 0.06 * dt;
      if (f.y < H * 0.22) f.vy += 0.06 * dt;
      if (f.y > H * 0.7) f.vy -= 0.06 * dt;
    }
    f.x += f.vx * dt;
    f.y += f.vy * dt;
  }

  // litratong may ≥2 alitaptap nang ~0.6s: liliwanag
  if (stage.value === "free") {
    for (const s of slots.value) {
      if (s.lit) continue;
      const half = s.size * 0.62;
      const near = flies.filter((f) => Math.abs(f.x - s.x) < half && Math.abs(f.y - s.y) < half * 1.2).length;
      s.charge = near >= 2 ? s.charge + dt / 60 : Math.max(0, s.charge - dt / 120);
      if (s.charge > (props.reduced ? 0.2 : 0.6)) lightSlot(s);
    }
  }
  for (const s of slots.value) if (s.lit) s.glow = Math.min(1, s.glow + 0.03 * dt);
  // sarado: halos itim (garapon lang ang kita); bukas: bahagyang lumuluwag; tapos: nawawala ang dilim
  if (stage.value === "done") darkness = Math.max(0, darkness - 0.012 * dt);
  // (habang hindi pa tapos, nananatiling ganap na itim; ang litrato ay lilitaw lang kapag naliwanagan na)

  // ===== guhit: dilim na may butas ng liwanag, tapos ang mga alitaptap =====
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (darkness > 0.01) {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(7, 5, 22, ${darkness})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "destination-out";
    const hole = (x, y, r, a) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(0.55, `rgba(0,0,0,${a * 0.6})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 6.283);
      ctx.fill();
    };
    // ang garapon lang ang may liwanag sa paligid habang sarado; ang alitaptap ay hindi gumagawa ng butas sa dilim
    if (stage.value === "closed") hole(jar.x, jar.y, jar.w * 1.1, 0.55);
    // maliwanag na litrato: liwanag na kasinghugis ng polaroid (malambot ang gilid), hindi tumatagos sa katabi
    for (const s of slots.value) {
      if (s.glow <= 0) continue;
      const w = s.size + 10;
      const h = s.size * 1.24 + 10;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate((s.tilt * Math.PI) / 180);
      ctx.shadowColor = "rgba(0, 0, 0, 1)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = `rgba(0, 0, 0, ${s.glow})`;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    }
    // malabong balangkas ng mga litratong hindi pa maliwanag (para alam kung saan pupunta)
    if (stage.value === "free") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(255, 230, 170, 0.14)";
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1.2;
      for (const s of slots.value) {
        if (s.lit) continue;
        const h = s.size * 0.6;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate((s.tilt * Math.PI) / 180);
        ctx.strokeRect(-h, -h * 1.12, h * 2, h * 2.3);
        ctx.restore();
      }
      ctx.setLineDash([]);
    }
  }
  ctx.globalCompositeOperation = "lighter";
  for (const f of flies) {
    const blink = props.reduced ? 1 : 0.55 + 0.45 * Math.sin(t * 3 + f.seed * 7);
    // natural na alitaptap: maliit na maliwanag na tuldok + manipis na liwanag sa paligid
    const r = stage.value === "closed" ? 5 : 6.5;
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
    g.addColorStop(0, `rgba(255, 252, 215, ${blink})`);
    g.addColorStop(0.35, `rgba(255, 228, 130, ${0.6 * blink})`);
    g.addColorStop(1, "rgba(255, 210, 90, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 235, ${blink})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 1.3, 0, 6.283);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  raf = requestAnimationFrame(tick);
}

let resizeObs = null;
onMounted(() => {
  layout();
  const jar = jarBox();
  for (let i = 0; i < FLY_COUNT; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random());
    const spot = { x: Math.cos(a) * r * 0.3, y: 0.12 + Math.sin(a) * r * 0.26 };
    flies.push({ x: jar.x + spot.x * jar.w, y: jar.y + spot.y * jar.h, vx: 0, vy: 0, seed: Math.random() * 100, spot });
  }
  last = performance.now();
  raf = requestAnimationFrame(tick);
  if (typeof ResizeObserver !== "undefined") {
    resizeObs = new ResizeObserver(layout);
    resizeObs.observe(stageEl.value);
  }
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  raf = 0;
  resizeObs?.disconnect();
});
</script>

<style scoped>
.jar-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  outline: none;
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.jar-stage.is-done {
  cursor: default;
}

/* litrato: nakatago sa dilim; kapag "lit", may gintong liwanag sa paligid */
.memory {
  position: absolute;
  z-index: 1;
  margin: 0;
  padding: 5px 5px 4px;
  border-radius: 3px;
  background: linear-gradient(180deg, #fffaf3, #f1e4d3);
  box-shadow: 0 8px 18px rgb(8 4 26 / 0.55);
  translate: -50% -50%;
  rotate: var(--tilt);
  transition: box-shadow 1s ease, scale 0.6s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.memory img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 2px;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}
.memory figcaption {
  overflow: hidden;
  margin-top: 3px;
  color: #5a3d52;
  font-family: var(--font-script);
  font-size: 13px;
  line-height: 1.2;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.memory.open {
  cursor: zoom-in;
}
.memory.open:hover,
.memory.open:focus-visible {
  scale: 1.12;
  outline: none;
}
.memory.lit {
  scale: 1.06;
  box-shadow:
    0 8px 18px rgb(8 4 26 / 0.55),
    0 0 26px rgb(255 217 138 / 0.65);
}

.night {
  position: absolute;
  z-index: 2;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.j-head {
  position: absolute;
  z-index: 4;
  top: calc(7% + 92px); /* nasa ilalim ng buwan sa background (top 7%, 78px) */
  left: 50%;
  width: min(100% - 40px, 520px);
  text-align: center;
  transform: translateX(-50%);
  pointer-events: none;
  transition: opacity 1s ease, filter 1s ease;
}
.j-head.out {
  opacity: 0;
  filter: blur(6px);
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
  font-size: clamp(24px, 7.4cqi, 36px);
  font-weight: 400;
  line-height: 1.15;
  text-shadow: 0 0 22px rgb(214 178 240 / 0.5);
}
.hint {
  margin: 8px 0 0;
  color: rgb(253 242 248 / 0.85);
  font-family: var(--font-serif);
  font-size: 15px;
  font-style: italic;
  text-shadow: 0 2px 8px rgb(10 6 30 / 0.8);
}

/* garapon: kumikinang sa dilim; pagkabukas ay bumababa at lumalabo */
.jar {
  --jw: 124px;
  position: absolute;
  z-index: 3;
  top: 79%;
  left: 50%;
  width: var(--jw);
  aspect-ratio: 120 / 160;
  translate: -50% -50%;
  transition: opacity 1.2s ease, top 1.4s ease, scale 1.4s ease;
}
.jar > svg {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.jar-light {
  position: absolute;
  inset: -55%;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 226 140 / 0.7), rgb(255 200 120 / 0.22) 40%, transparent 68%);
  pointer-events: none;
  animation: jar-breathe 2.6s ease-in-out infinite;
  transition: opacity 1s ease;
}
.lid {
  position: absolute;
  top: 7%;
  left: 25%;
  width: 50%;
  height: 16%;
  padding: 0;
  border: 0;
  background: none;
  cursor: grab;
  touch-action: none;
  transition: translate 0.8s cubic-bezier(0.3, 1.2, 0.5, 1), rotate 0.8s ease, opacity 0.8s ease 0.4s;
}
.lid svg {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 0 8px rgb(255 217 138 / 0.6));
}
.is-closed .lid {
  animation: lid-nudge 1.8s ease-in-out infinite;
}
.jar.open .lid {
  opacity: 0;
  translate: 40px -70px;
  rotate: 35deg;
  pointer-events: none;
}
.jar.open .jar-light {
  opacity: 0.35;
}
.is-free .jar {
  top: 86%;
  scale: 0.7;
  opacity: 0.75;
}
.is-done .jar {
  opacity: 0;
}

.message {
  position: absolute;
  z-index: 5;
  bottom: 5%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: min(100% - 32px, 480px);
  padding: 14px 18px 16px;
  border-radius: 22px;
  background: rgb(18 12 44 / 0.55);
  backdrop-filter: blur(6px);
  text-align: center;
  transform: translateX(-50%);
}
.message h3 {
  margin: 0;
  color: #fde7f0;
  font-family: var(--font-script);
  font-size: clamp(46px, 14cqi, 76px);
  font-weight: 400;
  line-height: 1;
  text-shadow: 0 0 24px rgb(244 170 208 / 0.6);
}
.text {
  margin: 0;
  color: #f4e9f7;
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1.4;
}
.from {
  margin: 0;
  color: #f1d3a6;
  font-family: var(--font-script);
  font-size: 26px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
}
.replay {
  padding: 10px 24px;
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
.viewer {
  position: absolute;
  z-index: 8;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  background: rgb(10 6 28 / 0.78);
  backdrop-filter: blur(4px);
  cursor: zoom-out;
}
.viewer-pol {
  position: relative;
  width: min(80%, 360px);
  margin: 0;
  padding: 10px 10px 8px;
  border-radius: 4px;
  background: linear-gradient(180deg, #fffaf3, #f1e4d3);
  box-shadow: 0 24px 50px rgb(0 0 0 / 0.55), 0 0 40px rgb(255 217 138 / 0.35);
  rotate: -1.5deg;
  cursor: default;
}
.viewer-pol img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 2px;
  object-fit: cover;
}
.viewer-pol figcaption {
  margin-top: 8px;
  color: #5a3d52;
  font-family: var(--font-script);
  font-size: 26px;
  line-height: 1.15;
  text-align: center;
}
.viewer-no {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgb(0 0 0 / 0.45);
  color: #fff;
  font-family: var(--font-serif);
  font-size: 13px;
}
.viewer-nav {
  display: flex;
  gap: 14px;
}
.viewer-nav button {
  width: 46px;
  height: 46px;
  border: 1px solid rgb(241 211 166 / 0.6);
  border-radius: 50%;
  background: rgb(255 255 255 / 0.1);
  color: #fdf2f8;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}
.viewer-nav button:hover {
  background: rgb(255 255 255 / 0.22);
}
.zoom-enter-active,
.zoom-leave-active {
  transition: opacity 0.35s ease;
}
.zoom-enter-active .viewer-pol {
  transition: scale 0.45s cubic-bezier(0.3, 1.4, 0.5, 1);
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
}
.zoom-enter-from .viewer-pol {
  scale: 0.6;
}
@container (min-width: 600px) and (min-aspect-ratio: 1) {
  .viewer-pol {
    width: min(42%, 380px);
  }
}
.rise-enter-active {
  transition: opacity 1.2s ease 0.8s, transform 1.2s ease 0.8s;
}
.rise-enter-from {
  opacity: 0;
  transform: translate(-50%, 14px);
}
@keyframes jar-breathe {
  50% {
    scale: 1.1;
  }
}
@keyframes lid-nudge {
  0%,
  70%,
  100% {
    translate: 0 0;
  }
  80% {
    translate: 0 -5px;
  }
  90% {
    translate: 0 0;
  }
}
@container (min-width: 600px) {
  .jar {
    --jw: 150px;
  }
  .memory figcaption {
    font-size: 16px;
  }
  .text {
    font-size: 21px;
  }
  .from {
    font-size: 32px;
  }
}
@container (max-height: 620px) {
  .j-head {
    top: calc(7% + 70px);
  }
  .message h3 {
    font-size: 42px;
  }
  .text {
    font-size: 15px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .jar-light,
  .is-closed .lid {
    animation: none;
  }
}
</style>
