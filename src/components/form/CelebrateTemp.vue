<template>
  <main class="page-content">
    <section class="page-heading">
      <div class="heading-copy">
        <h1>
          What are we <span class="accent">celebrating?</span>
          <svg class="deco deco-heading" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path d="M9 24c3-7 8-12 15-15M12 36l17-3" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
          </svg>
        </h1>
        <p>
          <svg class="deco deco-heart" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 21s-7.5-4.6-9.6-9.4C.9 8.2 3 4.5 6.6 4.5c2.2 0 3.7 1.3 5.4 3.2 1.7-1.9 3.2-3.2 5.4-3.2 3.6 0 5.7 3.7 4.2 7.1C19.5 16.4 12 21 12 21Z"
              fill="#FF8FAB"
            />
          </svg>
          Pick an occasion. You can change it later.
        </p>
      </div>
      <label class="search-box">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.8" />
          <path d="m16 16 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search occasions..."
          aria-label="Search occasions"
        />
        <svg class="deco deco-search" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M17 31 9 19M24 28V12M31 31l8-12" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" />
        </svg>
      </label>
    </section>

    <section class="occasion-grid" aria-label="Choose an occasion">
      <button
        v-for="occasion in filteredOccasions"
        :key="occasion.name"
        class="occasion-card"
        :class="{ selected: selectedOccasion === occasion.name }"
        type="button"
        :aria-pressed="selectedOccasion === occasion.name"
        @click="selectOccasion(occasion.name, occasion.action)"
      >
        <span v-if="selectedOccasion === occasion.name" class="selected-check" aria-label="Selected">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m5 12 4.3 4.3L19 6.8"
              stroke="white"
              stroke-width="2.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>

        <span class="occasion-art">
          <img
            :src="occasion.image"
            :alt="occasion.alt"
            width="320"
            height="200"
            loading="lazy"
            decoding="async"
          />
        </span>
        <span class="occasion-name" :class="`pill-${occasion.pill}`">{{ occasion.name }}</span>
        <span class="occasion-description">{{ occasion.description }}</span>
      </button>

      <p v-if="filteredOccasions.length === 0" class="empty-state">
        No occasions found. Try another search.
      </p>
    </section>

    <aside class="group-banner">
      <svg class="deco deco-banner-left" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M17 31 9 19M24 28V12M31 31l8-12" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" />
      </svg>
      <svg class="deco deco-banner-right" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M17 31 9 19M24 28V12M31 31l8-12" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" />
      </svg>

      <span class="group-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32">
          <circle cx="16" cy="10" r="5" fill="#F59E2B" />
          <path d="M7.5 25c.6-5 4-8 8.5-8s7.9 3 8.5 8z" fill="#F59E2B" />
          <circle cx="7.5" cy="12.5" r="3.6" fill="#FBC15E" />
          <path d="M1.5 24c.4-3.8 2.8-6 6-6 1.3 0 2.4.3 3.3 1-1.9 1.4-3.1 3.2-3.6 5z" fill="#FBC15E" />
          <circle cx="24.5" cy="12.5" r="3.6" fill="#FBC15E" />
          <path d="M30.5 24c-.4-3.8-2.8-6-6-6-1.3 0-2.4.3-3.3 1 1.9 1.4 3.1 3.2 3.6 5z" fill="#FBC15E" />
        </svg>
      </span>
      <div class="group-copy">
        <strong>Collecting wishes from many people?</strong>
        <p>
          Start a group card and invite friends and family to add their messages before it is sent.
        </p>
      </div>
      <button class="secondary-button" type="button" @click="startGroupCard">
        Start a group card
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12h15M13 5l7 7-7 7"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </aside>

    <footer class="page-actions">
      <button class="cancel-button" type="button" @click="cancelSelection">Cancel</button>
      <button
        class="continue-button"
        type="button"
        :disabled="!selectedOccasion"
        @click="continueToNext"
      >
        Continue
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12h15M13 5l7 7-7 7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </footer>
    <p v-if="statusMessage" class="status-message" role="status">{{ statusMessage }}</p>
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { readOrderDraft, updateOrderDraft } from "@/utils/orderDraft";

/* ===== Occasion illustrations (WebP) ===== */
import birthdayWebp from "@/assets/occasions/birthday-cake.webp";
import monthsaryWebp from "@/assets/occasions/monthsary-balloons.webp";
import anniversaryWebp from "@/assets/occasions/anniversary-rings.webp";
import weddingWebp from "@/assets/occasions/wedding-flowers.webp";
import graduationWebp from "@/assets/occasions/graduation-cap.webp";
import debutWebp from "@/assets/occasions/debut-crown.webp";
import babyWebp from "@/assets/occasions/baby-reveal.webp";
import thankYouWebp from "@/assets/occasions/thank-you-envelope.webp";
import congratsWebp from "@/assets/occasions/congratulations-trophy.webp";
import justBecauseWebp from "@/assets/occasions/just-because-star.webp";

const router = useRouter();
const selectedOccasion = ref("");
const selectedAction = ref("");
const searchQuery = ref("");
const statusMessage = ref("");
const savedDraft = readOrderDraft();

const occasions = [
  {
    name: "Birthday",
    description: "Any age, any style",
    pill: "yellow",
    image: birthdayWebp,
    alt: "Birthday cake with candles",
    action: "/birthday",
  },
  {
    name: "Monthsary",
    description: "Little milestones",
    pill: "pink",
    image: monthsaryWebp,
    alt: "Pink heart balloons",
    action: "/monthsary",
  },
  {
    name: "Anniversary",
    description: "Years together",
    pill: "blue",
    image: anniversaryWebp,
    alt: "Two gold rings with a heart",
    action: "/anniversary",
  },
  {
    name: "Wedding",
    description: "For the couple",
    pill: "peach",
    image: weddingWebp,
    alt: "Wedding flower bouquet",
    action: "/wedding",
  },
  {
    name: "Graduation",
    description: "Cheer their win",
    pill: "lavender",
    image: graduationWebp,
    alt: "Blue graduation cap",
    action: "/graduation",
  },
  {
    name: "Debut",
    description: "The 18th",
    pill: "pink",
    image: debutWebp,
    alt: "Gold crown with a pink gem",
    action: "/debut",
  },
  {
    name: "Baby & reveal",
    description: "New arrivals",
    pill: "blue",
    image: babyWebp,
    alt: "Teddy bear with balloons",
    action: "reveal",
  },
  {
    name: "Thank you",
    description: "Show gratitude",
    pill: "yellow",
    image: thankYouWebp,
    alt: "Envelope sealed with a heart",
    action: "thanks",
  },
  {
    name: "Congratulations",
    description: "Big or small wins",
    pill: "mint",
    image: congratsWebp,
    alt: "Gold trophy with confetti",
    action: "/congratulation",
  },
  {
    name: "Just because",
    description: "No reason needed",
    pill: "lavender",
    image: justBecauseWebp,
    alt: "Smiling yellow star",
    action: "/smile",
  },
];

const savedOccasion = occasions.find(
  (occasion) => occasion.action.replace(/^\//, "") === savedDraft.occasion,
);
if (savedOccasion) {
  selectedOccasion.value = savedOccasion.name;
  selectedAction.value = savedOccasion.action;
}

const filteredOccasions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return occasions.filter((occasion) =>
    `${occasion.name} ${occasion.description}`.toLowerCase().includes(query),
  );
});

function selectOccasion(name, action) {
  selectedOccasion.value = name;
  selectedAction.value = action;
  statusMessage.value = "";
  const occasion = action.replace(/^\//, "");
  const draft = readOrderDraft();
  updateOrderDraft({
    occasion,
    is_group: false,
    template_id: draft.occasion === occasion ? (draft.template_id ?? null) : null,
  });
}

function startGroupCard() {
  updateOrderDraft({
    ...(selectedAction.value ? { occasion: selectedAction.value.replace(/^\//, "") } : {}),
    is_group: true,
  });
  statusMessage.value = "Group card selected. You can invite friends and family in the next step.";
}

function cancelSelection() {
  selectedOccasion.value = "";
  selectedAction.value = "";
  searchQuery.value = "";
  statusMessage.value = "";
  updateOrderDraft({ occasion: null, is_group: false, template_id: null });
}

function continueToNext() {
  if (!selectedOccasion.value) return;
  if (!selectedAction.value) {
    statusMessage.value = `${selectedOccasion.value} is not available yet.`;
    return;
  }
  if (selectedAction.value === "/birthday") {
    updateOrderDraft({
      occasion: "birthday",
      is_group: false,
      template_id: null,
    });
    router.push("/create/template");
    return;
  }
  statusMessage.value = `You selected ${selectedOccasion.value}. Next: choose a template.`;
}
</script>

<style scoped>
.page-content {
  --navy: var(--sl-navy, #192448);
  --blue: var(--sl-blue, #3264e8);
  --muted: var(--sl-muted, #5f6880);
  --display: var(--sl-font-display, "Fredoka", sans-serif);
  --stretch: var(--sl-display-stretch, 86%);
  font-family: var(--sl-font-body, "Nunito", sans-serif);
  --card-shadow: 0 6px 18px rgba(120, 92, 40, 0.07);
  --card-shadow-hover: 0 16px 32px rgba(120, 92, 40, 0.12);

  width: min(1490px, 92%);
  margin: 0 auto;
  padding: 30px 0 30px;
}

/* ===== Heading ===== */
.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 26px;
}
.page-heading h1 {
  position: relative;
  display: inline-block;
  margin: 0 0 6px;
  color: var(--navy);
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: clamp(38px, 4.3vw, 64px);
  line-height: 1.02;
  letter-spacing: -0.3px;
  font-weight: 700;
}
.page-heading h1 .accent {
  color: var(--blue);
  font-weight: 700;
}
.page-heading p {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #4f5a75;
  font-size: clamp(17px, 1.4vw, 20px);
  font-weight: 400;
  line-height: 1.3;
}
/* yellow accent strokes (same shape, rotated per spot) */
.deco {
  position: absolute;
  pointer-events: none;
  color: #ffb629;
}
.deco-heading {
  width: 0.72em;
  height: 0.72em;
  right: -0.74em;
  top: -0.2em;
}
.deco-heart {
  position: static;
  width: 32px;
  height: 32px;
  margin-left: -28px;
  color: #ff8fab;
  transform: rotate(-14deg) translateY(6px);
  flex: 0 0 auto;
}

/* ===== Search ===== */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: min(400px, 32%);
  flex-shrink: 0;
  margin-bottom: 14px;
}
.search-box > svg:first-child {
  position: absolute;
  left: 18px;
  width: 22px;
  height: 22px;
  color: var(--muted);
  pointer-events: none;
}
.search-box input {
  width: 100%;
  height: 58px;
  border: 1px solid #e6dccb;
  border-radius: 14px;
  background: #fff;
  padding: 0 18px 0 52px;
  color: var(--navy);
  font-size: 17px;
  font-weight: 500;
  outline: none;
  box-shadow: 0 4px 12px rgba(120, 92, 40, 0.05);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.search-box input::placeholder {
  color: #8a91a4;
}
.search-box input:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 4px rgba(50, 100, 232, 0.14);
}
.deco-search {
  width: 44px;
  height: 44px;
  right: -28px;
  top: -40px;
  transform: rotate(28deg);
}

/* ===== Occasion grid ===== */
.occasion-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 22px;
}
.occasion-card {
  position: relative;
  min-width: 0;
  min-height: 212px;
  border: 1px solid #f0e8da;
  border-radius: 24px;
  background: #fffefb;
  padding: 16px 14px 18px;
  color: var(--navy);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--card-shadow);
  overflow: hidden;
  container-type: inline-size;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    background-color 0.25s ease;
}
.occasion-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--card-shadow-hover);
}
.occasion-card.selected {
  border-color: var(--blue);
  background: #f3f7ff;
  box-shadow:
    inset 0 0 0 1px var(--blue),
    0 0 0 4px rgba(50, 100, 232, 0.13),
    0 10px 24px rgba(50, 100, 232, 0.12);
}
.occasion-art {
  flex: 1;
  width: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}
.occasion-art img {
  display: block;
  width: auto;
  height: 112px;
  max-width: 90%;
  object-fit: contain;
  transition: transform 0.3s ease;
}
.occasion-card:hover .occasion-art img {
  transform: translateY(-3px) scale(1.03);
}

/* title with soft feathered pastel highlight */
.occasion-name {
  position: relative;
  z-index: 0;
  display: inline-block;
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: clamp(20px, 1.95vw, 30px);
  font-size: clamp(18px, 12cqi, 32px);
  max-width: 100%;
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.2px;
  padding: 4px 22px 0;
  margin-bottom: 2px;
  white-space: nowrap;
}
.occasion-name::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 22% -6px 2%;
  border-radius: 999px;
  background: var(--pill);
  filter: blur(4px);
}
.pill-yellow { --pill: #ffeaa8; }
.pill-pink { --pill: #ffd3df; }
.pill-blue { --pill: #d3e2ff; }
.pill-peach { --pill: #ffd9c7; }
.pill-lavender { --pill: #e2dbff; }
.pill-mint { --pill: #cdeedc; }
.occasion-card.selected .occasion-name {
  color: #1f4fc9;
}
.occasion-description {
  display: block;
  color: #4f5a75;
  font-size: clamp(15px, 1.25vw, 18.5px);
  font-weight: 400;
  line-height: 1.3;
}

.selected-check {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--blue);
  display: grid;
  place-items: center;
  box-shadow: 0 4px 10px rgba(50, 100, 232, 0.3);
  animation: check-in 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.selected-check svg {
  width: 19px;
  height: 19px;
}
@keyframes check-in {
  from {
    transform: scale(0.3);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.empty-state {
  grid-column: 1 / -1;
  padding: 28px;
  text-align: center;
  color: var(--muted);
}

/* ===== Group banner ===== */
.group-banner {
  position: relative;
  margin-top: 26px;
  background: #fff5d9;
  border: 1px solid #f7d98e;
  border-radius: 20px;
  padding: 18px 22px 18px 18px;
  display: flex;
  align-items: center;
  gap: 18px;
}
.deco-banner-left {
  width: 46px;
  height: 46px;
  left: -40px;
  top: -34px;
  transform: rotate(-42deg);
}
.deco-banner-right {
  width: 46px;
  height: 46px;
  right: -40px;
  top: -22px;
  transform: rotate(48deg);
}
.group-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #fff;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  box-shadow: 0 3px 8px rgba(199, 137, 0, 0.12);
}
.group-icon svg {
  width: 34px;
  height: 34px;
}
.group-copy {
  flex: 1;
  min-width: 0;
}
.group-copy strong {
  display: block;
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: clamp(20px, 1.7vw, 25px);
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 2px;
  color: var(--navy);
}
.group-copy p {
  margin: 0;
  color: var(--muted);
  font-size: clamp(15px, 1.2vw, 17.5px);
  font-weight: 400;
  line-height: 1.4;
}
.secondary-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #ece2cf;
  border-radius: 14px;
  padding: 14px 22px;
  color: var(--navy);
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-weight: 600;
  font-size: 20px;
  white-space: nowrap;
  box-shadow: 0 6px 14px rgba(120, 92, 40, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.secondary-button svg {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
}
.secondary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(120, 92, 40, 0.14);
}
.secondary-button:hover svg {
  transform: translateX(3px);
}

/* ===== Footer actions ===== */
.page-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 40px;
}
.cancel-button {
  border: 0;
  background: transparent;
  color: var(--blue);
  font-weight: 700;
  padding: 12px 10px;
}
.continue-button {
  border: 0;
  border-radius: 14px;
  background: var(--blue);
  color: #fff;
  padding: 17px 27px;
  min-width: 171px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}
.continue-button svg {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}
.continue-button:hover:not(:disabled) {
  background: var(--sl-blue-dark, #2654d1);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(50, 100, 232, 0.25);
}
.continue-button:hover:not(:disabled) svg {
  transform: translateX(3px);
}
.continue-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.status-message {
  margin: 12px 0 0;
  color: var(--muted);
  text-align: right;
  font-size: 13px;
}

/* ===== Responsive ===== */
@media (max-width: 1100px) {
  .page-content {
    width: 94%;
  }
  .occasion-grid {
    gap: 14px;
  }
  .occasion-art img {
    height: 96px;
  }
  .search-box {
    width: min(360px, 40%);
  }
  .deco-search {
    right: -12px;
  }
  .deco-banner-left,
  .deco-banner-right {
    width: 36px;
    height: 36px;
  }
  .deco-banner-left {
    left: -24px;
  }
  .deco-banner-right {
    right: -24px;
  }
}
@media (max-width: 960px) {
  .occasion-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .occasion-art img {
    height: 112px;
  }
}
@media (max-width: 760px) {
  .page-content {
    width: auto;
    padding: 26px 18px 24px;
  }
  .page-heading {
    align-items: stretch;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 20px;
  }
  .page-heading h1 {
    font-size: clamp(30px, 8vw, 40px);
    margin-right: 28px;
  }
  .deco-heart {
    margin-left: 0;
  }
  .deco-heading {
    display: none;
  }
  .search-box {
    width: 100%;
    margin-bottom: 0;
  }
  .deco-search {
    display: none;
  }
  .occasion-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .occasion-card {
    min-height: 168px;
    padding: 12px 10px 14px;
    border-radius: 20px;
  }
  .occasion-art img {
    height: 88px;
  }
  .occasion-name {
    font-size: 18px;
    font-size: clamp(15px, 12.5cqi, 22px);
    padding: 2px 12px;
  }
  .occasion-description {
    font-size: 13.5px;
  }
  .selected-check {
    width: 26px;
    height: 26px;
    right: 10px;
    top: 10px;
  }
  .selected-check svg {
    width: 16px;
    height: 16px;
  }
  .group-banner {
    padding: 15px;
    gap: 12px;
    align-items: flex-start;
    flex-wrap: wrap;
    border-radius: 18px;
  }
  .deco-banner-left,
  .deco-banner-right {
    display: none;
  }
  .group-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }
  .group-copy {
    flex: 1 1 calc(100% - 60px);
  }
  .secondary-button {
    width: 100%;
    justify-content: center;
    margin-top: 2px;
  }
  .page-actions {
    margin-top: 28px;
  }
  .continue-button {
    min-width: 145px;
    padding: 14px 18px;
  }
}
@media (max-width: 360px) {
  .page-content {
    padding-inline: 14px;
  }
  .occasion-grid {
    grid-template-columns: 1fr;
  }
  .occasion-art img {
    height: 100px;
  }
  .page-actions {
    gap: 12px;
  }
  .continue-button {
    min-width: 130px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .occasion-card,
  .occasion-art img,
  .secondary-button,
  .secondary-button svg,
  .continue-button,
  .continue-button svg,
  .search-box input {
    transition: none;
  }
  .occasion-card:hover,
  .occasion-card:hover .occasion-art img,
  .secondary-button:hover,
  .continue-button:hover:not(:disabled) {
    transform: none;
  }
  .selected-check {
    animation: none;
  }
}
</style>