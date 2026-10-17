<template>
  <main class="package-page">
    <section class="package-heading">
      <div>
        <h1>Choose a package</h1>
        <p>Start simple or go all out. You can change this any time before paying.</p>
      </div>
      <span class="sample-prices">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
          <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        Sample prices
      </span>
    </section>

    <section class="package-grid" aria-label="Choose a package">
      <article
        v-for="packageOption in packages"
        :key="packageOption.id"
        class="package-card"
        :class="{
          selected: selectedPackageId === packageOption.id,
          popular: packageOption.isPopular,
        }"
        @click="selectPackage(packageOption)"
      >
        <span v-if="packageOption.isPopular" class="popular-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="m12 2 2.9 6 6.6 1-4.8 4.7 1.1 6.6-5.8-3.1-5.8 3.1 1.1-6.6L2.5 9l6.6-1L12 2Z"
            />
          </svg>
          Most popular
        </span>

        <span class="package-icon" :class="packageOption.tone" aria-hidden="true">
          <svg v-if="packageOption.icon === 'mail'" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path
              d="m4 7 8 6 8-6"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else-if="packageOption.icon === 'image'" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="4"
              width="18"
              height="16"
              rx="2"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <circle cx="8.5" cy="9" r="1.5" stroke="currentColor" stroke-width="1.6" />
            <path
              d="m4 17 5-5 3 3 3-4 5 6"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <path
              d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 15l1.1 3.1L23 19l-2.9 1-1.1 3-1-3-3-1 3-.9L19 15Z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>

        <h2>{{ packageOption.name }}</h2>
        <p class="package-description">{{ packageOption.description }}</p>
        <div class="package-price">
          <strong>₱{{ packageOption.price }}</strong>
          <span>one-time</span>
        </div>

        <ul class="feature-list">
          <li v-for="feature in packageFeatures(packageOption)" :key="feature.label">
            <svg
              v-if="feature.included"
              class="feature-check"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m5 12 4 4L19 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else class="feature-locked" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            <span :class="{ locked: !feature.included }">{{ feature.label }}</span>
          </li>
        </ul>

        <button
          class="choose-package-button"
          :class="{ 'selected-button': selectedPackageId === packageOption.id }"
          type="button"
          :aria-pressed="selectedPackageId === packageOption.id"
          @click.stop="selectPackage(packageOption)"
        >
          <template v-if="selectedPackageId === packageOption.id">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m5 12 4 4L19 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Selected
          </template>
          <template v-else>Choose</template>
        </button>
      </article>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { readOrderDraft, updateOrderDraft } from "@/utils/orderDraft";

const packages = [
  {
    id: "greeting-card",
    name: "Greeting Card",
    description: "One animated card with your message",
    price: 149,
    max_photos: 3,
    has_music: false,
    has_video: false,
    has_password: false,
    has_group: false,
    isPopular: false,
    icon: "mail",
    tone: "blue",
  },
  {
    id: "surprise-website",
    name: "Surprise Website",
    description: "A full page with photo and music",
    price: 299,
    max_photos: 10,
    has_music: true,
    has_video: false,
    has_password: true,
    has_group: false,
    isPopular: true,
    icon: "image",
    tone: "gold",
  },
  {
    id: "complete-surprise",
    name: "Complete Surprise",
    description: "Everything, plus video and group wishes",
    price: 449,
    max_photos: 20,
    has_music: true,
    has_video: true,
    has_password: true,
    has_group: true,
    isPopular: false,
    icon: "sparkles",
    tone: "blue",
  },
];

const savedPackageId = readOrderDraft().package_id;
const popularPackage = packages.find((packageOption) => packageOption.isPopular);
const selectedPackageId = ref(
  packages.some((packageOption) => packageOption.id === savedPackageId)
    ? savedPackageId
    : popularPackage.id,
);

updateOrderDraft({ package_id: selectedPackageId.value });

function packageFeatures(packageOption) {
  return [
    { label: "Personal message", included: true },
    { label: `Up to ${packageOption.max_photos} photos`, included: true },
    { label: "Background music", included: packageOption.has_music },
    { label: "Video clip", included: packageOption.has_video },
    { label: "Password lock", included: packageOption.has_password },
    { label: "Group messages", included: packageOption.has_group },
  ];
}

function selectPackage(packageOption) {
  selectedPackageId.value = packageOption.id;
  updateOrderDraft({ package_id: packageOption.id });
}
</script>

<style scoped>
.package-page {
  width: min(1384px, 90%);
  margin: 0 auto;
  padding: 30px 0 40px;
}
.package-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}
.package-heading h1 {
  margin: 0 0 4px;
  color: #1c2344;
  font-size: clamp(27px, 2.3vw, 35px);
  line-height: 1.2;
  font-weight: 900;
}
.package-heading p {
  margin: 0;
  color: #606981;
  font-size: 15px;
}
.sample-prices {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #eaf0ff;
  color: #3265df;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 800;
}
.sample-prices svg {
  width: 14px;
  height: 14px;
}
.package-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 18px;
}
.package-card {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  border: 1px solid #e9e1d3;
  border-radius: 16px;
  background: #fff;
  padding: 22px 20px 18px;
}
.package-card.popular {
  border: 2px solid #ffb629;
}
.package-card.selected:not(.popular) {
  border: 2px solid #3265df;
}
.popular-badge {
  position: absolute;
  top: -13px;
  left: 50%;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  background: #ffb629;
  color: #34280a;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
  transform: translateX(-50%);
}
.popular-badge svg {
  width: 13px;
  height: 13px;
}
.package-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  margin-bottom: 12px;
  border-radius: 11px;
}
.package-icon svg {
  width: 20px;
  height: 20px;
}
.package-icon.blue {
  background: #e8efff;
  color: #3265df;
}
.package-icon.gold {
  background: #fff3d4;
  color: #c78900;
}
.package-card h2 {
  margin: 0 0 3px;
  color: #1c2344;
  font-size: 18px;
  font-weight: 900;
}
.package-description {
  min-height: 21px;
  margin: 0;
  color: #65708a;
  font-size: 12px;
}
.package-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 13px 0 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9e1d3;
}
.package-price strong {
  color: #1c2344;
  font-size: 25px;
  font-weight: 900;
  line-height: 1;
}
.package-price span {
  color: #65708a;
  font-size: 11px;
}
.feature-list {
  display: grid;
  gap: 6px;
  margin: 0 0 15px;
  padding: 0;
  list-style: none;
}
.feature-list li {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
  color: #49536b;
  font-size: 12px;
  line-height: 1.4;
}
.feature-list li > span:first-of-type {
  min-width: 0;
}
.feature-check,
.feature-locked {
  width: 13px;
  height: 13px;
  flex: 0 0 13px;
}
.feature-check {
  color: #39964c;
}
.feature-locked {
  color: #a8afbd;
}
.feature-list .locked {
  color: #a1a8b6;
}
.choose-package-button {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: auto;
  border: 1px solid #d9d0c0;
  border-radius: 10px;
  background: #fff;
  color: #1c2344;
  font-size: 12px;
  font-weight: 800;
}
.choose-package-button:hover {
  border-color: #3265df;
}
.choose-package-button.selected-button {
  border-color: #ffb629;
  background: #ffb629;
}
.choose-package-button svg {
  width: 15px;
  height: 15px;
}
@media (max-width: 900px) {
  .package-page {
    width: 94%;
  }
  .package-grid {
    gap: 12px;
  }
  .package-card {
    padding-inline: 15px;
  }
}
@media (max-width: 680px) {
  .package-page {
    width: auto;
    padding: 26px 18px 32px;
  }
  .package-heading {
    align-items: flex-start;
  }
  .package-heading h1 {
    font-size: 28px;
  }
  .package-heading p {
    font-size: 13px;
    line-height: 1.5;
  }
  .sample-prices {
    padding: 6px 9px;
    font-size: 10px;
  }
  .package-grid {
    grid-template-columns: 1fr;
    gap: 22px;
  }
  .package-card {
    padding: 20px;
  }
  .package-description {
    min-height: 0;
  }
}
@media (max-width: 390px) {
  .package-page {
    padding-inline: 14px;
  }
  .package-heading {
    flex-direction: column;
    gap: 10px;
  }
}
</style>