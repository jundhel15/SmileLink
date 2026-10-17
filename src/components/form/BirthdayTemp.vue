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
        <button
          class="template-art-button"
          type="button"
          :aria-label="`Select ${template.name} template`"
          :aria-pressed="selectedTemplateId === template.id"
          @click="selectTemplate(template)"
        >
          <BirthdayArtwork :template="template" />
          <span v-if="template.isNew" class="new-badge">New</span>
          <span v-if="selectedTemplateId === template.id" class="template-check" aria-label="Selected">
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
        <footer class="template-card-footer">
          <strong>{{ template.name }}</strong>
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
            <h2>{{ previewTemplate.name }}</h2>
            <p>Birthday card preview</p>
          </div>
          <button class="close-preview" type="button" aria-label="Close preview" @click="closePreview">
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
        <div class="preview-art">
          <BirthdayArtwork :template="previewTemplate" />
          <div class="sample-message">
            <span>HAPPY BIRTHDAY</span>
            <strong>Make a wish!</strong>
            <p>Hope your day is filled with all the things you love.</p>
          </div>
        </div>
        <button class="use-template-button" type="button" @click="usePreviewTemplate">
          Use this template
        </button>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, ref } from "vue";
import { useRouter } from "vue-router";
import { readOrderDraft, updateOrderDraft } from "@/utils/orderDraft";

const router = useRouter();
const styles = ["All", "Cute", "Elegant", "Fun", "Minimal", "Dark"];
const templates = [
  {
    id: "sky-balloons",
    name: "Sky Balloons",
    style: "Cute",
    background: "#c9e7ff",
    accent: "#2865d8",
    secondary: "#ffb629",
    icing: "#ff8f88",
    cake: "#fff0c4",
  },
  {
    id: "starry-night",
    name: "Starry Night",
    style: "Dark",
    isNew: true,
    background: "#292b70",
    accent: "#ffd036",
    secondary: "#8997ff",
    icing: "#fff3d0",
    cake: "#f6bd42",
  },
  {
    id: "golden-confetti",
    name: "Golden Confetti",
    style: "Elegant",
    background: "#fff0cf",
    accent: "#e6a51b",
    secondary: "#4881ed",
    icing: "#fff8e8",
    cake: "#f4c35c",
  },
  {
    id: "garden-bloom",
    name: "Garden Bloom",
    style: "Cute",
    background: "#e5f4df",
    accent: "#45a767",
    secondary: "#ff8580",
    icing: "#fff4dc",
    cake: "#76c279",
  },
  {
    id: "pastel-party",
    name: "Pastel Party",
    style: "Cute",
    background: "#f4dcf4",
    accent: "#a879dc",
    secondary: "#f6b642",
    icing: "#fff9ff",
    cake: "#c5a9ee",
  },
  {
    id: "midnight-sparkle",
    name: "Midnight Sparkle",
    style: "Dark",
    background: "#22233c",
    accent: "#f5b932",
    secondary: "#ff8580",
    icing: "#fff0c7",
    cake: "#304b9a",
  },
  {
    id: "sunny-picnic",
    name: "Sunny Picnic",
    style: "Fun",
    background: "#fff0c8",
    accent: "#3879e8",
    secondary: "#fa856c",
    icing: "#fffaf0",
    cake: "#ffca4f",
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    style: "Minimal",
    background: "#ccecf0",
    accent: "#287bda",
    secondary: "#ff906f",
    icing: "#f7fbf8",
    cake: "#3a82da",
  },
];

const BirthdayArtwork = defineComponent({
  props: {
    template: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h(
        "svg",
        {
          class: "birthday-artwork",
          viewBox: "0 0 320 180",
          role: "img",
          "aria-label": `${props.template.name} birthday illustration`,
        },
        [
          h("rect", { width: 320, height: 180, fill: props.template.background }),
          ...[
            [17, 24, 4],
            [52, 42, 3],
            [91, 18, 3],
            [135, 39, 4],
            [188, 18, 3],
            [239, 35, 4],
            [287, 19, 3],
            [28, 92, 3],
            [276, 95, 3],
            [62, 135, 3],
            [253, 139, 4],
          ].map(([cx, cy, r]) =>
            h("circle", {
              cx,
              cy,
              r,
              fill: (cx + cy) % 2 ? props.template.accent : props.template.secondary,
              opacity: 0.8,
            }),
          ),
          h("path", {
            d: "M0 145c44-12 75 8 119-2s78 0 111-5 58 7 90-2v44H0z",
            fill: props.template.icing,
          }),
          ...[
            [69, 75],
            [250, 80],
          ].flatMap(([x, y]) => [
            h("path", {
              d: `M${x} ${y + 22}q-5 25 0 48`,
              fill: "none",
              stroke: "#8392a8",
              "stroke-width": 1.5,
            }),
            h("ellipse", {
              cx: x,
              cy: y,
              rx: 13,
              ry: 17,
              fill: props.template.accent,
            }),
            h("path", {
              d: `m${x - 3} ${y + 16} 3 5 3-5`,
              fill: props.template.accent,
            }),
          ]),
          h("ellipse", { cx: 160, cy: 145, rx: 67, ry: 10, fill: "#ffffff", opacity: 0.8 }),
          h("rect", { x: 105, y: 122, width: 110, height: 23, rx: 4, fill: props.template.cake }),
          h("path", {
            d: "M105 129h110v9H105z",
            fill: props.template.icing,
          }),
          h("rect", { x: 120, y: 100, width: 80, height: 23, rx: 4, fill: props.template.icing }),
          h("path", {
            d: "M120 110q10 7 20 0t20 0 20 0 20 0v7h-80z",
            fill: props.template.accent,
          }),
          ...[140, 160, 180].flatMap((x, index) => [
            h("path", {
              d: `M${x} 98V${82 + (index % 2) * 4}`,
              stroke: props.template.secondary,
              "stroke-width": 3,
              "stroke-linecap": "round",
            }),
            h("path", {
              d: `M${x} ${81 + (index % 2) * 4}c-5-6 5-7 0-13`,
              fill: "none",
              stroke: props.template.accent,
              "stroke-width": 2,
              "stroke-linecap": "round",
            }),
          ]),
        ],
      );
  },
});

const activeStyle = ref("All");
const draft = readOrderDraft();
const selectedTemplateId = ref(
  templates.some((template) => template.id === draft.template_id)
    ? draft.template_id
    : templates[0].id,
);
const previewTemplate = ref(null);
const filteredTemplates = computed(() =>
  activeStyle.value === "All"
    ? templates
    : templates.filter((template) => template.style === activeStyle.value),
);

updateOrderDraft({ occasion: "birthday", template_id: selectedTemplateId.value });

function selectTemplate(template) {
  selectedTemplateId.value = template.id;
  updateOrderDraft({ occasion: "birthday", template_id: template.id });
}

function openPreview(template) {
  previewTemplate.value = template;
}

function closePreview() {
  previewTemplate.value = null;
}

function usePreviewTemplate() {
  if (!previewTemplate.value) return;
  selectTemplate(previewTemplate.value);
  closePreview();
}

function changeOccasion() {
  router.push("/create/occasion");
}
</script>

<style scoped>
.template-page {
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
.template-heading h1 {
  margin: 0 0 5px;
  color: #1c2344;
  font-size: clamp(27px, 2.3vw, 35px);
  line-height: 1.2;
  letter-spacing: -0.8px;
  font-weight: 900;
}
.template-heading p {
  margin: 0;
  color: #606981;
}
.change-occasion,
.preview-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: #3265df;
  font-size: 14px;
  font-weight: 700;
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
  padding: 8px 16px;
  font-size: 14px;
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
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.template-card:hover {
  border-color: #9cb7ff;
  transform: translateY(-1px);
}
.template-card.selected {
  border: 2px solid #3265df;
  box-shadow: 0 0 0 3px #3265df18;
}
.template-art-button {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1.78;
  overflow: hidden;
  padding: 0;
  border: 0;
  background: #f8f4eb;
}
.birthday-artwork {
  display: block;
  width: 100%;
  height: 100%;
  transition: transform 0.2s;
}
.template-art-button:hover .birthday-artwork {
  transform: scale(1.025);
}
.new-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  border-radius: 999px;
  padding: 5px 9px;
  background: #ffb629;
  color: #34280a;
  font-size: 12px;
  font-weight: 900;
}
.template-check {
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
  min-height: 43px;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 7px 10px;
}
.template-card-footer strong {
  overflow: hidden;
  color: #1c2344;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-button {
  flex: 0 0 auto;
  padding: 3px 0;
  font-size: 12px;
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
  font-size: 22px;
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
.preview-art {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1.65;
  background: #f7f3ea;
}
.sample-message {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(360px, 80%);
  padding: 22px;
  border-radius: 16px;
  background: rgb(255 255 255 / 91%);
  text-align: center;
  transform: translate(-50%, -50%);
}
.sample-message span {
  color: #3265df;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 2px;
}
.sample-message strong {
  display: block;
  margin: 7px 0;
  font-size: clamp(24px, 5vw, 38px);
  font-weight: 900;
}
.sample-message p {
  margin: 0;
  color: #606981;
}
.use-template-button {
  display: block;
  margin: 16px 24px 22px auto;
  border: 0;
  border-radius: 12px;
  background: #3265df;
  color: #fff;
  padding: 12px 20px;
  font-weight: 800;
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
    font-size: 28px;
  }
  .template-heading p {
    font-size: 14px;
    line-height: 1.5;
  }
  .change-occasion {
    gap: 4px;
    font-size: 12px;
  }
  .template-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .template-card-footer {
    padding-inline: 8px;
  }
  .template-card-footer strong {
    font-size: 12px;
  }
  .preview-button {
    font-size: 11px;
  }
  .preview-header {
    padding: 16px;
  }
  .preview-art {
    aspect-ratio: 1.2;
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
    padding: 7px 12px;
    font-size: 12px;
  }
}
</style>
