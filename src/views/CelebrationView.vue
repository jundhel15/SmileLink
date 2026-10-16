<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="SmileLink home" @click.prevent>
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <path
              d="M9 22c4-8 8 8 13 8s9-12 14-8"
              stroke="white"
              stroke-width="4"
              stroke-linecap="round"
            />
            <circle cx="9" cy="21" r="3.5" stroke="white" stroke-width="3" />
            <circle cx="36" cy="21" r="3.5" stroke="white" stroke-width="3" />
            <path
              d="M38 7l1.7 4.3L44 13l-4.3 1.7L38 19l-1.7-4.3L32 13l4.3-1.7L38 7Z"
              fill="#FFB629"
            />
          </svg>
        </span>
        <span class="brand-name">Smile<span>Link</span></span>
      </a>

      <nav class="main-nav" aria-label="Main navigation">
        <a class="active" href="#" @click.prevent>Create</a>
        <a href="#" @click.prevent>Templates</a>
        <a href="#" @click.prevent>Pricing</a>
        <a href="#" @click.prevent>How it works</a>
      </nav>

      <div class="account-actions">
        <a class="orders" href="#" @click.prevent><span aria-hidden="true">▣</span> My orders</a>
        <button class="avatar" type="button" aria-label="Account">J</button>
      </div>
    </header>

    <nav class="progress-nav" aria-label="Creation progress">
      <div class="progress-track">
        <template v-for="(step, index) in steps" :key="step">
          <div class="progress-step" :class="{ current: index === activeStep }">
            <span class="step-number">{{ index + 1 }}</span>
            <span class="step-label">{{ step }}</span>
          </div>
          <span v-if="index < steps.length - 1" class="step-line" aria-hidden="true"></span>
        </template>
      </div>
    </nav>

    <main class="page-content">
      <section class="page-heading">
        <div>
          <h1>What are we celebrating?</h1>
          <p>Pick an occasion. You can change it later.</p>
        </div>
        <label class="search-box">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.8" />
            <path d="m16 16 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search occasions"
            aria-label="Search occasions"
          />
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
          <span
            v-if="selectedOccasion === occasion.name"
            class="selected-check"
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

          <span class="occasion-icon" :class="occasion.tone" aria-hidden="true">
            <svg v-if="occasion.icon === 'cake'" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12h16v8H4zM3 20h18M7 12V9m5 3V9m5 3V9M6 6v1m6-1v1m6-1v1M4 16h16"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 9a2 2 0 0 1 4 0 2 2 0 0 1 4 0"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            <svg v-else-if="occasion.icon === 'heart'" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else-if="occasion.icon === 'diamond'" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 3h12l4 6-10 12L2 9zM2 9h20M6 3l6 18 6-18"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else-if="occasion.icon === 'sparkles'" viewBox="0 0 24 24" fill="none">
              <path
                d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8zM19 2v4m-2-2h4M5 17v5m-2.5-2.5h5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else-if="occasion.icon === 'graduation'" viewBox="0 0 24 24" fill="none">
              <path
                d="m2 9 10-5 10 5-10 5zM6 11v5c4 3 8 3 12 0v-5M22 9v6"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else-if="occasion.icon === 'star'" viewBox="0 0 24 24" fill="none">
              <path
                d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else-if="occasion.icon === 'baby'" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4a8 8 0 1 0 8 8M8 11h.01M15 11h.01M9 15c2 2 4 2 6 0M10 3l2 2 2-2M3 12H1m22 0h-2"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else-if="occasion.icon === 'hand'" viewBox="0 0 24 24" fill="none">
              <path
                d="m8 13 3-3a2 2 0 0 1 3 3l-3 3M8 13l-2-2a2 2 0 0 0-3 3l5 5h6l7-7a2 2 0 0 0-3-3l-4 4M13 6l2-2a2 2 0 0 1 3 3l-3 3"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else-if="occasion.icon === 'trophy'" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 21h8m-4-4v4M7 4h10v6a5 5 0 0 1-10 0zM7 6H3v2a5 5 0 0 0 5 5m9-7h4v2a5 5 0 0 1-5 5"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
              <path
                d="M8 10h.01M16 10h.01M8 14c2 3 6 3 8 0"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span class="occasion-name">{{ occasion.name }}</span>
          <span class="occasion-description">{{ occasion.description }}</span>
        </button>

        <p v-if="filteredOccasions.length === 0" class="empty-state">
          No occasions found. Try another search.
        </p>
      </section>

      <aside class="group-banner">
        <span class="group-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <div class="group-copy">
          <strong>Collecting wishes from many people?</strong>
          <p>
            Start a group card and invite friends and family to add their messages before it is
            sent.
          </p>
        </div>
        <button class="secondary-button" type="button" @click="startGroupCard">
          Start a group card
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
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const activeStep = ref(0);
const selectedOccasion = ref("");
const searchQuery = ref("");
const statusMessage = ref("");
const Celebrate_action = ref("");

const steps = ["Celebration", "Template", "Package", "Recipient", "Content", "Review & pay"];

const occasions = [
  {
    name: "Birthday",
    description: "Any age, any style",
    icon: "cake",
    tone: "blue",
    action: "/birthday",
  },
  {
    name: "Monthsary",
    description: "Little milestones",
    icon: "heart",
    tone: "gold",
    action: "/monthsary",
  },
  {
    name: "Anniversary",
    description: "Years together",
    icon: "diamond",
    tone: "blue",
    action: "/anniversary",
  },
  {
    name: "Wedding",
    description: "For the couple",
    icon: "sparkles",
    tone: "gold",
    action: "/wedding",
  },
  {
    name: "Graduation",
    description: "Cheer their win",
    icon: "graduation",
    tone: "blue",
    action: "/graduation",
  },
  { name: "Debut", description: "The 18th", icon: "star", tone: "gold", action: "/debut" },
  {
    name: "Baby & reveal",
    description: "New arrivals",
    icon: "baby",
    tone: "blue",
    action: "reveal",
  },
  {
    name: "Thank you",
    description: "Show gratitude",
    icon: "hand",
    tone: "gold",
    action: "thanks",
  },
  {
    name: "Congratulations",
    description: "Big or small wins",
    icon: "trophy",
    tone: "blue",
    action: "/congratulation",
  },
  {
    name: "Just because",
    description: "No reason needed",
    icon: "smile",
    tone: "gold",
    action: "/smile",
  },
];

const filteredOccasions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return occasions.filter((occasion) =>
    `${occasion.name} ${occasion.description}`.toLowerCase().includes(query),
  );
});

function selectOccasion(name, action) {
  console.log(action);
  selectedOccasion.value = name;
  Celebrate_action.value = action;
  statusMessage.value = "";
}

function startGroupCard() {
  statusMessage.value = "Group card selected. You can invite friends and family in the next step.";
}

function cancelSelection() {
  selectedOccasion.value = "";
  searchQuery.value = "";
  //   statusMessage.value = "Selection cleared. Choose an occasion to continue.";
}

function continueToNext() {
  if (!selectedOccasion.value && !Celebrate_action.value) return;
  //   console.log(Celebrate_action.value);
  //   statusMessage.value = `You selected ${selectedOccasion.value}. Next: choose a template.`;
}
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800;900&display=swap");

:root {
  font-family:
    "Nunito Sans",
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  color: #1c2344;
  background: #fffbf3;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-optical-sizing: auto;
}

* {
  box-sizing: border-box;
}
html {
  min-width: 320px;
}
body {
  margin: 0;
  min-width: 320px;
}
button,
input,
a {
  font: inherit;
}
button {
  cursor: pointer;
}
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid #9bb7ff;
  outline-offset: 3px;
}
.app-shell {
  min-height: 100vh;
  background: #fffbf3;
}

.topbar {
  min-height: 77px;
  display: flex;
  align-items: center;
  gap: 42px;
  padding: 12px 3.1%;
  background: #fff;
  border-bottom: 1px solid #e9e1d3;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  text-decoration: none;
  white-space: nowrap;
}
.brand-mark {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #3265df;
  flex: 0 0 auto;
}
.brand-mark svg {
  width: 31px;
  height: 31px;
}
.brand-name {
  color: #1c2344;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: -1px;
}
.brand-name span {
  color: #3265df;
}
.main-nav {
  display: flex;
  align-items: center;
  gap: 34px;
  flex: 1;
}
.main-nav a,
.orders {
  color: #606981;
  text-decoration: none;
  white-space: nowrap;
}
.main-nav a.active {
  color: #1c2344;
  font-weight: 800;
}
.main-nav a:hover,
.orders:hover {
  color: #3265df;
}
.account-actions {
  display: flex;
  align-items: center;
  gap: 22px;
}
.orders {
  display: flex;
  align-items: center;
  gap: 9px;
}
.avatar {
  width: 41px;
  height: 41px;
  border: 0;
  border-radius: 50%;
  background: #ffb629;
  color: #34280a;
  font-weight: 900;
}

.progress-nav {
  background: #fff;
  border-bottom: 1px solid #e9e1d3;
  padding: 0 5%;
}
.progress-track {
  max-width: 1500px;
  min-height: 85px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.progress-step {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  color: #606981;
  white-space: nowrap;
}
.step-number {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 50%;
  border: 1px solid #d7cebd;
  display: grid;
  place-items: center;
  background: #fff;
}
.progress-step.current {
  color: #1c2344;
  font-weight: 800;
}
.progress-step.current .step-number {
  color: #fff;
  background: #3265df;
  border-color: #3265df;
}
.step-line {
  height: 2px;
  width: clamp(12px, 5.3vw, 100px);
  background: #e8e0d2;
  flex: 1;
}

.page-content {
  width: min(1384px, 90%);
  margin: 0 auto;
  padding: 34px 0 30px;
}
.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 25px;
}
.page-heading h1 {
  margin: 0 0 7px;
  font-size: clamp(28px, 2.35vw, 36px);
  line-height: 1.18;
  letter-spacing: -1px;
  font-weight: 900;
}
.page-heading p {
  color: #606981;
  margin: 0;
  font-size: 18px;
}
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: min(385px, 34%);
  flex-shrink: 0;
}
.search-box svg {
  position: absolute;
  left: 17px;
  width: 21px;
  height: 21px;
  color: #606981;
  pointer-events: none;
}
.search-box input {
  width: 100%;
  height: 56px;
  border: 1px solid #dfd5c4;
  border-radius: 13px;
  background: #fff;
  padding: 0 16px 0 50px;
  color: #1c2344;
  outline: none;
}
.search-box input::placeholder {
  color: #8a91a4;
}
.search-box input:focus {
  border-color: #3265df;
  box-shadow: 0 0 0 3px #3265df18;
}

.occasion-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 21px;
}
.occasion-card {
  position: relative;
  min-width: 0;
  min-height: 180px;
  text-align: left;
  border: 1px solid #e9e1d3;
  border-radius: 20px;
  background: #fff;
  padding: 24px 22px;
  color: #1c2344;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.15s;
}
.occasion-card:hover {
  border-color: #9cb7ff;
  transform: translateY(-1px);
}
.occasion-card.selected {
  border: 2px solid #3265df;
  padding: 23px 21px;
  box-shadow: 0 0 0 4px #3265df15;
}
.occasion-icon {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  margin-bottom: 15px;
}
.occasion-icon svg {
  width: 31px;
  height: 31px;
}
.occasion-icon.blue {
  background: #e8efff;
  color: #2d67e9;
}
.occasion-icon.gold {
  background: #fff3d4;
  color: #c78900;
}
.occasion-name {
  display: block;
  font-size: 19px;
  font-weight: 800;
  margin-bottom: 5px;
  letter-spacing: -0.25px;
}
.occasion-description {
  display: block;
  color: #65708a;
  font-size: 15.5px;
}
.selected-check {
  position: absolute;
  top: 17px;
  right: 17px;
  width: 31px;
  height: 31px;
  border-radius: 50%;
  background: #3265df;
  display: grid;
  place-items: center;
}
.selected-check svg {
  width: 20px;
  height: 20px;
}
.empty-state {
  grid-column: 1 / -1;
  padding: 28px;
  text-align: center;
  color: #65708a;
}

.group-banner {
  margin-top: 24px;
  background: #fff4d6;
  border: 1px solid #ffda82;
  border-radius: 19px;
  padding: 17px 23px;
  display: flex;
  align-items: center;
  gap: 18px;
}
.group-icon {
  width: 53px;
  height: 53px;
  border-radius: 15px;
  background: #fff;
  color: #c78900;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.group-icon svg {
  width: 27px;
  height: 27px;
}
.group-copy {
  flex: 1;
  min-width: 0;
}
.group-copy strong {
  display: block;
  font-size: 18px;
  margin-bottom: 3px;
}
.group-copy p {
  margin: 0;
  color: #65708a;
  font-size: 15.5px;
  line-height: 1.5;
}
.secondary-button {
  background: #fff;
  border: 1px solid #d9d0c0;
  border-radius: 12px;
  padding: 12px 19px;
  color: #1c2344;
  font-weight: 800;
  white-space: nowrap;
}
.secondary-button:hover {
  border-color: #3265df;
}
.page-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 75px;
}
.cancel-button {
  border: 0;
  background: transparent;
  color: #3265df;
  font-weight: 800;
  padding: 12px 10px;
}
.continue-button {
  border: 0;
  border-radius: 14px;
  background: #3265df;
  color: #fff;
  padding: 17px 27px;
  min-width: 171px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.continue-button:hover:not(:disabled) {
  background: #2457cf;
}
.continue-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.continue-button svg {
  width: 20px;
  height: 20px;
}
.status-message {
  margin: 12px 0 0;
  color: #65708a;
  text-align: right;
  font-size: 13px;
}

@media (max-width: 1100px) {
  .topbar {
    gap: 25px;
    padding-inline: 3%;
  }
  .main-nav {
    gap: 20px;
  }
  .progress-nav {
    padding-inline: 3%;
  }
  .progress-step {
    gap: 7px;
    font-size: 14px;
  }
  .step-line {
    width: clamp(8px, 2vw, 30px);
  }
  .page-content {
    width: 94%;
  }
  .occasion-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .occasion-card {
    min-height: 165px;
  }
  .page-actions {
    margin-top: 45px;
  }
}

@media (max-width: 760px) {
  .topbar {
    min-height: 68px;
    padding: 13px 18px;
    flex-wrap: wrap;
    gap: 14px;
  }
  .brand-name {
    font-size: 21px;
  }
  .main-nav {
    order: 3;
    flex-basis: 100%;
    overflow-x: auto;
    gap: 25px;
    padding: 2px 0 4px;
  }
  .account-actions {
    margin-left: auto;
    gap: 12px;
  }
  .orders {
    font-size: 14px;
  }
  .avatar {
    width: 36px;
    height: 36px;
  }
  .progress-nav {
    padding: 12px 18px;
  }
  .progress-track {
    min-height: 0;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 3px;
  }
  .progress-step {
    gap: 7px;
    font-size: 13px;
  }
  .step-number {
    width: 30px;
    height: 30px;
    flex-basis: 30px;
  }
  .step-line {
    width: 20px;
    min-width: 20px;
  }
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
    font-size: 29px;
  }
  .page-heading p {
    font-size: 16px;
    line-height: 1.5;
  }
  .search-box {
    width: 100%;
  }
  .occasion-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .occasion-card {
    min-height: 155px;
    padding: 16px;
    border-radius: 16px;
  }
  .occasion-card.selected {
    padding: 15px;
  }
  .occasion-icon {
    width: 49px;
    height: 49px;
    border-radius: 14px;
    margin-bottom: 12px;
  }
  .occasion-icon svg {
    width: 26px;
    height: 26px;
  }
  .occasion-name {
    font-size: 16px;
  }
  .occasion-description {
    font-size: 13px;
    line-height: 1.4;
  }
  .selected-check {
    width: 25px;
    height: 25px;
    right: 10px;
    top: 10px;
  }
  .selected-check svg {
    width: 17px;
    height: 17px;
  }
  .group-banner {
    padding: 15px;
    gap: 12px;
    align-items: flex-start;
    flex-wrap: wrap;
    border-radius: 16px;
  }
  .group-icon {
    width: 45px;
    height: 45px;
    border-radius: 13px;
  }
  .group-copy {
    flex: 1 1 calc(100% - 60px);
  }
  .group-copy strong {
    font-size: 16px;
    line-height: 1.35;
  }
  .group-copy p {
    font-size: 13px;
    line-height: 1.5;
  }
  .secondary-button {
    width: 100%;
    margin-top: 2px;
    padding: 12px;
  }
  .page-actions {
    margin-top: 32px;
  }
  .continue-button {
    min-width: 145px;
    padding: 14px 18px;
  }
}
@media (max-width: 390px) {
  .page-content {
    padding-inline: 14px;
  }
  .occasion-grid {
    grid-template-columns: 1fr;
  }
  .occasion-card {
    min-height: 125px;
  }
  .occasion-icon {
    float: left;
  }
  .page-actions {
    gap: 12px;
  }
  .continue-button {
    min-width: 130px;
  }
  .orders {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition: none !important;
  }
}
</style>
