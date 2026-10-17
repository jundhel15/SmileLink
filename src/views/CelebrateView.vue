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
          <div
            class="progress-step"
            :class="{ current: index === activeStep, complete: index < activeStep }"
          >
            <span class="step-number">{{ index < activeStep ? "✓" : index + 1 }}</span>
            <span class="step-label">{{ step }}</span>
          </div>
          <span
            v-if="index < steps.length - 1"
            class="step-line"
            :class="{ complete: index < activeStep }"
            aria-hidden="true"
          ></span>
        </template>
      </div>
    </nav>

    <BirthdayTemp v-if="isTemplateStep" />
    <CelebrateTemp v-else />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import BirthdayTemp from "@/components/form/BirthdayTemp.vue";
import CelebrateTemp from "@/components/form/CelebrateTemp.vue";

const route = useRoute();
const isTemplateStep = computed(() => route.name === "birthday-template");
const activeStep = computed(() => (isTemplateStep.value ? 1 : 0));
const steps = ["Celebration", "Template", "Package", "Recipient", "Content", "Review & pay"];
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
.progress-step.complete {
  color: #398f48;
  font-weight: 800;
}
.progress-step.complete .step-number {
  color: #fff;
  background: #43a047;
  border-color: #43a047;
}
.step-line {
  height: 2px;
  width: clamp(12px, 5.3vw, 100px);
  background: #e8e0d2;
  flex: 1;
}
.step-line.complete {
  background: #43a047;
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
}
@media (max-width: 390px) {
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
