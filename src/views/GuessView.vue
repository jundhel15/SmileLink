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
        <h1>Turn a link<br />into a <span>smile.</span></h1>
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

        <div class="phone">
          <div class="phone-screen">
            <FrontBdayCake />
            <div class="greeting">
              <h2>Happy Birthday,<br />Maria!</h2>
              <p>Someone special made this just for you.</p>
              <button type="button" class="open-button">Open your surprise</button>
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
      </div>
    </section>
    <span id="create" class="sr-only">Create your SmileLink surprise</span>
  </main>
</template>

<script setup>
import FrontBdayCake from "@/components/FrontBdayCake.vue";
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800;900;1000&display=swap");

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
  scroll-behavior: smooth;
}
body {
  margin: 0;
}
button,
a {
  font: inherit;
}
.landing {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #fff;
  padding: 5.3vh 6vw 6vh;
}
.brand {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 14px;
  width: fit-content;
}
.brand-mark {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border-radius: 17px;
  background: #3265df;
}
.brand-mark svg {
  width: 45px;
  height: 45px;
}
.brand-name {
  font-size: clamp(27px, 2.5vw, 42px);
  font-weight: 1000;
  letter-spacing: -1.7px;
  color: #1c2344;

}
.brand-name span {
  color: #3265df;
}
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(400px, 0.95fr);
  align-items: center;
  gap: 3vw;
  max-width: 1720px;
  margin: 7.2vh auto 0;
}
.hero-copy {
  position: relative;
  z-index: 2;
  max-width: 760px;
  padding-bottom: 1.5rem;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffb629;
  border-radius: 999px;
  padding: 9px 23px;
  font-size: clamp(16px, 1.3vw, 23px);
  font-weight: 800;
  margin-bottom: 27px;
  color: #1c2344;
}
.sparkle {
  font-size: 25px;
  line-height: 1;
  color: #1c2344;
}
h1 {
  margin: 0;
  color: #1c2344;
  font-size: clamp(54px, 5.65vw, 104px);
  line-height: 0.99;
  letter-spacing: -0.065em;
  font-weight: 1000;
}
h1 span {
  color: #3265df;
}
.description {
  color: #606981;
  max-width: 720px;
  font-size: clamp(19px, 1.8vw, 30px);
  line-height: 1.52;
  margin: 32px 0 42px;
  font-weight: 500;
}
.cta {
  min-height: 82px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px 42px;
  border-radius: 24px;
  color: #1c2344;
  background: #ffb629;
  text-decoration: none;
  font-size: clamp(20px, 1.75vw, 30px);
  font-weight: 800;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}
.cta:hover {
  transform: translateY(-3px);
  background: #ffc247;
}
.cta svg {
  width: 27px;
  height: 27px;
}
.hero-art {
  position: relative;
  min-width: 0;
  min-height: 670px;
  display: grid;
  place-items: center;
  isolation: isolate;
}
.blue-orb {
  position: absolute;
  width: min(54vw, 790px);
  aspect-ratio: 1;
  right: -18%;
  top: -17%;
  border-radius: 50%;
  background: #e7efff;
  z-index: -2;
}
.yellow-orb {
  position: absolute;
  width: 285px;
  aspect-ratio: 1;
  left: 0;
  bottom: -17%;
  border-radius: 50%;
  background: #fff2cf;
  z-index: -2;
}
.phone {
  position: relative;
  width: clamp(270px, 24vw, 440px);
  height: clamp(510px, 45vw, 790px);
  padding: 12px;
  border: 12px solid #1c2344;
  border-radius: 54px;
  background: #1c2344;
  transform: rotate(6deg) translate(2%, -1%);
  box-shadow: 0 36px 60px rgba(27, 35, 68, 0.22);
  z-index: 1;
}
.phone-screen {
  height: 100%;
  width: 100%;
  border-radius: 35px;
  overflow: hidden;
  background: white;
}
.greeting {
  padding: 10% 8%;
  text-align: center;
}
.greeting h2 {
  color: #244eae;
  font-size: clamp(19px, 1.9vw, 32px);
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin: 0 0 12px;
  font-weight: 1000;
}
.greeting p {
  color: #68718a;
  font-size: clamp(11px, 1.05vw, 17px);
  line-height: 1.45;
  margin: 0 auto 18px;
  max-width: 260px;
}
.open-button {
  border: 0;
  color: white;
  background: #3265df;
  border-radius: 14px;
  padding: 13px 19px;
  font-size: clamp(11px, 1.1vw, 17px);
  font-weight: 800;
  white-space: nowrap;
}
.notice {
  max-width: 100%;
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 17px 24px;
  background: #fff;
  border-radius: 23px;
  box-shadow: 0 16px 42px rgba(28, 35, 68, 0.13);
  white-space: nowrap;
  font-size: clamp(15px, 1.5vw, 26px);
  font-weight: 800;
}
.notice-open {
  top: 17%;
  right: -1%;
  color: #1c2344;
}
.notice-sent {
  bottom: 17%;
  left: -9%;
  color: #1c2344;
}
.heart-icon,
.check-icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 43px;
  height: 43px;
  border-radius: 50%;
  color: white;
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}
.heart-icon {
  background: #3265df;
}
.check-icon {
  background: #3b9d35;
  font-size: 26px;
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

/* Responsive layout */
@media (max-width: 1280px) {
  .landing {
    padding: 32px 5vw 48px;
  }
  .hero {
    grid-template-columns: minmax(0, 1fr) minmax(300px, 0.85fr);
    gap: 2vw;
    margin-top: 6vh;
  }
  .hero-art {
    min-height: 560px;
    min-width: 0;
  }
  .phone {
    width: clamp(250px, 29vw, 340px);
    height: clamp(470px, 53vw, 620px);
    border-width: 10px;
    border-radius: 43px;
    padding: 8px;
  }
  .phone-screen {
    border-radius: 28px;
  }
  .notice {
    max-width: calc(100% - 8px);
    padding: 12px 15px;
    gap: 9px;
    border-radius: 17px;
    font-size: clamp(13px, 1.45vw, 19px);
  }
  .heart-icon,
  .check-icon {
    width: 34px;
    height: 34px;
  }
  .notice-open {
    right: -2%;
  }
  .notice-sent {
    left: -3%;
  }
  h1 {
    font-size: clamp(54px, 5.6vw, 76px);
  }
  .description {
    font-size: clamp(18px, 1.8vw, 23px);
    margin: 24px 0 30px;
  }
  .cta {
    min-height: 66px;
    padding: 17px 25px;
    border-radius: 18px;
  }
}

@media (min-width: 761px) and (max-width: 1024px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
    max-width: 760px;
    gap: 0;
    margin-top: 48px;
  }
  .hero-copy {
    max-width: 720px;
    padding-bottom: 0;
  }
  .hero-art {
    min-height: clamp(500px, 65vw, 620px);
    margin-top: 24px;
  }
  .phone {
    width: clamp(260px, 34vw, 340px);
    height: clamp(480px, 62vw, 620px);
  }
  .notice-open {
    right: 5%;
  }
  .notice-sent {
    left: 5%;
  }
}

@media (max-width: 760px) {
  .landing {
    min-height: 100svh;
    padding: 24px 22px 36px;
    overflow: hidden;
  }
  .brand {
    gap: 10px;
  }
  .brand-mark {
    width: 47px;
    height: 47px;
    border-radius: 13px;
  }
  .brand-mark svg {
    width: 35px;
    height: 35px;
  }
  .brand-name {
    font-size: clamp(26px, 6vw, 31px);
    letter-spacing: -1.2px;
  }

  .hero {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    width: 100%;
    margin: 42px auto 0;
  }
  .hero-copy {
    width: 100%;
    max-width: none;
    padding: 0;
  }
  .eyebrow {
    font-size: 15px;
    padding: 8px 16px;
    margin-bottom: 20px;
  }
  h1 {
    font-size: clamp(44px, 11.8vw, 76px);
    line-height: 0.99;
    letter-spacing: -0.06em;
    overflow-wrap: normal;
  }
  .description {
    max-width: 580px;
    font-size: clamp(17px, 4.2vw, 20px);
    line-height: 1.5;
    margin: 21px 0 25px;
  }
  .cta {
    display: flex;
    width: 100%;
    max-width: 440px;
    min-height: 60px;
    gap: 12px;
    padding: 15px 18px;
    border-radius: 16px;
    font-size: clamp(17px, 4.4vw, 20px);
  }
  .cta svg {
    width: 22px;
    height: 22px;
  }

  .hero-art {
    width: 100%;
    min-width: 0;
    min-height: clamp(430px, 125vw, 540px);
    margin: 28px auto 0;
    display: grid;
    place-items: center;
  }
  .blue-orb {
    width: min(118vw, 620px);
    right: -32%;
    top: 0;
  }
  .yellow-orb {
    width: clamp(140px, 45vw, 200px);
    left: -8%;
    bottom: 0;
  }
  .phone {
    width: clamp(225px, 62vw, 280px);
    height: clamp(415px, 115vw, 510px);
    max-width: 78%;
    border-width: 9px;
    border-radius: 38px;
    padding: 7px;
    transform: rotate(4deg);
  }
  .phone-screen {
    border-radius: 24px;
  }
  .birthday-scene {
    height: 47%;
  }
  .greeting {
    padding: 9% 7%;
  }
  .greeting h2 {
    font-size: clamp(20px, 5.7vw, 24px);
  }
  .greeting p {
    font-size: clamp(11px, 3vw, 13px);
    margin-bottom: 14px;
  }
  .open-button {
    font-size: clamp(10px, 2.8vw, 12px);
    padding: 11px 13px;
  }
  .notice {
    gap: 7px;
    max-width: 78%;
    padding: 9px 12px;
    border-radius: 14px;
    font-size: clamp(11px, 3.1vw, 14px);
    white-space: normal;
    line-height: 1.2;
  }
  .heart-icon,
  .check-icon {
    width: 29px;
    height: 29px;
    font-size: 22px;
  }
  .check-icon {
    font-size: 19px;
  }
  .notice-open {
    top: 12%;
    right: 0;
  }
  .notice-sent {
    bottom: 10%;
    left: 0;
  }
}

@media (max-width: 390px) {
  .landing {
    padding: 20px 16px 30px;
  }
  .brand-mark {
    width: 43px;
    height: 43px;
  }
  .brand-name {
    font-size: 25px;
  }
  .hero {
    margin-top: 35px;
  }
  h1 {
    font-size: clamp(41px, 11.5vw, 48px);
  }
  .description {
    font-size: 16px;
  }
  .hero-art {
    min-height: 420px;
    margin-top: 20px;
  }
  .phone {
    width: 220px;
    height: 405px;
    max-width: 76%;
    border-radius: 34px;
  }
  .phone-screen {
    border-radius: 22px;
  }
  .notice {
    max-width: 75%;
    font-size: 10.5px;
    padding: 8px 9px;
  }
  .heart-icon,
  .check-icon {
    width: 25px;
    height: 25px;
  }
  .notice-open {
    right: -1px;
    top: 12%;
  }
  .notice-sent {
    left: -1px;
    bottom: 9%;
  }
}

@media (max-width: 340px) {
  .landing {
    padding-left: 12px;
    padding-right: 12px;
  }
  .brand-name {
    font-size: 23px;
  }
  h1 {
    font-size: 39px;
  }
  .notice {
    max-width: 72%;
    font-size: 10px;
    gap: 6px;
  }
  .phone {
    width: 205px;
    height: 380px;
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