<template>
  <!-- 2) TEAR THE LETTERS: bawat envelope ay may tuldok-tuldok na linya sa itaas. I-swipe ang daliri sa linya
       para punitin ito. Lalabas ang sulat na may dahilan kung bakit mahal ka niya, kasama ang isang litrato. -->
  <section class="et-stage">
    <header class="et-head">
      <p class="et-eyebrow">Letter {{ idx + 1 }} of {{ n }}</p>
      <h2>{{ torn ? "A reason I love you" : "Tear along the dotted line" }}</h2>
      <ol class="et-dotsrow" aria-hidden="true">
        <li v-for="i in n" :key="i" :class="{ on: i - 1 < idx || (i - 1 === idx && torn), cur: i - 1 === idx }" />
      </ol>
    </header>

    <Transition name="et-swap" mode="out-in">
      <div v-if="!torn" :key="`env${idx}`" ref="envEl" class="et-env" :style="{ '--t': tearP }">
        <span class="et-flap" />
        <span class="et-seal" aria-hidden="true">♥</span>
        <span class="et-to">For {{ recipient }}</span>
        <div
          class="et-strip"
          role="button"
          tabindex="0"
          aria-label="Tear open the envelope"
          @pointerdown="tearDown"
          @pointermove="tearMove"
          @pointerup="tearUp"
          @pointercancel="tearUp"
          @keydown.enter.prevent="rip"
          @keydown.space.prevent="rip"
        >
          <span class="et-line" />
          <span class="et-done" />
          <span class="et-scissor" :class="{ idle: tearP === 0 }" aria-hidden="true">✂</span>
        </div>
      </div>

      <article v-else :key="`card${idx}`" class="et-card">
        <figure class="et-photo">
          <img v-if="photoFor(idx)" :src="photoFor(idx)" alt="" draggable="false" />
          <span v-else class="et-heart">♥</span>
          <figcaption v-if="captions[idx]">{{ captions[idx] }}</figcaption>
        </figure>
        <p class="et-num">Reason #{{ idx + 1 }}</p>
        <p class="et-reason">{{ reasons[idx] }}</p>
        <p class="et-sign">— {{ sender }}</p>
      </article>
    </Transition>

    <p v-if="!torn" class="et-hint">Swipe across the line →</p>

    <Transition name="et-rise">
      <button v-if="torn" class="et-next" type="button" @click="next">
        {{ idx + 1 < n ? "Next letter →" : "Continue ✦" }}
      </button>
    </Transition>
  </section>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  reasons: { type: Array, required: true },
  photos: { type: Array, default: () => [] },
  captions: { type: Array, default: () => [] },
});
const emit = defineEmits(["torn", "finished", "done"]);

const n = props.reasons.length;
const envEl = ref(null);
const idx = ref(0);
const torn = ref(false);
const tearP = ref(0);

const photoFor = (i) => (props.photos.length ? props.photos[i % props.photos.length] : "");

let start = null;
let startP = 0;

function tearDown(event) {
  if (torn.value) return;
  start = { x: event.clientX };
  startP = tearP.value;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function tearMove(event) {
  if (!start || torn.value) return;
  const w = event.currentTarget.getBoundingClientRect().width || 1;
  tearP.value = Math.max(0, Math.min(1, startP + (event.clientX - start.x) / w));
  if (tearP.value >= 0.9) rip();
}
function tearUp() {
  start = null;
}

function rip() {
  if (torn.value) return;
  const el = envEl.value;
  tearP.value = 1;
  start = null;
  torn.value = true;
  navigator.vibrate?.([20, 30, 20]);
  emit("torn", el);
  if (idx.value + 1 >= n) emit("finished", el);
}

function next() {
  if (idx.value + 1 >= n) {
    emit("done");
    return;
  }
  idx.value += 1;
  torn.value = false;
  tearP.value = 0;
}
</script>

<style scoped>
.et-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.et-head {
  position: absolute;
  top: 8%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.et-eyebrow {
  margin: 0;
  color: #d94b70;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3em;
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
.et-dotsrow {
  display: flex;
  justify-content: center;
  gap: 7px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}
.et-dotsrow li {
  width: 8px;
  height: 8px;
  border: 1.5px solid #e0667f;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.55);
  transition: background 0.4s ease, transform 0.4s ease;
}
.et-dotsrow li.on {
  background: #e0667f;
}
.et-dotsrow li.cur {
  transform: scale(1.3);
}

/* ===== Envelope ===== */
.et-env {
  position: absolute;
  left: 50%;
  top: 33%;
  width: min(82cqi, 320px);
  aspect-ratio: 1.55;
  border: 2px solid #fff;
  border-radius: 12px;
  background: linear-gradient(160deg, #fff8f0, #ffe9d9);
  box-shadow: 0 16px 30px rgb(122 43 69 / 0.28);
  translate: -50% 0;
}
.et-env::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(to top right, transparent 49.4%, rgb(224 102 127 / 0.3) 50%, transparent 50.8%) left bottom / 50% 70% no-repeat,
    linear-gradient(to top left, transparent 49.4%, rgb(224 102 127 / 0.3) 50%, transparent 50.8%) right bottom / 50% 70% no-repeat;
}
.et-flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 58%;
  border-radius: 10px 10px 0 0;
  background: linear-gradient(#ffb3c7, #ff93b0);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  scale: 1 max(0.04, calc(1 - var(--t) * 1.5));
  transform-origin: 50% 0;
}
.et-seal {
  position: absolute;
  left: 50%;
  top: 58%;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ff5c75, #c61f3b);
  box-shadow: 0 4px 8px rgb(122 43 69 / 0.35);
  color: #ffd9e0;
  font-size: 17px;
  opacity: max(0, calc(1 - var(--t) * 3));
  translate: -50% -50%;
}
.et-to {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12%;
  color: #b4506f;
  font-family: var(--font-hand);
  font-size: clamp(20px, 6cqi, 26px);
  text-align: center;
}
.et-strip {
  position: absolute;
  top: -16px;
  left: 0;
  right: 0;
  height: 48px;
  outline: none;
  cursor: ew-resize;
  touch-action: none;
}
.et-strip:focus-visible {
  outline: 2px dashed #7a2b45;
  outline-offset: 2px;
}
.et-line {
  position: absolute;
  top: 50%;
  left: 8px;
  right: 8px;
  border-top: 3px dashed #e0667f;
}
.et-done {
  position: absolute;
  top: calc(50% - 1px);
  left: 8px;
  width: calc((100% - 16px) * var(--t));
  height: 5px;
  border-radius: 3px;
  background: #e0667f;
}
.et-scissor {
  position: absolute;
  top: 50%;
  left: calc(8px + (100% - 16px) * var(--t));
  color: #7a2b45;
  font-size: 24px;
  line-height: 1;
  translate: -50% -58%;
}
.et-scissor.idle {
  animation: et-nudge 1.1s ease-in-out infinite alternate;
}

/* ===== Sulat ===== */
.et-card {
  position: absolute;
  left: 50%;
  top: 27%;
  width: min(88cqi, 340px);
  max-height: 60cqh;
  padding: 18px 20px 16px;
  overflow: hidden auto;
  border: 2px solid #fff;
  border-radius: 8px;
  background:
    repeating-linear-gradient(0deg, transparent 0 27px, rgb(224 102 127 / 0.16) 27px 28px),
    linear-gradient(180deg, #fffaf2, #fff1e2);
  box-shadow: 0 18px 34px rgb(122 43 69 / 0.3);
  translate: -50% 0;
}
.et-photo {
  float: right;
  width: 104px;
  margin: 0 0 8px 12px;
  padding: 6px 6px 8px;
  background: #fff;
  box-shadow: 0 6px 12px rgb(122 43 69 / 0.28);
  rotate: 4deg;
}
.et-photo img {
  display: block;
  width: 92px;
  height: 92px;
  object-fit: cover;
  pointer-events: none;
}
.et-heart {
  display: grid;
  width: 92px;
  height: 92px;
  place-items: center;
  background: #ffe3ea;
  color: #ff8fab;
  font-size: 40px;
}
.et-photo figcaption {
  padding-top: 5px;
  color: #6b5a47;
  font-family: var(--font-hand);
  font-size: 15px;
  line-height: 1.1;
  text-align: center;
}
.et-num {
  margin: 0 0 4px;
  color: #d94b70;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.et-reason {
  margin: 0;
  color: #5c2a3c;
  font-family: var(--font-hand);
  font-size: clamp(24px, 7cqi, 30px);
  line-height: 1.2;
}
.et-sign {
  clear: both;
  margin: 8px 0 0;
  color: #b4506f;
  font-family: var(--font-script);
  font-size: 24px;
  text-align: right;
}
.et-swap-enter-active,
.et-swap-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.et-swap-enter-from {
  opacity: 0;
  transform: translateY(18px);
}
.et-swap-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.et-env.et-swap-enter-from,
.et-env.et-swap-leave-to,
.et-card.et-swap-enter-from,
.et-card.et-swap-leave-to {
  translate: -50% 0;
}

.et-hint {
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
.et-next {
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
.et-rise-enter-active {
  transition: opacity 0.7s ease 0.7s, transform 0.7s ease 0.7s;
}
.et-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes et-nudge {
  from {
    translate: -50% -58%;
  }
  to {
    translate: calc(-50% + 90px) -58%;
  }
}
@container (max-height: 620px) {
  .et-head {
    top: 4%;
  }
  .et-env {
    top: 31%;
  }
  .et-card {
    top: 26%;
    max-height: 56cqh;
  }
}
@media (prefers-reduced-motion: reduce) {
  .et-scissor.idle {
    animation: none;
  }
}
</style>