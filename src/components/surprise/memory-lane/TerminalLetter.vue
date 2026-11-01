<template>
  <!-- TERMINAL LETTER: ita-type ang mensahe na parang terminal; tap para lumaktaw -->
  <section class="terminal-wrap" @click="skip">
    <div class="terminal">
      <header class="terminal-bar">
        <span class="dot" /><span class="dot" /><span class="dot" />
        <span class="file">message_from_{{ fileName }}.txt</span>
      </header>
      <div class="terminal-body" aria-live="polite">
        <p v-for="(text, index) in typed" :key="index" :class="lines[index].kind">
          {{ text }}<span v-if="index === typed.length - 1 && !finished" class="cursor" aria-hidden="true">▍</span>
        </p>
      </div>
    </div>
    <Transition name="rise" mode="out-in">
      <button v-if="finished" key="hug" class="cta" type="button" @click.stop="emit('hug')">
        Send a hug <span aria-hidden="true">♥</span>
      </button>
      <p v-else key="skip" class="skip">Tap to skip</p>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  reduced: { type: Boolean, default: false },
});
const emit = defineEmits(["hug"]);

const fileName = computed(() => props.sender.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
// kind: sys = mensahe ng "system", msg = sulat, sign = pirma
const lines = computed(() => [
  { kind: "sys", text: "> decrypting message..." },
  { kind: "sys", text: "> done ✓" },
  { kind: "msg", text: `Dear ${props.recipient},` },
  { kind: "msg", text: props.message },
  { kind: "sign", text: `— ${props.sender} ♥` },
]);

const typed = ref([]);
const finished = ref(false);
let timer = 0;
let lineIndex = 0;
let charIndex = 0;

function typeNext() {
  const line = lines.value[lineIndex];
  if (!line) {
    finished.value = true;
    return;
  }
  const chars = Array.from(line.text);
  charIndex += 1;
  typed.value[lineIndex] = chars.slice(0, charIndex).join("");
  if (charIndex >= chars.length) {
    lineIndex += 1;
    charIndex = 0;
    timer = setTimeout(typeNext, props.reduced ? 60 : 380);
  } else {
    timer = setTimeout(typeNext, line.kind === "sys" ? 18 : 32);
  }
}

function skip() {
  if (finished.value) return;
  clearTimeout(timer);
  typed.value = lines.value.map((line) => line.text);
  finished.value = true;
}

onMounted(() => {
  if (props.reduced) skip();
  else timer = setTimeout(typeNext, 500);
});
onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
.terminal-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 40px max(18px, calc(50% - 240px));
  cursor: pointer;
}
.terminal {
  width: 100%;
  overflow: hidden;
  border: 1px solid rgb(236 95 114 / 0.45);
  border-radius: 14px;
  background: rgb(22 10 26 / 0.88);
  box-shadow:
    0 0 40px rgb(236 95 114 / 0.2),
    0 20px 40px rgb(0 0 0 / 0.5);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
.terminal-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid rgb(236 95 114 / 0.25);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ec5f72;
}
.dot:nth-child(2) {
  background: #f4c27a;
}
.dot:nth-child(3) {
  background: #ffb39b;
}
.file {
  margin-left: 8px;
  overflow: hidden;
  color: rgb(255 241 224 / 0.6);
  font-family: var(--font-mono);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.terminal-body {
  min-height: 240px;
  padding: 16px 18px 20px;
  font-family: var(--font-mono);
}
.terminal-body p {
  margin: 0 0 10px;
  white-space: pre-wrap;
}
.sys {
  color: #ec5f72;
  font-size: 12px;
}
.msg {
  color: #fff1e0;
  font-size: 15px;
  line-height: 1.6;
}
.sign {
  margin-top: 14px !important;
  color: #ffb39b;
  font-size: 15px;
  font-weight: 700;
}
.cursor {
  color: #ffb39b;
  animation: blink 0.9s steps(1) infinite;
}
.skip {
  margin: 0;
  color: rgb(255 241 224 / 0.55);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.cta {
  padding: 14px 30px;
  border: 0;
  border-radius: 999px;
  background: #ec5f72;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 24px rgb(236 95 114 / 0.5);
}
.rise-enter-active,
.rise-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.rise-enter-from,
.rise-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>
