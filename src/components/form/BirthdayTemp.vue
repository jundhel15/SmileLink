<template>
  <main class="template-page">
    <section class="template-heading">
      <div>
        <h1>Birthday templates</h1>
        <p>Choose a look. Every template works as a card or a website.</p>
      </div>
      <button class="change-occasion" type="button" @click="changeOccasion">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 7v5h-5M4 17v-5h5m10-1a7 7 0 0 0-12-4L4 9m16 6-3 3a7 7 0 0 1-12-4"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Change occasion
      </button>
    </section>

    <div class="filter-list" role="group" aria-label="Filter birthday templates">
      <button
        v-for="style in styles"
        :key="style"
        class="filter-chip"
        :class="{ active: activeStyle === style }"
        type="button"
        :aria-pressed="activeStyle === style"
        @click="activeStyle = style"
      >
        {{ style }}
      </button>
    </div>

    <section class="template-grid" aria-label="Birthday templates">
      <article
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        :class="{ selected: selectedTemplateId === template.id }"
      >
        <!-- ARTWORK: ang mismong larawan ng template (WebP, hindi binago).
             Pag-click sa larawan = lalabas ang "Use this template?" dialog (gaya ng dati). -->
        <div class="template-art" :style="{ '--btn-y': template.cardButtonY + '%' }">
        <button
          class="template-art-button"
          type="button"
          :aria-label="`Choose ${template.name} template`"
          :aria-pressed="selectedTemplateId === template.id"
          @click="confirmTemplate(template)"
        >
          <img
            class="template-image"
            :src="template.image"
            :alt="`${template.name} birthday template: ${template.heading}`"
            width="930"
            height="620"
            loading="lazy"
            decoding="async"
          />
          <span v-if="template.isNew" class="new-badge">New</span>
          <span
            v-if="selectedTemplateId === template.id"
            class="template-check"
            aria-label="Selected"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m5 12 4.3 4.3L19 6.8"
                stroke="white"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>
        <!-- DAGDAG: totoong "Start the surprise" button (HTML, hindi bahagi ng larawan).
             Nakapatong sa bakanteng espasyo sa ilalim ng mensahe; tuloy agad sa Package. -->
        <button
          class="surprise-button"
          :class="`btn-${template.buttonStyle}`"
          type="button"
          :aria-label="`Start the surprise with ${template.name}`"
          @click="useTemplate(template)"
        >
          Start the surprise <span aria-hidden="true">→</span>
        </button>
        </div>
        <footer class="template-card-footer">
          <strong>{{ template.number }} {{ template.name }}</strong>
          <button class="preview-button" type="button" @click="openPreview(template)">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.8" />
            </svg>
            Preview
          </button>
        </footer>
      </article>

      <p v-if="filteredTemplates.length === 0" class="empty-templates">
        No templates match this style.
      </p>
    </section>

    <div
      v-if="previewTemplate"
      ref="previewEl"
      class="preview-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="`${previewTemplate.name} template preview`"
      tabindex="-1"
      @click.self="closePreview"
      @keydown.esc="closePreview"
    >
      <section class="preview-dialog">
        <header class="preview-header">
          <div>
            <h2>{{ previewTemplate.number }} {{ previewTemplate.name }}</h2>
            <p>Birthday card preview</p>
          </div>
          <button
            class="close-preview"
            type="button"
            aria-label="Close preview"
            @click="closePreview"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>
        <!-- PREVIEW: buong larawan (malaking WebP, walang crop) + totoong button sa ibabaw -->
        <div class="preview-art" :style="{ '--btn-y': previewTemplate.buttonY + '%' }">
          <img
            class="preview-image"
            :src="previewTemplate.fullImage"
            :alt="`${previewTemplate.name} birthday template: ${previewTemplate.heading}`"
            decoding="async"
          />
          <button
            class="surprise-button"
            :class="`btn-${previewTemplate.buttonStyle}`"
            type="button"
            @click="usePreviewTemplate"
          >
            Start the surprise <span aria-hidden="true">→</span>
          </button>
        </div>
        <button class="use-template-button" type="button" @click="usePreviewTemplate">
          Use this template
        </button>
      </section>
    </div>

    <ConFirm
      v-if="pendingTemplate"
      :template-name="pendingTemplate.name"
      message="Would you like to use this birthday template?"
      cancel-label="Cancel"
      confirm-label="Use template"
      @cancel="cancelTemplate"
      @confirm="useSelectedTemplate"
    />
  </main>
</template>

<script setup>
import { computed, nextTick, ref } from "vue";
import { useRouter } from "vue-router";
import ConFirm from "../dialog/ConFirm.vue";
import { readOrderDraft } from "@/utils/orderDraft";
import { useOrderStore } from "@/stores/order";

/* ===== DAGDAG: mga larawan ng Birthday templates (WebP) =====
   birthday-*.webp      = maliit, para sa gallery (mabilis mag-load)
   birthday-*-full.webp = malaki, para sa Preview (naglo-load lang kapag binuksan) */
import softCelebration from "@/assets/templates/birthday/birthday-soft-celebration.webp";
import softCelebrationFull from "@/assets/templates/birthday/birthday-soft-celebration-full.webp";
import starryNight from "@/assets/templates/birthday/birthday-starry-night.webp";
import starryNightFull from "@/assets/templates/birthday/birthday-starry-night-full.webp";
import memoryLane from "@/assets/templates/birthday/birthday-memory-lane.webp";
import memoryLaneFull from "@/assets/templates/birthday/birthday-memory-lane-full.webp";
import happyVibes from "@/assets/templates/birthday/birthday-happy-vibes.webp";
import happyVibesFull from "@/assets/templates/birthday/birthday-happy-vibes-full.webp";
import timelessElegance from "@/assets/templates/birthday/birthday-timeless-elegance.webp";
import timelessEleganceFull from "@/assets/templates/birthday/birthday-timeless-elegance-full.webp";
import oceanBreeze from "@/assets/templates/birthday/birthday-ocean-breeze.webp";
import oceanBreezeFull from "@/assets/templates/birthday/birthday-ocean-breeze-full.webp";
import gardenBloom from "@/assets/templates/birthday/birthday-garden-bloom.webp";
import gardenBloomFull from "@/assets/templates/birthday/birthday-garden-bloom-full.webp";
import cozyCorner from "@/assets/templates/birthday/birthday-cozy-corner.webp";
import cozyCornerFull from "@/assets/templates/birthday/birthday-cozy-corner-full.webp";

const router = useRouter();
const orderStore = useOrderStore();
const styles = ["All", "Cute", "Elegant", "Fun", "Minimal", "Dark"];
/* ===== Listahan ng 8 Birthday templates (pinalitan ang lumang SVG drawing) =====
   image        = maliit na WebP para sa gallery
   fullImage    = malaking WebP para sa Preview lang
   buttonY      = posisyon ng "Start the surprise" sa BUONG larawan (% mula itaas) — sa Preview
   cardButtonY  = posisyon ng button sa card (iba nang konti kasi naka-crop ang taas/baba)
   buttonStyle  = kulay ng button na bagay sa template (tingnan ang .btn-* sa CSS) */
const templates = [
  {
    id: "soft-celebration",
    number: "01",
    name: "Soft Celebration",
    heading: "To a very special you",
    style: "Cute",
    image: softCelebration,
    fullImage: softCelebrationFull,
    buttonY: 69,
    cardButtonY: 70,
    buttonStyle: "rose",
  },
  {
    id: "starry-night",
    number: "02",
    name: "Starry Night",
    heading: "Make a Wish",
    style: "Dark",
    isNew: true,
    image: starryNight,
    fullImage: starryNightFull,
    buttonY: 72,
    cardButtonY: 74,
    buttonStyle: "white-navy",
  },
  {
    id: "memory-lane",
    number: "03",
    name: "Memory Lane",
    heading: "Another Chapter",
    style: "Fun",
    image: memoryLane,
    fullImage: memoryLaneFull,
    buttonY: 82,
    cardButtonY: 85,
    buttonStyle: "coral",
  },
  {
    id: "happy-vibes",
    number: "04",
    name: "Happy Vibes",
    heading: "Good Vibes Only!",
    style: "Fun",
    image: happyVibes,
    fullImage: happyVibesFull,
    buttonY: 81,
    cardButtonY: 84,
    buttonStyle: "coral",
  },
  {
    id: "timeless-elegance",
    number: "05",
    name: "Timeless Elegance",
    heading: "A Brighter Year Ahead",
    style: "Elegant",
    image: timelessElegance,
    fullImage: timelessEleganceFull,
    buttonY: 69,
    cardButtonY: 71,
    buttonStyle: "taupe",
  },
  {
    id: "ocean-breeze",
    number: "06",
    name: "Ocean Breeze",
    heading: "Same Sun Brighter You",
    style: "Minimal",
    image: oceanBreeze,
    fullImage: oceanBreezeFull,
    buttonY: 64,
    cardButtonY: 71,
    buttonStyle: "ocean",
  },
  {
    id: "garden-bloom",
    number: "07",
    name: "Garden Bloom",
    heading: "Bloom and Shine",
    style: "Cute",
    image: gardenBloom,
    fullImage: gardenBloomFull,
    buttonY: 62,
    cardButtonY: 69,
    buttonStyle: "white-rose",
  },
  {
    id: "cozy-corner",
    number: "08",
    name: "Cozy Corner",
    heading: "Cozy Moments",
    style: "Dark",
    image: cozyCorner,
    fullImage: cozyCornerFull,
    buttonY: 63,
    cardButtonY: 70,
    buttonStyle: "white-dark",
  },
];

const activeStyle = ref("All");
const draft = readOrderDraft();
const selectedTemplateId = ref(
  templates.some((template) => template.id === draft.template_id) ? draft.template_id : "",
);
const previewTemplate = ref(null);
const pendingTemplate = ref(null);
const previewEl = ref(null); // DAGDAG: para ma-focus ang Preview (gumana agad ang Esc)
const confirmEl = ref(null); // DAGDAG: para ma-focus ang confirm dialog
const filteredTemplates = computed(() =>
  activeStyle.value === "All"
    ? templates
    : templates.filter((template) => template.style === activeStyle.value),
);

function selectTemplate(template) {
  selectedTemplateId.value = template.id;
  orderStore.updateOrderDraft({ occasion: "birthday", template_id: template.id });
}

function confirmTemplate(template) {
  pendingTemplate.value = template;
  nextTick(() => confirmEl.value?.focus()); // DAGDAG: Esc para isara
}

function cancelTemplate() {
  pendingTemplate.value = null;
}

function useSelectedTemplate() {
  if (!pendingTemplate.value) return;
  useTemplate(pendingTemplate.value);
  cancelTemplate();
}

function openPreview(template) {
  previewTemplate.value = template;
  nextTick(() => previewEl.value?.focus()); // DAGDAG: Esc para isara
}

function closePreview() {
  previewTemplate.value = null;
}

function usePreviewTemplate() {
  if (!previewTemplate.value) return;
  useTemplate(previewTemplate.value);
  closePreview();
}

let navigating = false; // DAGDAG: iwas dobleng pindot sa "Start the surprise"
function useTemplate(template) {
  if (navigating) return;
  navigating = true;
  selectTemplate(template);
  router.push("/create/package");
}

function changeOccasion() {
  router.push("/create/occasion");
}
</script>

<style scoped>
.template-page {
  /* FONT (pareho sa Celebrate page): Fredoka = title/pangalan/buttons, Nunito = ibang text */
  --navy: var(--sl-navy, #192448);
  --display: var(--sl-font-display, "Fredoka", sans-serif);
  --stretch: var(--sl-display-stretch, 86%);
  font-family: var(--sl-font-body, "Nunito", sans-serif);
  width: min(1384px, 90%);
  margin: 0 auto;
  padding: 30px 0 38px;
}
.template-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
/* title: Fredoka (gaya ng "What are we celebrating?") */
.template-heading h1 {
  margin: 0 0 6px;
  color: var(--navy);
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: clamp(36px, 3.8vw, 56px);
  line-height: 1.05;
  letter-spacing: -0.3px;
  font-weight: 700;
}
/* subtitle: Nunito (gaya ng "Pick an occasion...") */
.template-heading p {
  margin: 0;
  color: #4f5a75;
  font-size: clamp(17px, 1.4vw, 20px);
  font-weight: 400;
  line-height: 1.3;
}
.change-occasion,
.preview-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: #3265df;
  /* Fredoka (gaya ng mga button sa Celebrate page) */
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: 17px;
  font-weight: 600;
}
.change-occasion {
  white-space: nowrap;
}
.change-occasion svg,
.preview-button svg {
  width: 17px;
  height: 17px;
}
.filter-list {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin: 19px 0 16px;
}
.filter-chip {
  border: 1px solid #dfd5c4;
  border-radius: 999px;
  background: #fff;
  color: #59637d;
  padding: 8px 18px;
  font-size: 15px;
  font-weight: 500;
}
.filter-chip.active {
  background: #1c2344;
  border-color: #1c2344;
  color: #fff;
}
.template-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.template-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e9e1d3;
  border-radius: 15px;
  background: #fff;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.15s;
}
.template-card:hover {
  border-color: #9cb7ff;
  transform: translateY(-1px);
}
.template-card.selected {
  border: 2px solid #3265df;
  box-shadow: 0 0 0 3px #3265df18;
}
/* DAGDAG: lalagyan ng larawan + "Start the surprise" button */
.template-art {
  position: relative;
  container-type: inline-size;
}
.template-art-button {
  position: relative;
  display: block;
  width: 100%;
  /* 3:2 (dati 1.78) para hindi maputol ang "Happy Birthday" at mensahe */
  aspect-ratio: 1.5;
  overflow: hidden;
  padding: 0;
  border: 0;
  background: #f8f4eb;
}
/* larawan ng template: puno ang card, naka-crop lang nang konti (hindi nababanat) */
.template-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* bahagyang mas kita ang itaas (para sa "Happy Birthday" ng mas mataas na larawan) */
  object-position: 50% 35%;
  transition: transform 0.2s;
}
.template-art-button:hover .template-image {
  transform: scale(1.025);
}

/* ===== DAGDAG: "Start the surprise →" (totoong HTML button sa ibabaw ng larawan) =====
   Nakagitna at nasa --btn-y (bakanteng espasyo sa ilalim ng mensahe) */
.surprise-button {
  position: absolute;
  left: 50%;
  top: var(--btn-y, 70%);
  transform: translate(-50%, -50%);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  border: 0;
  border-radius: 999px;
  padding: 0.7em 1.4em;
  font-size: clamp(10px, 3.9cqi, 15px);
  font-weight: 600;
  white-space: nowrap;
  font-family: var(--display);
  font-stretch: var(--stretch);
  color: var(--btn-text);
  background: var(--btn-bg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}
.surprise-button span {
  transition: transform 0.18s ease;
}
.surprise-button:hover {
  transform: translate(-50%, calc(-50% - 2px));
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.24);
  filter: brightness(1.06);
}
.surprise-button:hover span {
  transform: translateX(3px);
}
.surprise-button:active {
  transform: translate(-50%, -50%) scale(0.97);
}
.surprise-button:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 2px;
  box-shadow: 0 0 0 6px #3265df;
}
/* kulay ng button bawat template (bagay sa artwork) */
.btn-rose { --btn-bg: #e9677c; --btn-text: #fff; }
.btn-white-navy { --btn-bg: #fff; --btn-text: #1d2a5b; }
.btn-coral { --btn-bg: #ec5f72; --btn-text: #fff; }
.btn-taupe { --btn-bg: #6e675c; --btn-text: #fff; }
.btn-ocean { --btn-bg: #1f4fa8; --btn-text: #fff; }
.btn-white-rose { --btn-bg: #fff; --btn-text: #e0606f; }
.btn-white-dark { --btn-bg: #fff; --btn-text: #2b211b; }
.new-badge {
  z-index: 1;
  position: absolute;
  top: 10px;
  left: 10px;
  border-radius: 999px;
  padding: 5px 9px;
  background: #ffb629;
  color: #34280a;
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: 13px;
  font-weight: 600;
}
.template-check {
  z-index: 1;
  position: absolute;
  top: 9px;
  right: 9px;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: #3265df;
}
.template-check svg {
  width: 18px;
  height: 18px;
}
.template-card-footer {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 7px 10px;
}
/* pangalan ng template: Fredoka (gaya ng "Birthday", "Monthsary" sa Celebrate) */
.template-card-footer strong {
  overflow: hidden;
  color: var(--navy);
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: clamp(16px, 1.3vw, 19px);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-button {
  flex: 0 0 auto;
  padding: 3px 0;
  font-size: 15px;
}
.empty-templates {
  grid-column: 1 / -1;
  padding: 35px;
  color: #606981;
  text-align: center;
}
.preview-overlay {
  position: fixed;
  z-index: 10;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 24px;
  background: rgb(20 25 47 / 78%);
}
.preview-dialog {
  width: min(900px, 100%);
  overflow: hidden;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 20px 70px rgb(0 0 0 / 25%);
}
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
}
.preview-header h2 {
  margin: 0 0 3px;
  color: var(--navy);
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: 24px;
  font-weight: 600;
}
.preview-header p {
  margin: 0;
  color: #606981;
}
.close-preview {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid #e9e1d3;
  border-radius: 50%;
  background: #fff;
  color: #1c2344;
}
.close-preview svg {
  width: 20px;
  height: 20px;
}
/* PREVIEW: buong larawan sa tunay na sukat (walang crop, walang banat) */
.preview-art {
  position: relative;
  overflow: hidden;
  background: #f7f3ea;
  container-type: inline-size;
}
.preview-image {
  display: block;
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
}
.preview-art .surprise-button {
  font-size: clamp(12px, 2.3cqi, 18px);
}
.preview-overlay:focus,
.confirm-overlay:focus {
  outline: none;
}
.use-template-button {
  border: 0;
  border-radius: 12px;
  background: #3265df;
  color: #fff;
  padding: 12px 22px;
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: 17px;
  font-weight: 600;
}
.preview-dialog > .use-template-button {
  display: block;
  margin: 16px 24px 22px auto;
}
@media (max-width: 1100px) {
  .template-page {
    width: 94%;
  }
}
@media (max-width: 760px) {
  .template-page {
    width: auto;
    padding: 25px 18px 30px;
  }
  .template-heading {
    align-items: flex-start;
  }
  .template-heading h1 {
    font-size: clamp(30px, 8vw, 40px);
  }
  .template-heading p {
    font-size: 15px;
    line-height: 1.45;
  }
  .change-occasion {
    gap: 4px;
    font-size: 15px;
  }
  .template-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .template-card-footer {
    padding-inline: 8px;
  }
  /* DAGDAG: mas maliit na "Start the surprise" sa phone para hindi matakpan ang mensahe */
  .template-art .surprise-button {
    padding: 0.5em 1em;
    font-size: clamp(8px, 3.4cqi, 12px);
  }
  .template-card-footer strong {
    font-size: 14px;
  }
  .preview-button {
    font-size: 13px;
  }
  .preview-header {
    padding: 16px;
  }
}
@media (max-width: 390px) {
  .template-page {
    padding-inline: 14px;
  }
  .template-heading {
    flex-direction: column;
    gap: 13px;
  }
  .filter-list {
    gap: 6px;
  }
  .filter-chip {
    padding: 7px 13px;
    font-size: 13.5px;
  }
}
/* DAGDAG: kapag naka-off ang animation sa device */
@media (prefers-reduced-motion: reduce) {
  .template-image,
  .surprise-button,
  .surprise-button span {
    transition: none;
  }
  .template-art-button:hover .template-image {
    transform: none;
  }
}
</style>