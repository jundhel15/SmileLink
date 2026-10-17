<template>
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
        <span v-if="selectedOccasion === occasion.name" class="selected-check" aria-label="Selected">
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
          Start a group card and invite friends and family to add their messages before it is sent.
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
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { readOrderDraft, updateOrderDraft } from "@/utils/orderDraft";

const router = useRouter();
const selectedOccasion = ref("");
const selectedAction = ref("");
const searchQuery = ref("");
const statusMessage = ref("");
const savedDraft = readOrderDraft();

const occasions = [
  { name: "Birthday", description: "Any age, any style", icon: "cake", tone: "blue", action: "/birthday" },
  { name: "Monthsary", description: "Little milestones", icon: "heart", tone: "gold", action: "/monthsary" },
  { name: "Anniversary", description: "Years together", icon: "diamond", tone: "blue", action: "/anniversary" },
  { name: "Wedding", description: "For the couple", icon: "sparkles", tone: "gold", action: "/wedding" },
  { name: "Graduation", description: "Cheer their win", icon: "graduation", tone: "blue", action: "/graduation" },
  { name: "Debut", description: "The 18th", icon: "star", tone: "gold", action: "/debut" },
  { name: "Baby & reveal", description: "New arrivals", icon: "baby", tone: "blue", action: "reveal" },
  { name: "Thank you", description: "Show gratitude", icon: "hand", tone: "gold", action: "thanks" },
  { name: "Congratulations", description: "Big or small wins", icon: "trophy", tone: "blue", action: "/congratulation" },
  { name: "Just because", description: "No reason needed", icon: "smile", tone: "gold", action: "/smile" },
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
  color: #1c2344;
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
}
</style>