<template>
  <!-- 5) CRACK THE COOKIE: hawakan ang isang kalahati ng fortune cookie at hilahin palayo sa kabila.
       Habang humihiwalay, lumilitaw ang papel na fortune sa gitna. Kapag nabiyak, lilitaw ang mahabang sulat.
       Cookie at sulat ay nasa iisang puwesto; ang Continue ay nasa ilalim kaya walang nagsasapawan. -->
  <section class="fc-stage">
    <header class="fc-head">
      <p class="fc-eyebrow">{{ cracked ? `Month ${monthCount}` : "Your fortune awaits" }}</p>
      <h2>{{ cracked ? "A little fortune" : "Crack the cookie" }}</h2>
    </header>

    <div class="fc-body">
      <div class="fc-main">
        <div
          ref="cookieEl"
          class="fc-cookie"
          :class="{ gone: cracked, idle: !dragging && !spread }"
          :style="{ '--k': Math.min(1, spread / 40) }"
        >
          <span class="fc-glow" />
          <span class="fc-slip"><i /><i /><i /></span>
          <button
            class="fc-half l"
            :class="{ cracked, drag: dragging && dir < 0 }"
            :style="lStyle"
            type="button"
            aria-label="Pull the cookie apart"
            @pointerdown="down($event, -1)"
            @pointermove="move"
            @pointerup="up"
            @pointercancel="up"
            @keydown.enter.prevent="crack"
            @keydown.space.prevent="crack"
          >
            <svg viewBox="0 0 110 130" aria-hidden="true">
              <defs>
                <linearGradient id="fc-gl" x1="0" y1="0" x2="0.3" y2="1">
                  <stop offset="0" stop-color="#ffdc94" />
                  <stop offset="0.55" stop-color="#f6b95c" />
                  <stop offset="1" stop-color="#e48f35" />
                </linearGradient>
              </defs>
              <path class="fc-skin" fill="url(#fc-gl)" d="M108 16C70 4 14 24 7 68C2 104 38 126 82 121C98 119 107 111 108 98Z" />
              <path class="fc-shine" d="M20 60C28 38 58 24 94 24" />
              <path class="fc-crease" d="M108 18V98" />
              <circle class="fc-dot" cx="38" cy="86" r="2.4" />
              <circle class="fc-dot" cx="62" cy="96" r="2" />
              <circle class="fc-dot" cx="30" cy="62" r="1.8" />
              <circle class="fc-dot" cx="78" cy="52" r="2" />
            </svg>
          </button>
          <button
            class="fc-half r"
            :class="{ cracked, drag: dragging && dir > 0 }"
            :style="rStyle"
            type="button"
            aria-label="Pull the cookie apart"
            @pointerdown="down($event, 1)"
            @pointermove="move"
            @pointerup="up"
            @pointercancel="up"
            @keydown.enter.prevent="crack"
            @keydown.space.prevent="crack"
          >
            <svg viewBox="0 0 110 130" aria-hidden="true">
              <defs>
                <linearGradient id="fc-gr" x1="0" y1="0" x2="0.3" y2="1">
                  <stop offset="0" stop-color="#ffdc94" />
                  <stop offset="0.55" stop-color="#f6b95c" />
                  <stop offset="1" stop-color="#e48f35" />
                </linearGradient>
              </defs>
              <path class="fc-skin" fill="url(#fc-gr)" d="M108 16C70 4 14 24 7 68C2 104 38 126 82 121C98 119 107 111 108 98Z" />
              <path class="fc-shine" d="M20 60C28 38 58 24 94 24" />
              <path class="fc-crease" d="M108 18V98" />
              <circle class="fc-dot" cx="38" cy="86" r="2.4" />
              <circle class="fc-dot" cx="62" cy="96" r="2" />
              <circle class="fc-dot" cx="30" cy="62" r="1.8" />
              <circle class="fc-dot" cx="78" cy="52" r="2" />
            </svg>
          </button>
          <span v-if="!dragging" class="fc-pull" aria-hidden="true"><i>◀</i><em>pull apart</em><i>▶</i></span>
        </div>

        <Transition name="fc-card">
          <article v-if="cracked" class="fc-card">
            <p class="fc-tag">Your fortune</p>
            <img v-if="photo" class="fc-clip" :src="photo" alt="" draggable="false" />
            <p class="fc-to">Dear {{ recipient }},</p>
            <p class="fc-text">{{ letter }}</p>
            <p class="fc-sig">— {{ sender }}</p>
            <p class="fc-lucky">Lucky number · {{ monthCount }}</p>
          </article>
        </Transition>
      </div>

      <div class="fc-foot">
        <button v-if="cracked" class="fc-next" type="button" @click="emit('done')">Continue ✦</button>
        <p v-else class="fc-hint">Pull the two halves apart · {{ Math.round(Math.min(1, spread / THRESH) * 100) }}%</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  letter: { type: String, required: true },
  monthCount: { type: Number, default: 1 },
  photo: { type: String, default: "" },
});
const emit = defineEmits(["cracked", "done"]);

const THRESH = 64; // gaano kalayo ang hihilahin bago mabiyak

const cookieEl = ref(null);
const spread = ref(0);
const dir = ref(0); // -1 = kaliwang kalahati ang hawak, 1 = kanan
const dragging = ref(false);
const cracked = ref(false);

let startX = 0;
let scale = 1;

// ang hawak na kalahati ang sumusunod sa daliri; ang kabila ay bahagya lang gumagalaw
const lStyle = computed(() => {
  if (cracked.value) return {};
  const s = dir.value < 0 ? spread.value : spread.value * 0.25;
  return { translate: `${-s}px 0`, rotate: `${-s / 10}deg` };
});
const rStyle = computed(() => {
  if (cracked.value) return {};
  const s = dir.value > 0 ? spread.value : spread.value * 0.25;
  return { translate: `${s}px 0`, rotate: `${s / 10}deg` };
});

function down(event, d) {
  if (cracked.value) return;
  dir.value = d;
  startX = event.clientX;
  scale = cookieEl.value.getBoundingClientRect().width / (cookieEl.value.offsetWidth || 1) || 1;
  dragging.value = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function move(event) {
  if (!dragging.value || cracked.value) return;
  spread.value = Math.max(0, Math.min(110, ((event.clientX - startX) / scale) * dir.value));
  if (spread.value >= THRESH) crack();
}
function up() {
  dragging.value = false;
  if (!cracked.value) spread.value = 0;
}

function crack() {
  if (cracked.value) return;
  cracked.value = true;
  dragging.value = false;
  spread.value = 0;
  navigator.vibrate?.([30, 40, 60]);
  emit("cracked", cookieEl.value);
}
</script>

<style scoped>
.fc-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.fc-head {
  position: absolute;
  z-index: 6;
  top: 58px;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  pointer-events: none;
  transform: translateX(-50%);
}
.fc-eyebrow {
  margin: 0;
  color: var(--brown);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}
h2 {
  margin: 4px 0 0;
  color: var(--ink);
  font-family: var(--font-script);
  font-size: clamp(26px, 7.4cqi, 36px);
  font-weight: 400;
  line-height: 1.2;
}

/* iisang column: cookie/sulat sa gitna, hint o Continue sa ilalim */
.fc-body {
  position: absolute;
  inset: 138px 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.fc-main {
  position: relative;
  flex: 1 1 0;
  width: 100%;
  min-height: 0;
}
.fc-foot {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-height: 52px;
}

/* ===== Cookie ===== */
.fc-cookie {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 240px;
  height: 142px;
  translate: -50% -50%;
  touch-action: none;
  filter: drop-shadow(0 14px 12px rgb(110 42 28 / 0.35));
}
.fc-cookie.idle {
  animation: fc-idle 2.6s ease-in-out infinite;
}
.fc-cookie.gone {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.6s ease 0.5s;
}
.fc-glow {
  position: absolute;
  inset: -22% -12%;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 0.55), transparent 65%);
  pointer-events: none;
}
.fc-slip {
  position: absolute;
  top: 50px;
  left: 50%;
  display: grid;
  gap: 4px;
  align-content: center;
  width: 86px;
  height: 36px;
  padding: 0 10px;
  background: #fffdf6;
  box-shadow: 0 2px 5px rgb(0 0 0 / 0.22);
  opacity: var(--k);
  scale: calc(0.6 + var(--k) * 0.4) 1;
  translate: -50% 0;
}
.fc-slip i {
  display: block;
  height: 3px;
  border-radius: 2px;
  background: rgb(224 80 60 / 0.55);
}
.fc-slip i:nth-child(2) {
  width: 70%;
}
.fc-slip i:nth-child(3) {
  width: 45%;
}
.fc-half {
  position: absolute;
  top: 0;
  width: 120px;
  height: 142px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: grab;
  touch-action: none;
  transition:
    translate 0.4s cubic-bezier(0.3, 1.5, 0.5, 1),
    rotate 0.4s ease,
    opacity 0.3s ease;
}
.fc-half.l {
  left: 0;
  transform-origin: 100% 60%;
}
.fc-half.r {
  left: 120px;
  transform-origin: 0 60%;
}
.fc-half.r svg {
  transform: scaleX(-1);
}
.fc-half.drag {
  cursor: grabbing;
  transition: none;
}
.fc-half:focus-visible {
  outline: 2px dashed var(--ink);
  outline-offset: 4px;
}
.fc-half svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.fc-skin {
  stroke: #c9782a;
  stroke-width: 2.5;
  stroke-linejoin: round;
}
.fc-shine {
  fill: none;
  stroke: rgb(255 255 255 / 0.5);
  stroke-width: 4;
  stroke-linecap: round;
}
.fc-crease {
  fill: none;
  stroke: rgb(150 80 20 / 0.4);
  stroke-width: 4;
  stroke-linecap: round;
}
.fc-dot {
  fill: rgb(170 95 30 / 0.35);
}
.fc-half.cracked {
  pointer-events: none;
  opacity: 0;
  transition:
    translate 0.9s cubic-bezier(0.3, 0.7, 0.4, 1),
    rotate 0.9s ease,
    opacity 0.9s ease 0.2s;
}
.fc-half.cracked.l {
  translate: -130px 90px;
  rotate: -34deg;
}
.fc-half.cracked.r {
  translate: 130px 90px;
  rotate: 34deg;
}
.fc-pull {
  position: absolute;
  top: 100%;
  right: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  color: var(--accent);
  pointer-events: none;
}
.fc-pull i {
  font-size: 20px;
  font-style: normal;
}
.fc-pull i:first-child {
  animation: fc-nudge-l 0.8s ease-in-out infinite alternate;
}
.fc-pull i:last-child {
  animation: fc-nudge-r 0.8s ease-in-out infinite alternate;
}
.fc-pull em {
  color: var(--brown);
  font-family: var(--font-body);
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.fc-hint {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
}

/* ===== Fortune ===== */
.fc-card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(90cqi, 360px);
  max-height: 100%;
  padding: 16px 20px 14px;
  overflow-y: auto;
  border: 2px solid #fff;
  border-radius: 6px;
  background:
    repeating-linear-gradient(0deg, transparent 0 27px, rgb(138 75 42 / 0.13) 27px 28px),
    linear-gradient(180deg, #fffdf6, #fff3d8);
  box-shadow: 0 20px 38px rgb(110 42 28 / 0.4);
  translate: -50% -50%;
}
.fc-tag {
  margin: 0 0 4px;
  color: var(--accent);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}
.fc-clip {
  float: right;
  width: 78px;
  height: 78px;
  margin: 0 0 6px 10px;
  padding: 4px 4px 14px;
  background: #fff;
  box-shadow: 0 4px 10px rgb(110 42 28 / 0.3);
  object-fit: cover;
  pointer-events: none;
  rotate: 5deg;
}
.fc-to {
  margin: 0 0 4px;
  color: var(--accent);
  font-family: var(--font-hand);
  font-size: 34px;
  font-weight: 700;
  line-height: 1.1;
}
.fc-text {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: clamp(21px, 6cqi, 26px);
  line-height: 1.26;
}
.fc-sig {
  margin: 8px 0 0;
  color: var(--brown);
  font-family: var(--font-hand);
  font-size: 28px;
  font-weight: 700;
  text-align: right;
}
.fc-lucky {
  margin: 4px 0 0;
  padding-top: 6px;
  border-top: 2px dashed rgb(138 75 42 / 0.3);
  color: var(--brown);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-align: center;
  text-transform: uppercase;
}
.fc-card-enter-active {
  transition: opacity 0.9s ease 0.5s, transform 0.9s cubic-bezier(0.2, 1.1, 0.4, 1) 0.5s;
}
.fc-card-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.fc-next {
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 10px 22px rgb(110 42 28 / 0.4);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  animation: fc-in 0.8s ease 1.6s both;
}

@keyframes fc-idle {
  0%,
  100% {
    rotate: -2deg;
  }
  50% {
    rotate: 2deg;
  }
}
@keyframes fc-nudge-l {
  to {
    transform: translateX(-8px);
  }
}
@keyframes fc-nudge-r {
  to {
    transform: translateX(8px);
  }
}
@keyframes fc-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@container (max-height: 620px) {
  .fc-head {
    top: 54px;
  }
  .fc-body {
    top: 122px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .fc-cookie.idle,
  .fc-pull i {
    animation: none;
  }
}
</style>
