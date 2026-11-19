<template>
  <!-- BINARY SWITCHES: 8 switch (bits). I-flip ang tamang mga switch hanggang tumugma sa target
       (ang araw ng birthday, hal. 14 = 8 + 4 + 2). May "hint" button para hindi mahirap. -->
  <section class="bin">
    <header class="b-head">
      <p class="eyebrow">memory_archive.lock</p>
      <h2>{{ granted ? "Access granted ♥" : "Unlock the archive" }}</h2>
      <p class="sub">
        Flip the bits to make <strong>{{ target }}</strong>
        <span class="why">(your birthday)</span>
      </p>
    </header>

    <div class="panel" :class="{ granted, wrong: shake }">
      <div class="readout">
        <span class="label">VALUE</span>
        <span class="num" :class="{ ok: granted }">{{ String(value).padStart(3, "0") }}</span>
        <span class="label">/ {{ String(target).padStart(3, "0") }}</span>
      </div>
      <div class="switches">
        <button
          v-for="(on, i) in bits"
          :key="i"
          type="button"
          class="sw"
          :class="{ on, hinted: hinting && needed[i] !== on }"
          :aria-pressed="on"
          :aria-label="`Bit ${WEIGHTS[i]} ${on ? 'on' : 'off'}`"
          :disabled="granted"
          @click="flip(i)"
        >
          <span class="led" aria-hidden="true" />
          <span class="track" aria-hidden="true"><span class="knob" /></span>
          <span class="bit">{{ on ? 1 : 0 }}</span>
          <span class="w">{{ WEIGHTS[i] }}</span>
        </button>
      </div>
      <p class="status" aria-live="polite">
        <template v-if="granted">&gt; ACCESS GRANTED · opening memories...</template>
        <template v-else-if="value > target">&gt; too high · turn some bits off</template>
        <template v-else>&gt; {{ target - value }} to go</template>
      </p>
    </div>

    <button v-if="!granted" class="hint-btn" type="button" @click="showHint">
      {{ hinting ? `Tip: ${tipText}` : "Need a hint?" }}
    </button>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  // petsa na MMDD (hal. "0214"); ang araw (14) ang target. Kung wala, 14.
  date: { type: String, default: "" },
});
const emit = defineEmits(["granted", "done"]);

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];
const target = computed(() => {
  const d = Number(String(props.date).replace(/\D/g, "").slice(-2));
  return d >= 1 && d <= 31 ? d : 14;
});
const needed = computed(() => WEIGHTS.map((w) => (target.value & w) !== 0));
const tipText = computed(() => `${target.value} = ${WEIGHTS.filter((w) => target.value & w).join(" + ")}`);

const bits = ref(WEIGHTS.map(() => false));
const value = computed(() => bits.value.reduce((sum, on, i) => sum + (on ? WEIGHTS[i] : 0), 0));
const granted = ref(false);
const hinting = ref(false);
const shake = ref(false);
const timers = [];

function flip(i) {
  if (granted.value) return;
  bits.value = bits.value.map((b, k) => (k === i ? !b : b));
  navigator.vibrate?.(6);
  if (value.value === target.value) {
    granted.value = true;
    navigator.vibrate?.([20, 40, 20]);
    emit("granted");
    timers.push(setTimeout(() => emit("done"), 1800));
  } else if (value.value > target.value) {
    shake.value = true;
    timers.push(setTimeout(() => (shake.value = false), 400));
  }
}
function showHint() {
  hinting.value = true;
}
onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<style scoped>
.bin {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 50px 16px 40px;
  text-align: center;
}
.eyebrow {
  margin: 0;
  color: #ffb39b;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
}
h2 {
  margin: 6px 0 0;
  color: #fff1e0;
  font-family: var(--font-serif);
  font-size: clamp(26px, 8cqi, 40px);
  font-style: italic;
  font-weight: 600;
  text-shadow: 0 0 18px rgb(236 95 114 / 0.6);
}
.sub {
  margin: 8px 0 0;
  color: rgb(255 241 224 / 0.85);
  font-family: var(--font-mono);
  font-size: 13px;
}
.sub strong {
  color: #ffd27a;
  font-size: 16px;
}
.why {
  color: rgb(255 179 155 / 0.8);
}

.panel {
  width: min(100%, 520px);
  padding: 16px 12px 14px;
  border: 1px solid rgb(255 179 155 / 0.35);
  border-radius: 14px;
  background: linear-gradient(180deg, rgb(32 16 38 / 0.9), rgb(18 10 26 / 0.92));
  box-shadow: 0 0 30px rgb(236 95 114 / 0.18), inset 0 0 20px rgb(0 0 0 / 0.5);
  transition: box-shadow 0.4s, border-color 0.4s;
}
.panel.granted {
  border-color: rgb(120 255 190 / 0.6);
  box-shadow: 0 0 40px rgb(120 255 190 / 0.35), inset 0 0 20px rgb(0 0 0 / 0.5);
}
.panel.wrong {
  animation: shake 0.35s ease;
}
.readout {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
  font-family: var(--font-mono);
}
.label {
  color: rgb(255 179 155 / 0.7);
  font-size: 11px;
  letter-spacing: 0.12em;
}
.num {
  color: #ffb39b;
  font-size: 34px;
  font-weight: 700;
  text-shadow: 0 0 12px rgb(236 95 114 / 0.7);
}
.num.ok {
  color: #8affc4;
  text-shadow: 0 0 14px rgb(120 255 190 / 0.8);
}
.switches {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}
.sw {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 0;
  padding: 6px 0;
  border: 0;
  border-radius: 8px;
  background: rgb(255 255 255 / 0.03);
  color: #fff1e0;
  font-family: var(--font-mono);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.sw:disabled {
  cursor: default;
}
.led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(255 179 155 / 0.2);
  transition: background 0.2s, box-shadow 0.2s;
}
.sw.on .led {
  background: #ff6f88;
  box-shadow: 0 0 8px #ff6f88;
}
.granted .sw.on .led {
  background: #8affc4;
  box-shadow: 0 0 8px #8affc4;
}
.track {
  position: relative;
  width: 22px;
  height: 40px;
  border-radius: 12px;
  background: rgb(0 0 0 / 0.45);
  box-shadow: inset 0 0 0 1px rgb(255 179 155 / 0.3);
}
.knob {
  position: absolute;
  left: 3px;
  bottom: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(180deg, #fff1e0, #d9b8a8);
  transition: transform 0.18s cubic-bezier(0.3, 1.5, 0.5, 1);
}
.sw.on .knob {
  transform: translateY(-18px);
  background: linear-gradient(180deg, #ffd0d8, #ff6f88);
}
.bit {
  font-size: 15px;
  font-weight: 700;
}
.w {
  color: rgb(255 179 155 / 0.7);
  font-size: 10px;
}
.sw.hinted {
  background: rgb(255 210 122 / 0.16);
  box-shadow: 0 0 0 1px rgb(255 210 122 / 0.7);
  animation: pulse 1s ease-in-out infinite;
}
.status {
  margin: 12px 0 0;
  color: rgb(255 241 224 / 0.75);
  font-family: var(--font-mono);
  font-size: 12px;
  text-align: left;
}
.hint-btn {
  padding: 9px 20px;
  border: 1px solid rgb(255 179 155 / 0.5);
  border-radius: 999px;
  background: rgb(18 10 26 / 0.6);
  color: #ffb39b;
  font-family: var(--font-mono);
  font-size: 13px;
  cursor: pointer;
}
/* laptop/iPad: mas malaking panel */
@container (min-width: 700px) {
  .panel {
    width: min(100%, 640px);
    padding: 22px 18px 18px;
  }
  .track {
    width: 28px;
    height: 52px;
  }
  .knob {
    width: 22px;
    height: 22px;
  }
  .sw.on .knob {
    transform: translateY(-24px);
  }
  .bit {
    font-size: 18px;
  }
}
@keyframes shake {
  25% {
    transform: translateX(-6px);
  }
  75% {
    transform: translateX(6px);
  }
}
@keyframes pulse {
  50% {
    background: rgb(255 210 122 / 0.3);
  }
}
@media (prefers-reduced-motion: reduce) {
  .panel.wrong,
  .sw.hinted {
    animation: none;
  }
}
</style>
