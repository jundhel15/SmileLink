<template>
  <main class="landing">
    <header class="brand" aria-label="SmileLink home">
      <div class="brand-mark" aria-hidden="true">
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
      </div>
      <span class="brand-name">Smile<span>Link</span></span>
    </header>

    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow"><span class="sparkle">✧</span> Now open</div>
        <h1>
          <span class="h-line h-line-1">Turn a link</span><br />
          <span class="h-line h-line-2">into a <span class="smile-word">smile.</span></span>
        </h1>
        <p class="description">
          Personalized surprise websites and greeting cards for birthdays, monthsaries, weddings and
          more.
        </p>

        <RouterLink class="cta" to="/celebrate">
          Create yours today
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 12h15M13 5l7 7-7 7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </RouterLink>
      </div>

      <div class="hero-art" aria-label="Preview of a birthday greeting website">
        <div class="blue-orb"></div>
        <div class="yellow-orb"></div>

        <div class="phone-float">
          <div class="phone">
            <div class="phone-screen">
              <FrontBdayCake :happy="celebrating" />
              <div class="greeting">
                <h2>Happy Birthday,<br />Maria!</h2>
                <p>Someone special made this just for you.</p>
                <button type="button" class="open-button" @click="openSurprise">
                  Open your surprise
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="notice notice-open">
          <span class="heart-icon">♡</span>
          <span>Opened just now</span>
        </div>
        <div class="notice notice-sent">
          <span class="check-icon">✓</span>
          <span>Link sent to Maria</span>
        </div>

        <div class="burst-layer" aria-hidden="true">
          <template v-for="burst in bursts" :key="burst.id">
            <span
              v-for="piece in burst.pieces"
              :key="piece.id"
              class="burst-piece"
              :class="piece.kind"
              :style="piece.style"
              >{{ piece.kind === "heart" ? "♥" : "" }}</span
            >
          </template>
        </div>
      </div>
    </section>
    <span id="create" class="sr-only">Create your SmileLink surprise</span>
  </main>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";
import FrontBdayCake from "@/components/FrontBdayCake.vue";

/* ===== Surprise burst (confetti, puso, kislap) ===== */
const COLORS = ["#ffb629", "#ff887b", "#3265df", "#ff9eb1", "#6cc4a1"];
const KINDS = ["confetti", "heart", "confetti", "sparkle"];
const PIECES = 22;

const bursts = ref([]);
const celebrating = ref(false);
const timers = new Set();
let nextId = 0;

function later(fn, ms) {
  const t = setTimeout(() => {
    timers.delete(t);
    fn();
  }, ms);
  timers.add(t);
}

function openSurprise() {
  // cake reaction (restart kahit pindutin ulit)
  celebrating.value = false;
  later(() => (celebrating.value = true), 20);
  later(() => (celebrating.value = false), 950);

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const id = nextId++;
  const pieces = Array.from({ length: PIECES }, (_, i) => {
    const angle = (i / PIECES) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 120 + Math.random() * 90;
    return {
      id: `${id}-${i}`,
      kind: KINDS[i % KINDS.length],
      style: {
        "--dx": `${Math.round(Math.cos(angle) * dist)}px`,
        "--dy": `${Math.round(Math.sin(angle) * dist - 50)}px`,
        "--rot": `${Math.round(Math.random() * 540 - 270)}deg`,
        "--c": COLORS[i % COLORS.length],
        "--delay": `${Math.round(Math.random() * 90)}ms`,
      },
    };
  });

  bursts.value.push({ id, pieces });
  if (bursts.value.length > 3) bursts.value.shift();
  later(() => {
    bursts.value = bursts.value.filter((b) => b.id !== id);
  }, 1500);
}

onBeforeUnmount(() => {
  timers.forEach(clearTimeout);
  timers.clear();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wdth,wght@75..125,300..700&family=Nunito:wght@400;500;600;700;800&display=swap");

/* =========================================================
   SmileLink landing — kasya sa ISANG screen sa lahat ng device
   - Laging 100% ng taas ng screen ang page (100svh), walang scroll
   - Laki ng text: sumusunod sa lapad AT taas ng screen (min(vw, svh))
   - Phone mockup: kinukuha ang natitirang espasyo at sumasakto doon
   ========================================================= */

/* ===== FONTS (pareho sa Celebrate page) ===== */
.landing {
  --display: "Fredoka", ui-rounded, system-ui, -apple-system, "Segoe UI", sans-serif;
  --stretch: 86%;
  --body: "Nunito", ui-rounded, system-ui, -apple-system, "Segoe UI", sans-serif;
  --navy: #1c2344;
  --blue: #3265df;
  --yellow: #ffb629;
  font-family: var(--body);
  color: var(--navy);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
* {
  box-sizing: border-box;
}
button,
a {
  font: inherit;
}

/* ===== PAGE: eksaktong taas ng screen ===== */
.landing {
  position: relative;
  height: 100vh;
  height: 100svh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  padding: clamp(14px, 4svh, 48px) clamp(18px, 6vw, 110px) clamp(10px, 3svh, 40px);
}

/* ===== LOGO ===== */
.brand {
  position: relative;
  z-index: 2;
  flex: none;
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.4svh, 14px);
  width: fit-content;
}
.brand-mark {
  width: clamp(34px, 6.6svh, 62px);
  height: clamp(34px, 6.6svh, 62px);
  display: grid;
  place-items: center;
  border-radius: 28%;
  background: var(--blue);
}
.brand-mark svg {
  width: 73%;
  height: 73%;
}
.brand-name {
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: clamp(21px, min(2.5vw, 4.4svh), 42px);
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--navy);
}
.brand-name span {
  color: var(--blue);
}

/* ===== HERO: 2 column (PC / laptop / tablet na pahiga) ===== */
.hero {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  max-width: 1720px;
  margin: clamp(8px, 2svh, 28px) auto 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr);
  align-items: center;
  gap: 3vw;
}
.hero-copy {
  position: relative;
  z-index: 2;
  max-width: 760px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--yellow);
  border-radius: 999px;
  padding: clamp(5px, 1svh, 9px) clamp(14px, 1.6vw, 23px);
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: clamp(13px, min(1.3vw, 2.3svh), 23px);
  font-weight: 600;
  margin-bottom: clamp(10px, 3svh, 27px);
  color: var(--navy);
}
.sparkle {
  font-size: 1.15em;
  line-height: 1;
}
h1 {
  margin: 0;
  color: var(--navy);
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: clamp(26px, min(5.65vw, 9.5svh), 104px);
  line-height: 1.02;
  letter-spacing: -0.01em;
  font-weight: 700;
}
h1 .smile-word {
  color: var(--blue);
}
.description {
  color: #606981;
  max-width: 720px;
  font-size: clamp(13px, min(1.8vw, 3svh), 30px);
  line-height: 1.5;
  margin: clamp(8px, 3svh, 32px) 0 clamp(12px, 4.2svh, 42px);
  font-weight: 500;
}
.cta {
  position: relative;
  z-index: 3;
  min-height: clamp(42px, 8.6svh, 82px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: clamp(10px, 1.2vw, 20px);
  padding: 0 clamp(20px, 2.6vw, 42px);
  border-radius: clamp(14px, 2.4svh, 24px);
  color: var(--navy);
  background: var(--yellow);
  text-decoration: none;
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: clamp(15px, min(1.75vw, 3svh), 30px);
  font-weight: 600;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}
.cta:hover {
  transform: translateY(-3px);
  background: #ffc247;
}
.cta svg {
  width: 1.1em;
  height: 1.1em;
}

/* ===== PHONE MOCKUP: sumasakto sa natitirang espasyo ===== */
.hero-art {
  position: relative;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: grid;
  place-items: center;
  isolation: isolate;
  container-type: size;
}
.blue-orb {
  position: absolute;
  width: min(125cqh, 130cqw);
  aspect-ratio: 1;
  right: -22%;
  top: -12%;
  border-radius: 50%;
  background: #e7efff;
  z-index: -2;
}
.yellow-orb {
  position: absolute;
  width: min(40cqh, 45cqw);
  aspect-ratio: 1;
  left: 2%;
  bottom: -14%;
  border-radius: 50%;
  background: #fff2cf;
  z-index: -2;
}
.phone {
  position: relative;
  height: min(94cqh, 790px);
  width: auto;
  max-width: 64cqw;
  aspect-ratio: 0.56;
  padding: clamp(5px, 1.4cqh, 12px);
  border: clamp(6px, 1.4cqh, 12px) solid var(--navy);
  border-radius: clamp(22px, 6.6cqh, 54px);
  background: var(--navy);
  transform: rotate(6deg);
  box-shadow: 0 36px 60px rgba(27, 35, 68, 0.22);
  z-index: 1;
  container-type: inline-size;
}
.phone-screen {
  height: 100%;
  width: 100%;
  border-radius: clamp(14px, 4.4cqh, 35px);
  overflow: hidden;
  background: white;
}
/* text sa loob ng phone: sumusunod sa laki ng phone (cqi) */
.greeting {
  padding: 8cqi 7cqi 0;
  text-align: center;
}
.greeting h2 {
  color: #244eae;
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: 10cqi;
  line-height: 1.1;
  letter-spacing: -0.01em;
  margin: 0 0 3cqi;
  font-weight: 700;
}
.greeting p {
  color: #68718a;
  font-size: 5.2cqi;
  line-height: 1.45;
  margin: 0 auto 5cqi;
  max-width: 85%;
}
.open-button {
  border: 0;
  color: white;
  background: var(--blue);
  border-radius: 4cqi;
  padding: 3.6cqi 5.5cqi;
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: 5.4cqi;
  font-weight: 600;
  white-space: nowrap;
}

/* ===== NOTICES ===== */
.notice {
  position: absolute;
  z-index: 3;
  max-width: 62%;
  display: flex;
  align-items: center;
  gap: clamp(6px, 1.4cqh, 14px);
  padding: clamp(7px, 1.9cqh, 17px) clamp(10px, 2.6cqh, 24px);
  background: #fff;
  border-radius: clamp(12px, 2.6cqh, 23px);
  box-shadow: 0 16px 42px rgba(28, 35, 68, 0.13);
  white-space: nowrap;
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: clamp(10.5px, 2.8cqh, 26px);
  font-weight: 500;
  color: var(--navy);
}
.notice-open {
  top: 16%;
  right: 0;
}
.notice-sent {
  bottom: 14%;
  left: 0;
}
.heart-icon,
.check-icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: clamp(22px, 4.8cqh, 43px);
  height: clamp(22px, 4.8cqh, 43px);
  border-radius: 50%;
  color: white;
  font-size: clamp(16px, 3.4cqh, 32px);
  font-weight: 700;
  line-height: 1;
}
.heart-icon {
  background: var(--blue);
}
.check-icon {
  background: #3b9d35;
  font-size: clamp(14px, 2.8cqh, 26px);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ===== PATAYO (tablet na nakatayo + phone): isang column =====
   pagkakasunod: logo → Now open → title → description → phone → button */
@media (orientation: portrait) and (max-width: 1100px) {
  .hero {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }
  .hero-copy {
    display: contents;
  }
  .eyebrow {
    align-self: flex-start;
    font-size: clamp(13px, min(2.4vw, 2svh), 20px);
  }
  h1 {
    flex: none;
    font-size: clamp(30px, min(11vw, 6.2svh), 84px);
  }
  .description {
    flex: none;
    max-width: 640px;
    font-size: clamp(14px, min(4.2vw, 2.3svh), 22px);
    line-height: 1.45;
    margin: clamp(8px, 1.8svh, 20px) 0 0;
  }
  .hero-art {
    order: 1;
    flex: 1 1 0;
    height: auto;
    margin-top: clamp(6px, 1.6svh, 24px);
  }
  .phone {
    height: min(calc(100cqh - 12px), 790px);
    max-width: 70cqw;
    transform: rotate(4deg);
  }
  .blue-orb {
    width: min(115cqw, 105cqh);
    right: -30%;
    top: 2%;
  }
  .yellow-orb {
    width: min(42cqw, 38cqh);
    left: -10%;
    bottom: -8%;
  }
  .notice-open {
    top: 8%;
  }
  .notice-sent {
    bottom: 8%;
  }
  .cta {
    order: 2;
    flex: none;
    display: flex;
    width: 100%;
    min-height: clamp(46px, 7svh, 66px);
    margin-top: clamp(8px, 1.8svh, 18px);
    font-size: clamp(16px, min(4.4vw, 2.6svh), 24px);
    box-shadow: 0 8px 20px rgba(255, 182, 41, 0.3);
  }
}

/* ===== PHONE (maliit na screen): itago ang logo at "Now open" ===== */
@media (max-width: 760px) {
  .brand,
  .eyebrow {
    display: none;
  }
  .landing {
    padding-inline: 20px;
  }
  .hero {
    margin-top: 0;
  }
}

/* ===== PHONE NA PAHIGA (sobrang baba ng screen) ===== */
@media (max-height: 500px) and (orientation: landscape) {
  .eyebrow {
    display: none;
  }
  .notice {
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