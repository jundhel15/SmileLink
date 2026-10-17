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
        <a class="active" href="#" aria-current="page" @click.prevent>Create</a>
        <a href="#" @click.prevent>Templates</a>
        <a href="#" @click.prevent>Pricing</a>
        <a href="#" @click.prevent>How it works</a>
      </nav>

      <div class="account-actions">
        <button class="avatar" type="button" aria-label="Account menu">
          <span class="avatar-circle" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="8.5" r="4" />
              <path d="M4.5 20c.8-3.8 3.9-6 7.5-6s6.7 2.2 7.5 6z" />
            </svg>
          </span>
          <svg class="avatar-chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>

    <nav class="progress-nav" aria-label="Creation progress">
      <div class="progress-track">
        <template v-for="(step, index) in steps" :key="step">
          <div
            class="progress-step"
            :class="{ current: index === activeStep, complete: index < activeStep }"
            :aria-current="index === activeStep ? 'step' : undefined"
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
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wdth,wght@75..125,300..700&family=Nunito:wght@400;500;600;700;800&display=swap");

/* ===== SmileLink design tokens ===== */
:root {
  --sl-navy: #192448;
  --sl-blue: #3264e8;
  --sl-blue-dark: #2654d1;
  --sl-muted: #5f6880;
  --sl-cream: #fffaf2;
  --sl-line: #ece4d6;
  --sl-yellow: #ffb629;
  /* display: Fredoka na pinakitid (title, pangalan ng card, banner, buttons) */
  --sl-font-display: "Fredoka", ui-rounded, system-ui, -apple-system, "Segoe UI", sans-serif;
  --sl-display-stretch: 86%;
  /* body: Nunito (menu, stepper, subtitle, description, search) */
  --sl-font-body: "Nunito", ui-rounded, system-ui, -apple-system, "Segoe UI", sans-serif;
  --sl-shadow-soft: 0 6px 18px rgba(120, 92, 40, 0.07);
  --sl-shadow-lift: 0 14px 30px rgba(120, 92, 40, 0.12);

  font-family: var(--sl-font-body);
  color: var(--sl-navy);
  background: var(--sl-cream);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
  overflow-x: clip;
  background:
    radial-gradient(1200px 500px at 85% 0%, rgba(255, 232, 196, 0.35), transparent 60%),
    radial-gradient(900px 500px at 0% 100%, rgba(255, 236, 214, 0.4), transparent 60%),
    var(--sl-cream);
}

/* ===== Top navigation ===== */
.topbar {
  min-height: 76px;
  display: flex;
  align-items: center;
  gap: 52px;
  padding: 10px 4.4%;
  background: #fffdf8;
  border-bottom: 1px solid var(--sl-line);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  white-space: nowrap;
}
.brand-mark {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--sl-blue);
  flex: 0 0 auto;
}
.brand-mark svg {
  width: 31px;
  height: 31px;
}
.brand-name {
  font-family: var(--sl-font-display);
  color: var(--sl-navy);
  font-size: 25px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1;
}
.brand-name span {
  color: var(--sl-blue);
}
.main-nav {
  display: flex;
  align-items: stretch;
  align-self: stretch;
  gap: 36px;
  flex: 1;
}
.main-nav a {
  display: flex;
  align-items: center;
  color: var(--sl-muted);
  text-decoration: none;
  white-space: nowrap;
  font-size: 16.5px;
  font-weight: 500;
}
.main-nav a {
  position: relative;
}
.main-nav a.active {
  color: var(--sl-navy);
  font-weight: 700;
}
.main-nav a.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -10px;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--sl-blue);
}
.main-nav a:hover {
  color: var(--sl-blue);
}
.account-actions {
  display: flex;
  align-items: center;
  gap: 22px;
}
.avatar {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 0;
  padding: 0;
  background: none;
  color: var(--sl-muted);
}
.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e5edff;
  color: var(--sl-blue);
  box-shadow: inset 0 0 0 1px #d5e1ff;
}
.avatar-circle svg {
  width: 22px;
  height: 22px;
}
.avatar-chevron {
  width: 18px;
  height: 18px;
}

/* ===== Progress stepper ===== */
.progress-nav {
  background: #fffdf8;
  border-bottom: 1px solid var(--sl-line);
  padding: 0 8%;
}
.progress-track {
  max-width: 1320px;
  min-height: 70px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.progress-step {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: #4560a8;
  font-size: 14.5px;
  font-weight: 500;
  white-space: nowrap;
}
.step-number {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 50%;
  border: 1.5px solid #ddd5c6;
  display: grid;
  place-items: center;
  background: #fff;
  color: #2e3d6b;
  font-weight: 600;
  font-size: 16px;
  line-height: 1;
}
.progress-step.current {
  color: var(--sl-navy);
  font-size: 16px;
  font-weight: 600;
}
.progress-step.current .step-number {
  color: #fff;
  background: var(--sl-blue);
  border-color: var(--sl-blue);
  box-shadow: 0 4px 10px rgba(50, 100, 232, 0.25);
}
.progress-step.complete {
  color: #398f48;
  font-weight: 700;
}
.progress-step.complete .step-number {
  color: #fff;
  background: #43a047;
  border-color: #43a047;
}
.step-line {
  height: 1px;
  width: clamp(12px, 5.3vw, 100px);
  background: #e6ddcd;
  flex: 1;
}
.step-line.complete {
  background: #43a047;
}

@media (max-width: 1100px) {
  .topbar {
    gap: 28px;
    padding-inline: 3%;
  }
  .main-nav {
    gap: 22px;
  }
  .progress-nav {
    padding-inline: 3%;
  }
  .progress-step {
    gap: 8px;
    font-size: 13.5px;
  }
  .step-number {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }
  .step-line {
    width: clamp(8px, 2vw, 30px);
  }
}
@media (max-width: 760px) {
  .topbar {
    min-height: 68px;
    padding: 12px 18px 0;
    flex-wrap: wrap;
    gap: 12px;
  }
  .brand-name {
    font-size: 21px;
  }
  .main-nav {
    order: 3;
    flex-basis: 100%;
    overflow-x: auto;
    gap: 24px;
    padding: 4px 0 12px;
  }
  .main-nav a.active::after {
    bottom: -12px;
  }
  .account-actions {
    margin-left: auto;
    gap: 12px;
  }
  .avatar-circle {
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
    flex: 0 0 auto;
  }
  .step-number {
    width: 32px;
    height: 32px;
    flex-basis: 32px;
    font-size: 14px;
  }
  .progress-step.current {
    font-size: 14px;
  }
  .step-line {
    flex: 0 0 20px;
    width: 20px;
    min-width: 20px;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition: none !important;
    animation: none !important;
  }
}
</style>