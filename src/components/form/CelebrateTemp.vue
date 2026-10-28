<template>
  <main class="page-content">
    <section class="page-heading">
      <div class="heading-copy">
        <h1>
          What are we <span class="accent">celebrating?</span>
          <svg class="deco deco-heading" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <path
              d="M9 24c3-7 8-12 15-15M12 36l17-3"
              stroke="currentColor"
              stroke-width="5"
              stroke-linecap="round"
            />
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
          <path
            d="M17 31 9 19M24 28V12M31 31l8-12"
            stroke="currentColor"
            stroke-width="4.5"
            stroke-linecap="round"
          />
        </svg>
      </label>
    </section>

    <section class="occasion-grid" aria-label="Choose an occasion">
      <button
        v-for="occasion in filteredOccasions"
        :key="occasion.name"
        class="occasion-card"
        :class="[
          `fx-${occasion.fx}`,
          { selected: selectedOccasion === occasion.name, 'fx-play': playing === occasion.name },
        ]"
        type="button"
        :aria-pressed="selectedOccasion === occasion.name"
        @click="selectOccasion(occasion.name, occasion.action, occasion.fx)"
      >
        <span
          v-if="selectedOccasion === occasion.name"
          class="selected-check"
          aria-label="Selected"
        >
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
          <!-- maliliit na dekorasyon ng animation (confetti, puso, bituin) -->
          <span v-if="playing === occasion.name" :key="playKey" class="fx-layer" aria-hidden="true">
            <span
              v-for="(part, i) in FX_PARTS[occasion.fx]"
              :key="i"
              class="fx-part"
              :class="`fx-${part[0]}`"
              :style="{
                '--x': part[1] + '%',
                '--y': part[2] + '%',
                '--dx': part[3] + 'cqi',
                '--dy': part[4] + 'cqi',
                '--delay': part[5] + 'ms',
                '--c': part[6],
                '--rot': (part[7] || 0) + 'deg',
                '--dur': (part[8] || 900) + 'ms',
              }"
              >{{ FX_CHAR[part[0]] }}</span
            >
          </span>
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
        <path
          d="M17 31 9 19M24 28V12M31 31l8-12"
          stroke="currentColor"
          stroke-width="4.5"
          stroke-linecap="round"
        />
      </svg>
      <svg class="deco deco-banner-right" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M17 31 9 19M24 28V12M31 31l8-12"
          stroke="currentColor"
          stroke-width="4.5"
          stroke-linecap="round"
        />
      </svg>

      <span class="group-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32">
          <circle cx="16" cy="10" r="5" fill="#F59E2B" />
          <path d="M7.5 25c.6-5 4-8 8.5-8s7.9 3 8.5 8z" fill="#F59E2B" />
          <circle cx="7.5" cy="12.5" r="3.6" fill="#FBC15E" />
          <path
            d="M1.5 24c.4-3.8 2.8-6 6-6 1.3 0 2.4.3 3.3 1-1.9 1.4-3.1 3.2-3.6 5z"
            fill="#FBC15E"
          />
          <circle cx="24.5" cy="12.5" r="3.6" fill="#FBC15E" />
          <path
            d="M30.5 24c-.4-3.8-2.8-6-6-6-1.3 0-2.4.3-3.3 1 1.9 1.4 3.1 3.2 3.6 5z"
            fill="#FBC15E"
          />
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
    <ConFirm
      v-if="pendingOccasion"
      :template-name="pendingOccasion"
      message="Would you like to continue with this occasion?"
      cancel-label="Cancel"
      confirm-label="Continue"
      @cancel="cancelOccasionConfirmation"
      @confirm="continueToNext"
    />
  </main>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from "vue";
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

import ConFirm from "../dialog/ConFirm.vue";

const router = useRouter();
const selectedOccasion = ref("");
const selectedAction = ref("");
const searchQuery = ref("");
const pendingOccasion = ref("");
const savedDraft = readOrderDraft();
const navigating = ref(false);

/* ===== Animation ng bawat occasion =====
   FX_PARTS: [uri, x%, y%, galaw-x, galaw-y, delay(ms), kulay, ikot(deg), tagal(ms)]
   uri: heart | star | spark | confetti | petal  (x/y = simula sa loob ng larawan) */
const FX_CHAR = { heart: "♥", star: "★", spark: "✦", confetti: "", petal: "" };
const FX_PARTS = {
  // 1. Birthday — Cake Pop-Up Surprise: confetti at kislap sa ibabaw ng cake
  birthday: [
    ["confetti", 50, 30, -26, -16, 380, "#ffb629", 160],
    ["confetti", 50, 30, -12, -26, 420, "#ff8fab", -120],
    ["spark", 50, 28, 0, -30, 460, "#ffb629"],
    ["confetti", 50, 30, 13, -25, 400, "#3568f5", 140],
    ["confetti", 50, 30, 26, -15, 440, "#6cc4a1", -160],
  ],
  // 2. Monthsary — Floating Love: lumulutang ang heart balloons, may maliliit na pusong umaakyat
  monthsary: [
    ["heart", 26, 92, -4, -60, 150, "#ff8fab", 0, 1300],
    ["heart", 74, 92, 5, -66, 330, "#ff6f91", 0, 1300],
    ["heart", 50, 96, -2, -72, 520, "#ffb3c6", 0, 1300],
  ],
  // 3. Anniversary — Golden Clink: nagkikiskisan ang singsing, kumikinang, may kislap sa paligid
  anniversary: [
    ["spark", 50, 58, -36, -4, 460, "#ff8fab", 0, 850],
    ["spark", 50, 58, 36, -6, 500, "#7cc4ff", 0, 850],
    ["spark", 50, 58, -24, -30, 540, "#ffb629", 0, 850],
    ["spark", 50, 58, 26, -28, 580, "#ff8fab", 0, 850],
    ["heart", 50, 20, 0, -16, 640, "#ff6f91", 0, 900],
  ],
  // 4. Wedding — Bouquet Bloom: talulot at kislap na lumulutang
  wedding: [
    ["petal", 50, 50, -28, -14, 480, "#ffb3c6", 120],
    ["petal", 50, 50, 28, -16, 520, "#ffd9c7", -140],
    ["petal", 50, 50, -18, -30, 560, "#ff8fab", 90],
    ["spark", 50, 45, 20, -28, 600, "#ffb629"],
  ],
  // 5. Graduation — Cap Toss: gintong bituin pagbagsak ng cap
  graduation: [
    ["star", 50, 22, -26, -12, 420, "#ffb629"],
    ["star", 50, 22, 25, -16, 470, "#ffc94d"],
    ["star", 50, 22, -12, -26, 520, "#ffd166"],
    ["star", 50, 22, 13, -28, 560, "#ffb629"],
  ],
  // 6. Debut — Royal Crown Reveal: kislap na parang diamante
  debut: [
    ["spark", 50, 32, -20, -14, 600, "#7cc4ff"],
    ["spark", 50, 32, 20, -16, 660, "#ffb629"],
    ["spark", 50, 28, 0, -26, 720, "#ff8fab"],
  ],
  // 7. Baby & Reveal — Peekaboo Teddy: isang maliit na puso
  baby: [
    ["heart", 50, 34, 0, -26, 620, "#ff8fab", 0, 1000],
    ["spark", 28, 44, -8, -14, 720, "#8fb5ff"],
  ],
  // 8. Thank You — Heartfelt Letter: puso sa itaas ng sobre
  thanks: [
    ["heart", 52, 32, 0, -26, 600, "#ff6f91", 0, 1000],
    ["spark", 30, 40, -10, -16, 700, "#ffb629"],
    ["spark", 72, 38, 10, -18, 760, "#ffb629"],
  ],
  // 9. Congratulations — Trophy Celebration: bituin at confetti
  congrats: [
    ["star", 50, 40, -27, -16, 320, "#ffb629"],
    ["confetti", 50, 38, -14, -28, 360, "#ff8fab", 150],
    ["star", 50, 36, 0, -32, 400, "#3568f5"],
    ["confetti", 50, 38, 15, -27, 380, "#6cc4a1", -140],
    ["star", 50, 40, 27, -16, 440, "#ffb629"],
  ],
  // 10. Just Because — Mystery Gift: pusong lumulutang at kislap sa paligid
  smile: [
    ["heart", 50, 50, -30, -18, 300, "#ff8fab"],
    ["spark", 50, 50, 30, -16, 340, "#ffb629"],
    ["heart", 50, 50, -16, -32, 380, "#ff6f91"],
    ["spark", 50, 50, 18, -30, 420, "#b9a4ff"],
  ],
};

const playing = ref("");
const playKey = ref(0);
let playTimer = 0;
let startTimer = 0;

function playFx(name) {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  clearTimeout(playTimer);
  clearTimeout(startTimer);
  playing.value = "";
  // maliit na pagitan para mag-restart ang animation kahit pindutin ulit
  startTimer = setTimeout(() => {
    playing.value = name;
    playKey.value++;
    playTimer = setTimeout(() => (playing.value = ""), 2200);
  }, 30);
}
onBeforeUnmount(() => {
  clearTimeout(playTimer);
  clearTimeout(startTimer);
});

const occasions = [
  {
    name: "Birthday",
    description: "Any age, any style",
    pill: "yellow",
    image: birthdayWebp,
    alt: "Birthday cake with candles",
    action: "birthday",
    fx: "birthday",
  },
  {
    name: "Monthsary",
    description: "Little milestones",
    pill: "pink",
    image: monthsaryWebp,
    alt: "Pink heart balloons",
    action: "monthsary",
    fx: "monthsary",
  },
  {
    name: "Anniversary",
    description: "Years together",
    pill: "blue",
    image: anniversaryWebp,
    alt: "Two gold rings with a heart",
    action: "anniversary",
    fx: "anniversary",
  },
  {
    name: "Wedding",
    description: "For the couple",
    pill: "peach",
    image: weddingWebp,
    alt: "Wedding flower bouquet",
    action: "wedding",
    fx: "wedding",
  },
  {
    name: "Graduation",
    description: "Cheer their win",
    pill: "lavender",
    image: graduationWebp,
    alt: "Blue graduation cap",
    action: "graduation",
    fx: "graduation",
  },
  {
    name: "Debut",
    description: "The 18th",
    pill: "pink",
    image: debutWebp,
    alt: "Gold crown with a pink gem",
    action: "debut",
    fx: "debut",
  },
  {
    name: "Baby & reveal",
    description: "New arrivals",
    pill: "blue",
    image: babyWebp,
    alt: "Teddy bear with balloons",
    fx: "baby",
    action: "reveal",
  },
  {
    name: "Thank you",
    description: "Show gratitude",
    pill: "yellow",
    image: thankYouWebp,
    alt: "Envelope sealed with a heart",
    fx: "thanks",
    action: "thanks",
  },
  {
    name: "Congratulations",
    description: "Big or small wins",
    pill: "mint",
    image: congratsWebp,
    alt: "Gold trophy with confetti",
    action: "congrats",
    fx: "congrats",
  },
  {
    name: "Just because",
    description: "No reason needed",
    pill: "lavender",
    image: justBecauseWebp,
    alt: "Smiling yellow star",
    action: "smile",
    fx: "smile",
  },
];

const savedOccasion = occasions.find((occasion) => occasion.action === savedDraft.occasion);
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

function selectOccasion(name, action, fx) {
  selectedOccasion.value = name;
  if (fx) playFx(name);
  selectedAction.value = action;
  pendingOccasion.value = name;
  const occasion = action;
  const draft = readOrderDraft();
  updateOrderDraft({
    occasion,
    is_group: false,
    template_id: draft.occasion === occasion ? (draft.template_id ?? null) : null,
  });
}

function startGroupCard() {
  updateOrderDraft({
    ...(selectedAction.value ? { occasion: selectedAction.value } : {}),
    is_group: true,
  });
}

function cancelOccasionConfirmation() {
  pendingOccasion.value = "";
}

function continueToNext() {
  // iwas dobleng pindot
  if (!selectedOccasion.value || navigating.value) return;
  if (!selectedAction.value) {
    // statusMessage.value = `${selectedOccasion.value} is not available yet.`;
    return;
  }
  updateOrderDraft({
    occasion: `${selectedAction.value}`,
    is_group: false,
    template_id: null,
  });
  navigating.value = true;
  // maikling pagitan para makita ang pindot (scale + arrow) bago lumipat
  setTimeout(() => router.push(`/create/${selectedAction.value}`), 160);
  return;

  // statusMessage.value = `You selected ${selectedOccasion.value}. Next: choose a template.`;
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
.occasion-card.selected:hover {
  transform: translateY(-4px) scale(1.02);
}
.occasion-card:focus-visible {
  outline: 3px solid #9bb7ff;
  outline-offset: 3px;
}
.occasion-card.selected {
  transform: scale(1.02);
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
  position: relative;
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
.pill-yellow {
  --pill: #ffeaa8;
}
.pill-pink {
  --pill: #ffd3df;
}
.pill-blue {
  --pill: #d3e2ff;
}
.pill-peach {
  --pill: #ffd9c7;
}
.pill-lavender {
  --pill: #e2dbff;
}
.pill-mint {
  --pill: #cdeedc;
}
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
}
@media (prefers-reduced-motion: reduce) {
  .occasion-card,
  .occasion-art img,
  .secondary-button,
  .secondary-button svg,
  .search-box input {
    transition: none;
  }
  .occasion-card:hover,
  .occasion-card:hover .occasion-art img,
  .secondary-button:hover,
  .continue-button:hover:not(:disabled) {
    transform: none;
  }
  .selected-check,
  .continue-button.ready,
  .fx-play .occasion-art img {
    animation: none !important;
  }
  .occasion-card.selected,
  .occasion-card.selected:hover,
  .continue-button:active:not(:disabled),
  .continue-button.going {
    transform: none;
  }
  .fx-layer {
    display: none;
  }
}
</style>
