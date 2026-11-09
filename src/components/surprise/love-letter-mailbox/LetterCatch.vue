<template>
  <!-- 1) CATCH THE LOVE NOTES: lumulutang paitaas ang mga sulat. I-tap ang bawat isa para saluhin at mabasa
       ang dahilan kung bakit mahal ka niya, kasama ang isang litrato. -->
  <section class="lc-stage">
    <header class="lc-head">
      <p class="lc-eyebrow">{{ taken.length }} of {{ n }} caught</p>
      <h2>{{ allTaken ? "You caught them all" : "Catch the love notes" }}</h2>
    </header>

    <template v-for="(r, i) in reasons" :key="i">
      <button
        v-if="!taken.includes(i)"
        class="lc-fly"
        :style="flyStyle(i)"
        type="button"
        :aria-label="`Catch love note ${i + 1}`"
        @click="grab(i, $event)"
      >
        <span class="lc-env"><i>♥</i></span>
      </button>
    </template>

    <ol class="lc-tray" aria-hidden="true">
      <li v-for="(r, i) in reasons" :key="i" :class="{ on: taken.includes(i) }">♥</li>
    </ol>

    <p v-if="!taken.length && !open" class="lc-hint">Tap the floating letters</p>

    <Transition name="lc-pop">
      <div v-if="open" class="lc-veil">
        <article class="lc-card">
          <figure class="lc-photo">
            <img v-if="photoFor(cur)" :src="photoFor(cur)" alt="" draggable="false" />
            <span v-else class="lc-heart">♥</span>
            <figcaption v-if="captions[cur]">{{ captions[cur] }}</figcaption>
          </figure>
          <p class="lc-num">Reason #{{ cur + 1 }}</p>
          <p class="lc-reason">{{ reasons[cur] }}</p>
          <p class="lc-sign">— {{ sender }}</p>
          <button class="lc-keep" type="button" @click="keep">Keep it ♥</button>
        </article>
      </div>
    </Transition>

    <Transition name="lc-rise">
      <button v-if="allTaken && !open" class="lc-next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  sender: { type: String, required: true },
  reasons: { type: Array, required: true },
  photos: { type: Array, default: () => [] },
  captions: { type: Array, default: () => [] },
});
const emit = defineEmits(["caught", "finished", "done"]);

const n = props.reasons.length;
const taken = ref([]);
const open = ref(false);
const cur = ref(0);
const allTaken = computed(() => taken.value.length >= n);

const photoFor = (i) => (props.photos.length ? props.photos[i % props.photos.length] : "");

// bawat sulat ay may sariling linya, bilis at simula para hindi sabay-sabay
const LANES = [16, 50, 84, 33, 67, 45];
const flyStyle = (i) => ({
  left: `${LANES[i % LANES.length]}%`,
  "--dur": `${10 + (i % 3) * 1.6}s`,
  "--delay": `${-(i * 2.1 + 0.8)}s`,
  "--ry": `${24 + (i % 3) * 15}%`,
  "--sway": i % 2 ? 1 : -1,
});

function grab(i, event) {
  if (taken.value.includes(i)) return;
  taken.value.push(i);
  cur.value = i;
  open.value = true;
  navigator.vibrate?.(18);
  emit("caught", event.currentTarget);
}

function keep(event) {
  open.value = false;
  if (taken.value.length >= n) emit("finished", event.currentTarget);
}
</script>

<style scoped>
.lc-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.lc-head {
  position: absolute;
  z-index: 4;
  top: 9%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  pointer-events: none;
  transform: translateX(-50%);
}
.lc-eyebrow {
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
  font-size: clamp(28px, 8.4cqi, 42px);
  font-weight: 600;
  line-height: 1.15;
}

/* ===== Mga sulat na lumulutang ===== */
.lc-fly {
  position: absolute;
  z-index: 3;
  top: 100%;
  width: 70px;
  height: 56px;
  margin-left: -35px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  animation: lc-rise var(--dur) linear var(--delay) infinite;
}
.lc-fly:focus-visible {
  outline: 2px dashed #7a2b45;
  outline-offset: 2px;
}
.lc-env {
  position: relative;
  display: grid;
  width: 56px;
  aspect-ratio: 1.4;
  margin: 8px auto 0;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 6px;
  background: linear-gradient(160deg, #fff8f0, #ffe3d3);
  box-shadow: 0 8px 14px rgb(122 43 69 / 0.28);
  animation: lc-sway 2.4s ease-in-out infinite alternate;
}
.lc-env::before {
  content: "";
  position: absolute;
  inset: 0 0 45%;
  background: linear-gradient(#ffb3c7, #ff93b0);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.lc-env i {
  position: relative;
  z-index: 1;
  margin-top: 5px;
  color: #e5384f;
  font-size: 12px;
  font-style: normal;
}

/* ===== Tray ng nasaluhang sulat ===== */
.lc-tray {
  position: absolute;
  z-index: 4;
  left: 50%;
  bottom: 11%;
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
  transform: translateX(-50%);
}
.lc-tray li {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 2px dashed rgb(224 102 127 / 0.6);
  border-radius: 50%;
  color: transparent;
  font-size: 13px;
  transition: background 0.4s ease, color 0.4s ease, transform 0.4s ease;
}
.lc-tray li.on {
  border-style: solid;
  border-color: #e0667f;
  background: #e0667f;
  color: #fff;
  transform: scale(1.12);
}

/* ===== Sulat na nabuksan ===== */
.lc-veil {
  position: absolute;
  z-index: 8;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(122 43 69 / 0.38);
  backdrop-filter: blur(3px);
}
.lc-card {
  width: min(88cqi, 340px);
  max-height: 74cqh;
  padding: 18px 20px 16px;
  overflow: hidden auto;
  border: 2px solid #fff;
  border-radius: 8px;
  background:
    repeating-linear-gradient(0deg, transparent 0 27px, rgb(224 102 127 / 0.16) 27px 28px),
    linear-gradient(180deg, #fffaf2, #fff1e2);
  box-shadow: 0 18px 34px rgb(122 43 69 / 0.4);
}
.lc-photo {
  float: right;
  width: 104px;
  margin: 0 0 8px 12px;
  padding: 6px 6px 8px;
  background: #fff;
  box-shadow: 0 6px 12px rgb(122 43 69 / 0.28);
  rotate: 4deg;
}
.lc-photo img {
  display: block;
  width: 92px;
  height: 92px;
  object-fit: cover;
  pointer-events: none;
}
.lc-heart {
  display: grid;
  width: 92px;
  height: 92px;
  place-items: center;
  background: #ffe3ea;
  color: #ff8fab;
  font-size: 40px;
}
.lc-photo figcaption {
  padding-top: 5px;
  color: #6b5a47;
  font-family: var(--font-hand);
  font-size: 15px;
  line-height: 1.1;
  text-align: center;
}
.lc-num {
  margin: 0 0 4px;
  color: #d94b70;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.lc-reason {
  margin: 0;
  color: #5c2a3c;
  font-family: var(--font-hand);
  font-size: clamp(24px, 7cqi, 30px);
  line-height: 1.2;
}
.lc-sign {
  clear: both;
  margin: 8px 0 0;
  color: #b4506f;
  font-family: var(--font-script);
  font-size: 24px;
  text-align: right;
}
.lc-keep {
  display: block;
  margin: 8px auto 0;
  padding: 10px 28px;
  border: 0;
  border-radius: 999px;
  background: #e9677c;
  box-shadow: 0 8px 16px rgb(180 60 90 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.lc-pop-enter-active,
.lc-pop-leave-active {
  transition: opacity 0.35s ease;
}
.lc-pop-enter-active .lc-card {
  animation: lc-card-in 0.5s cubic-bezier(0.2, 1.2, 0.4, 1);
}
.lc-pop-leave-active .lc-card {
  transition: transform 0.35s ease;
}
.lc-pop-enter-from,
.lc-pop-leave-to {
  opacity: 0;
}
.lc-pop-leave-to .lc-card {
  transform: translateY(40px) scale(0.8);
}

.lc-hint {
  position: absolute;
  z-index: 4;
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
.lc-next {
  position: absolute;
  z-index: 9;
  left: 50%;
  bottom: 3.5%;
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
.lc-rise-enter-active {
  transition: opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s;
}
.lc-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes lc-rise {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 -118cqh;
  }
}
@keyframes lc-sway {
  from {
    rotate: -7deg;
    translate: calc(var(--sway) * -14px) 0;
  }
  to {
    rotate: 7deg;
    translate: calc(var(--sway) * 14px) 0;
  }
}
@keyframes lc-card-in {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.7) rotate(-4deg);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@container (max-height: 620px) {
  .lc-head {
    top: 5%;
  }
  .lc-tray {
    bottom: 10%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .lc-fly {
    top: var(--ry);
    animation: none;
  }
  .lc-env {
    animation: none;
  }
}
</style>