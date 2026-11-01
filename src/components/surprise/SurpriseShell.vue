<template>
  <!-- SHELL ng interactive surprise preview: top bar + pilian ng device (Cellphone / iPad / Laptop)
       + device frame. Totoong laki ang render ng bawat device, pinaliliit lang para magkasya. -->
  <div
    ref="overlayEl"
    class="surprise-overlay"
    role="dialog"
    aria-modal="true"
    :aria-label="`${title} interactive preview`"
    tabindex="-1"
  >
    <header class="surprise-topbar">
      <div class="topbar-title">
        <strong>{{ title }}</strong>
        <span>Interactive preview</span>
      </div>

      <div v-if="!compact" class="device-switch" role="group" aria-label="Preview device">
        <button
          v-for="item in devices"
          :key="item.id"
          type="button"
          :class="{ active: device === item.id }"
          :aria-pressed="device === item.id"
          :aria-label="item.label"
          @click="device = item.id"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path :d="item.icon" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ item.label }}</span>
        </button>
      </div>

      <div class="topbar-actions">
        <button class="use-button" type="button" @click="emit('use')">Use this template</button>
        <button class="close-button" type="button" aria-label="Close preview" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </header>

    <div class="surprise-stage" :class="{ compact }">
      <!-- side = opsyonal na panel sa kaliwa ng device (hal. step list ng Soft Celebration) -->
      <div v-if="$slots.side && !compact" class="side-panel">
        <slot name="side" />
      </div>
      <div ref="areaEl" class="device-area">
        <div class="device-box" :style="boxStyle">
          <div class="device" :class="`is-${activeDevice.id}`" :style="deviceStyle">
            <!-- :key = bagong simula ng eksena kapag lumipat ng device (tamang laki ng canvas, layout, atbp.) -->
            <div :key="screenKey" class="screen" :style="screenStyle">
              <slot />
            </div>
            <span v-if="!compact && activeDevice.base" class="laptop-base" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

defineProps({
  title: { type: String, required: true },
});
// device-change = lumipat ng device (o ng compact mode); para ma-reset ng parent ang sariling state
const emit = defineEmits(["close", "use", "device-change"]);

/* w/h = laki ng screen (CSS px), bezel = kapal ng frame, base = ilalim ng laptop */
const devices = [
  {
    id: "phone",
    label: "Cellphone",
    w: 390,
    h: 844,
    bezel: 12,
    radius: 48,
    icon: "M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 15h2",
  },
  {
    id: "tablet",
    label: "iPad",
    w: 820,
    h: 1180,
    bezel: 18,
    radius: 36,
    icon: "M6 2.5h12a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2Zm5 16h2",
  },
  {
    id: "laptop",
    label: "Laptop",
    w: 1280,
    h: 800,
    bezel: 14,
    radius: 16,
    base: 22,
    icon: "M5 5h14a1 1 0 0 1 1 1v9H4V6a1 1 0 0 1 1-1Zm-3 13h20",
  },
];
const device = ref("phone");
const activeDevice = computed(() => devices.find((item) => item.id === device.value));

/* compact = maliit na screen (totoong phone o landscape): puno ang screen, walang frame at pilian */
const compactQuery = window.matchMedia("(max-width: 480px), (max-height: 620px)");
const compact = ref(compactQuery.matches);
const onCompactChange = (event) => (compact.value = event.matches);

const screenKey = computed(() => (compact.value ? "full" : device.value));
watch(screenKey, (key) => emit("device-change", key));

/* ===== Scale para magkasya ang device sa natitirang espasyo ===== */
const areaEl = ref(null);
const stageSize = ref({ w: 0, h: 0 });
let observer = null;

const outer = computed(() => {
  const d = activeDevice.value;
  return { w: d.w + d.bezel * 2, h: d.h + d.bezel * 2 + (d.base || 0) };
});
const scale = computed(() => {
  const { w, h } = stageSize.value;
  if (!w || !h) return 1;
  return Math.min(1, w / outer.value.w, h / outer.value.h);
});
const boxStyle = computed(() =>
  compact.value
    ? { width: "100%", height: "100%" }
    : { width: `${outer.value.w * scale.value}px`, height: `${outer.value.h * scale.value}px` },
);
const deviceStyle = computed(() =>
  compact.value
    ? { width: "100%", height: "100%" }
    : { width: `${outer.value.w}px`, height: `${outer.value.h}px`, transform: `scale(${scale.value})` },
);
const screenStyle = computed(() => {
  if (compact.value) return { width: "100%", height: "100%", border: 0, borderRadius: 0, "--screen-radius": "0px" };
  const d = activeDevice.value;
  return {
    width: `${d.w + d.bezel * 2}px`,
    height: `${d.h + d.bezel * 2}px`,
    borderWidth: `${d.bezel}px`,
    borderRadius: `${d.radius}px`,
    // radius ng loob ng screen (para sa mga dekorasyong frame sa loob ng eksena)
    "--screen-radius": `${Math.max(0, d.radius - d.bezel)}px`,
  };
});

function measure() {
  const el = areaEl.value;
  if (el) stageSize.value = { w: el.clientWidth, h: el.clientHeight };
}

/* Esc = isara */
function onKeydown(event) {
  if (event.key === "Escape") emit("close");
}

const overlayEl = ref(null);
let previousOverflow = "";
onMounted(() => {
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", onKeydown);
  compactQuery.addEventListener("change", onCompactChange);
  observer = new ResizeObserver(measure);
  observer.observe(areaEl.value);
  measure();
  overlayEl.value?.focus();
});
onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow;
  window.removeEventListener("keydown", onKeydown);
  compactQuery.removeEventListener("change", onCompactChange);
  observer?.disconnect();
});
</script>

<style scoped>
/* kulay: puwedeng palitan ng bawat template gamit ang mga --shell-* variable */
.surprise-overlay {
  --display: var(--sl-font-display, "Fredoka", sans-serif);
  --stretch: var(--sl-display-stretch, 86%);
  position: fixed;
  z-index: 20;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--shell-bg, #14102b);
  color: var(--shell-ink, #fff);
  font-family: var(--sl-font-body, "Nunito", sans-serif);
  outline: none;
}

/* ===== Top bar ===== */
.surprise-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px clamp(16px, 4vw, 40px);
  border-bottom: 1px solid var(--shell-line, rgb(255 255 255 / 0.12));
  background: var(--shell-bar, rgb(18 14 46 / 0.7));
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.topbar-title {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;
}
.topbar-title strong {
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: 19px;
  white-space: nowrap;
}
.topbar-title span {
  color: var(--shell-muted, rgb(255 255 255 / 0.7));
  font-size: 13px;
}
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.use-button {
  border: 0;
  border-radius: 999px;
  padding: 10px 20px;
  background: var(--shell-use-bg, #fff);
  color: var(--shell-use-ink, var(--shell-accent, #292b70));
  font-family: var(--display);
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: var(--shell-use-shadow, none);
  transition: transform 0.2s;
}
.use-button:hover {
  transform: translateY(-1px);
}
.close-button {
  display: grid;
  flex: none;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--shell-line-strong, rgb(255 255 255 / 0.3));
  border-radius: 50%;
  background: var(--shell-close-bg, transparent);
  color: var(--shell-ink, #fff);
  cursor: pointer;
}
.close-button svg {
  width: 20px;
  height: 20px;
}

/* ===== Pilian ng device ===== */
.device-switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--shell-line, rgb(255 255 255 / 0.16));
  border-radius: 999px;
  background: var(--shell-switch-bg, rgb(255 255 255 / 0.06));
}
.device-switch button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--shell-muted, rgb(255 255 255 / 0.75));
  font-family: var(--display);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.device-switch button:hover {
  color: var(--shell-ink, #fff);
}
.device-switch button.active {
  background: var(--shell-use-bg, #fff);
  color: var(--shell-use-ink, var(--shell-accent, #292b70));
}
.device-switch button:focus-visible {
  outline: 2px solid var(--shell-ink, #fff);
  outline-offset: 2px;
}
.device-switch svg {
  width: 18px;
  height: 18px;
}

/* ===== Stage + device frame ===== */
.surprise-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 4vw, 64px);
  padding: 20px clamp(16px, 3vw, 40px);
}
.surprise-stage.compact {
  display: block;
  padding: 0;
}
.side-panel {
  flex: 0 1 380px;
  min-width: 0;
  max-height: 100%;
  overflow-y: auto;
}
.device-area {
  flex: 1 1 0;
  align-self: stretch;
  min-width: 0;
  display: grid;
  place-items: center;
}
.compact .device-area {
  width: 100%;
  height: 100%;
}
.device-box {
  position: relative;
}
.device {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: 0 0;
}
.screen {
  position: relative;
  flex: none;
  box-sizing: border-box; /* kasama ang bezel sa width/height */
  overflow: hidden;
  isolation: isolate;
  border: 0 solid var(--shell-frame, #0b0920);
  background: #000;
  box-shadow: 0 30px 60px rgb(0 0 0 / 0.45);
  /* para sa @container at cqi ng laman: laki ng napiling device, hindi ng browser */
  container-type: size;
  touch-action: manipulation;
}
.compact .device {
  position: static;
}
.compact .screen {
  box-shadow: none;
}
.laptop-base {
  flex: none;
  width: 116%;
  height: 22px;
  border-radius: 0 0 18px 18px;
  background: linear-gradient(180deg, #4a4a58, #23232c 60%, #15151b);
  box-shadow: 0 18px 30px rgb(0 0 0 / 0.4);
}

@media (max-width: 900px) {
  .side-panel {
    display: none;
  }
}
@media (max-width: 760px) {
  .device-switch span {
    display: none;
  }
  .device-switch button {
    padding: 0 10px;
  }
  .topbar-title span {
    display: none;
  }
}
@media (max-width: 360px) {
  .topbar-title strong {
    font-size: 16px;
  }
  .use-button {
    padding: 8px 14px;
    font-size: 14px;
  }
}
@media (max-height: 620px) {
  .surprise-topbar {
    padding-block: 6px;
  }
  .topbar-title span {
    display: none;
  }
}
</style>
