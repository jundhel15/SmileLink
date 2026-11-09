<template>
  <!-- 3) MATCH OUR MEMORIES: i-tap ang mga baliktad na card para hanapin ang magkaparehang litrato at sticker.
       Bawat tamang pares ay sumasabog at nagpapakita ng maikling alaala. -->
  <section class="mm-stage">
    <header class="mm-head">
      <p class="mm-eyebrow">{{ found }} of {{ P }} pairs</p>
      <h2>{{ allDone ? "Every memory found" : "Match our memories" }}</h2>
    </header>

    <div ref="boardEl" class="mm-board">
      <template v-for="cell in cells" :key="cell.key">
        <div v-if="cell.center" class="mm-center">
          <b>{{ moves }}</b>
          <small>{{ moves === 1 ? "move" : "moves" }}</small>
        </div>
        <button
          v-else
          class="mm-card"
          :class="{ flip: cards[cell.i].up || cards[cell.i].done, done: cards[cell.i].done }"
          type="button"
          :aria-label="`Memory card ${cell.i + 1}`"
          @click="flipCard(cell.i, $event)"
        >
          <span class="mm-inner">
            <span class="mm-face back"><i>✈</i></span>
            <span class="mm-face front">
              <img v-if="cards[cell.i].src" :src="cards[cell.i].src" alt="" draggable="false" />
              <span v-else class="mm-ph">♥</span>
              <b class="mm-sticker">{{ cards[cell.i].sticker }}</b>
            </span>
          </span>
        </button>
      </template>
    </div>

    <Transition name="mm-note" mode="out-in">
      <p v-if="note" :key="note" class="mm-line">“{{ note }}”</p>
    </Transition>

    <p v-if="!allDone && !moves" class="mm-hint">Tap two cards to flip them</p>

    <Transition name="mm-rise">
      <button v-if="allDone" class="mm-next" type="button" @click="emit('done')">Continue ✦</button>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  photos: { type: Array, default: () => [] },
  captions: { type: Array, default: () => [] },
});
const emit = defineEmits(["matched", "finished", "done"]);

const DEFAULT_NOTES = ["Where it started", "Our silly side", "A day I keep", "Just because"];
const STICKERS = ["♥", "★", "✿", "☀"];

const P = Math.min(4, Math.max(3, props.photos.length)); // dami ng pares
const photoOf = (pair) => (props.photos.length ? props.photos[pair % props.photos.length] : "");

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const cards = ref(
  shuffle(
    Array.from({ length: P * 2 }, (_, k) => ({
      id: k,
      pair: k % P,
      src: photoOf(k % P),
      sticker: STICKERS[k % P],
      up: false,
      done: false,
    })),
  ),
);

// kapag 4 ang pares, may palamuti sa gitna ng 3x3 na pisara
const cells = computed(() => {
  const list = cards.value.map((c, i) => ({ key: c.id, i }));
  if (P === 4) list.splice(4, 0, { key: "center", center: true });
  return list;
});

const boardEl = ref(null);
const moves = ref(0);
const found = ref(0);
const note = ref("");
const allDone = computed(() => found.value >= P);

let open = [];
let locked = false;
const timers = [];

function flipCard(i, event) {
  const c = cards.value[i];
  if (locked || c.up || c.done) return;
  const el = event.currentTarget;
  c.up = true;
  open.push(i);
  navigator.vibrate?.(8);
  if (open.length < 2) return;

  moves.value += 1;
  locked = true;
  const [a, b] = open;
  if (cards.value[a].pair === cards.value[b].pair) {
    timers.push(
      setTimeout(() => {
        cards.value[a].done = true;
        cards.value[b].done = true;
        found.value += 1;
        const pair = cards.value[a].pair;
        note.value = props.captions[pair] || DEFAULT_NOTES[pair % DEFAULT_NOTES.length];
        emit("matched", el);
        if (found.value >= P) emit("finished", boardEl.value);
        open = [];
        locked = false;
      }, 450),
    );
  } else {
    timers.push(
      setTimeout(() => {
        cards.value[a].up = false;
        cards.value[b].up = false;
        open = [];
        locked = false;
      }, 900),
    );
  }
}

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<style scoped>
.mm-stage {
  position: absolute;
  z-index: 12;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.mm-head {
  position: absolute;
  top: 8%;
  left: 50%;
  width: min(100% - 44px, 420px);
  text-align: center;
  transform: translateX(-50%);
}
.mm-eyebrow {
  margin: 0;
  color: var(--brown);
  font-family: var(--font-type);
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
h2 {
  margin: 6px 0 0;
  color: var(--ink);
  font-family: var(--font-head);
  font-size: clamp(28px, 8.4cqi, 42px);
  font-weight: 600;
  line-height: 1.15;
}

/* ===== Pisara ===== */
.mm-board {
  position: absolute;
  left: 50%;
  top: 21%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  width: min(88cqi, 340px);
  translate: -50% 0;
}
.mm-card {
  aspect-ratio: 0.82;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  perspective: 600px;
}
.mm-card:focus-visible {
  outline: 2px dashed var(--ink);
  outline-offset: 3px;
}
.mm-inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.3, 1.2, 0.5, 1);
}
.mm-card.flip .mm-inner {
  transform: rotateY(180deg);
}
.mm-face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 10px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.mm-face.back {
  border: 3px dashed rgb(255 247 230 / 0.8);
  background: linear-gradient(145deg, #c79a64, #a8794a);
  box-shadow: 0 6px 12px rgb(74 47 28 / 0.3);
}
.mm-face.back i {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 50%;
  background: rgb(255 247 230 / 0.85);
  color: var(--accent);
  font-size: 22px;
  font-style: normal;
}
.mm-face.front {
  padding: 6px 6px 16px;
  background: #fffaf0;
  box-shadow: 0 6px 12px rgb(74 47 28 / 0.3);
  transform: rotateY(180deg);
}
.mm-face.front img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.mm-ph {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  background: #fde4d4;
  color: var(--accent);
  font-size: 32px;
}
.mm-sticker {
  position: absolute;
  right: -6px;
  bottom: -6px;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 3px 6px rgb(74 47 28 / 0.35);
  color: #fff;
  font-size: 14px;
}
.mm-card.done .mm-inner {
  animation: mm-pop 0.5s ease;
}
.mm-card.done .mm-face.front {
  box-shadow:
    0 0 0 3px #7aa35a,
    0 6px 12px rgb(74 47 28 / 0.3);
}
.mm-center {
  display: grid;
  aspect-ratio: 0.82;
  place-items: center;
  align-content: center;
  border: 3px dashed rgb(122 75 42 / 0.45);
  border-radius: 10px;
  color: var(--ink);
  text-align: center;
}
.mm-center b {
  font-family: var(--font-head);
  font-size: 34px;
  line-height: 1;
}
.mm-center small {
  font-family: var(--font-type);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.mm-line {
  position: absolute;
  left: 50%;
  bottom: 14%;
  width: min(86cqi, 330px);
  margin: 0;
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: clamp(24px, 7cqi, 30px);
  line-height: 1.1;
  text-align: center;
  translate: -50% 0;
}
.mm-note-enter-active,
.mm-note-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.mm-note-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.mm-note-leave-to {
  opacity: 0;
}

.mm-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1.6%;
  margin: 0;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 14px;
  font-style: italic;
  font-weight: 700;
  text-align: center;
  pointer-events: none;
}
.mm-next {
  position: absolute;
  left: 50%;
  bottom: 3.5%;
  z-index: 4;
  padding: 12px 32px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 10px 22px rgb(74 47 28 / 0.35);
  color: #fff;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  translate: -50% 0;
}
.mm-rise-enter-active {
  transition: opacity 0.7s ease 0.8s, transform 0.7s ease 0.8s;
}
.mm-rise-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes mm-pop {
  50% {
    scale: 1.12;
  }
}
@container (max-height: 620px) {
  .mm-head {
    top: 4%;
  }
  .mm-board {
    top: 18%;
    gap: 7px;
    width: min(76cqi, 290px);
  }
  .mm-line {
    bottom: 12%;
    font-size: 22px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .mm-inner {
    transition: none;
  }
  .mm-card.done .mm-inner {
    animation: none;
  }
}
</style>