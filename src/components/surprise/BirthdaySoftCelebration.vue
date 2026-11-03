<template>
  <!-- INTERACTIVE PREVIEW ng 01 Soft Celebration (PURE CODE · CINEMATIC REDESIGN)
       Walang png/webp. SVG + CSS + <canvas> lang.
       - 3D na pop-up birthday card (CSS 3D): hilahin ang cover para bumukas, lalabas ang cake
       - Aurora background na gumagalaw + grain texture
       - Glossy 3D na lobo, holographic na memory cards (3D flip + swipe) para sa mga litrato
       - Finale: ikonekta ang mga bituin para mabuo ang puso, tapos fireworks at confetti sa canvas
       Lahat ng laman ay galing sa `content` prop. -->
  <SurpriseShell
    class="soft-shell"
    title="01 Soft Celebration"
    @close="emit('close')"
    @use="emit('use')"
    @device-change="onDeviceChange"
  >
    <Teleport to="body" :disabled="!bare">
    <div ref="fitEl" class="fit" :class="[{ bare, panel: stage.panel }, bare ? 'soft-shell' : '']" :style="bare ? { top: `${bareTop}px` } : null">
    <div ref="phoneEl" class="phone" :class="[`is-${scene}`, { 'is-dark': scene === 'finale', 'is-wide': stage.wide }]" :style="stageStyle" @pointermove="trail" @pointerdown="tapRing">
      <!-- SVG DEFS -->
      <svg class="svg-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <radialGradient id="sl-shine" cx="32%" cy="26%" r="60%">
            <stop offset="0" stop-color="#fff" stop-opacity="0.8" />
            <stop offset="0.4" stop-color="#fff" stop-opacity="0.12" />
            <stop offset="1" stop-color="#fff" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="sl-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#fff6d6" />
            <stop offset="0.35" stop-color="#f3c777" />
            <stop offset="0.7" stop-color="#d79a4a" />
            <stop offset="1" stop-color="#f7d58c" />
          </linearGradient>
          <linearGradient id="sl-lockbody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffb0c5" />
            <stop offset="0.55" stop-color="#ff6a93" />
            <stop offset="1" stop-color="#d93768" />
          </linearGradient>
          <radialGradient id="sl-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stop-color="#ff7aa2" stop-opacity="0.55" />
            <stop offset="1" stop-color="#ff7aa2" stop-opacity="0" />
          </radialGradient>
          <pattern id="sl-win" width="7" height="9" patternUnits="userSpaceOnUse">
            <rect x="2" y="2.5" width="2.4" height="3.4" fill="#ffd98a" />
          </pattern>
          <radialGradient id="sl-petal" cx="50%" cy="85%" r="95%">
            <stop offset="0" stop-color="#ffffff" />
            <stop offset="0.55" stop-color="#ffe4ee" />
            <stop offset="1" stop-color="#f7a6c1" />
          </radialGradient>
          <linearGradient id="sl-leafg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#b6d19f" />
            <stop offset="1" stop-color="#6d9a6e" />
          </linearGradient>
          <radialGradient id="sl-roseg" cx="38%" cy="30%" r="80%">
            <stop offset="0" stop-color="#ffd0dc" />
            <stop offset="0.5" stop-color="#f4709a" />
            <stop offset="1" stop-color="#bf3262" />
          </radialGradient>
          <linearGradient id="sl-ribbon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffc6d6" />
            <stop offset="1" stop-color="#f27a9c" />
          </linearGradient>
          <linearGradient id="sl-mount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#cdb6ef" />
            <stop offset="1" stop-color="#f1cfe6" />
          </linearGradient>
          <linearGradient id="sl-lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffe3d0" />
            <stop offset="1" stop-color="#f6b9cf" />
          </linearGradient>
          <linearGradient id="sl-hillg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#b9d3a2" />
            <stop offset="1" stop-color="#85ad82" />
          </linearGradient>
          <linearGradient id="sl-stone" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#f4dcd2" />
            <stop offset="0.5" stop-color="#fff6ee" />
            <stop offset="1" stop-color="#ecc9c3" />
          </linearGradient>
          <linearGradient id="sl-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#f9d2cf" />
            <stop offset="1" stop-color="#ffe9dd" />
          </linearGradient>
          <radialGradient id="sl-lamp" cx="50%" cy="50%" r="50%">
            <stop offset="0" stop-color="#fff2b8" stop-opacity="0.95" />
            <stop offset="1" stop-color="#ffd27a" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="sl-giftp" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffd9e3" />
            <stop offset="1" stop-color="#f58fae" />
          </linearGradient>
          <pattern id="sl-baluster" width="24" height="60" patternUnits="userSpaceOnUse">
            <path d="M8 0h8v6c0 5-5 6-5 12 0 4 5 5 5 11 0 7-6 9-6 14v17H3V43c0-5-6-7-6-14 0-6 5-7 5-11 0-6-5-7-5-12V0Z" transform="translate(4 0)" fill="url(#sl-stone)" stroke="#e5bdb7" stroke-width="0.6" />
          </pattern>
        </defs>

        <symbol id="sl-heart" viewBox="0 0 24 24">
          <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" />
        </symbol>
        <symbol id="sl-sparkle" viewBox="0 0 24 24">
          <path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z" />
        </symbol>
        <symbol id="sl-flower" viewBox="0 0 24 24">
          <ellipse cx="5" cy="18" rx="4.2" ry="1.8" fill="#9db48a" transform="rotate(-32 5 18)" />
          <ellipse cx="19" cy="18" rx="4.2" ry="1.8" fill="#9db48a" transform="rotate(32 19 18)" />
          <g fill="#fff2f5" stroke="#f1aec0" stroke-width="0.8">
            <circle cx="12" cy="6.5" r="4" />
            <circle cx="17.2" cy="10.3" r="4" />
            <circle cx="15.2" cy="16.4" r="4" />
            <circle cx="8.8" cy="16.4" r="4" />
            <circle cx="6.8" cy="10.3" r="4" />
          </g>
          <circle cx="12" cy="12" r="2.6" fill="#f5c55a" />
        </symbol>
        <symbol id="sl-bow" viewBox="0 0 60 44">
          <path d="M28 22 18 42l6-2 4 4 2-20Z" fill="#f28fa9" />
          <path d="M32 22 42 42l-6-2-4 4-2-20Z" fill="#f28fa9" />
          <path d="M30 20C18 2 2 6 4 18s16 10 26 2Z" fill="#f9b3c5" stroke="#e8809c" stroke-width="1.4" />
          <path d="M30 20C42 2 58 6 56 18s-16 10-26 2Z" fill="#f9b3c5" stroke="#e8809c" stroke-width="1.4" />
          <path
            d="M30 27s-6.5-3.8-6.5-8a3.4 3.4 0 0 1 6.5-1.7 3.4 3.4 0 0 1 6.5 1.7c0 4.2-6.5 8-6.5 8Z"
            fill="#ffd6e0"
            stroke="#e8809c"
            stroke-width="1.2"
          />
        </symbol>
        <!-- gintong bow para sa gift box -->
        <symbol id="sl-gbow" viewBox="0 0 60 44">
          <path d="M28 22 16 43l7-2 5 4 2-23Z" fill="#e3b05a" />
          <path d="M32 22 44 43l-7-2-5 4-2-23Z" fill="#e3b05a" />
          <path d="M30 22C16 0 0 5 3 19s17 11 27 3Z" fill="#ffe6a6" stroke="#cf9a45" stroke-width="1.5" />
          <path d="M30 22C44 0 60 5 57 19s-17 11-27 3Z" fill="#ffe6a6" stroke="#cf9a45" stroke-width="1.5" />
          <path d="M14 14C18 9 24 11 27 18M46 14C42 9 36 11 33 18" fill="none" stroke="#fff8e0" stroke-width="1.6" stroke-linecap="round" />
          <ellipse cx="30" cy="22" rx="7" ry="6" fill="#f3c777" stroke="#cf9a45" stroke-width="1.4" />
        </symbol>
        <symbol id="sl-letter" viewBox="0 0 24 24">
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="#fff" stroke="#e8809c" stroke-width="1.3" />
          <path d="m3.5 7 8.5 6.5L20.5 7" fill="none" stroke="#e8809c" stroke-width="1.3" stroke-linejoin="round" />
          <path
            d="M12 18.2s-3.2-1.9-3.2-4a1.7 1.7 0 0 1 3.2-.9 1.7 1.7 0 0 1 3.2.9c0 2.1-3.2 4-3.2 4Z"
            fill="#f07a98"
          />
        </symbol>
        <symbol id="sl-sakura" viewBox="0 0 40 40">
          <g transform="translate(20 20)" stroke="#f0a0bb" stroke-width="0.7" stroke-linejoin="round">
            <path d="M0 -2C-9 -7 -10 -18 -3.4 -18.6L0 -15.6L3.4 -18.6C10 -18 9 -7 0 -2Z" fill="url(#sl-petal)" />
            <path d="M0 -2C-9 -7 -10 -18 -3.4 -18.6L0 -15.6L3.4 -18.6C10 -18 9 -7 0 -2Z" fill="url(#sl-petal)" transform="rotate(72)" />
            <path d="M0 -2C-9 -7 -10 -18 -3.4 -18.6L0 -15.6L3.4 -18.6C10 -18 9 -7 0 -2Z" fill="url(#sl-petal)" transform="rotate(144)" />
            <path d="M0 -2C-9 -7 -10 -18 -3.4 -18.6L0 -15.6L3.4 -18.6C10 -18 9 -7 0 -2Z" fill="url(#sl-petal)" transform="rotate(216)" />
            <path d="M0 -2C-9 -7 -10 -18 -3.4 -18.6L0 -15.6L3.4 -18.6C10 -18 9 -7 0 -2Z" fill="url(#sl-petal)" transform="rotate(288)" />
          </g>
          <g stroke="#e8628d" stroke-width="0.8" stroke-linecap="round" opacity="0.8">
            <path d="M20 20 20 12M20 20 26.5 15M20 20 27 24M20 20 14 26M20 20 13.5 15" />
          </g>
          <circle cx="20" cy="20" r="2.3" fill="#f7c85a" />
          <circle cx="19.3" cy="19.2" r="0.8" fill="#fff" opacity="0.8" />
        </symbol>
        <symbol id="sl-leaf" viewBox="0 0 30 16">
          <path d="M1 8C8 0 21 0 29 8 21 16 8 16 1 8Z" fill="url(#sl-leafg)" />
          <path d="M3 8H27" stroke="#4f7a52" stroke-opacity="0.45" stroke-width="0.9" />
          <path d="M9 8 14 4.5M14 8 19 4.5M9 8 14 11.5M14 8 19 11.5" stroke="#4f7a52" stroke-opacity="0.3" stroke-width="0.7" fill="none" />
        </symbol>
        <symbol id="sl-corner" viewBox="0 0 200 200">
          <g fill="none" stroke-linecap="round">
            <path d="M-6 168C34 112 92 54 196 14" stroke="url(#sl-ribbon)" stroke-width="9" />
            <path d="M-6 166C34 110 92 52 196 12" stroke="#fff" stroke-opacity="0.55" stroke-width="1.6" />
            <path d="M-6 120C20 84 60 44 124 8" stroke="url(#sl-ribbon)" stroke-width="5" opacity="0.7" />
          </g>
          <use href="#sl-leaf" x="6" y="78" width="64" height="34" transform="rotate(-62 38 95)" />
          <use href="#sl-leaf" x="60" y="22" width="64" height="34" transform="rotate(-18 92 39)" />
          <use href="#sl-leaf" x="2" y="30" width="58" height="30" transform="rotate(-40 31 45)" />
          <use href="#sl-bow" x="40" y="62" width="74" height="54" transform="rotate(-34 77 89)" />
          <use href="#sl-sakura" x="4" y="2" width="64" height="64" />
          <use href="#sl-sakura" x="58" y="6" width="44" height="44" />
          <use href="#sl-sakura" x="2" y="62" width="40" height="40" />
          <use href="#sl-sakura" x="112" y="2" width="30" height="30" />
          <use href="#sl-heart" x="96" y="46" width="13" height="13" fill="#ff9fbd" opacity="0.85" />
          <use href="#sl-heart" x="24" y="124" width="11" height="11" fill="#ff9fbd" opacity="0.8" />
        </symbol>
        <symbol id="sl-rose" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="17" fill="url(#sl-roseg)" />
          <path d="M20 20m-2.6 0a2.6 2.6 0 1 1 5.2 0 4.6 4.6 0 1 1-9.2 0 6.8 6.8 0 1 1 13.6 0 9 9 0 1 1-18 0" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="1.4" stroke-linecap="round" />
          <path d="M8 24C11 33 27 34 32 25" fill="none" stroke="#8f1f4a" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round" />
          <ellipse cx="13" cy="12" rx="6" ry="3" fill="#fff" opacity="0.4" transform="rotate(-35 13 12)" />
        </symbol>
      </svg>

      <!-- BACKGROUND: aurora + grain + ambient -->
      <div class="aurora" aria-hidden="true"><i class="a1" /><i class="a2" /><i class="a3" /></div>
      <div class="grain" aria-hidden="true" />
      <div class="ambient" aria-hidden="true">
        <i v-for="(a, i) in ambient" :key="i" :style="a" />
      </div>

      <!-- DECO: ribbon swag, sakura at leaves (hindi kasama sa balloons at finale) -->
      <div v-if="scene !== 'finale' && scene !== 'balloons'" class="deco" aria-hidden="true">
        <svg class="deco-top" viewBox="0 0 400 130">
          <g fill="none" stroke-linecap="round">
            <path d="M200 60C160 46 104 46 72 64C52 76 40 98 20 108" stroke="url(#sl-ribbon)" stroke-width="9" />
            <path d="M200 58C160 44 104 44 72 62C52 74 40 96 20 106" stroke="#fff" stroke-opacity="0.55" stroke-width="1.6" />
            <path d="M200 60C240 46 296 46 328 64C348 76 360 98 380 108" stroke="url(#sl-ribbon)" stroke-width="9" />
            <path d="M200 58C240 44 296 44 328 62C348 74 360 96 380 106" stroke="#fff" stroke-opacity="0.55" stroke-width="1.6" />
          </g>
          <use href="#sl-leaf" x="6" y="62" width="40" height="22" transform="rotate(-28 26 73)" />
          <use href="#sl-leaf" x="52" y="96" width="38" height="20" transform="rotate(32 70 106)" />
          <use href="#sl-leaf" x="354" y="62" width="40" height="22" transform="rotate(28 374 73)" />
          <use href="#sl-leaf" x="310" y="96" width="38" height="20" transform="rotate(-32 330 106)" />
          <use href="#sl-sakura" x="14" y="38" width="44" height="44" />
          <use href="#sl-sakura" x="48" y="70" width="32" height="32" />
          <use href="#sl-sakura" x="342" y="38" width="44" height="44" />
          <use href="#sl-sakura" x="320" y="70" width="32" height="32" />
          <use href="#sl-bow" x="160" y="30" width="80" height="58" />
          <use href="#sl-heart" x="120" y="64" width="12" height="12" fill="#ff9fbd" opacity="0.8" />
          <use href="#sl-heart" x="268" y="64" width="12" height="12" fill="#ff9fbd" opacity="0.8" />
        </svg>
        <svg class="deco-corner c-tl" viewBox="0 0 200 200"><use href="#sl-corner" width="200" height="200" /></svg>
        <svg class="deco-corner c-tr" viewBox="0 0 200 200"><use href="#sl-corner" width="200" height="200" /></svg>
        <svg class="deco-corner c-bl" viewBox="0 0 200 200"><use href="#sl-corner" width="200" height="200" /></svg>
        <svg class="deco-corner c-br" viewBox="0 0 200 200"><use href="#sl-corner" width="200" height="200" /></svg>
        <svg class="deco-bottom" viewBox="0 0 400 120">
          <path d="M20 108C90 92 150 118 200 106S310 92 380 108" fill="none" stroke="url(#sl-ribbon)" stroke-width="3" stroke-linecap="round" opacity="0.7" />
          <use href="#sl-heart" x="190" y="96" width="20" height="20" fill="#ff9fbd" />
          <use href="#sl-leaf" x="-4" y="70" width="46" height="24" transform="rotate(-50 19 82)" />
          <use href="#sl-leaf" x="28" y="82" width="46" height="24" transform="rotate(-8 51 94)" />
          <use href="#sl-sakura" x="4" y="66" width="36" height="36" />
          <use href="#sl-sakura" x="34" y="84" width="28" height="28" />
          <use href="#sl-sakura" x="14" y="90" width="22" height="22" />
          <use href="#sl-leaf" x="358" y="70" width="46" height="24" transform="rotate(50 381 82)" />
          <use href="#sl-leaf" x="326" y="82" width="46" height="24" transform="rotate(8 349 94)" />
          <use href="#sl-sakura" x="360" y="66" width="36" height="36" />
          <use href="#sl-sakura" x="338" y="84" width="28" height="28" />
          <use href="#sl-sakura" x="364" y="90" width="22" height="22" />
        </svg>
      </div>
      <div v-if="scene !== 'finale'" class="petals" aria-hidden="true">
        <i v-for="(p, i) in petals" :key="i" :style="p" />
      </div>

      <!-- PROGRESS -->
      <div v-if="sceneIndex >= 0" class="progress" aria-hidden="true">
        <span v-for="(step, index) in scenes" :key="step.id" :class="{ on: index <= sceneIndex, now: index === sceneIndex }" />
      </div>

      <Transition name="scene" mode="out-in">
        <!-- COVER: pop-up birthday card -->
        <section v-if="scene === 'cover'" key="cover" class="scene scene-cover">
          <p class="eyebrow"><span class="eyebrow-line" /> A surprise for {{ c.recipient }} <span class="eyebrow-line" /></p>
          <h3 class="scene-title">Someone made this <em>just for you</em></h3>

          <div ref="cardStageEl" class="gift-stage">
            <div class="gift-halo" />
            <div
              class="pc-wrap"
              :class="{ drag: cardDragging, done: cardDone }"
              :style="{ '--p': cardP, '--pop': cardPop }"
              role="button"
              tabindex="0"
              aria-label="Open the birthday card"
              @pointerdown="cardDown"
              @pointermove="cardMove"
              @pointerup="cardUp"
              @pointercancel="cardUp"
              @keydown.enter.prevent="openCard"
              @keydown.space.prevent="openCard"
            >
              <span class="pc-shadow" />
              <div ref="cardEl" class="pc-card">
                <div class="pc-right" />
                <div class="pc-pop">
                  <svg viewBox="0 0 260 220" aria-hidden="true">
                  <defs>
                    <linearGradient id="pc-pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc9db" /><stop offset="1" stop-color="#ff8fb0" /></linearGradient>
                    <linearGradient id="pc-lilac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6dbff" /><stop offset="1" stop-color="#b79cf2" /></linearGradient>
                    <linearGradient id="pc-rose" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3ec" /><stop offset="1" stop-color="#ffa5c1" /></linearGradient>
                    <radialGradient id="pc-b1" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffc2d6" /><stop offset="1" stop-color="#e8507b" /></radialGradient>
                    <radialGradient id="pc-b2" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#eadfff" /><stop offset="1" stop-color="#9f80ee" /></radialGradient>
                    <radialGradient id="pc-flame" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff6c0" /><stop offset="0.55" stop-color="#ffc247" /><stop offset="1" stop-color="#ff7a2f" /></radialGradient>
                    <radialGradient id="pc-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe9a8" stop-opacity="0.8" /><stop offset="1" stop-color="#ffe9a8" stop-opacity="0" /></radialGradient>
                  </defs>
                  <g class="pc-bunting">
                    <path d="M14 22Q130 58 246 22" fill="none" stroke="#e9c18a" stroke-width="1.6" />
                    <polygon v-for="(f, i) in BUNTING" :key="i" :points="`${f.x - 9},${f.y - 1} ${f.x + 9},${f.y - 1} ${f.x},${f.y + 20}`" :fill="f.c" />
                  </g>
                  <g class="pc-bal b1">
                    <path d="M44 122C46 150 60 172 72 198" fill="none" stroke="#e7b3c4" stroke-width="1.2" />
                    <ellipse cx="44" cy="94" rx="23" ry="27" fill="url(#pc-b1)" />
                    <ellipse cx="36" cy="83" rx="5" ry="8" fill="#fff" opacity="0.55" transform="rotate(-20 36 83)" />
                    <path d="M41 120l3 6 3-6z" fill="#e8507b" />
                  </g>
                  <g class="pc-bal b2">
                    <path d="M216 111C214 144 200 172 190 198" fill="none" stroke="#cbbbee" stroke-width="1.2" />
                    <ellipse cx="216" cy="86" rx="21" ry="25" fill="url(#pc-b2)" />
                    <ellipse cx="209" cy="76" rx="4.5" ry="7" fill="#fff" opacity="0.55" transform="rotate(-20 209 76)" />
                    <path d="M213 111l3 6 3-6z" fill="#9f80ee" />
                  </g>
                  <ellipse cx="130" cy="210" rx="98" ry="8" fill="rgb(180 60 100 / .22)" />
                  <ellipse cx="130" cy="207" rx="96" ry="9" fill="#fff" stroke="#f3cfda" />
                  <rect x="52" y="150" width="156" height="56" rx="10" fill="url(#pc-pink)" />
                  <path d="M52 150h156v10q-13 14-26 0q-13 14-26 0q-13 14-26 0q-13 14-26 0q-13 14-26 0q-13 14-26 0Z" fill="#fff8f2" />
                  <text x="130" y="190" text-anchor="middle" class="pc-cake-text">Happy Birthday</text>
                  <rect x="78" y="110" width="104" height="44" rx="9" fill="url(#pc-lilac)" />
                  <path d="M78 110h104v9q-13 13-26 0q-13 13-26 0q-13 13-26 0q-13 13-26 0Z" fill="#fff8f2" />
                  <use href="#sl-heart" x="120" y="126" width="20" height="20" fill="#fff" opacity="0.92" />
                  <rect x="100" y="76" width="60" height="38" rx="8" fill="url(#pc-rose)" />
                  <path d="M100 76h60v8q-7.5 11-15 0q-7.5 11-15 0q-7.5 11-15 0q-7.5 11-15 0Z" fill="#fff8f2" />
                  <circle class="pc-glow" cx="130" cy="46" r="30" fill="url(#pc-glow)" />
                  <g v-for="x in [112, 130, 148]" :key="x">
                    <rect :x="x - 3" y="52" width="6" height="24" rx="2" fill="#fff" stroke="#ffc2d4" stroke-width="0.8" />
                    <rect :x="x - 3" y="58" width="6" height="3" fill="#ff9fbd" />
                    <rect :x="x - 3" y="66" width="6" height="3" fill="#ff9fbd" />
                    <ellipse class="pc-flame" :cx="x" cy="45" rx="4.2" ry="7" fill="url(#pc-flame)" />
                  </g>
                  <use class="pc-tw t1" href="#sl-sparkle" x="20" y="132" width="16" height="16" fill="#ffd37a" />
                  <use class="pc-tw t2" href="#sl-sparkle" x="228" y="126" width="14" height="14" fill="#ff9fbd" />
                  <use class="pc-tw t3" href="#sl-sparkle" x="70" y="52" width="12" height="12" fill="#c9b5ff" />
                  <use class="pc-tw t4" href="#sl-sparkle" x="182" y="48" width="14" height="14" fill="#ffd37a" />
                </svg>
                </div>
                <div class="pc-cover">
                  <div class="pc-face pc-front">
                    <span class="pc-frame" />
                    <svg class="pc-bow" viewBox="0 0 60 44" aria-hidden="true"><use href="#sl-bow" width="60" height="44" /></svg>
                    <p class="pc-small">for {{ c.recipient }}</p>
                    <p class="pc-big">Happy<br />Birthday</p>
                    <span class="pc-pull" aria-hidden="true"><i>←</i> open</span>
                  </div>
                  <div class="pc-face pc-back">
                    <span class="pc-frame" />
                    <p class="pc-hi">Dear {{ c.recipient }},</p>
                    <p class="pc-msg">I made a little something, just for you.</p>
                    <p class="pc-sign">— {{ c.sender }}</p>
                  </div>
                </div>
              </div>
            </div>
            <p class="pc-hint" :class="{ off: cardP > 0.04 }">Drag the card open · or tap</p>
          </div>
          <button class="primary-button" type="button" :disabled="cardDone" @click.stop="openCard">
            Open your surprise <span aria-hidden="true">→</span>
          </button>
          <p class="script-line">From {{ c.sender }}, with love 💗</p>
        </section>

        <!-- 1. SECRET LOCK -->
        <section v-else-if="scene === 'lock'" key="lock" class="scene scene-lock">
          <p class="eyebrow"><span class="eyebrow-line" /> A surprise for {{ c.recipient }} <span class="eyebrow-line" /></p>
          <h3 class="scene-title">Just for <em>you</em></h3>
          <div class="padlock-wrap" :class="{ shake: lockShake, open: unlocked, bump: lockBump }">
            <span class="ring r1" /><span class="ring r2" />
            <svg class="padlock" viewBox="0 0 160 170" aria-hidden="true">
              <defs>
                <linearGradient id="lx-rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0f5" /><stop offset="0.45" stop-color="#ff9fbd" /><stop offset="0.8" stop-color="#e8507b" /><stop offset="1" stop-color="#ffc2d6" /></linearGradient>
                <linearGradient id="lx-lb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9fbd" /><stop offset="0.55" stop-color="#f0608a" /><stop offset="1" stop-color="#c93d72" /></linearGradient>
                <radialGradient id="lx-kg"><stop offset="0" stop-color="#fff2e8" /><stop offset="1" stop-color="#ffd0dd" /></radialGradient>
              </defs>
              <g class="shackle">
                <path d="M52 76V54a28 28 0 0 1 56 0v22" fill="none" stroke="url(#lx-rg)" stroke-width="9" stroke-linecap="round" />
                <path d="M57 74V54a23 23 0 0 1 20-22.8" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="1.6" stroke-linecap="round" />
              </g>
              <rect x="26" y="72" width="108" height="84" rx="24" fill="url(#lx-lb)" />
              <rect x="26.8" y="72.8" width="106.4" height="82.4" rx="23.2" fill="none" stroke="url(#lx-rg)" stroke-width="1.6" />
              <circle cx="80" cy="108" r="30" fill="none" stroke="#fff" stroke-opacity="0.35" />
              <circle cx="80" cy="108" r="30" fill="none" stroke="#fff" stroke-opacity="0.9" stroke-width="3" stroke-dasharray="1 5.85" />
              <circle cx="80" cy="104" r="9" fill="url(#lx-kg)" />
              <path d="M76.5 108h7l2.5 17h-12Z" fill="url(#lx-kg)" />
              <circle cx="80" cy="104" r="3.5" fill="#8e1f4d" />
            </svg>
          </div>
          <div class="pad glass">
            <p class="hint">
              <svg class="hint-icon" aria-hidden="true"><use href="#sl-letter" /></svg>
              Hint: {{ c.hint }}
            </p>
            <div class="code-dots" aria-live="polite" :aria-label="`${entered.length} of ${c.code.length} digits`">
              <span v-for="n in c.code.length" :key="n" :class="{ filled: n <= entered.length }" />
            </div>
            <div class="keypad">
              <button
                v-for="key in keypadKeys"
                :key="key"
                type="button"
                :class="{ 'key-ok': key === 'ok', 'key-fn': key === 'back' }"
                :aria-label="key === 'back' ? 'Delete' : key === 'ok' ? 'Unlock' : key"
                @click="pressKey(key, $event)"
              >
                <svg v-if="key === 'back'" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7 6-7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
                  <path d="m11 9.5 5 5m0-5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
                <svg v-else-if="key === 'ok'" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <template v-else>{{ key }}</template>
              </button>
            </div>
          </div>
          <p class="demo-code">Demo code: <b>{{ c.code }}</b></p>
        </section>

        <!-- 2. BALLOON POP WISHES -->
        <section v-else-if="scene === 'balloons'" key="balloons" class="scene scene-balloons">
          <div class="sky" aria-hidden="true" />
          <p class="eyebrow"><span class="eyebrow-line" /> Make a wish, {{ c.recipient }} <span class="eyebrow-line" /></p>
          <h3 class="scene-title">Pop the <em>wishes</em></h3>
          <p class="scene-sub">Each orb holds a birthday wish.</p>
          <div class="wish-card glass" aria-live="polite">
            <svg class="card-bow" viewBox="0 0 60 44" aria-hidden="true"><use href="#sl-bow" width="60" height="44" /></svg>
            <Transition name="pop-in" mode="out-in">
              <div :key="popped.length">
                <template v-if="popped.length">
                  <span class="chip">Wish {{ popped.length }} of {{ wishes.length }}</span>
                  <p>{{ wishes[popped.length - 1] }}</p>
                </template>
                <p v-else>Tap an orb to begin</p>
              </div>
            </Transition>
          </div>
          <div class="balloon-field" @pointermove="sliceBalloons">
            <button
              v-for="(wish, index) in wishes"
              :key="index"
              class="balloon"
              :class="{ popped: popped.includes(index) }"
              type="button"
              :disabled="popped.includes(index)"
              :aria-label="`Pop balloon ${index + 1}`"
              :data-i="index"
              :style="balloonStyle(index)"
              @click="popBalloon(index, $event)"
            >
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <defs>
                  <radialGradient :id="`bl-${index}`" cx="35%" cy="28%" r="78%">
                    <stop offset="0" stop-color="#fff" stop-opacity="0.95" />
                    <stop offset="0.35" :stop-color="palette(index).b" stop-opacity="0.78" />
                    <stop offset="1" :stop-color="palette(index).d" stop-opacity="0.92" />
                  </radialGradient>
                  <radialGradient :id="`bs-${index}`" cx="50%" cy="50%" r="50%">
                    <stop offset="0.72" stop-color="#fff" stop-opacity="0" />
                    <stop offset="1" stop-color="#fff" stop-opacity="0.7" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="47" :fill="`url(#bl-${index})`" />
                <circle cx="50" cy="50" r="47" :fill="`url(#bs-${index})`" />
                <circle cx="50" cy="50" r="46.5" fill="none" stroke="#fff" stroke-opacity="0.8" />
                <ellipse cx="34" cy="24" rx="15" ry="8" fill="#fff" opacity="0.75" transform="rotate(-30 34 24)" />
                <path d="M70 82a36 36 0 0 0 14-26" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="2.4" stroke-linecap="round" />
                <text x="50" y="60" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="300" font-size="34" fill="#fff" fill-opacity="0.95">{{ index + 1 }}</text>
              </svg>
            </button>
          </div>
          <button
            v-if="popped.length === wishes.length"
            class="primary-button floating-cta"
            type="button"
            @click="goTo('memories')"
          >
            Next surprise <span aria-hidden="true">→</span>
          </button>
        </section>

        <!-- 3. MEMORY CARDS: holographic na card stack (dito lumalabas ang litrato ng customer) -->
        <section v-else-if="scene === 'memories'" key="memories" class="scene scene-memories">
          <p class="eyebrow"><span class="eyebrow-line" /> Memory {{ Math.min(cardIndex + 1, photos.length) }} of {{ photos.length }} <span class="eyebrow-line" /></p>
          <h3 class="scene-title">Your <em>memories</em></h3>
          <p class="scene-sub" aria-live="polite">{{ cardHint }}</p>
          <div class="cards-stage">
            <div class="cards-aura" />
            <div
              v-for="item in visibleCards"
              :key="item.i"
              class="mcard"
              :class="{ top: item.i === cardIndex, flipped: item.i === cardIndex && flipped }"
              :style="cardStyle(item.i)"
              :role="item.i === cardIndex ? 'button' : undefined"
              :tabindex="item.i === cardIndex ? 0 : -1"
              :aria-label="item.i === cardIndex ? (flipped ? 'Swipe the memory away' : 'Reveal the memory') : undefined"
              v-on="item.i === cardIndex ? cardHandlers : {}"
            >
              <div class="mcard-inner">
                <!-- likod ng card (sarado pa) -->
                <div class="mface mback">
                  <div class="back-frame">
                    <span class="back-eyebrow">For {{ c.recipient }}</span>
                    <div class="seal"><svg aria-hidden="true"><use href="#sl-heart" /></svg></div>
                    <span class="back-script">Tap to open</span>
                  </div>
                  <span class="sheen" />
                </div>
                <!-- harap ng card: ang litrato -->
                <div class="mface mfront">
                  <div class="mphoto">
                    <img :src="item.p.src" :alt="item.p.caption" draggable="false" />
                    <span class="foil" />
                    <span class="glare" />
                    <svg class="csp c1" aria-hidden="true"><use href="#sl-sparkle" /></svg>
                    <svg class="csp c2" aria-hidden="true"><use href="#sl-sparkle" /></svg>
                  </div>
                  <div class="mcap">
                    <span class="no">No. 0{{ item.i + 1 }}</span>
                    <p>{{ item.p.caption }}</p>
                  </div>
                  <span class="sheen" />
                </div>
              </div>
            </div>
          </div>
          <p v-if="flipped" class="swipe-hint">
            <span class="arr l">←</span> Swipe to continue <span class="arr r">→</span>
          </p>
          <button v-if="!flipped" class="primary-button" type="button" @click="flipCard">
            Reveal memory <span aria-hidden="true">✨</span>
          </button>
          <button v-else class="primary-button" type="button" @click="throwCard(1)">
            {{ cardIndex < photos.length - 1 ? "Next memory" : "Next surprise" }}
            <span aria-hidden="true">→</span>
          </button>
        </section>

        <!-- 4. GACHA LOVE COUPONS -->
        <section v-else-if="scene === 'gacha'" key="gacha" class="scene scene-gacha">
          <p class="eyebrow"><span class="eyebrow-line" /> Love coupons for {{ c.recipient }} <span class="eyebrow-line" /></p>
          <h3 class="scene-title">Spin the <em>gacha</em></h3>
          <p class="scene-sub" aria-live="polite">{{ gachaHint }}</p>
          <div class="gacha">
            <svg class="gacha-bow" viewBox="0 0 60 44" aria-hidden="true"><use href="#sl-bow" width="60" height="44" /></svg>
            <div class="gacha-dome" :class="{ shaking: gachaState === 'turning' }">
              <span v-for="n in 7" :key="n" class="mini-capsule" :class="`cap-${n}`" />
            </div>
            <div class="gacha-body">
              <span class="gacha-label">♥ LOVE ♥</span>
              <button
                class="gacha-knob"
                :class="{ turning: gachaState === 'turning', ready: canTurn }"
                type="button"
                :disabled="!canTurn"
                aria-label="Turn the knob"
                @click="turnKnob"
              >
                <svg aria-hidden="true"><use href="#sl-heart" /></svg>
              </button>
              <div class="gacha-chute" />
              <button
                v-if="gachaState === 'dropped'"
                class="capsule"
                type="button"
                aria-label="Open the capsule"
                :style="{ '--cap': capsuleColors[spin % capsuleColors.length] }"
                @click="openCapsule"
              />
            </div>
          </div>
          <Transition name="pop-in">
            <div v-if="gachaState === 'open'" :key="spin" class="coupon-wrap">
              <svg class="card-bow" viewBox="0 0 60 44" aria-hidden="true"><use href="#sl-bow" width="60" height="44" /></svg>
              <div class="coupon">
                <span class="chip">Love coupon {{ spin }} of {{ coupons.length }}</span>
                <p>{{ coupons[spin - 1] }}</p>
                <span v-if="redeemed.includes(spin - 1)" class="stamp">Redeemed ♥</span>
                <button
                  v-else
                  class="coupon-redeem"
                  type="button"
                  :disabled="!scratched"
                  :style="scratched ? null : { visibility: 'hidden' }"
                  @click="redeem"
                >
                  Redeem
                </button>
                <canvas
                  ref="scratchEl"
                  class="scratch"
                  :class="{ done: scratched }"
                  aria-label="Scratch to reveal the coupon"
                  @pointerdown="scratchStart"
                  @pointermove="scratchMove"
                  @pointerup="scratchEnd"
                  @pointercancel="scratchEnd"
                />
              </div>
            </div>
          </Transition>
          <button v-if="gachaDone" class="primary-button" type="button" @click="goTo('finale')">
            Next surprise <span aria-hidden="true">→</span>
          </button>
        </section>

        <!-- 5. TRACE THE HEART FINALE -->
        <section
          v-else
          key="finale"
          class="scene scene-finale"
          tabindex="0"
          aria-label="Trace a heart among the stars"
        >
          <span class="stars" aria-hidden="true" />
          <span class="moon" aria-hidden="true" />
          <span class="shoot" aria-hidden="true" />
          <span class="horizon" aria-hidden="true" />
          <span class="fclouds" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>
          <svg class="skyline" :viewBox="`0 0 ${stage.w} 100`" preserveAspectRatio="xMinYMax slice" aria-hidden="true">
            <g fill="#1b1342">
              <rect v-for="(b, i) in skyline" :key="i" :x="b.x" :y="100 - b.h" :width="b.w" :height="b.h" />
            </g>
            <g class="lights" fill="url(#sl-win)">
              <rect v-for="(b, i) in skyline" :key="i" :x="b.x" :y="100 - b.h" :width="b.w" :height="b.h" />
            </g>
          </svg>
          <div
            v-if="!revealed"
            class="trace"
            :class="{ lit: traceDone }"
            tabindex="0"
            role="button"
            aria-label="Light the heart (press Enter)"
            @keydown.enter.prevent="litAll"
          >
            <p class="sky-hint">
              {{ traceDone ? "Made with love 💗" : "Trace the heart" }}<br />
              {{ traceDone ? "" : "to light every star ✨" }}
              <span>{{ traceCount }} / {{ HEART.pts.length }}</span>
            </p>
            <svg
              ref="traceSvgEl"
              class="trace-svg"
              viewBox="0 0 200 190"
              @pointerdown.stop="traceDown"
              @pointermove="traceMove"
              @pointerup="traceUp"
              @pointercancel="traceUp"
            >
              <defs>
                <radialGradient id="tr-fill" cx="50%" cy="36%" r="70%">
                  <stop offset="0" stop-color="#ffd6e4" />
                  <stop offset="1" stop-color="#ff5f8d" />
                </radialGradient>
              </defs>
              <path class="trace-fill" :d="HEART.d" />
              <path class="trace-guide" :d="HEART.d" />
              <polyline v-if="traceOrder.length > 1" class="trace-link" :points="constellation" />
              <polyline v-if="tracePath.length > 1" class="trace-line" :points="traceTrail" />
              <g
                v-for="(p, i) in HEART.pts"
                :key="i"
                class="trace-star"
                :class="{ on: traceHit[i], pulse: i === 0 && !traceCount }"
                :transform="`translate(${p.x} ${p.y})`"
              >
                <circle class="trace-halo" r="11" />
                <path class="trace-st" d="M0 -6.5L1.7 -1.7L6.5 0L1.7 1.7L0 6.5L-1.7 1.7L-6.5 0L-1.7 -1.7Z" />
              </g>
              <circle v-if="traceTip" class="trace-tip" :cx="traceTip.x" :cy="traceTip.y" r="4" />
            </svg>
          </div>
          <Transition name="reveal">
            <div v-if="revealed" class="finale-card" @pointerdown.stop>
              <div class="finale-medallion">
                <img :src="photos[0].src" :alt="photos[0].caption" />
                <svg class="medallion-bow" viewBox="0 0 60 44" aria-hidden="true"><use href="#sl-gbow" width="60" height="44" /></svg>
              </div>
              <h3>Happy Birthday, <em>{{ c.recipient }}!</em></h3>
              <p>{{ c.message }}</p>
              <p class="finale-from">— {{ c.sender }} ♡</p>
              <Transition name="pop-in">
                <p v-if="showExtra" class="finale-extra">{{ c.extraMessage }}</p>
              </Transition>
              <div class="finale-actions">
                <button v-if="!showExtra" class="primary-button" type="button" @click="revealExtra">
                  One more sweet ✨
                </button>
                <button class="replay-button" type="button" @click="goTo('cover')">↻ Replay</button>
              </div>
            </div>
          </Transition>
        </section>
      </Transition>

      <!-- FX: canvas para sa confetti at fireworks -->
      <canvas ref="fxCanvas" class="fx-canvas" aria-hidden="true" />
      <div v-if="flash" class="flash" aria-hidden="true" />
    </div>
    <button
      class="fs-toggle"
      type="button"
      :title="bare ? 'Exit full view (Esc)' : 'Full view, walang device frame'"
      @click="toggleBare"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path v-if="!bare" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path v-else d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      </svg>
      <span>{{ bare ? "Exit" : "Full view" }}</span>
    </button>
    </div>
    </Teleport>
  </SurpriseShell>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import SurpriseShell from "./SurpriseShell.vue";

/* ===== Sample na litrato: gawa sa SVG (inline data URI), walang file na kailangan =====
   Sa totoong gamit, papalitan ito ng upload ng customer sa pamamagitan ng `content.photos`. */
function samplePhoto(top, bottom, emoji) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${top}"/>
          <stop offset="1" stop-color="${bottom}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g)"/>
      <circle cx="80" cy="90" r="46" fill="#fff" opacity=".35"/>
      <circle cx="330" cy="70" r="30" fill="#fff" opacity=".3"/>
      <circle cx="300" cy="320" r="60" fill="#fff" opacity=".25"/>
      <text x="200" y="250" font-size="150" text-anchor="middle">${emoji}</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form:
   recipient/sender, code + hint, 5 wishes, 1–3 photos (may caption), 3 coupons, message */
const sampleContent = {
  recipient: "Maria",
  sender: "Juan",
  code: "0214",
  hint: "the date of our first date",
  wishes: [
    "May all your dreams come true this year.",
    "More laughter than ever, every single day.",
    "Good health, peace and endless joy.",
    "New adventures with the people you love.",
    "Cake that never runs out 🍰",
  ],
  photos: [
    { src: samplePhoto("#ffd9e3", "#f7a8c0", "🎂"), caption: "Your best smile, always." },
    { src: samplePhoto("#ffe6c9", "#f9b9a3", "🌸"), caption: "Here's to another beautiful year." },
  ],
  coupons: ["Free milk tea 🧋", "One movie night, your pick 🎬", "A day with no chores ✨"],
  message: "Thank you for making every day brighter. I'm so lucky to celebrate you today!",
  extraMessage: "P.S. You're my favorite person in the whole world. Always. 💗",
};

const props = defineProps({
  content: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["close", "use"]);

const c = computed(() => ({ ...sampleContent, ...props.content }));
const wishes = computed(() => c.value.wishes.slice(0, 5));
const photos = computed(() => c.value.photos.slice(0, 3));
const coupons = computed(() => c.value.coupons.slice(0, 3));

/* mga talulot na bumabagsak sa background */
const petals = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 29 + 7) % 96}%`,
  width: `${9 + (i % 4) * 3}px`,
  height: `${12 + (i % 4) * 3}px`,
  animationDelay: `${(i * 1.3) % 9}s`,
  animationDuration: `${9 + (i % 5) * 1.6}s`,
}));

const scenes = [
  { id: "lock", label: "Secret Lock" },
  { id: "balloons", label: "Balloon Pop Wishes" },
  { id: "memories", label: "Memory Cards" },
  { id: "gacha", label: "Gacha Love Coupons" },
  { id: "finale", label: "Trace the Heart" },
];
const scene = ref("cover");
const sceneIndex = computed(() => scenes.findIndex((step) => step.id === scene.value));
const phoneEl = ref(null);

/* ===== FIT: isang disenyong 360 x 720 na kusang sumusukat sa kahit anong device =====
   scale = pinakamaliit sa (lapad / 360) at (taas / 720). Ang sobra sa isang gilid ay
   pinupuno ng background, kaya pareho ang itsura sa cellphone, iPad at laptop. */
const BASE_W = 360;
const BASE_H = 720;
const fitEl = ref(null);
const WIDE_W = 1000;
const WIDE_H = 600;
const stage = ref({ s: 1, w: BASE_W, h: BASE_H, panel: false, wide: false, x: 0, y: 0 });
const stageStyle = computed(() => ({
  width: `${stage.value.w}px`,
  height: `${stage.value.h}px`,
  left: `${stage.value.x}px`,
  top: `${stage.value.y}px`,
  transform: `scale(${stage.value.s})`,
  transformOrigin: "0 0",
}));
/* Sinusukat ang TOTOONG nakikitang lugar (hindi lang ang laki ng .fit), kasi puwedeng mas malaki
   ang container kaysa sa screen ng device at naka-clip lang ng frame. */
function visibleBox(el) {
  const r = el.getBoundingClientRect();
  let L = r.left;
  let T = r.top;
  let Rr = r.right;
  let B = r.bottom;
  let p = el.parentElement;
  while (p && p !== document.body && p !== document.documentElement) {
    const cs = getComputedStyle(p);
    if (cs.overflowX !== "visible" || cs.overflowY !== "visible" || (cs.clipPath && cs.clipPath !== "none")) {
      const pr = p.getBoundingClientRect();
      L = Math.max(L, pr.left);
      T = Math.max(T, pr.top);
      Rr = Math.min(Rr, pr.right);
      B = Math.min(B, pr.bottom);
    }
    p = p.parentElement;
  }
  L = Math.max(L, 0);
  T = Math.max(T, 0);
  Rr = Math.min(Rr, window.innerWidth);
  B = Math.min(B, window.innerHeight);
  return { r, L, T, Rr, B };
}
function fitStage() {
  const el = fitEl.value;
  if (!el || !el.offsetWidth) return;
  const { r, L, T, Rr, B } = visibleBox(el);
  const f = r.width / el.offsetWidth || 1;
  const W = (Rr - L) / f;
  const H = (B - T) / f;
  if (W < 50 || H < 50) return;
  const ox = (L - r.left) / f;
  const oy = (T - r.top) / f;
  if (W / H >= 1.05) {
    // LAPTOP / malapad na screen: totoong desktop layout (dalawang column), pinupuno ang buong screen
    const k = Math.min(W / WIDE_W, H / WIDE_H);
    stage.value = {
      s: k,
      w: Math.max(WIDE_W, Math.ceil(W / k)),
      h: Math.max(WIDE_H, Math.ceil(H / k)),
      panel: false,
      wide: true,
      x: Math.round(ox),
      y: Math.round(oy),
    };
  } else {
    // CELLPHONE / iPad na pahaba: pinupuno ang buong screen
    const k = Math.min(W / BASE_W, H / BASE_H);
    stage.value = {
      s: k,
      w: Math.max(BASE_W, Math.ceil(W / k)),
      h: Math.max(BASE_H, Math.ceil(H / k)),
      panel: false,
      wide: false,
      x: Math.round(ox),
      y: Math.round(oy),
    };
  }
}
function onDeviceChange() {
  goTo("cover");
  nextTick(fitStage);
  setTimeout(fitStage, 150);
  setTimeout(fitStage, 500);
}

/* ===== "NONE" na pagpipilian sa device selector =====
   Ang Cellphone / iPad / Laptop na pili ay galing sa SurpriseShell. Dinadagdagan dito ng "None" na
   button sa tabi nila. Kapag pinili: tinatanggal ang device frame at ipinapakita ang buong preview
   (sa ibaba ng top bar). Kapag pumili ulit ng device, babalik ang frame. */
const bare = ref(false);
const bareTop = ref(0);
const NONE_ICON =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="3" stroke-dasharray="3 3"/></svg>';
const NONE_SHAPES = '<rect x="3.5" y="5" width="17" height="14" rx="3" stroke-dasharray="3 3"></rect><path d="M9 12h6"></path>';
const STYLE_PROPS = ["background-color", "background-image", "color", "box-shadow", "border-color"];
let noneBtn = null;
let devBtns = [];
let noneTimer = null;

function snapStyle(el) {
  const cs = getComputedStyle(el);
  const o = {};
  STYLE_PROPS.forEach((p) => {
    o[p] = cs.getPropertyValue(p);
  });
  return o;
}
function applyStyle(el, o) {
  if (!el || !o) return;
  STYLE_PROPS.forEach((p) => el.style.setProperty(p, o[p], "important"));
}
function clearStyle(el) {
  if (!el) return;
  STYLE_PROPS.forEach((p) => el.style.removeProperty(p));
}
function isActiveBtn(b) {
  const cs = getComputedStyle(b);
  const bg = cs.backgroundColor;
  return (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") || (cs.backgroundImage && cs.backgroundImage !== "none");
}
function headerBottom() {
  const ref0 = devBtns[0];
  if (!ref0) return 0;
  let n = ref0.parentElement;
  while (n && n !== document.body) {
    const r = n.getBoundingClientRect();
    if (r.top <= 4 && r.height >= 48 && r.height <= 220 && r.width >= window.innerWidth * 0.8) return Math.round(r.bottom);
    n = n.parentElement;
  }
  return Math.round(ref0.getBoundingClientRect().bottom + 16);
}
function setBare(value) {
  bare.value = value;
  document.body.style.overflow = value ? "hidden" : "";
  nextTick(fitStage);
  setTimeout(fitStage, 120);
}
function enterNone() {
  if (bare.value) return;
  bareTop.value = headerBottom();
  if (noneBtn && devBtns.length) {
    const activeBtn = devBtns.find(isActiveBtn);
    const inactiveBtn = devBtns.find((b) => b !== activeBtn) || devBtns[0];
    const inactiveSnap = snapStyle(inactiveBtn);
    const activeSnap = activeBtn ? snapStyle(activeBtn) : null;
    if (activeBtn) applyStyle(activeBtn, inactiveSnap);
    if (activeSnap) applyStyle(noneBtn, activeSnap);
  }
  setBare(true);
}
function exitNone() {
  if (!bare.value) return;
  devBtns.forEach(clearStyle);
  clearStyle(noneBtn);
  setBare(false);
}
function toggleBare() {
  if (bare.value) exitNone();
  else enterNone();
}
function onNoneClick(event) {
  event.preventDefault();
  event.stopPropagation();
  toggleBare();
}
function onDeviceBtnClick() {
  if (bare.value) exitNone();
}
function installNoneOption() {
  if (noneBtn) return true;
  const lap = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Laptop");
  if (!lap || !lap.parentElement) return false;
  const group = lap.parentElement;
  devBtns = [...group.children].filter((b) => b.tagName === "BUTTON" && /^(Cellphone|iPad|Laptop)$/.test(b.textContent.trim()));
  if (devBtns.length < 2) return false;
  const inactive = devBtns.find((b) => !isActiveBtn(b)) || devBtns[0];
  const btn = inactive.cloneNode(true);
  btn.removeAttribute("disabled");
  btn.setAttribute("data-sl-none", "1");
  const walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT);
  let done = false;
  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue.trim()) {
      node.nodeValue = done ? "" : "None";
      done = true;
    }
    node = walker.nextNode();
  }
  btn.removeAttribute("aria-pressed");
  btn.removeAttribute("aria-selected");
  btn.classList.remove("active", "is-active", "selected", "on", "current");
  const svg = btn.querySelector("svg");
  if (svg) {
    // pinapanatili ang class at laki ng orihinal na icon, ang laman lang ang pinapalitan
    svg.innerHTML = NONE_SHAPES;
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
  } else {
    btn.insertAdjacentHTML("afterbegin", NONE_ICON);
  }
  btn.addEventListener("click", onNoneClick);
  group.appendChild(btn);
  devBtns.forEach((b) => b.addEventListener("click", onDeviceBtnClick, true));
  noneBtn = btn;
  return true;
}
function removeNoneOption() {
  clearInterval(noneTimer);
  devBtns.forEach((b) => {
    b.removeEventListener("click", onDeviceBtnClick, true);
    clearStyle(b);
  });
  if (noneBtn) {
    noneBtn.removeEventListener("click", onNoneClick);
    noneBtn.remove();
    noneBtn = null;
  }
  devBtns = [];
}
function onEscCapture(event) {
  if (event.key === "Escape" && bare.value) {
    event.stopPropagation();
    event.preventDefault();
    exitNone();
  }
}
let fitObserver = null;

/* lumulutang na sparkles sa background (fixed na posisyon para pareho lagi) */
const ambient = Array.from({ length: 10 }, (_, i) => ({
  left: `${((i * 37 + 11) % 90) + 3}%`,
  top: `${((i * 53 + 7) % 86) + 5}%`,
  width: `${6 + (i % 3) * 4}px`,
  height: `${6 + (i % 3) * 4}px`,
  animationDelay: `${(i % 5) * 0.8}s`,
  animationDuration: `${3 + (i % 4)}s`,
}));

/* skyline ng lungsod sa Finale (deterministic) */
const skyline = computed(() => {
  const list = [];
  let x = -4;
  let i = 0;
  while (x < stage.value.w + 4) {
    const w = 16 + ((i * 7) % 14);
    const h = 28 + ((i * 37) % 58);
    list.push({ x, w, h });
    x += w + (i % 3);
    i += 1;
  }
  return list;
});

function buzz(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* walang vibration sa device na ito */
  }
}

/* ===== Timers ===== */
const timers = new Set();
let fireworksInterval = null;
function later(fn, ms) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    fn();
  }, ms);
  timers.add(timer);
}
function clearTimers() {
  timers.forEach(clearTimeout);
  timers.clear();
  clearInterval(fireworksInterval);
  fireworksInterval = null;
}

/* =====================================================================
   FX ENGINE (canvas): confetti, rocket, fireworks (bilog + hugis-puso)
   ===================================================================== */
const fxCanvas = ref(null);
let ctx = null;
let W = 0;
let H = 0;
let raf = 0;
let last = 0;
let resizeObserver = null;
const parts = [];
const rand = (a, b) => a + Math.random() * (b - a);
const confettiColors = ["#ff8fab", "#ffc8dd", "#e8597a", "#ffd166", "#a0c4ff", "#cdb4db", "#ffffff"];
const fireworkPalettes = [
  ["#ff9fbc", "#ffd1de", "#ffe3a3"],
  ["#ffd166", "#fff1c1", "#ff9fbc"],
  ["#f7a8d8", "#ffe0ef", "#ffffff"],
  ["#9cc9ff", "#d9ebff", "#ffd1de"],
];

function resizeCanvas() {
  const canvas = fxCanvas.value;
  const phone = phoneEl.value;
  if (!canvas || !phone) return;
  W = phone.offsetWidth;
  H = phone.offsetHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function addPart(p) {
  parts.push(p);
  if (!raf && ctx) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
}

function tick(now) {
  if (!ctx) {
    raf = 0;
    return;
  }
  const dt = Math.min(2.5, (now - last) / 16.667);
  last = now;
  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = "round";
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const p = parts[i];
    if (!update(p, dt)) {
      parts.splice(i, 1);
      continue;
    }
    draw(p);
  }
  raf = parts.length ? requestAnimationFrame(tick) : 0;
}

function update(p, dt) {
  if (p.t === "confetti") {
    p.vy += p.g * dt;
    p.vx *= Math.pow(0.985, dt);
    p.vy *= Math.pow(0.992, dt);
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    p.flip += 0.18 * dt;
    p.life -= dt;
    return p.life > 0 && p.y < H + 20;
  }
  if (p.t === "spark") {
    p.trail.push(p.x, p.y);
    if (p.trail.length > p.tl * 2) p.trail.splice(0, 2);
    const f = Math.pow(p.fr, dt);
    p.vx *= f;
    p.vy *= f;
    p.vy += p.g * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    return p.life > 0;
  }
  if (p.t === "rocket") {
    p.trail.push(p.x, p.y);
    if (p.trail.length > 24) p.trail.splice(0, 2);
    p.y += p.vy * dt;
    p.x += Math.sin(p.y * 0.08) * 0.25 * dt;
    if (Math.random() < 0.7) {
      addPart({
        t: "spark", x: p.x, y: p.y, vx: rand(-0.3, 0.3), vy: rand(0.2, 0.8),
        color: "#ffe9b0", life: 18, max: 18, g: 0.02, fr: 0.98, tl: 3, size: 1.4, trail: [],
      });
    }
    if (p.y <= p.ty) {
      explode(p.x, p.y, p.heart);
      return false;
    }
    return true;
  }
  if (p.t === "ring") p.r += p.dr * dt;
  p.life -= dt; // glow / ring
  return p.life > 0;
}

function draw(p) {
  if (p.t === "confetti") {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, Math.cos(p.flip));
    ctx.globalAlpha = Math.min(1, p.life / 25);
    ctx.fillStyle = p.color;
    if (p.shape === "heart") {
      const k = p.w * 0.55;
      ctx.beginPath();
      ctx.moveTo(0, k * 0.9);
      ctx.bezierCurveTo(-k * 1.3, k * 0.1, -k * 0.7, -k * 0.9, 0, -k * 0.25);
      ctx.bezierCurveTo(k * 0.7, -k * 0.9, k * 1.3, k * 0.1, 0, k * 0.9);
      ctx.fill();
    } else {
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    ctx.restore();
    return;
  }
  if (p.t === "ring") {
    ctx.globalAlpha = Math.max(0, (p.life / p.max) * 0.7);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 6.283);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }
  if (p.t === "glow") {
    const a = p.life / p.max;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    g.addColorStop(0, `rgba(255,255,255,${0.55 * a})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 6.283);
    ctx.fill();
    return;
  }
  let a = p.t === "rocket" ? 1 : Math.min(1, (p.life / p.max) * 1.6);
  if (p.t === "spark" && p.life < p.max * 0.35 && Math.random() < 0.35) a *= 0.3;
  const trail = p.trail;
  const n = trail.length / 2;
  ctx.strokeStyle = p.color;
  for (let k = 1; k < n; k += 1) {
    ctx.globalAlpha = (k / n) * a * 0.9;
    ctx.lineWidth = p.size * (k / n) + 0.3;
    ctx.beginPath();
    ctx.moveTo(trail[(k - 1) * 2], trail[(k - 1) * 2 + 1]);
    ctx.lineTo(trail[k * 2], trail[k * 2 + 1]);
    ctx.stroke();
  }
  ctx.globalAlpha = a;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 0.55, 0, 6.283);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function explode(x, y, heart = false) {
  const pal = fireworkPalettes[Math.floor(Math.random() * fireworkPalettes.length)];
  addPart({ t: "glow", x, y, r: rand(70, 100), life: 12, max: 12 });
  const count = heart ? 64 : 90;
  for (let i = 0; i < count; i += 1) {
    let vx;
    let vy;
    if (heart) {
      const t = (i / count) * Math.PI * 2;
      const hx = 16 * Math.sin(t) ** 3;
      const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      vx = hx * 0.2;
      vy = -hy * 0.2;
    } else {
      const ang = Math.random() * Math.PI * 2;
      const sp = Math.sqrt(Math.random()) * rand(2.4, 5.4);
      vx = Math.cos(ang) * sp;
      vy = Math.sin(ang) * sp;
    }
    const life = rand(55, 90);
    addPart({
      t: "spark", x, y, vx, vy, color: pal[i % pal.length], life, max: life,
      g: heart ? 0.012 : 0.045, fr: heart ? 0.97 : 0.972, tl: 8, size: rand(1.8, 3), trail: [],
    });
  }
}

function launchRocket({ x, y }, heart = false) {
  if (!H) return;
  addPart({
    t: "rocket", x: Math.min(Math.max(x, 24), W - 24), y: H + 10, ty: y,
    vy: -Math.max(9, (H - y) / 34), color: "#ffeab5", size: 2.4, trail: [], heart,
  });
}

function confettiAt({ x, y }, count = 38) {
  for (let i = 0; i < count; i += 1) {
    const ang = rand(-Math.PI * 0.95, -Math.PI * 0.05);
    const sp = rand(4, 10);
    addPart({
      t: "confetti", x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: 0.22,
      rot: rand(0, 6), vr: rand(-0.3, 0.3), flip: rand(0, 6), w: rand(6, 10), h: rand(3, 5),
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)], life: rand(70, 120),
    });
  }
}

const heartColors = ["#ff7aa8", "#ff9fc3", "#ffb3c7", "#f0507f", "#ffffff", "#ffc2a8"];
function heartsAt({ x, y }, count = 16) {
  for (let i = 0; i < count; i += 1) {
    const ang = rand(-Math.PI * 0.97, -Math.PI * 0.03);
    const sp = rand(3, 8.5);
    addPart({
      t: "confetti", shape: "heart", x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: 0.12,
      rot: rand(-0.5, 0.5), vr: rand(-0.08, 0.08), flip: 0, w: rand(9, 16), h: 0,
      color: heartColors[Math.floor(Math.random() * heartColors.length)], life: rand(70, 110),
    });
  }
}

/* sparkle na sumusunod sa daliri / mouse, at singsing sa bawat pindot */
const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastTrail = 0;
const trailColors = ["#ffd6e4", "#ff9fc3", "#fff1c9", "#ffffff", "#f7a8c9"];
function trail(event) {
  if (reduceMotion || !phoneEl.value) return;
  const now = performance.now();
  if (now - lastTrail < 45) return;
  lastTrail = now;
  const p = pointFrom(event);
  for (let i = 0; i < 2; i += 1) {
    addPart({
      t: "spark", x: p.x + rand(-4, 4), y: p.y + rand(-4, 4), vx: rand(-0.5, 0.5), vy: rand(-0.2, 0.8),
      color: trailColors[Math.floor(Math.random() * trailColors.length)], life: rand(22, 34), max: 34,
      g: 0.03, fr: 0.97, tl: 3, size: rand(1.4, 2.4), trail: [],
    });
  }
}
function tapRing(event) {
  if (reduceMotion || !phoneEl.value) return;
  const p = pointFrom(event);
  addPart({ t: "ring", x: p.x, y: p.y, r: 6, dr: 2.2, life: 26, max: 26, color: "#ff7aa8" });
}

function confettiRain() {
  for (let i = 0; i < 16; i += 1) {
    addPart({
      t: "confetti", x: rand(0, W), y: rand(-30, -5), vx: rand(-0.8, 0.8), vy: rand(1, 2.4), g: 0.015,
      rot: rand(0, 6), vr: rand(-0.2, 0.2), flip: rand(0, 6), w: rand(6, 9), h: rand(3, 5),
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)], life: 260,
    });
  }
}

function clearFx() {
  parts.length = 0;
  if (ctx) ctx.clearRect(0, 0, W, H);
}

// posisyon ng pointer/button relative sa loob ng phone (hinahati sa scale ng SurpriseShell)
function pointFrom(event) {
  const phone = phoneEl.value;
  const rect = phone.getBoundingClientRect();
  const scale = rect.width / phone.offsetWidth || 1;
  if (event?.clientX || event?.clientY) {
    return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
  }
  const target = event?.currentTarget?.getBoundingClientRect?.();
  if (target) {
    return {
      x: (target.left + target.width / 2 - rect.left) / scale,
      y: (target.top + target.height / 2 - rect.top) / scale,
    };
  }
  return { x: phone.clientWidth / 2, y: phone.clientHeight / 3 };
}

/* ===== 0. Cover: pop-up birthday card (hilahin ang cover para bumukas) ===== */
const cardStageEl = ref(null);
const cardEl = ref(null);
const cardP = ref(0); // 0 = sarado, 1 = bukas
const cardDone = ref(false);
const cardDragging = ref(false);
const cardPop = computed(() => Math.min(1, Math.max(0, (cardP.value - 0.42) / 0.5)));
let cardRaf = 0;
let cardStartX = 0;
let cardStartP = 0;
let cardMoved = 0;

/* mga flag ng bunting sa loob ng card (nasa kurba ng M14 22 Q130 58 246 22) */
const BUNTING = Array.from({ length: 7 }, (_, i) => {
  const t = 0.08 + i * 0.14;
  const x = (1 - t) ** 2 * 14 + 2 * (1 - t) * t * 130 + t * t * 246;
  const y = (1 - t) ** 2 * 22 + 2 * (1 - t) * t * 58 + t * t * 22;
  return { x: +x.toFixed(1), y: +y.toFixed(1), c: ["#ff8fb0", "#ffd37a", "#c9b5ff"][i % 3] };
});

function pxScale() {
  const phone = phoneEl.value;
  if (!phone) return 1;
  return phone.getBoundingClientRect().width / phone.offsetWidth || 1;
}
function tweenCard(to, ms, done) {
  cancelAnimationFrame(cardRaf);
  const from = cardP.value;
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / ms);
    cardP.value = from + (to - from) * (1 - (1 - k) ** 3);
    if (k < 1) {
      cardRaf = requestAnimationFrame(step);
    } else {
      cardRaf = 0;
      done?.();
    }
  };
  cardRaf = requestAnimationFrame(step);
}
function openCard() {
  if (cardDone.value) return;
  buzz(18);
  tweenCard(1, 750, finishCard);
}
function finishCard() {
  if (cardDone.value) return;
  cardDone.value = true;
  buzz(30);
  const p = pointFrom({ currentTarget: cardStageEl.value });
  confettiAt(p, 56);
  heartsAt(p, 14);
  later(() => goTo("lock"), 2600);
}
function cardDown(event) {
  if (cardDone.value) return;
  cancelAnimationFrame(cardRaf);
  cardDragging.value = true;
  cardMoved = 0;
  cardStartX = event.clientX;
  cardStartP = cardP.value;
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function cardMove(event) {
  if (!cardDragging.value) return;
  const w = cardEl.value?.offsetWidth || 160;
  const dx = (event.clientX - cardStartX) / pxScale();
  cardMoved = Math.max(cardMoved, Math.abs(dx));
  cardP.value = Math.min(1, Math.max(0, cardStartP - dx / (w * 1.7)));
  if (cardP.value >= 0.985) {
    cardDragging.value = false;
    tweenCard(1, 200, finishCard);
  }
}
function cardUp() {
  if (!cardDragging.value) return;
  cardDragging.value = false;
  if (cardMoved < 8 || cardP.value > 0.4) openCard();
  else tweenCard(0, 450);
}
function resetCard() {
  cancelAnimationFrame(cardRaf);
  cardRaf = 0;
  cardP.value = 0;
  cardDone.value = false;
  cardDragging.value = false;
}

/* ===== 1. Secret Lock ===== */
const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "ok"];
const entered = ref("");
const lockShake = ref(false);
const lockBump = ref(false);
const unlocked = ref(false);
const flash = ref(false);

function pressKey(key, event) {
  if (unlocked.value || lockShake.value) return;
  buzz(6);
  lockBump.value = true;
  later(() => {
    lockBump.value = false;
  }, 200);
  if (event && key !== "back" && key !== "ok") heartsAt(pointFrom(event), 4);
  if (key === "back") {
    entered.value = entered.value.slice(0, -1);
  } else if (key === "ok") {
    checkCode();
  } else if (entered.value.length < c.value.code.length) {
    entered.value += key;
    if (entered.value.length === c.value.code.length) later(checkCode, 250);
  }
}

function checkCode() {
  if (unlocked.value || lockShake.value) return;
  if (entered.value === c.value.code) {
    unlocked.value = true;
    buzz(30);
    flash.value = true;
    confettiAt({ x: W / 2, y: H * 0.3 }, 60);
    later(() => {
      flash.value = false;
    }, 700);
    later(() => goTo("balloons"), 1300);
  } else {
    lockShake.value = true;
    buzz(40);
    later(() => {
      lockShake.value = false;
      entered.value = "";
    }, 550);
  }
}

/* ===== 2. Balloon Pop Wishes ===== */
const balloonPalettes = [
  { b: "#ffb0c8", l: "#fff", d: "#d6406d" },
  { b: "#e8c8ff", l: "#fff", d: "#a561d8" },
  { b: "#ffcfb8", l: "#fff", d: "#e8785a" },
  { b: "#ffc0dd", l: "#fff", d: "#cc3f8a" },
  { b: "#ffd0e0", l: "#fff", d: "#e8507b" },
];
const palette = (index) => balloonPalettes[index % balloonPalettes.length];
const balloonSpots = [
  { x: 4, t: 6, d: 0 },
  { x: 38, t: 0, d: 0.6 },
  { x: 70, t: 8, d: 1.2 },
  { x: 18, t: 42, d: 0.3 },
  { x: 56, t: 46, d: 0.9 },
];
const popped = ref([]);

function balloonStyle(index) {
  const spot = balloonSpots[index % balloonSpots.length];
  return {
    left: `${spot.x}%`,
    top: `${spot.t}%`,
    animationDelay: `${spot.d}s`,
  };
}

function popBalloon(index, event) {
  if (popped.value.includes(index)) return;
  popped.value = [...popped.value, index];
  buzz(14);
  const point = pointFrom(event);
  confettiAt(point, 22);
  heartsAt(point, 12);
}
/* i-slide ang daliri / mouse (habang pinipindot) sa ibabaw ng mga lobo para pumutok sila */
function sliceBalloons(event) {
  if (event.pointerType === "mouse" && event.buttons !== 1) return;
  const el = document.elementFromPoint(event.clientX, event.clientY);
  const b = el && el.closest ? el.closest(".balloon") : null;
  if (!b || b.disabled) return;
  popBalloon(Number(b.dataset.i), event);
}

/* ===== 3. Memory Cards (holographic, 3D flip, swipe) ===== */
const TILT0 = { x: 0, y: 0, gx: 50, gy: 50, on: 0 };
const cardIndex = ref(0);
const flipped = ref(false);
const leaveDir = ref(0);
const drag = ref({ x: 0, y: 0, active: false });
const tilt = ref({ ...TILT0 });
const visibleCards = computed(() =>
  photos.value
    .map((p, i) => ({ p, i }))
    .filter(({ i }) => i >= cardIndex.value && i < cardIndex.value + 3),
);
const cardHint = computed(() => {
  if (!flipped.value) return "Tap the card to reveal it.";
  return "Double-tap for a burst of hearts, swipe away to continue.";
});

function uiScale() {
  const phone = phoneEl.value;
  return phone ? phone.getBoundingClientRect().width / phone.offsetWidth || 1 : 1;
}
function cardStyle(i) {
  const o = i - cardIndex.value;
  if (o !== 0) {
    return {
      transform: `translateY(${o * 14}px) scale(${1 - o * 0.06}) rotate(${o % 2 ? 4 : -4}deg)`,
      zIndex: photos.value.length - o,
      filter: `brightness(${1 - o * 0.05})`,
    };
  }
  const t = tilt.value;
  const base = {
    zIndex: 20,
    "--hx": `${t.gx}%`,
    "--hy": `${t.gy}%`,
    "--holo": t.on,
  };
  if (leaveDir.value) {
    return {
      ...base,
      transform: `translate(${leaveDir.value * 460}px, -40px) rotate(${leaveDir.value * 28}deg)`,
      opacity: 0,
      transition: "transform 0.45s cubic-bezier(0.5, 0, 0.9, 0.4), opacity 0.45s",
    };
  }
  return {
    ...base,
    transform: `translate(${drag.value.x}px, ${drag.value.y}px) rotate(${drag.value.x * 0.05}deg) perspective(900px) rotateX(${t.x}deg) rotateY(${t.y}deg)`,
    transition: drag.value.active ? "none" : undefined,
  };
}
function updateTilt(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  tilt.value = { x: (py - 0.5) * -18, y: (px - 0.5) * 18, gx: px * 100, gy: py * 100, on: 1 };
}
function cardCenter() {
  const el = phoneEl.value?.querySelector(".mcard.top");
  return el ? pointFrom({ currentTarget: el }) : { x: W / 2, y: H * 0.45 };
}
let dragStart = null;
let dragMoved = 0;
function onCardDown(event) {
  if (leaveDir.value) return;
  dragStart = { x: event.clientX, y: event.clientY };
  dragMoved = 0;
  drag.value = { x: 0, y: 0, active: true };
  event.currentTarget.setPointerCapture?.(event.pointerId);
}
function onCardMove(event) {
  if (leaveDir.value) return;
  updateTilt(event);
  if (!dragStart) return;
  const scale = uiScale();
  const dx = (event.clientX - dragStart.x) / scale;
  const dy = (event.clientY - dragStart.y) / scale;
  dragMoved = Math.max(dragMoved, Math.hypot(dx, dy));
  if (flipped.value) drag.value = { x: dx, y: dy * 0.4, active: true };
}
function onCardUp() {
  if (!dragStart) return;
  const dx = drag.value.x;
  const wasTap = dragMoved < 8;
  dragStart = null;
  drag.value = { x: 0, y: 0, active: false };
  if (!flipped.value) {
    if (wasTap) flipCard();
    return;
  }
  if (Math.abs(dx) > 80) throwCard(dx > 0 ? 1 : -1);
}
function onCardCancel() {
  dragStart = null;
  drag.value = { x: 0, y: 0, active: false };
  tilt.value = { ...TILT0 };
}
function onCardLeave() {
  if (!dragStart) tilt.value = { ...TILT0 };
}
function onCardKey(event) {
  event.preventDefault();
  if (!flipped.value) flipCard();
  else throwCard(1);
}
const cardHandlers = {
  pointerdown: onCardDown,
  pointermove: onCardMove,
  pointerup: onCardUp,
  pointercancel: onCardCancel,
  pointerleave: onCardLeave,
  dblclick: () => {
    if (!flipped.value || leaveDir.value) return;
    heartsAt(cardCenter(), 24);
    buzz(16);
  },
  keydown: (event) => {
    if (event.key === "Enter" || event.key === " ") onCardKey(event);
  },
};

function flipCard() {
  if (flipped.value || leaveDir.value) return;
  flipped.value = true;
  buzz(18);
  confettiAt(cardCenter(), 38);
}
function throwCard(dir) {
  if (leaveDir.value) return;
  if (!flipped.value) {
    flipCard();
    return;
  }
  leaveDir.value = dir;
  buzz(10);
  later(() => {
    leaveDir.value = 0;
    flipped.value = false;
    tilt.value = { ...TILT0 };
    if (cardIndex.value < photos.value.length - 1) {
      cardIndex.value += 1;
    } else {
      goTo("gacha");
    }
  }, 430);
}

/* ===== 4. Gacha Love Coupons (3 ikot) ===== */
const capsuleColors = ["#ff8fab", "#9cc0f5", "#ffd166"];
const spin = ref(0);
const gachaState = ref("idle"); // idle → turning → dropped → open
const redeemed = ref([]);
const spinsLeft = computed(() => coupons.value.length - spin.value);
const canTurn = computed(
  () => spinsLeft.value > 0 && (gachaState.value === "idle" || gachaState.value === "open"),
);
const gachaDone = computed(() => spinsLeft.value === 0 && gachaState.value === "open");
const gachaHint = computed(() => {
  if (gachaState.value === "open" && !scratched.value) return "Scratch the coupon with your finger ✨";
  if (gachaState.value === "turning") return "Rolling...";
  if (gachaState.value === "dropped") return "Tap the capsule to open it!";
  if (gachaDone.value) return "All coupons collected! 💝";
  return `Turn the knob · ${spinsLeft.value} ${spinsLeft.value === 1 ? "spin" : "spins"} left`;
});

function turnKnob() {
  if (!canTurn.value) return;
  buzz(12);
  gachaState.value = "turning";
  later(() => {
    gachaState.value = "dropped";
  }, 900);
}
function openCapsule(event) {
  if (gachaState.value !== "dropped") return;
  spin.value += 1;
  gachaState.value = "open";
  buzz(16);
  confettiAt(pointFrom(event), 24);
  scratched.value = false;
  scratchMoves = 0;
  nextTick(() => requestAnimationFrame(initScratch));
}

/* scratch-off: kaskasin ang coupon gamit ang daliri para lumabas ang laman */
const scratchEl = ref(null);
const scratched = ref(false);
let scratchDown = false;
let scratchMoves = 0;
function initScratch() {
  const cv = scratchEl.value;
  if (!cv) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = cv.offsetWidth;
  const h = cv.offsetHeight;
  if (!w || !h) return;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  const g = cv.getContext("2d");
  g.globalCompositeOperation = "source-over";
  const grad = g.createLinearGradient(0, 0, cv.width, cv.height);
  grad.addColorStop(0, "#ffd0e0");
  grad.addColorStop(0.5, "#f58aa8");
  grad.addColorStop(1, "#ffc2d6");
  g.fillStyle = grad;
  g.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < 140; i += 1) {
    g.fillStyle = `rgba(255,255,255,${rand(0.15, 0.5)})`;
    g.beginPath();
    g.arc(rand(0, cv.width), rand(0, cv.height), rand(1, 3) * dpr, 0, 6.283);
    g.fill();
  }
  g.fillStyle = "#fff";
  g.font = `600 ${Math.round(17 * dpr)}px "Jost", system-ui, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("✨ Scratch to reveal ✨", cv.width / 2, cv.height / 2);
}
function scratchAt(event) {
  const cv = scratchEl.value;
  if (!cv) return;
  const r = cv.getBoundingClientRect();
  const x = ((event.clientX - r.left) / r.width) * cv.width;
  const y = ((event.clientY - r.top) / r.height) * cv.height;
  const g = cv.getContext("2d");
  g.globalCompositeOperation = "destination-out";
  g.beginPath();
  g.arc(x, y, 22 * (cv.width / cv.offsetWidth), 0, 6.283);
  g.fill();
}
function scratchStart(event) {
  if (scratched.value) return;
  scratchDown = true;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  scratchAt(event);
}
function scratchMove(event) {
  if (!scratchDown || scratched.value) return;
  scratchAt(event);
  scratchMoves += 1;
  if (scratchMoves % 5 === 0) checkScratch(event);
}
function scratchEnd(event) {
  scratchDown = false;
  if (!scratched.value) checkScratch(event);
}
function checkScratch(event) {
  const cv = scratchEl.value;
  if (!cv || scratched.value) return;
  const g = cv.getContext("2d");
  const w = cv.width;
  const h = cv.height;
  const data = g.getImageData(0, 0, w, h).data;
  let clear = 0;
  let total = 0;
  for (let y = 0; y < h; y += 16) {
    for (let x = 0; x < w; x += 16) {
      total += 1;
      if (data[(y * w + x) * 4 + 3] < 40) clear += 1;
    }
  }
  if (clear / total > 0.5) {
    scratched.value = true;
    buzz(24);
    const p = pointFrom(event);
    confettiAt(p, 40);
    heartsAt(p, 18);
  }
}
function redeem(event) {
  redeemed.value = [...redeemed.value, spin.value - 1];
  buzz(20);
  confettiAt(pointFrom(event), 26);
}

/* ===== 5. Finale: ikonekta ang mga bituin para mabuo ang puso ===== */
const revealed = ref(false);
const showExtra = ref(false);

function buildHeart() {
  const raw = [];
  for (let i = 0; i <= 360; i += 1) {
    const t = Math.PI + (i / 360) * Math.PI * 2; // simula sa ibaba ng puso
    raw.push({
      x: 16 * Math.sin(t) ** 3,
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
    });
  }
  const xs = raw.map((p) => p.x);
  const ys = raw.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const k = Math.min(172 / (maxX - minX), 160 / (maxY - minY));
  const ox = 100 - ((minX + maxX) / 2) * k;
  const oy = 95 - ((minY + maxY) / 2) * k;
  const full = raw.map((p) => ({ x: +(p.x * k + ox).toFixed(1), y: +(p.y * k + oy).toFixed(1) }));
  const lens = [0];
  for (let i = 1; i < full.length; i += 1) {
    lens.push(lens[i - 1] + Math.hypot(full[i].x - full[i - 1].x, full[i].y - full[i - 1].y));
  }
  const total = lens[lens.length - 1];
  const pts = [];
  let at = 0;
  for (let j = 0; j < 24; j += 1) {
    const target = (total * j) / 24;
    while (at < lens.length - 1 && lens[at] < target) at += 1;
    pts.push(full[at]);
  }
  return { pts, d: `M${full.map((p) => `${p.x} ${p.y}`).join("L")}Z` };
}
const HEART = buildHeart();
const HIT_R = 13; // gaano kalapit ang daliri para umilaw ang bituin

const traceSvgEl = ref(null);
const traceHit = ref(Array(HEART.pts.length).fill(false));
const traceOrder = ref([]);
const tracePath = ref([]);
const traceTip = ref(null);
const traceDragging = ref(false);
const traceDone = ref(false);
const traceCount = computed(() => traceHit.value.filter(Boolean).length);
const constellation = computed(() => traceOrder.value.map((i) => `${HEART.pts[i].x},${HEART.pts[i].y}`).join(" "));
const traceTrail = computed(() => tracePath.value.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "));

function svgPoint(event) {
  const r = traceSvgEl.value.getBoundingClientRect();
  return { x: ((event.clientX - r.left) / r.width) * 200, y: ((event.clientY - r.top) / r.height) * 190 };
}
function traceAt(event) {
  const p = svgPoint(event);
  traceTip.value = p;
  tracePath.value.push(p);
  if (tracePath.value.length > 26) tracePath.value.shift();
  let lit = false;
  HEART.pts.forEach((star, i) => {
    if (traceHit.value[i]) return;
    if (Math.hypot(star.x - p.x, star.y - p.y) < HIT_R) {
      traceHit.value[i] = true;
      traceOrder.value.push(i);
      lit = true;
    }
  });
  if (lit) {
    buzz(8);
    heartsAt(pointFrom(event), 2);
    if (traceCount.value >= HEART.pts.length) finishTrace();
  }
}
function traceDown(event) {
  if (traceDone.value) return;
  traceDragging.value = true;
  tracePath.value = [];
  event.currentTarget.setPointerCapture?.(event.pointerId);
  traceAt(event);
}
function traceMove(event) {
  if (traceDragging.value) traceAt(event);
}
function traceUp() {
  traceDragging.value = false;
  traceTip.value = null;
  tracePath.value = [];
}
/* para sa keyboard: Enter ang magpapailaw ng natitirang bituin */
function litAll() {
  if (traceDone.value) return;
  HEART.pts.forEach((_, i) => {
    if (!traceHit.value[i]) {
      traceHit.value[i] = true;
      traceOrder.value.push(i);
    }
  });
  finishTrace();
}
function finishTrace() {
  if (traceDone.value) return;
  traceDone.value = true;
  traceDragging.value = false;
  traceTip.value = null;
  tracePath.value = [];
  buzz(30);
  const p = pointFrom({ currentTarget: traceSvgEl.value });
  confettiAt(p, 40);
  heartsAt(p, 22);
  launchRocket({ x: W / 2, y: H * 0.22 }, true);
  later(() => {
    revealed.value = true;
    launchRocket({ x: W * 0.25, y: H * 0.17 }, true);
    launchRocket({ x: W * 0.75, y: H * 0.19 }, true);
    later(confettiRain, 500);
    fireworksInterval = setInterval(() => {
      randomFirework();
      if (Math.random() < 0.5) confettiRain();
    }, 2600);
  }, 1500);
}
function randomFirework() {
  if (!W) return;
  launchRocket({ x: W * (0.15 + Math.random() * 0.7), y: H * (0.1 + Math.random() * 0.18) }, Math.random() < 0.3);
}
function revealExtra() {
  showExtra.value = true;
  launchRocket({ x: W * 0.3, y: H * 0.16 }, true);
  launchRocket({ x: W * 0.7, y: H * 0.14 }, true);
}

/* ===== Lipat ng eksena ===== */
function goTo(id) {
  clearTimers();
  clearFx();
  entered.value = "";
  lockShake.value = false;
  unlocked.value = false;
  flash.value = false;
  resetCard();
  popped.value = [];
  cardIndex.value = 0;
  flipped.value = false;
  leaveDir.value = 0;
  drag.value = { x: 0, y: 0, active: false };
  dragStart = null;
  tilt.value = { ...TILT0 };
  spin.value = 0;
  scratched.value = false;
  gachaState.value = "idle";
  redeemed.value = [];
  traceHit.value = Array(HEART.pts.length).fill(false);
  traceOrder.value = [];
  tracePath.value = [];
  traceTip.value = null;
  traceDragging.value = false;
  traceDone.value = false;
  revealed.value = false;
  showExtra.value = false;
  scene.value = id;
}

/* sa Secret Lock, gumagana rin ang number keys ng keyboard (ang Esc ay nasa SurpriseShell). */
function onKeydown(event) {
  if (scene.value !== "lock") return;
  if (/^[0-9]$/.test(event.key)) pressKey(event.key);
  else if (event.key === "Backspace") pressKey("back");
  else if (event.key === "Enter" && !event.target.closest?.("button")) pressKey("ok");
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  fitStage();
  if (typeof ResizeObserver !== "undefined" && fitEl.value) {
    fitObserver = new ResizeObserver(fitStage);
    let node = fitEl.value;
    for (let i = 0; i < 6 && node && node !== document.body; i += 1) {
      fitObserver.observe(node);
      node = node.parentElement;
    }
  }
  window.addEventListener("resize", fitStage);
  window.addEventListener("keydown", onEscCapture, true);
  let tries = 0;
  noneTimer = setInterval(() => {
    tries += 1;
    if (installNoneOption() || tries > 24) clearInterval(noneTimer);
  }, 250);
  resizeCanvas();
  if (typeof ResizeObserver !== "undefined" && phoneEl.value) {
    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(phoneEl.value);
  }
});
onUnmounted(() => {
  clearTimers();
  cancelAnimationFrame(cardRaf);
  cancelAnimationFrame(raf);
  raf = 0;
  resizeObserver?.disconnect();
  fitObserver?.disconnect();
  window.removeEventListener("resize", fitStage);
  window.removeEventListener("keydown", onEscCapture, true);
  removeNoneOption();
  if (bare.value) document.body.style.overflow = "";
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Nunito:wght@600;700;800&display=swap");

.soft-shell {
  --shell-bg:
    radial-gradient(circle at 12% 18%, #ffd3df 0, transparent 38%),
    radial-gradient(circle at 88% 82%, #ffe0cc 0, transparent 40%),
    radial-gradient(circle at 80% 10%, #e6dcff 0, transparent 34%),
    linear-gradient(160deg, #fff3f6, #ffe6ee 55%, #fff1ea);
  --shell-bar: rgb(255 250 247 / 0.85);
  --shell-ink: #3b2140;
  --shell-muted: #7a6277;
  --shell-line: #f6d3dd;
  --shell-line-strong: #f0cbd6;
  --shell-close-bg: #fff;
  --shell-switch-bg: #fff;
  --shell-use-bg: #e8507b;
  --shell-use-ink: #fff;
  --shell-use-shadow: 0 6px 16px rgb(232 80 123 / 0.3);
  --shell-frame: #3b2140;

  --ink: #3b2140;
  --ink-soft: #7a6277;
  --rose: #e8507b;
  --rose-deep: #c93a63;
  --cream: #fff8f5;
  --gold: #e2c07a;
  --serif: "Fraunces", Georgia, "Times New Roman", serif;
  --script: "Caveat", "Segoe Script", cursive;
  --ui: "Nunito", system-ui, sans-serif;
  --glass: rgb(255 255 255 / 0.55);
  --glass-line: rgb(255 255 255 / 0.9);
  --shadow-soft: 0 1px 0 rgb(255 255 255 / 0.9) inset, 0 16px 34px rgb(232 80 123 / 0.16), 0 2px 6px rgb(59 33 64 / 0.06);
}

/* ===== Step list sa kaliwa ng device ===== */
.flow-info {
  max-width: 420px;
  color: var(--ink);
}
.flow-info h2 {
  margin: 0 0 8px;
  font-family: var(--serif);
  font-size: clamp(30px, 3vw, 42px);
  font-weight: 700;
  line-height: 1.05;
}
.flow-info h2 span {
  color: var(--rose);
  font-style: italic;
}
.flow-info > p {
  margin: 0 0 18px;
  color: var(--ink-soft);
  font-family: var(--ui);
  font-size: 16px;
  line-height: 1.5;
}
.flow-steps {
  margin: 0 0 20px;
  padding: 0;
  list-style: none;
}
.flow-steps button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 5px 0;
  border: 0;
  background: none;
  color: var(--ink-soft);
  font: inherit;
  font-family: var(--ui);
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.flow-steps button.active {
  color: var(--ink);
}
.step-number {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid #f0cbd6;
  border-radius: 50%;
  background: #fff;
  font-size: 13px;
}
.flow-steps button.active .step-number,
.flow-steps button.done .step-number {
  border-color: var(--rose);
  background: var(--rose);
  color: #fff;
}
.flow-note {
  margin: 0;
  padding: 14px 16px;
  border: 1px solid #f3d6de;
  border-radius: 14px;
  background: #fff;
  color: var(--ink-soft);
  font-family: var(--ui);
  font-size: 14px;
  line-height: 1.5;
}
.flow-note strong {
  color: var(--ink);
}

/* ===== Screen ===== */
.phone {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(170deg, #fff3f6 0%, #fdeaf1 45%, #fff0e6 100%);
  color: var(--ink);
  font-family: var(--ui);
}
.phone::after {
  content: "";
  position: absolute;
  z-index: 7;
  inset: 7px;
  border: 1px solid rgb(255 255 255 / 0.85);
  border-radius: max(12px, calc(var(--screen-radius, 36px) - 4px));
  box-shadow: 0 0 0 1px rgb(232 80 123 / 0.08);
  pointer-events: none;
  transition: border-color 0.4s;
}
.phone.is-dark::after {
  border-color: rgb(255 255 255 / 0.16);
  box-shadow: none;
}
.svg-defs {
  position: absolute;
}

/* aurora: tatlong malalaking blurred na kulay na dahan-dahang gumagalaw */
.aurora {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.aurora i {
  position: absolute;
  width: 80%;
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(46px);
  opacity: 0.75;
}
.aurora .a1 {
  top: -18%;
  left: -22%;
  background: radial-gradient(circle, #ff9db9, transparent 68%);
  animation: aur1 14s ease-in-out infinite alternate;
}
.aurora .a2 {
  top: 24%;
  right: -34%;
  background: radial-gradient(circle, #cdb8ff, transparent 68%);
  animation: aur2 18s ease-in-out infinite alternate;
}
.aurora .a3 {
  bottom: -20%;
  left: -10%;
  background: radial-gradient(circle, #ffd0a8, transparent 68%);
  animation: aur3 16s ease-in-out infinite alternate;
}
.grain {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  pointer-events: none;
}
.ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ambient i {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0, rgb(255 200 220 / 0.9) 45%, transparent 70%);
  opacity: 0;
  animation: ambient ease-in-out infinite;
}

/* progress */
.progress {
  position: absolute;
  z-index: 6;
  top: 20px;
  left: 50%;
  display: flex;
  gap: 6px;
  padding: 5px 8px;
  border: 1px solid var(--glass-line);
  border-radius: 999px;
  background: var(--glass);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgb(232 80 123 / 0.1);
  transform: translateX(-50%);
}
.progress span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #f1d3dc;
  transition: width 0.35s, background 0.3s;
}
.progress span.on {
  background: #f59ab4;
}
.progress span.now {
  width: 24px;
  background: linear-gradient(90deg, #ff7a9c, #e8507b);
}
.phone.is-dark .progress {
  border-color: rgb(255 255 255 / 0.2);
  background: rgb(255 255 255 / 0.1);
}
.phone.is-dark .progress span {
  background: rgb(255 255 255 / 0.3);
}
.phone.is-dark .progress span.now {
  background: #ffc8dd;
}

/* ===== Eksena (common) ===== */
.scene {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 66px max(22px, calc(50% - 220px)) 28px;
  overflow-x: hidden;
  overflow-y: auto;
  text-align: center;
  scrollbar-width: none;
}
.scene::-webkit-scrollbar {
  display: none;
}
.scene > * {
  position: relative;
  flex-shrink: 0;
}
.eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--rose);
  font-family: var(--ui);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2.2px;
  text-transform: uppercase;
}
.eyebrow-line {
  width: 22px;
  height: 1px;
  background: linear-gradient(90deg, transparent, currentColor);
  opacity: 0.6;
}
.eyebrow-line:last-child {
  background: linear-gradient(90deg, currentColor, transparent);
}
.scene-title {
  margin: 0;
  color: var(--ink);
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.6px;
  line-height: 1.08;
  text-wrap: balance;
}
.scene-title em {
  background: linear-gradient(110deg, #ff5f8d 0%, #ff9bb6 35%, #d63f78 55%, #ff6f95 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-style: italic;
  font-weight: 600;
  animation: shimmer 4.5s linear infinite;
}
.scene-sub {
  margin: 0;
  color: var(--ink-soft);
  font-family: var(--ui);
  font-size: 14.5px;
  font-weight: 600;
}
.script-line {
  margin: 0;
  color: var(--rose);
  font-family: var(--script);
  font-size: 26px;
}
.chip {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffe3ec, #ffd3e0);
  color: var(--rose-deep);
  font-family: var(--ui);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
.glass {
  border: 1px solid var(--glass-line);
  background: var(--glass);
  backdrop-filter: blur(14px) saturate(1.3);
  box-shadow: var(--shadow-soft);
}

.primary-button {
  position: relative;
  margin-top: auto;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  padding: 16px 38px;
  background: linear-gradient(135deg, #ff86a5 0%, #e8507b 100%);
  color: #fff;
  font-family: var(--ui);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  box-shadow:
    inset 0 1.5px 0 rgb(255 255 255 / 0.55),
    inset 0 -3px 0 rgb(173 28 73 / 0.25),
    0 14px 28px rgb(232 80 123 / 0.38);
  transition: transform 0.2s, filter 0.2s;
}
.primary-button::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 35%, rgb(255 255 255 / 0.55) 50%, transparent 65%);
  transform: translateX(-120%);
  animation: sweep 3.4s ease-in-out infinite;
  pointer-events: none;
}
.primary-button:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}
.primary-button:active {
  transform: translateY(1px) scale(0.99);
}

/* ===== Cover: 3D gift box ===== */
.scene-cover {
  gap: 12px;
}
.gift-stage {
  position: relative;
  width: 100%;
  height: 268px;
  margin-top: 2px;
  cursor: pointer;
}
.rays {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 440px;
  height: 440px;
  margin: -220px 0 0 -220px;
  background: repeating-conic-gradient(from 0deg, rgb(255 255 255 / 0.85) 0 5deg, transparent 5deg 17deg);
  -webkit-mask: radial-gradient(circle, #000 0, transparent 66%);
  mask: radial-gradient(circle, #000 0, transparent 66%);
  opacity: 0.55;
  animation: spin 60s linear infinite;
  pointer-events: none;
}
.gift-halo {
  position: absolute;
  left: 50%;
  top: 52%;
  width: 250px;
  height: 250px;
  margin: -125px 0 0 -125px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 0.95), rgb(255 190 210 / 0.5) 45%, transparent 70%);
  animation: breathe 4s ease-in-out infinite;
}
.gift-beam {
  position: absolute;
  left: 50%;
  top: 6%;
  width: 90px;
  height: 52%;
  margin-left: -45px;
  background: linear-gradient(0deg, rgb(255 246 214 / 0.95), rgb(255 246 214 / 0));
  filter: blur(8px);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.gift-beam.on {
  opacity: 1;
}
.gift-scene {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  perspective: 900px;
}
.gift-float {
  transform-style: preserve-3d;
  animation: giftfloat 4s ease-in-out infinite;
}
.gift {
  position: relative;
  width: 120px;
  height: 96px;
  margin-top: 40px;
  transform-style: preserve-3d;
  transform: rotateX(-22deg) rotateY(30deg);
  animation: giftspin 14s linear infinite;
}
.gbody,
.glid {
  position: absolute;
  transform-style: preserve-3d;
}
.gbody {
  inset: 0;
}
.gbody .f,
.glid .f {
  position: absolute;
  left: 0;
  top: 0;
  backface-visibility: hidden;
}
.gbody .f {
  width: 120px;
  height: 96px;
}
.gbody .front { transform: translateZ(60px); background: linear-gradient(90deg, transparent 41%, #e9c06a 41% 43%, #ffeab8 43% 57%, #e9c06a 57% 59%, transparent 59%), linear-gradient(180deg, #ff86a8, #ee4f7e); }
.gbody .back { transform: rotateY(180deg) translateZ(60px); background: linear-gradient(90deg, transparent 41%, #e9c06a 41% 43%, #ffeab8 43% 57%, #e9c06a 57% 59%, transparent 59%), linear-gradient(180deg, #ff93b2, #f2608b); }
.gbody .right { transform: rotateY(90deg) translateZ(60px); background: linear-gradient(90deg, transparent 41%, #cfa24f 41% 43%, #f2d28e 43% 57%, #cfa24f 57% 59%, transparent 59%), linear-gradient(180deg, #e2467a, #c22f62); }
.gbody .left { transform: rotateY(-90deg) translateZ(60px); background: linear-gradient(90deg, transparent 41%, #e9c06a 41% 43%, #ffeab8 43% 57%, #e9c06a 57% 59%, transparent 59%), linear-gradient(180deg, #ffa3bd, #f5739a); }
.gbody .btop {
  position: absolute;
  left: 0;
  top: -60px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #fff8d6 0, #ffc2d3 55%, #e8507b 100%);
  transform: rotateX(90deg);
}
.glid {
  left: -6px;
  top: -28px;
  width: 132px;
  height: 28px;
  animation: lidtease 4.5s ease-in-out infinite;
}
.glid .f {
  width: 132px;
  height: 28px;
}
.glid .front { transform: translateZ(66px); background: linear-gradient(90deg, transparent 40%, #e9c06a 40% 42%, #ffeab8 42% 58%, #e9c06a 58% 60%, transparent 60%), linear-gradient(180deg, #ff9ab8, #f2608b); }
.glid .back { transform: rotateY(180deg) translateZ(66px); background: linear-gradient(90deg, transparent 40%, #e9c06a 40% 42%, #ffeab8 42% 58%, #e9c06a 58% 60%, transparent 60%), linear-gradient(180deg, #ffa3bf, #f56b93); }
.glid .right { transform: rotateY(90deg) translateZ(66px); background: linear-gradient(90deg, transparent 40%, #cfa24f 40% 42%, #f2d28e 42% 58%, #cfa24f 58% 60%, transparent 60%), linear-gradient(180deg, #e8527f, #c9356a); }
.glid .left { transform: rotateY(-90deg) translateZ(66px); background: linear-gradient(90deg, transparent 40%, #e9c06a 40% 42%, #ffeab8 42% 58%, #e9c06a 58% 60%, transparent 60%), linear-gradient(180deg, #ffb0c7, #f7799e); }
.glid .top {
  top: -52px;
  height: 132px;
  transform: rotateX(90deg) translateZ(14px);
  background:
    linear-gradient(90deg, transparent 40%, #e9c06a 40% 42%, #ffeab8 42% 58%, #e9c06a 58% 60%, transparent 60%),
    linear-gradient(0deg, transparent 40%, #e9c06a 40% 42%, #ffeab8 42% 58%, #e9c06a 58% 60%, transparent 60%),
    radial-gradient(circle at 30% 28%, #ffd0de, #ff86a8 70%);
}
.gbow {
  position: absolute;
  left: 30px;
  top: -46px;
  width: 72px;
  height: 52px;
  transform-style: preserve-3d;
}
.gbow svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 3px 3px rgb(150 80 20 / 0.25));
}
.gbow.b2 {
  transform: rotateY(90deg);
}
.gift.open .glid {
  animation: lidopen 0.9s cubic-bezier(0.3, 1.4, 0.5, 1) forwards;
}
.gift.open .btop {
  filter: brightness(1.35);
}
.gift-shadow {
  position: absolute;
  left: 50%;
  bottom: 18px;
  width: 150px;
  height: 26px;
  margin-left: -75px;
  border-radius: 50%;
  background: radial-gradient(rgb(190 60 100 / 0.38), transparent 70%);
  animation: gshadow 4s ease-in-out infinite;
}
.orbit {
  position: absolute;
  width: 18px;
  height: 18px;
  fill: #ff8fb0;
  opacity: 0.9;
  animation: orbit 5s ease-in-out infinite;
}
.orbit.o1 { left: 14%; top: 22%; }
.orbit.o2 { right: 12%; top: 16%; fill: #ffd166; width: 22px; height: 22px; animation-delay: 1s; }
.orbit.o3 { right: 18%; bottom: 20%; animation-delay: 2s; }
.orbit.o4 { left: 10%; bottom: 26%; fill: #c9b5ff; animation-delay: 3s; }
.scene-cover .primary-button {
  min-width: 74%;
  margin-top: 8px;
}

/* ===== 1. Secret Lock ===== */
.padlock-wrap {
  position: relative;
  width: 118px;
}
.padlock {
  position: relative;
  display: block;
  width: 100%;
  overflow: visible;
  filter: drop-shadow(0 12px 14px rgb(232 80 123 / 0.3));
}
.padlock-wrap.shake {
  animation: shake 0.45s;
}
.padlock-wrap.open {
  animation: unlock 0.8s ease forwards;
}
.ring {
  position: absolute;
  left: 50%;
  top: 56%;
  width: 90px;
  height: 90px;
  margin: -45px 0 0 -45px;
  border: 2px solid rgb(255 255 255 / 0.9);
  border-radius: 50%;
  opacity: 0;
}
.padlock-wrap.open .ring {
  animation: ring 0.9s ease-out forwards;
}
.padlock-wrap.open .r2 {
  animation-delay: 0.18s;
}
.shackle {
  transition: transform 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.padlock-wrap.open .shackle {
  transform: translateY(-16px);
}
.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 16px 18px;
  border-radius: 28px;
}
.hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--rose-deep);
  font-family: var(--script);
  font-size: 23px;
  line-height: 1.1;
}
.hint-icon {
  width: 24px;
  height: 24px;
  transform: rotate(-6deg);
}
.code-dots {
  display: flex;
  gap: 16px;
}
.code-dots span {
  width: 14px;
  height: 14px;
  border: 2px solid #e9a9bb;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.7);
  transition: background 0.15s, transform 0.2s, box-shadow 0.2s;
}
.code-dots span.filled {
  border-color: var(--rose);
  background: var(--rose);
  box-shadow: 0 0 0 4px rgb(232 80 123 / 0.18), 0 0 14px rgb(232 80 123 / 0.55);
  transform: scale(1.12);
}
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 62px);
  gap: 10px 16px;
}
.keypad button {
  position: relative;
  display: grid;
  place-items: center;
  height: 52px;
  border: 1px solid rgb(255 255 255 / 0.95);
  border-radius: 50%;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.98), rgb(255 232 240 / 0.8));
  box-shadow: 0 8px 16px rgb(232 80 123 / 0.16), inset 0 -3px 0 rgb(232 80 123 / 0.1);
  color: var(--ink);
  font-family: var(--serif);
  font-size: 23px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}
.keypad button svg {
  width: 22px;
  height: 22px;
}
.keypad button:active {
  transform: scale(0.9);
  box-shadow: 0 2px 6px rgb(232 80 123 / 0.16);
}
.keypad .key-fn {
  color: var(--ink-soft);
}
.keypad .key-ok {
  border-color: transparent;
  background: linear-gradient(135deg, #ff86a5, #e8507b);
  box-shadow: 0 10px 18px rgb(232 80 123 / 0.4), inset 0 1.5px 0 rgb(255 255 255 / 0.5);
  color: #fff;
}
.demo-code {
  margin: auto 0 0;
  color: var(--ink-soft);
  font-family: var(--ui);
  font-size: 12px;
  font-weight: 600;
}
.demo-code b {
  padding: 2px 8px;
  border-radius: 8px;
  background: rgb(255 255 255 / 0.7);
  color: var(--rose-deep);
  letter-spacing: 2px;
}

/* ===== 2. Balloons ===== */
.scene-balloons {
  background: linear-gradient(180deg, #efe3ff 0%, #ffd6e6 36%, #ffcfc8 68%, #ffe2c6 100%);
}
.sky {
  position: absolute !important;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.sun {
  position: absolute;
  top: 26%;
  right: -50px;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 246 218 / 0.98) 0, rgb(255 228 190 / 0.55) 42%, transparent 70%);
}
.cloud {
  position: absolute;
  height: 54px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.75);
  filter: blur(5px);
}
.cloud-1 { top: 46%; left: -34px; width: 190px; animation: cloud 18s ease-in-out infinite alternate; }
.cloud-2 { top: 58%; right: -44px; width: 210px; animation: cloud 22s ease-in-out infinite alternate-reverse; }
.cloud-3 { top: 32%; left: 38%; width: 120px; height: 36px; opacity: 0.7; }
.hill {
  position: absolute;
  left: -10%;
  width: 120%;
  border-radius: 50% 50% 0 0;
}
.hill-back { bottom: -8%; height: 24%; background: linear-gradient(180deg, #f8bdd0, #f3a6bf); opacity: 0.8; }
.hill-front { bottom: -14%; left: -30%; height: 22%; background: linear-gradient(180deg, #ffd0de, #f7a9c2); }
.wish-card {
  width: 100%;
  min-height: 100px;
  margin-top: 16px;
  padding: 24px 18px 16px;
  border-radius: 24px;
}
.card-bow {
  position: absolute;
  z-index: 1;
  top: -22px;
  left: 50%;
  width: 66px;
  height: 48px;
  transform: translateX(-50%);
}
.wish-card p {
  margin: 8px 0 0;
  color: var(--ink);
  font-family: var(--script);
  font-size: 28px;
  line-height: 1.05;
}
.balloon-field {
  flex: 1 0 230px;
  width: 100%;
  margin-top: 18px;
  container-type: size;
}
.balloon {
  position: absolute;
  width: min(27cqw, 23cqh);
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  filter: drop-shadow(0 14px 12px rgb(232 80 123 / 0.24));
  animation: bob 3.4s ease-in-out infinite;
  transition: transform 0.25s, opacity 0.25s;
}
.balloon svg {
  display: block;
  width: 100%;
  overflow: visible;
}
.string {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: sway 2.6s ease-in-out infinite alternate;
}
.balloon:hover {
  transform: scale(1.07);
}
.balloon.popped {
  opacity: 0;
  transform: scale(1.5);
  pointer-events: none;
  animation: none;
}
.floating-cta {
  position: absolute !important;
  bottom: 26px;
  z-index: 2;
}

/* ===== 3. Memory Cards ===== */
.scene-memories {
  gap: 10px;
}
.cards-stage {
  position: relative;
  flex-shrink: 0;
  width: 250px;
  height: 352px;
  margin-top: 6px;
}
.cards-aura {
  position: absolute;
  inset: -34px -40px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 190 214 / 0.8), rgb(255 214 190 / 0.35) 45%, transparent 70%);
  animation: breathe 4s ease-in-out infinite;
  pointer-events: none;
}
.mcard {
  position: absolute;
  top: 0;
  left: 50%;
  width: 230px;
  height: 326px;
  margin-left: -115px;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.2, 1.2, 0.4, 1), filter 0.5s;
  touch-action: none;
  user-select: none;
  outline: none;
}
.mcard:not(.top) {
  pointer-events: none;
}
.mcard.top {
  cursor: grab;
}
.mcard.top:active {
  cursor: grabbing;
}
.mcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.9s cubic-bezier(0.3, 1.35, 0.45, 1);
}
.mcard.flipped .mcard-inner {
  transform: rotateY(180deg);
}
.mface {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 22px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-shadow: 0 30px 50px rgb(59 33 64 / 0.28), 0 0 0 1px rgb(255 255 255 / 0.55) inset;
}
.mback {
  background:
    radial-gradient(circle at 20% 20%, rgb(255 255 255 / 0.4) 0 2px, transparent 3px) 0 0 / 22px 22px,
    radial-gradient(circle at 70% 70%, rgb(255 255 255 / 0.28) 0 2px, transparent 3px) 11px 11px / 22px 22px,
    linear-gradient(160deg, #ff9db9, #f0507f 55%, #d93768);
}
.back-frame {
  position: absolute;
  inset: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border: 1.5px solid rgb(255 236 190 / 0.9);
  border-radius: 16px;
  box-shadow: inset 0 0 0 4px rgb(255 255 255 / 0.12);
}
.back-eyebrow {
  color: #fff4d0;
  font-family: var(--ui);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2.4px;
  text-transform: uppercase;
}
.seal {
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 28%, #fff1c2, #e7b15a 55%, #b87a2e);
  box-shadow: inset 0 0 0 4px rgb(255 255 255 / 0.25), 0 10px 18px rgb(80 20 40 / 0.35);
  animation: breathe 3s ease-in-out infinite;
}
.seal svg {
  width: 44px;
  height: 44px;
  fill: #fff;
  filter: drop-shadow(0 2px 2px rgb(120 70 20 / 0.4));
}
.back-script {
  color: #fff;
  font-family: var(--script);
  font-size: 26px;
}
.mfront {
  display: flex;
  flex-direction: column;
  padding: 12px 12px 0;
  background: linear-gradient(180deg, #fffdf9, #fff0e8);
  transform: rotateY(180deg);
}
.mfront::after {
  content: "";
  position: absolute;
  inset: 5px;
  border: 1px solid rgb(226 192 122 / 0.8);
  border-radius: 18px;
  pointer-events: none;
}
.mphoto {
  position: relative;
  flex: none;
  height: 232px;
  overflow: hidden;
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgb(59 33 64 / 0.08);
}
.mphoto img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.foil {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(115deg, #ff9ecb 0%, #ffe08a 12%, #8fe9ff 24%, #c9a6ff 36%, #ff9ecb 48%);
  background-size: 260% 260%;
  background-position: var(--hx, 50%) var(--hy, 50%);
  mix-blend-mode: color-dodge;
  opacity: calc(0.14 + var(--holo, 0) * 0.5);
  transition: opacity 0.3s;
  pointer-events: none;
}
.glare {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--hx, 50%) var(--hy, 50%), rgb(255 255 255 / 0.7), transparent 55%);
  mix-blend-mode: soft-light;
  opacity: var(--holo, 0);
  transition: opacity 0.3s;
  pointer-events: none;
}
.csp {
  position: absolute;
  width: 18px;
  height: 18px;
  fill: #fff;
  filter: drop-shadow(0 0 4px rgb(255 255 255 / 0.9));
  animation: tw 2.4s ease-in-out infinite;
  pointer-events: none;
}
.csp.c1 { top: 10px; left: 10px; }
.csp.c2 { right: 12px; bottom: 12px; width: 13px; height: 13px; animation-delay: 1s; }
.mcap {
  display: grid;
  flex: 1;
  align-content: center;
  justify-items: center;
  gap: 2px;
  padding: 4px 8px 12px;
}
.mcap .no {
  color: #b88a3c;
  font-family: var(--ui);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2.2px;
  text-transform: uppercase;
}
.mcap p {
  margin: 0;
  color: var(--ink);
  font-family: var(--script);
  font-size: 26px;
  line-height: 1;
}
.sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 38%, rgb(255 255 255 / 0.55) 50%, transparent 62%);
  transform: translateX(-130%);
  animation: sweep 4.2s ease-in-out infinite;
  pointer-events: none;
}
.swipe-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--ink-soft);
  font-family: var(--ui);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
}
.swipe-hint .arr {
  color: var(--rose);
  font-size: 16px;
  animation: nudge 1.4s ease-in-out infinite;
}
.swipe-hint .arr.l {
  animation-name: nudgel;
}

/* ===== 4. Gacha ===== */
.gacha {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 220px;
  margin-top: 20px;
  filter: drop-shadow(0 16px 18px rgb(232 80 123 / 0.22));
}
.gacha-bow {
  position: absolute;
  z-index: 2;
  top: -24px;
  width: 78px;
  height: 56px;
}
.gacha-dome {
  position: relative;
  z-index: 1;
  width: 176px;
  height: 160px;
  overflow: hidden;
  border: 2px solid rgb(255 255 255 / 0.9);
  border-radius: 50% 50% 44% 44% / 56% 56% 44% 44%;
  background: radial-gradient(circle at 50% 40%, rgb(255 255 255 / 0.7), rgb(252 225 233 / 0.6) 70%, rgb(244 190 205 / 0.7));
  box-shadow: inset 0 -10px 20px rgb(232 80 123 / 0.12);
}
.gacha-dome::after {
  content: "";
  position: absolute;
  top: 16px;
  left: 26px;
  width: 30px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.95), rgb(255 255 255 / 0));
  transform: rotate(24deg);
}
.gacha-dome.shaking { animation: shake 0.3s 3; }
.mini-capsule {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 26%, rgb(255 255 255 / 0.85) 0 12%, transparent 13%),
    linear-gradient(180deg, var(--cap-top) 50%, #fff 50%);
  box-shadow: inset 0 0 0 1.5px rgb(59 33 64 / 0.08), 0 2px 4px rgb(0 0 0 / 0.08);
}
.cap-1 { --cap-top: #ff8fab; left: 6px; bottom: 8px; transform: rotate(-20deg); }
.cap-2 { --cap-top: #9cc0f5; left: 46px; bottom: 2px; transform: rotate(30deg); }
.cap-3 { --cap-top: #ffd166; left: 88px; bottom: 4px; transform: rotate(-14deg); }
.cap-4 { --cap-top: #cdb4f0; left: 126px; bottom: 10px; transform: rotate(18deg); }
.cap-5 { --cap-top: #f7b6cc; left: 24px; bottom: 46px; transform: rotate(60deg); }
.cap-6 { --cap-top: #e8507b; left: 66px; bottom: 42px; }
.cap-7 { --cap-top: #a8e0c4; left: 106px; bottom: 48px; transform: rotate(-50deg); }
.gacha-body {
  position: relative;
  width: 210px;
  height: 104px;
  margin-top: -8px;
  border-radius: 22px 22px 16px 16px;
  background: linear-gradient(180deg, #ffb3c6, #ee7f9a);
  box-shadow: inset 0 2px 0 rgb(255 255 255 / 0.5), inset 0 -8px 0 rgb(173 28 73 / 0.12);
}
.gacha-body::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 10px;
  right: 10px;
  height: 10px;
  border-radius: 6px;
  background: linear-gradient(180deg, #ffe9cf, #e8b98f);
}
.gacha-label {
  position: absolute;
  top: 16px;
  left: 14px;
  padding: 2px 8px;
  border: 2px solid var(--gold);
  border-radius: 6px;
  background: #fff4e6;
  color: var(--rose);
  font-family: var(--serif);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
}
.gacha-knob {
  position: absolute;
  top: 18px;
  right: 16px;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border: 4px solid #fde4ea;
  border-radius: 50%;
  background:
    linear-gradient(90deg, transparent 47%, #f0c9d1 47% 53%, transparent 53%),
    linear-gradient(0deg, transparent 47%, #f0c9d1 47% 53%, transparent 53%),
    radial-gradient(circle, #fffaf5, #f8e6e0);
  box-shadow: 0 0 0 2px #d96583, 0 4px 8px rgb(0 0 0 / 0.15);
  cursor: pointer;
  transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1);
}
.gacha-knob svg { width: 24px; height: 24px; fill: #e8507b; }
.gacha-knob.ready { animation: pulse 1.4s ease-in-out infinite; }
.gacha-knob.turning { transform: rotate(360deg); animation: none; }
.gacha-knob:disabled { cursor: default; }
.gacha-chute {
  position: absolute;
  bottom: 10px;
  left: 18px;
  width: 72px;
  height: 50px;
  border: 3px solid #ffd0dc;
  border-radius: 26px 26px 6px 6px;
  background: radial-gradient(circle at 50% 30%, #6b2a40, #3e1424);
}
.capsule {
  position: absolute;
  z-index: 2;
  bottom: 14px;
  left: 33px;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 26%, rgb(255 255 255 / 0.9) 0 12%, transparent 13%),
    linear-gradient(180deg, var(--cap) 50%, #fff 50%);
  box-shadow: 0 0 0 2px #fff, 0 6px 12px rgb(0 0 0 / 0.3);
  cursor: pointer;
  animation: drop 0.6s cubic-bezier(0.3, 1.5, 0.6, 1), wiggle 1.2s 0.6s ease-in-out infinite;
}
.coupon-wrap {
  width: 100%;
  margin-top: 22px;
  filter: drop-shadow(0 12px 18px rgb(232 80 123 / 0.2));
}
.coupon-wrap .card-bow { top: -24px; }
.coupon {
  position: relative;
  padding: 24px 18px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fffdfc, #fff0f4);
  -webkit-mask:
    radial-gradient(circle 11px at 0 50%, transparent 98%, #000) left / 51% 100% no-repeat,
    radial-gradient(circle 11px at 100% 50%, transparent 98%, #000) right / 51% 100% no-repeat;
  mask:
    radial-gradient(circle 11px at 0 50%, transparent 98%, #000) left / 51% 100% no-repeat,
    radial-gradient(circle 11px at 100% 50%, transparent 98%, #000) right / 51% 100% no-repeat;
}
.coupon::after {
  content: "";
  position: absolute;
  inset: 7px 18px;
  border: 1.5px dashed #f2a9bb;
  border-radius: 12px;
  pointer-events: none;
}
.coupon p {
  margin: 8px 0 12px;
  color: var(--ink);
  font-family: var(--serif);
  font-size: 25px;
  font-weight: 700;
}
.coupon-redeem {
  position: relative;
  z-index: 1;
  border: 0;
  border-radius: 999px;
  padding: 10px 32px;
  background: linear-gradient(180deg, #5a3562, #3b2140);
  color: #fff;
  font-family: var(--ui);
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: inset 0 1.5px 0 rgb(255 255 255 / 0.25), 0 8px 14px rgb(59 33 64 / 0.3);
}
.stamp {
  display: inline-block;
  padding: 4px 16px;
  border: 3px solid #e2607f;
  border-radius: 10px;
  box-shadow: inset 0 0 0 2px #fff6f8, inset 0 0 0 3.5px rgb(226 96 127 / 0.5);
  color: #e2607f;
  font-family: var(--ui);
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  transform: rotate(-8deg);
  animation: stamp 0.4s cubic-bezier(0.3, 1.6, 0.5, 1);
}

/* ===== 5. Fireworks Finale ===== */
.scene-finale {
  justify-content: center;
  background:
    radial-gradient(70% 36% at 50% 100%, rgb(255 150 180 / 0.5), transparent 72%),
    linear-gradient(180deg, #0e0b2b 0%, #20184f 38%, #4f3478 66%, #b76b95 90%, #e59aa6 100%);
  color: #fff;
  outline: none;
}
.stars {
  position: absolute !important;
  inset: 0;
  background-image:
    radial-gradient(1.5px 1.5px at 20% 15%, #fff, transparent),
    radial-gradient(1px 1px at 70% 10%, #fff, transparent),
    radial-gradient(2px 2px at 85% 30%, #ffe6a8, transparent),
    radial-gradient(1px 1px at 40% 35%, #fff, transparent),
    radial-gradient(1px 1px at 10% 45%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 60% 22%, #fff, transparent),
    radial-gradient(2px 2px at 30% 6%, #ffe6a8, transparent),
    radial-gradient(1px 1px at 92% 52%, #fff, transparent),
    radial-gradient(1px 1px at 52% 48%, #fff, transparent),
    radial-gradient(1.5px 1.5px at 6% 28%, #fff, transparent);
  animation: twinkle 3s ease-in-out infinite alternate;
  pointer-events: none;
}
.moon {
  position: absolute !important;
  top: 64px;
  left: 38px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 10px 6px 0 0 #f7d97b;
  filter: drop-shadow(0 0 14px rgb(247 217 123 / 0.7));
  pointer-events: none;
}
.shoot {
  position: absolute !important;
  top: 14%;
  left: -12%;
  width: 90px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fff);
  opacity: 0;
  transform: rotate(24deg);
  animation: shoot 7s ease-in infinite 2s;
  pointer-events: none;
}
.horizon {
  position: absolute !important;
  inset: auto 0 0;
  height: 26%;
  background: linear-gradient(180deg, transparent, rgb(255 160 190 / 0.35));
  pointer-events: none;
}
.skyline {
  position: absolute !important;
  inset: auto 0 0;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 1;
  pointer-events: none;
}
.skyline .lights {
  animation: twinkle 2.6s ease-in-out infinite alternate;
}
.sky-hint {
  margin: 0;
  color: #fff;
  font-family: var(--serif);
  font-size: 23px;
  font-style: italic;
  font-weight: 500;
  text-shadow: 0 0 18px rgb(255 168 200 / 0.9);
  pointer-events: none;
}
.sky-hint span {
  display: inline-block;
  margin-top: 12px;
  padding: 3px 14px;
  border: 1px solid rgb(255 255 255 / 0.3);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.12);
  color: #ffd1e0;
  font-family: var(--ui);
  font-size: 13px;
  font-style: normal;
  font-weight: 800;
}
.finale-card {
  width: 100%;
  margin-top: 58px;
  padding: 0 18px 20px;
  border: 1px solid rgb(255 255 255 / 0.9);
  border-radius: 28px;
  background: linear-gradient(180deg, rgb(255 251 244 / 0.97), rgb(255 238 232 / 0.95));
  color: #6b4a4a;
  cursor: default;
  box-shadow:
    inset 0 0 0 5px rgb(255 251 244 / 0.9),
    inset 0 0 0 6px #ecd3a2,
    0 28px 54px rgb(0 0 0 / 0.4);
}
.finale-medallion {
  position: relative;
  width: 118px;
  height: 118px;
  margin: -62px auto 6px;
}
.finale-medallion img {
  display: block;
  width: 100%;
  height: 100%;
  border: 4px solid #fffaf2;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 2px var(--gold), 0 0 28px rgb(255 213 140 / 0.7);
}
.medallion-bow {
  position: absolute;
  bottom: -20px;
  left: 50%;
  width: 92px;
  height: 66px;
  transform: translateX(-50%);
}
.finale-card h3 {
  margin: 30px 0 8px;
  color: var(--ink);
  font-family: var(--serif);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
}
.finale-card h3 em {
  background: linear-gradient(110deg, #ff5f8d 0%, #ff9bb6 35%, #d63f78 55%, #ff6f95 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-style: italic;
  font-weight: 600;
  animation: shimmer 4.5s linear infinite;
}
.finale-card p {
  margin: 0;
  color: #6b4a4a;
  font-family: var(--serif);
  font-size: 15px;
  line-height: 1.5;
}
.finale-card .finale-from {
  margin-top: 8px;
  color: var(--rose-deep);
  font-family: var(--script);
  font-size: 27px;
}
.finale-card .finale-extra {
  margin-top: 10px;
  padding: 10px 12px;
  border: 1.5px dashed #f0b3c1;
  border-radius: 16px;
  background: #fff1f3;
  color: var(--ink);
  font-family: var(--script);
  font-size: 23px;
  line-height: 1.1;
}
.finale-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
.finale-actions .primary-button {
  margin-top: 0;
  padding: 13px 34px;
  font-size: 16px;
}
.replay-button {
  border: 1.5px solid var(--gold);
  border-radius: 999px;
  padding: 8px 26px;
  background: rgb(255 255 255 / 0.5);
  color: #7a5240;
  font-family: var(--ui);
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}
.replay-button:hover {
  background: #fff;
}

/* ===== FX ===== */
.fx-canvas {
  position: absolute;
  z-index: 5;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.flash {
  position: absolute;
  z-index: 6;
  inset: 0;
  background: radial-gradient(circle at 50% 30%, rgb(255 255 255 / 0.95), rgb(255 200 220 / 0.4) 55%, transparent 80%);
  animation: flash 0.7s ease-out forwards;
  pointer-events: none;
}

/* ===== Transitions & keyframes ===== */
.scene-enter-active,
.scene-leave-active {
  transition: opacity 0.4s, transform 0.4s, filter 0.4s;
}
.scene-enter-from {
  opacity: 0;
  transform: translateY(18px) scale(0.97);
  filter: blur(6px);
}
.scene-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(1.02);
  filter: blur(6px);
}
.pop-in-enter-active { transition: opacity 0.3s, transform 0.35s cubic-bezier(0.3, 1.5, 0.6, 1); }
.pop-in-leave-active { transition: opacity 0.15s; }
.pop-in-enter-from { opacity: 0; transform: scale(0.88); }
.pop-in-leave-to { opacity: 0; }
.reveal-enter-active { transition: opacity 0.6s, transform 0.6s cubic-bezier(0.3, 1.4, 0.6, 1); }
.reveal-enter-from { opacity: 0; transform: translateY(30px) scale(0.9); }

@keyframes aur1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(18%, 12%) scale(1.15); } }
@keyframes aur2 { from { transform: translate(0, 0) scale(1.1); } to { transform: translate(-16%, 14%) scale(0.9); } }
@keyframes aur3 { from { transform: translate(0, 0) scale(1); } to { transform: translate(20%, -12%) scale(1.2); } }
@keyframes ambient {
  0%, 100% { opacity: 0; transform: translateY(0) scale(0.6); }
  50% { opacity: 0.9; transform: translateY(-14px) scale(1); }
}
@keyframes shimmer { from { background-position: 0% 0; } to { background-position: 220% 0; } }
@keyframes sweep {
  0%, 55% { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes breathe {
  0%, 100% { transform: scale(0.94); opacity: 0.85; }
  50% { transform: scale(1.06); opacity: 1; }
}
@keyframes giftspin {
  from { transform: rotateX(-22deg) rotateY(0deg); }
  to { transform: rotateX(-22deg) rotateY(360deg); }
}
@keyframes giftfloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes gshadow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.82); opacity: 0.6; }
}
@keyframes lidtease {
  0%, 68%, 100% { transform: translateY(0) rotateZ(0); }
  76% { transform: translateY(-9px) rotateZ(-2.5deg); }
  84% { transform: translateY(-3px) rotateZ(1.5deg); }
  92% { transform: translateY(-6px) rotateZ(-1deg); }
}
@keyframes lidopen {
  to { transform: translateY(-74px) translateX(14px) rotateZ(-16deg); }
}
@keyframes orbit {
  0%, 100% { transform: translateY(0) rotate(0) scale(1); opacity: 0.55; }
  50% { transform: translateY(-14px) rotate(18deg) scale(1.2); opacity: 1; }
}
@keyframes tw {
  0%, 100% { opacity: 0.55; transform: scale(0.8) rotate(0); }
  50% { opacity: 1; transform: scale(1.15) rotate(12deg); }
}
.tw {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: tw 2.4s ease-in-out infinite;
}
.tw.t2 { animation-delay: 0.8s; }
.tw.t3 { animation-delay: 1.5s; }
@keyframes nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
@keyframes nudgel { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-5px); } }
@keyframes cloud { from { transform: translateX(-12px); } to { transform: translateX(22px); } }
@keyframes sway { from { transform: rotate(-7deg); } to { transform: rotate(7deg); } }
@keyframes bob {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-14px) rotate(3deg); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px) rotate(-4deg); }
  40% { transform: translateX(9px) rotate(4deg); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(4px); }
}
@keyframes unlock {
  0% { transform: scale(1); }
  40% { transform: scale(1.14); filter: drop-shadow(0 0 22px rgb(255 143 171 / 0.95)); }
  100% { transform: scale(1.04); filter: drop-shadow(0 0 14px rgb(255 143 171 / 0.6)); }
}
@keyframes ring {
  0% { transform: scale(0.5); opacity: 0.9; }
  100% { transform: scale(3.4); opacity: 0; }
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 2px #d96583, 0 0 0 2px rgb(255 255 255 / 0.8); }
  50% { box-shadow: 0 0 0 2px #d96583, 0 0 0 10px rgb(255 255 255 / 0); }
}
@keyframes drop {
  from { transform: translateY(-60px) scale(0.6); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes wiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}
@keyframes stamp {
  from { transform: scale(2) rotate(-8deg); opacity: 0; }
  to { transform: scale(1) rotate(-8deg); opacity: 1; }
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes twinkle { from { opacity: 0.55; } to { opacity: 1; } }
@keyframes shoot {
  0% { transform: translate(0, 0) rotate(24deg); opacity: 0; }
  3% { opacity: 1; }
  12% { transform: translate(440px, 200px) rotate(24deg); opacity: 0; }
  100% { opacity: 0; }
}
@keyframes flash {
  0% { opacity: 0; }
  20% { opacity: 1; }
  100% { opacity: 0; }
}


/* ===== RICH LAYER: pupunuin ang screen, may depth at palamuti ===== */
.phone { container-type: size; }
.phone .scene { gap: 10px; padding: 100px max(22px, calc(50% - 220px)) 26px; }
.phone .progress { top: 16px; }
.deco { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.deco-top { position: absolute; top: 26px; left: 0; width: 100%; height: auto; filter: drop-shadow(0 6px 8px rgb(220 100 140 / 0.22)); }
.deco-bottom { position: absolute; bottom: 0; left: 0; width: 100%; height: auto; filter: drop-shadow(0 -2px 6px rgb(220 100 140 / 0.18)); }
.petals { position: absolute; inset: 0; z-index: 4; overflow: hidden; pointer-events: none; }
.petals i { position: absolute; top: -20px; border-radius: 70% 0 70% 0; background: linear-gradient(135deg, #ffe0ea, #ff9dbb); box-shadow: 0 1px 3px rgb(220 90 130 / 0.3); opacity: 0; animation: petalfall 11s linear infinite; }
@keyframes petalfall {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.9; }
  50% { transform: translate(36px, 55cqh) rotate(200deg); }
  100% { transform: translate(-14px, 112cqh) rotate(420deg); opacity: 0.7; }
}
.phone.is-finale .deco, .phone.is-finale .petals { display: none; }

/* cover */
.phone .scene-cover { justify-content: space-between; }
.phone .gift-stage { flex: 1 1 auto; height: auto; min-height: 240px; margin: 0; }
.phone .gift-scene { scale: 1.5; }
.phone .gift-stage::before { content: ""; position: absolute; left: 50%; bottom: 3%; width: 86%; height: 42px; margin-left: -43%; border-radius: 50%; background: radial-gradient(ellipse at 50% 40%, #fff 0, rgb(255 214 228 / 0.85) 50%, rgb(255 190 214 / 0) 74%); box-shadow: 0 10px 34px rgb(255 140 180 / 0.35); }
.phone .gift-stage::after { content: ""; position: absolute; left: 50%; top: 50%; width: 92%; aspect-ratio: 1; margin: -46% 0 0 -46%; border: 1px dashed rgb(240 140 170 / 0.45); border-radius: 50%; animation: spin 60s linear infinite; }
.phone .scene-cover .primary-button { margin-top: 0; }

/* lock */
.phone .padlock-wrap { width: min(44cqw, 24cqh); margin-block: auto; }
.phone .pad { gap: 16px; padding: 20px 18px 22px; border-radius: 30px; }
.phone .keypad { grid-template-columns: repeat(3, 64px); gap: 12px 20px; }
.phone .keypad button { height: 58px; }
.phone .demo-code { margin-top: 0; }

/* balloons */
.phone .scene-balloons { background: linear-gradient(180deg, #e6d8fa 0%, #fbd2e2 26%, #ffd8d2 50%, #ffe7c9 72%, #ffd3c8 100%); }
.phone .sky::before { content: ""; position: absolute; left: 50%; bottom: 26%; width: 150%; height: 56%; margin-left: -75%; background: radial-gradient(ellipse at 50% 100%, rgb(255 238 190 / 0.95), rgb(255 205 170 / 0.5) 36%, transparent 66%); }
.phone .scenery { position: absolute; left: 0; bottom: 0; width: 100%; height: 50%; }
.phone .balloon { width: min(34cqw, 30cqh); }
.phone .balloon-field { flex: 1 0 280px; }
.phone .scene-balloons .eyebrow, .phone .scene-balloons .scene-title, .phone .scene-balloons .scene-sub, .phone .scene-balloons .wish-card { z-index: 2; }
.phone .scene-balloons { padding-top: 84px; }

/* memories */
.phone .cards-stage { --cw: min(76cqw, 300px); width: var(--cw); height: calc(var(--cw) * 1.42); margin: auto 0; }
.phone .mcard { width: calc(var(--cw) - 24px); height: calc(var(--cw) * 1.42 - 30px); margin-left: calc((var(--cw) - 24px) / -2); }
.phone .mphoto { flex: 1 1 auto; height: auto; min-height: 0; }
.phone .cards-aura { inset: -50px -60px; }

/* gacha */
.phone .gacha { zoom: 1.38; margin-block: auto; }

/* finale */
.phone .scene-finale .sky-hint { font-size: 30px; }
.fclouds { position: absolute !important; left: -10%; right: -10%; bottom: 5%; height: 36%; pointer-events: none; }
.fclouds i { position: absolute; border-radius: 50%; background: radial-gradient(circle at 40% 30%, rgb(255 205 210 / 0.95), rgb(236 130 170 / 0.92) 52%, rgb(140 88 170 / 0.9)); filter: blur(0.6px); }
.fclouds i:nth-child(1) { left: 0; bottom: 10%; width: 46%; aspect-ratio: 1.5; }
.fclouds i:nth-child(2) { left: 22%; bottom: 0; width: 40%; aspect-ratio: 1.6; }
.fclouds i:nth-child(3) { left: 48%; bottom: 8%; width: 44%; aspect-ratio: 1.5; }
.fclouds i:nth-child(4) { right: -4%; bottom: 14%; width: 40%; aspect-ratio: 1.4; }
.fclouds i:nth-child(5) { left: -6%; bottom: 36%; width: 30%; aspect-ratio: 1.8; opacity: 0.8; }
.fclouds i:nth-child(6) { right: 2%; bottom: 40%; width: 28%; aspect-ratio: 1.8; opacity: 0.75; }
.fclouds i:nth-child(7) { left: 36%; bottom: 30%; width: 26%; aspect-ratio: 2; opacity: 0.6; }


/* ===== FIT + RESPONSIVE (pareho ang itsura sa phone, iPad, laptop) ===== */
.fit { position: absolute; inset: 0; overflow: hidden; }
.fit > .phone { position: absolute; left: 0; top: 0; right: auto; bottom: auto; }
.phone .scene { padding-top: 100px; }
.phone .deco-top { width: min(100%, 440px); left: 50%; transform: translateX(-50%); }
.phone .deco-bottom { width: min(100%, 440px); left: 50%; transform: translateX(-50%); }
.phone .padlock-wrap { width: min(36cqw, 18cqh); }
.phone .keypad button { height: 54px; }
.phone .pad { gap: 14px; padding: 18px 18px 20px; }
.phone .gift-stage { max-width: 440px; width: 100%; }
.phone .scenery { width: min(100%, 560px); height: auto; aspect-ratio: 4 / 3; left: 50%; transform: translateX(-50%); }
.phone .sky::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: calc(min(100cqw, 560px) * 0.75 * 0.29); background: linear-gradient(180deg, #f9d2cf, #ffe9dd); }
.phone .skyline { height: 100px; aspect-ratio: auto; width: 100%; }
.phone .scene-finale .finale-card { max-width: 440px; }
.phone .cards-stage { --cw: min(76cqw, 300px, 40cqh); }


/* ===== PANEL (laptop / iPad / full view) + FULL VIEW toggle ===== */
.fit.bare { position: fixed; inset: 0; z-index: 2147483000; }
.fit.panel {
  background:
    radial-gradient(60% 50% at 18% 18%, #ffd0e0 0, transparent 70%),
    radial-gradient(55% 50% at 86% 82%, #ffe0cc 0, transparent 70%),
    radial-gradient(40% 40% at 82% 14%, #e4dbff 0, transparent 70%),
    linear-gradient(160deg, #fff3f6, #fdeaf1 50%, #fff0e6);
}
.fit.panel > .phone { border-radius: 30px; box-shadow: 0 30px 80px rgb(200 90 130 / 0.35), 0 0 0 1px rgb(255 255 255 / 0.7); }
.fit.panel > .phone::after { border-radius: 24px; }
.fs-toggle {
  position: absolute;
  z-index: 30;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px 7px 9px;
  border: 1px solid rgb(240 140 170 / 0.5);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.85);
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 16px rgb(200 90 130 / 0.22);
  color: #5a2a45;
  font: 600 12px/1 "Nunito", system-ui, sans-serif;
  letter-spacing: 0.3px;
  cursor: pointer;
}
.fs-toggle svg { width: 15px; height: 15px; }
.fs-toggle:hover { background: #fff; }


/* ===== WIDE / LAPTOP: totoong desktop layout, dalawang column ===== */
.phone.is-wide .deco { display: none; }
.phone.is-wide .scene { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-auto-rows: min-content; align-content: center; align-items: center; column-gap: 4%; row-gap: 14px; padding: 64px 7% 36px; text-align: left; overflow-x: hidden; }
.phone.is-wide .scene > * { min-width: 0; }
.phone.is-wide .scene .eyebrow { justify-content: flex-start; grid-column: 1; }
.phone.is-wide .scene .scene-title { grid-column: 1; font-size: 52px; line-height: 1.04; text-align: left; }
.phone.is-wide .scene .scene-sub { grid-column: 1; font-size: 17px; text-align: left; }
.phone.is-wide .scene .script-line { grid-column: 1; font-size: 34px; }
.phone.is-wide .scene .primary-button { grid-column: 1; justify-self: start; margin-top: 8px; min-width: 0; padding: 18px 44px; }
.phone.is-wide .progress { top: 18px; }

/* cover */
.phone.is-wide .scene-cover .eyebrow { grid-row: 1; }
.phone.is-wide .scene-cover .scene-title { grid-row: 2; }
.phone.is-wide .scene-cover .primary-button { grid-row: 3; }
.phone.is-wide .scene-cover .script-line { grid-row: 4; }
.phone.is-wide .scene-cover .gift-stage { grid-column: 2; grid-row: 1 / span 4; width: 100%; max-width: none; height: min(82cqh, 580px); min-height: 0; }
.phone.is-wide .gift-scene { scale: 2.1; }

/* lock */
.phone.is-wide .scene-lock .eyebrow { grid-row: 1; }
.phone.is-wide .scene-lock .scene-title { grid-row: 2; }
.phone.is-wide .scene-lock .padlock-wrap { grid-column: 1; grid-row: 3; width: min(15cqw, 30cqh); margin: 0; }
.phone.is-wide .scene-lock .pad { grid-column: 2; grid-row: 1 / span 3; justify-self: center; width: min(100%, 420px); }
.phone.is-wide .scene-lock .demo-code { grid-column: 2; grid-row: 4; justify-self: center; }

/* balloons */
.phone.is-wide .scene-balloons .eyebrow { grid-row: 1; }
.phone.is-wide .scene-balloons .scene-title { grid-row: 2; }
.phone.is-wide .scene-balloons .scene-sub { grid-row: 3; }
.phone.is-wide .scene-balloons .wish-card { grid-column: 1; grid-row: 4; width: 100%; margin-top: 8px; }
.phone.is-wide .scene-balloons .wish-card p { font-size: 32px; }
.phone.is-wide .scene-balloons .balloon-field { grid-column: 2; grid-row: 1 / span 4; width: 100%; height: min(76cqh, 540px); flex: none; margin: 0; }
.phone.is-wide .scene-balloons .floating-cta { left: 7%; right: auto; bottom: 30px; transform: none; }
.phone.is-wide .scenery { left: auto; right: 2%; transform: none; width: min(56cqw, 700px); }
.phone.is-wide .sky::after { height: calc(min(56cqw, 700px) * 0.75 * 0.29); }

/* memories */
.phone.is-wide .scene-memories .eyebrow { grid-row: 1; }
.phone.is-wide .scene-memories .scene-title { grid-row: 2; }
.phone.is-wide .scene-memories .scene-sub { grid-row: 3; }
.phone.is-wide .scene-memories .swipe-hint { grid-column: 1; grid-row: 4; justify-self: start; }
.phone.is-wide .scene-memories .primary-button { grid-row: 5; }
.phone.is-wide .scene-memories .cards-stage { --cw: min(24cqw, 46cqh); grid-column: 2; grid-row: 1 / span 5; justify-self: center; margin: 0; }

/* gacha */
.phone.is-wide .scene-gacha .eyebrow { grid-row: 1; }
.phone.is-wide .scene-gacha .scene-title { grid-row: 2; }
.phone.is-wide .scene-gacha .scene-sub { grid-row: 3; }
.phone.is-wide .scene-gacha .coupon-wrap { grid-column: 1; grid-row: 4; width: 100%; max-width: 440px; margin-top: 8px; }
.phone.is-wide .scene-gacha .primary-button { grid-row: 5; }
.phone.is-wide .scene-gacha .gacha { grid-column: 2; grid-row: 1 / span 5; justify-self: center; zoom: 1.7; margin: 0; }

/* finale */
.phone.is-wide .scene-finale { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px 7%; }
.phone.is-wide .scene-finale .sky-hint { font-size: 38px; }
.phone.is-wide .scene-finale .finale-card { max-width: 560px; margin-top: 70px; }
.phone.is-wide .scene-finale .finale-card h3 { font-size: 38px; }
.phone.is-wide .scene-finale .finale-card p { font-size: 18px; }
.phone.is-wide .skyline { height: 150px; }


/* ===== WIDE: huwag mag-stretch sa sobrang lapad na monitor ===== */
.phone.is-wide .scene { padding-left: max(7%, calc((100% - 1180px) / 2)); padding-right: max(7%, calc((100% - 1180px) / 2)); }
.phone.is-wide .scene-finale { padding-left: 7%; padding-right: 7%; }
.phone.is-wide .scenery { right: max(2%, calc((100% - 1280px) / 2)); }


/* ===== WIDE v2: ayos ng grid (walang pagkalayo-layo), tanawin na buong lapad, mas maliit na ulap ===== */
.scenery-wide { display: none; }
.phone.is-wide .scenery { display: none; }
.phone.is-wide .scenery-wide { display: block; position: absolute; left: 0; bottom: 0; width: 100%; height: 50%; }
.phone.is-wide .sky::after { display: none; }
.phone.is-wide .scene { grid-template-rows: 1fr repeat(var(--rows, 4), min-content) 1fr; row-gap: 14px; }
.phone.is-wide .scene-cover { --rows: 4; }
.phone.is-wide .scene-lock { --rows: 4; }
.phone.is-wide .scene-balloons { --rows: 5; }
.phone.is-wide .scene-memories { --rows: 5; }
.phone.is-wide .scene-gacha { --rows: 5; }

/* cover */
.phone.is-wide .scene-cover .eyebrow { grid-row: 2; }
.phone.is-wide .scene-cover .scene-title { grid-row: 3; }
.phone.is-wide .scene-cover .primary-button { grid-row: 4; }
.phone.is-wide .scene-cover .script-line { grid-row: 5; }
.phone.is-wide .scene-cover .gift-stage { grid-row: 1 / -1; align-self: center; }

/* lock */
.phone.is-wide .scene-lock .eyebrow { grid-row: 2; }
.phone.is-wide .scene-lock .scene-title { grid-row: 3; }
.phone.is-wide .scene-lock .padlock-wrap { grid-column: 1; grid-row: 4; width: min(17cqw, 38cqh); margin: 8px 0 0; }
.phone.is-wide .scene-lock .demo-code { grid-column: 1; grid-row: 5; justify-self: start; }
.phone.is-wide .scene-lock .pad { grid-column: 2; grid-row: 1 / -1; align-self: center; justify-self: center; width: min(100%, 460px); }

/* balloons */
.phone.is-wide .scene-balloons .eyebrow { grid-row: 2; }
.phone.is-wide .scene-balloons .scene-title { grid-row: 3; }
.phone.is-wide .scene-balloons .scene-sub { grid-row: 4; }
.phone.is-wide .scene-balloons .wish-card { grid-row: 5; max-width: 520px; }
.phone.is-wide .scene-balloons .floating-cta { position: relative !important; bottom: auto; left: auto; right: auto; transform: none; grid-column: 1; grid-row: 6; justify-self: start; margin-top: 4px; }
.phone.is-wide .scene-balloons .balloon-field { grid-row: 1 / -1; align-self: center; }

/* memories */
.phone.is-wide .scene-memories .eyebrow { grid-row: 2; }
.phone.is-wide .scene-memories .scene-title { grid-row: 3; }
.phone.is-wide .scene-memories .scene-sub { grid-row: 4; }
.phone.is-wide .scene-memories .swipe-hint { grid-row: 5; }
.phone.is-wide .scene-memories .primary-button { grid-row: 6; }
.phone.is-wide .scene-memories .cards-stage { grid-row: 1 / -1; align-self: center; }

/* gacha */
.phone.is-wide .scene-gacha .eyebrow { grid-row: 2; }
.phone.is-wide .scene-gacha .scene-title { grid-row: 3; }
.phone.is-wide .scene-gacha .scene-sub { grid-row: 4; }
.phone.is-wide .scene-gacha .coupon-wrap { grid-row: 5; }
.phone.is-wide .scene-gacha .primary-button { grid-row: 6; }
.phone.is-wide .scene-gacha .gacha { grid-row: 1 / -1; align-self: center; }

/* finale clouds: maliliit at hiwa-hiwalay sa malapad na screen */
.phone.is-wide .fclouds { left: 0; right: 0; bottom: 4%; height: 30%; }
.phone.is-wide .fclouds i { width: min(22cqw, 300px); aspect-ratio: 2.6; opacity: 0.92; }
.phone.is-wide .fclouds i:nth-child(1) { left: 1%; bottom: 8%; }
.phone.is-wide .fclouds i:nth-child(2) { left: 19%; bottom: 0; }
.phone.is-wide .fclouds i:nth-child(3) { left: 38%; bottom: 10%; }
.phone.is-wide .fclouds i:nth-child(4) { left: 56%; bottom: 0; }
.phone.is-wide .fclouds i:nth-child(5) { left: 74%; bottom: 12%; right: auto; }
.phone.is-wide .fclouds i:nth-child(6) { left: 88%; bottom: 2%; right: auto; width: min(16cqw, 220px); }
.phone.is-wide .fclouds i:nth-child(7) { left: 30%; bottom: 34%; opacity: 0.5; width: min(16cqw, 220px); }
.fs-toggle { top: 14px; right: 18px; }


/* ===== WIDE v3: palamuti sa apat na sulok, glow sa hero, mas siksik na layout ===== */
.deco-corner { display: none; position: absolute; width: min(12cqw, 190px); height: auto; filter: drop-shadow(0 6px 8px rgb(220 100 140 / 0.2)); }
.phone.is-wide .deco { display: block; }
.phone.is-wide .deco-top, .phone.is-wide .deco-bottom { display: none; }
.phone.is-wide .deco-corner { display: block; }
.deco-corner.c-tl { top: 0; left: 0; }
.deco-corner.c-tr { top: 0; right: 0; transform: scaleX(-1); }
.deco-corner.c-bl { bottom: 0; left: 0; transform: scaleY(-1); }
.deco-corner.c-br { bottom: 0; right: 0; transform: scale(-1, -1); }
.phone.is-wide .scene { padding-left: max(8%, calc((100% - 1060px) / 2)); padding-right: max(8%, calc((100% - 1060px) / 2)); }
.phone.is-wide .scene-finale { padding-left: 7%; padding-right: 7%; }
.phone.is-wide .aurora i { width: 60%; }
.phone.is-wide .ambient i { scale: 2.4; }

/* glow at singsing sa likod ng mga hero */
.phone.is-wide .scene-lock .padlock-wrap::before { content: ""; position: absolute; left: 50%; top: 50%; width: 240%; aspect-ratio: 1; margin: -120% 0 0 -120%; border-radius: 50%; background: radial-gradient(circle, rgb(255 255 255 / 0.8), rgb(255 190 214 / 0.38) 46%, transparent 68%); }
.phone.is-wide .scene-lock .padlock-wrap::after { content: ""; position: absolute; left: 50%; top: 50%; width: 190%; aspect-ratio: 1; margin: -95% 0 0 -95%; border: 1.5px dashed rgb(240 140 170 / 0.5); border-radius: 50%; animation: spin 80s linear infinite; }
.phone.is-wide .scene-lock .padlock-wrap { margin: 24px 0 18px 12px; }
.phone.is-wide .scene-lock .pad { padding: 26px 26px 28px; border-radius: 36px; box-shadow: 0 1px 0 #fff inset, 0 30px 60px rgb(220 100 140 / 0.22); }
.phone.is-wide .scene-lock .pad::before { content: ""; position: absolute; inset: 10px; border: 1px dashed rgb(240 140 170 / 0.45); border-radius: 28px; pointer-events: none; }
.phone.is-wide .scene-cover .gift-stage::before { width: 70%; margin-left: -35%; }


/* ===== INTERACTIVE extras ===== */
.scratch { position: absolute; inset: 0; z-index: 3; width: 100%; height: 100%; border-radius: 18px; touch-action: none; cursor: grab; }
.scratch.done { opacity: 0; pointer-events: none; transition: opacity 0.5s; }
.phone .balloon-field { touch-action: none; }
.padlock-wrap.bump { animation: lockbump 0.2s ease-out; }
@keyframes lockbump { 0% { transform: scale(1); } 45% { transform: scale(1.09) rotate(-2deg); } 100% { transform: scale(1); } }
.phone .gift-scene { translate: calc(var(--px, 0) * 16px) calc(var(--py, 0) * 12px); transition: translate 0.15s ease-out; }
.phone .gift-halo { translate: calc(var(--px, 0) * -26px) calc(var(--py, 0) * -18px); transition: translate 0.2s ease-out; }
.phone .rays { translate: calc(var(--px, 0) * -12px) calc(var(--py, 0) * -8px); transition: translate 0.2s ease-out; }

/* ===================== NEW LOOK: SOFT LUXURY (pearl · rose gold · glass · light) ===================== */
.soft-shell {
  --ink: #2a1b2e;
  --ink-soft: rgb(42 27 46 / 0.62);
  --gold-1: #a35468;
  --gold-2: #c98a86;
  --gold-3: #e3b3a6;
  --gold-grad: linear-gradient(135deg, #f6dccd, #dca297 45%, #b97179 78%, #f0cbb9);
  --gold-text: linear-gradient(110deg, #a35468, #d99b92 55%, #a35468);
  --line: rgb(201 138 134 / 0.45);
  --rose: #b4566b;
  --serif: "Fraunces", "Cormorant Garamond", Georgia, serif;
  --script: "Fraunces", Georgia, serif;
  --ui: "Jost", "Nunito", system-ui, sans-serif;
  --glass: rgb(255 255 255 / 0.55);
  --glass-line: rgb(201 138 134 / 0.38);
  --shell-frame: #1d1322;
}
.deco, .petals { display: none !important; }
.phone {
  background:
    radial-gradient(90% 55% at 8% 0%, #f7d5da 0%, transparent 62%),
    radial-gradient(80% 55% at 100% 28%, #e4d6ee 0%, transparent 62%),
    radial-gradient(90% 55% at 82% 100%, #f9e2c9 0%, transparent 62%),
    #fbf4f1;
}
.phone::before { background: radial-gradient(120% 90% at 50% 45%, transparent 70%, rgb(120 60 80 / 0.08) 100%); }
.phone::after { border: 1px solid rgb(201 138 134 / 0.28); }
.aurora i { opacity: 0.55; }
.grain { opacity: 0.16; }
.ambient i { background: radial-gradient(circle, #fff 0, rgb(236 190 160 / 0.9) 42%, transparent 72%); }

/* progress */
.phone .progress { top: 20px; gap: 6px; padding: 0; border: 0; background: none; backdrop-filter: none; }
.phone .progress span { width: 26px; height: 2px; border-radius: 2px; background: rgb(42 27 46 / 0.14); }
.phone .progress span.on { background: #c98a86; }
.phone .progress span.now { width: 26px; background: linear-gradient(90deg, #b4566b, #e3b3a6); box-shadow: 0 0 10px rgb(180 86 107 / 0.55); }
.phone.is-finale .progress span { background: rgb(255 255 255 / 0.2); }
.phone.is-finale .progress span.on { background: #e3b3a6; }

/* type */
.phone .eyebrow { color: #a35468; font: 500 10px/1 var(--ui); letter-spacing: 0.36em; text-transform: uppercase; gap: 10px; }
.phone .eyebrow-line { display: block; width: 22px; height: 1px; background: linear-gradient(90deg, transparent, #c98a86); }
.phone .eyebrow-line:last-child { background: linear-gradient(90deg, #c98a86, transparent); }
.phone .scene-title { font-family: var(--serif); font-weight: 300; font-size: 41px; letter-spacing: -0.025em; line-height: 1.02; color: var(--ink); text-shadow: none; text-wrap: balance; }
.phone .scene-title em { font-style: italic; font-weight: 300; background: var(--gold-text); -webkit-background-clip: text; background-clip: text; color: transparent; animation: none; padding-right: 0.06em; }
.phone .scene-sub { font: 400 12.5px/1.4 var(--ui); letter-spacing: 0.08em; color: var(--ink-soft); }
.phone .script-line { font: italic 300 17px/1 var(--serif); color: #a35468; letter-spacing: 0.01em; }
.phone .chip { font: 500 9px/1 var(--ui); letter-spacing: 0.3em; color: #a35468; border: 1px solid rgb(201 138 134 / 0.45); background: rgb(255 255 255 / 0.5); padding: 6px 12px; }

/* buttons */
.phone .primary-button {
  background: linear-gradient(180deg, #3a2640, #231528);
  color: #f6dccd;
  font: 500 11px/1 var(--ui);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  text-shadow: none;
  padding: 18px 40px;
  box-shadow: inset 0 0 0 1px rgb(233 195 176 / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.18), 0 18px 34px rgb(42 27 46 / 0.3);
}
.phone .primary-button::after { background: linear-gradient(105deg, transparent 38%, rgb(240 200 180 / 0.35) 50%, transparent 62%); }

/* glass */
.phone .glass {
  border: 1px solid rgb(201 138 134 / 0.32);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.38));
  backdrop-filter: blur(18px) saturate(1.3);
  box-shadow: inset 0 1px 0 #fff, 0 24px 50px rgb(120 60 80 / 0.14);
}

/* ===== COVER: pearl orb ===== */
.phone .gift-stage .rays, .phone .gift-stage .gift-scene, .phone .gift-stage .gift-shadow, .phone .gift-stage .orbit { display: none; }
.phone .gift-stage::before, .phone .gift-stage::after { display: none; }
.phone .gift-halo { width: 330px; height: 330px; margin: -165px 0 0 -165px; background: radial-gradient(circle, rgb(255 255 255 / 0.9), rgb(247 205 214 / 0.5) 38%, rgb(240 200 170 / 0.18) 60%, transparent 72%); }
.orb-wrap { position: absolute; inset: 0; display: grid; place-items: center; perspective: 900px; }
.orb-float { position: relative; width: 150px; height: 150px; animation: giftfloat 5s ease-in-out infinite; transform-style: preserve-3d; }
.orb {
  position: absolute; inset: 0; border-radius: 50%;
  background:
    radial-gradient(circle at 31% 24%, #fff 0, rgb(255 255 255 / 0.85) 5%, rgb(255 255 255 / 0) 22%),
    radial-gradient(circle at 70% 82%, rgb(255 214 200 / 0.9) 0, transparent 46%),
    radial-gradient(circle at 50% 50%, #fff4ee 0%, #f6d6d8 42%, #e2aebb 74%, #b9809a 100%);
  box-shadow: inset -16px -20px 44px rgb(120 50 90 / 0.38), inset 12px 14px 32px rgb(255 255 255 / 0.75), 0 34px 60px rgb(160 80 110 / 0.34), 0 0 90px rgb(255 205 220 / 0.85);
}
.orb::before { /* iridescence */
  content: ""; position: absolute; inset: 0; border-radius: 50%;
  background: conic-gradient(from 0deg, rgb(255 190 200 / 0.0), rgb(200 220 255 / 0.55), rgb(255 230 190 / 0.5), rgb(230 190 255 / 0.55), rgb(255 190 200 / 0.0));
  mix-blend-mode: soft-light; animation: spin 14s linear infinite;
}
.orb::after { /* specular crescent */
  content: ""; position: absolute; left: 14%; top: 10%; width: 46%; height: 30%; border-radius: 50%;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.95), rgb(255 255 255 / 0)); filter: blur(1px); transform: rotate(-24deg);
}
.orb.open { animation: orbopen 0.9s cubic-bezier(0.3, 0.9, 0.4, 1) forwards; }
@keyframes orbopen { 0% { transform: scale(1); filter: brightness(1); } 55% { transform: scale(1.25); filter: brightness(1.25); } 100% { transform: scale(2.6); opacity: 0; filter: brightness(1.6) blur(6px); } }
.orb-ring { position: absolute; left: 50%; top: 50%; border-radius: 50%; border: 1px solid rgb(201 138 134 / 0.65); transform-style: preserve-3d; }
.orb-ring.r1 { width: 250px; height: 250px; margin: -125px 0 0 -125px; transform: rotateX(72deg); animation: ringspin1 16s linear infinite; }
.orb-ring.r2 { width: 300px; height: 300px; margin: -150px 0 0 -150px; border-color: rgb(180 86 107 / 0.4); transform: rotateX(62deg) rotateY(18deg); animation: ringspin2 24s linear infinite reverse; }
.orb-ring.r3 { width: 200px; height: 200px; margin: -100px 0 0 -100px; border-style: dashed; border-color: rgb(201 138 134 / 0.55); transform: rotateX(78deg) rotateY(-22deg); animation: ringspin1 30s linear infinite; }
.orb-ring i { position: absolute; left: 50%; top: -3.5px; width: 7px; height: 7px; margin-left: -3.5px; border-radius: 50%; background: radial-gradient(circle, #fff, #f3c9b8 60%, #d99b92); box-shadow: 0 0 12px 3px rgb(255 214 190 / 0.95); }
.orb-ring.r2 i { top: auto; bottom: -3.5px; width: 5px; height: 5px; }
@keyframes ringspin1 { to { transform: rotateX(72deg) rotateZ(360deg); } }
@keyframes ringspin2 { to { transform: rotateX(62deg) rotateY(18deg) rotateZ(360deg); } }
.orb-reflect { position: absolute; left: 50%; bottom: 7%; width: 190px; height: 30px; margin-left: -95px; border-radius: 50%; background: radial-gradient(ellipse, rgb(180 86 107 / 0.35), transparent 70%); animation: gshadow 5s ease-in-out infinite; }
.phone .scene-cover .primary-button { margin-top: 0; min-width: 72%; }

/* ===== LOCK: dial ===== */
.phone .padlock-wrap { width: 190px; }
.phone .padlock { filter: drop-shadow(0 14px 24px rgb(160 80 110 / 0.28)); }
.phone .ring { border-color: rgb(201 138 134 / 0.8); }
.phone .pad { padding: 18px 16px 20px; gap: 14px; border-radius: 30px; }
.phone .hint { font: italic 300 17px/1.2 var(--serif); color: #a35468; gap: 8px; letter-spacing: 0; }
.phone .hint-icon { display: none; }
.phone .code-dots { gap: 16px; }
.phone .code-dots span { width: 11px; height: 11px; border: 1px solid rgb(163 84 104 / 0.7); border-radius: 50%; }
.phone .code-dots span.filled { border-color: transparent; background: linear-gradient(135deg, #f0cbb9, #b4566b); box-shadow: 0 0 0 4px rgb(201 138 134 / 0.2), 0 0 14px rgb(180 86 107 / 0.55); }
.phone .keypad { grid-template-columns: repeat(3, 58px); gap: 11px 20px; }
.phone .keypad button { height: 58px; border-radius: 50%; border: 1px solid rgb(201 138 134 / 0.5); background: radial-gradient(circle at 32% 24%, #fff, rgb(255 244 240 / 0.75) 70%); color: var(--ink); font: 300 25px/1 var(--serif); text-shadow: none; box-shadow: 0 8px 18px rgb(160 80 110 / 0.14), inset 0 1px 0 #fff; }
.phone .keypad button:active { transform: scale(0.92); }
.phone .keypad .key-ok { background: linear-gradient(180deg, #3a2640, #231528); color: #f6dccd; border-color: rgb(233 195 176 / 0.6); }
.phone .demo-code { font: 500 9px/1 var(--ui); letter-spacing: 0.3em; text-transform: uppercase; color: var(--ink-soft); }
.phone .demo-code b { border: 1px solid rgb(201 138 134 / 0.45); background: rgb(255 255 255 / 0.5); color: #a35468; font-weight: 500; padding: 4px 9px; }

/* ===== BALLOONS -> wish orbs (glass bubbles) ===== */
.phone .scene-balloons { background: linear-gradient(180deg, #f2e6f3 0%, #f8dde2 48%, #fbe5d4 100%); }
.phone .sky .sun, .phone .sky .cloud, .phone .sky .scenery, .phone .sky .scenery-wide, .phone .sky .hill { display: none; }
.phone .sky::before { content: ""; position: absolute; left: 50%; top: 38%; width: 160%; height: 60%; margin-left: -80%; background: radial-gradient(ellipse at 50% 50%, rgb(255 255 255 / 0.85), rgb(255 214 214 / 0.35) 42%, transparent 70%); }
.phone .sky::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 34%; background: linear-gradient(180deg, transparent, rgb(255 255 255 / 0.6)); }
.phone .wish-card { margin-top: 6px; padding: 22px 20px 18px; border-radius: 22px; min-height: 96px; }
.phone .wish-card p { font: italic 300 23px/1.15 var(--serif); color: var(--ink); margin: 10px 0 0; }
.phone .wish-card .card-bow { display: none; }
.phone .balloon { width: min(36cqw, 31cqh); aspect-ratio: 1; filter: drop-shadow(0 18px 18px rgb(160 80 110 / 0.22)); animation: bob 5s ease-in-out infinite; }
.phone .balloon svg { width: 100%; height: 100%; }
.phone .balloon.popped { transform: scale(1.7); opacity: 0; }
.phone .floating-cta { bottom: 28px; }

/* ===== MEMORY cards ===== */
.phone .cards-aura { background: radial-gradient(circle, rgb(255 205 215 / 0.65), rgb(240 190 160 / 0.2) 50%, transparent 70%); }
.phone .mback { background: radial-gradient(120% 80% at 50% 0%, #4a2d4e, #1e1224 72%); box-shadow: 0 28px 44px rgb(80 30 60 / 0.4), 0 0 0 1px rgb(233 195 176 / 0.6) inset; }
.phone .mback::after { border: 1px solid rgb(233 195 176 / 0.45); }
.phone .mback { background-image: repeating-radial-gradient(circle at 50% 46%, transparent 0 9px, rgb(233 195 176 / 0.07) 9px 10px), radial-gradient(120% 80% at 50% 0%, #4a2d4e, #1e1224 72%); }
.phone .back-eyebrow { color: #e9c3b0; font: 500 9.5px/1 var(--ui); letter-spacing: 0.4em; }
.phone .seal { background: radial-gradient(circle at 34% 26%, #fff3ea, #e9c3b0 52%, #b97179); box-shadow: inset 0 0 0 5px rgb(255 245 235 / 0.35), 0 0 40px rgb(233 195 176 / 0.45), 0 12px 22px rgb(0 0 0 / 0.5); }
.phone .seal svg { fill: #5a2a45; }
.phone .back-script { font: italic 300 20px/1 var(--serif); color: #f6dccd; }
.phone .mfront { background: linear-gradient(180deg, #fffaf6, #f7e7e2); }
.phone .mcap p { font: italic 300 20px/1.1 var(--serif); color: var(--ink); }
.phone .mcap .no { color: #a35468; letter-spacing: 0.34em; }
.phone .swipe-hint { font: 500 9.5px/1 var(--ui); letter-spacing: 0.3em; color: var(--ink-soft); }
.phone .padlock-wrap { width: 150px; margin-top: -4px; }
.phone .pad { padding: 12px 14px 14px; gap: 9px; width: calc(100% - 36px); }
.phone .keypad { grid-template-columns: repeat(3, 48px); gap: 8px 18px; }
.phone .keypad button { height: 48px; font-size: 22px; }
.phone .wish-card { width: calc(100% - 44px); align-self: center; }

/* ===== FEMININE PINK RESTORE ===== */
.soft-shell { --ink:#4a1a33; --ink-soft:rgb(120 50 85 / .7); --rose:#e8507b; --gold-text:linear-gradient(110deg,#e8507b,#ff8fb0 55%,#e8507b); --line:rgb(255 120 160 / .5); }
.phone { background:
  radial-gradient(90% 55% at 6% 0%, #ffc2d6 0%, transparent 62%),
  radial-gradient(80% 55% at 100% 30%, #f1cfff 0%, transparent 62%),
  radial-gradient(90% 55% at 80% 100%, #ffd6c4 0%, transparent 62%), #fff0f5; }
.phone .progress span.on { background:#ff8fb0; }
.phone .progress span.now { background:linear-gradient(90deg,#e8507b,#ffb3c8); box-shadow:0 0 10px rgb(232 80 123 / .6); }
.phone .eyebrow, .phone .script-line, .phone .hint, .phone .chip, .phone .demo-code b, .phone .mcap .no { color:#d6406d; }
.phone .eyebrow-line { background:linear-gradient(90deg,transparent,#ff8fb0); }
.phone .eyebrow-line:last-child { background:linear-gradient(90deg,#ff8fb0,transparent); }
.phone .chip, .phone .demo-code b { border-color:rgb(255 120 160 / .5); }
.phone .primary-button { background:linear-gradient(180deg,#ff8fb0,#e8507b 60%,#d13a68); color:#fff; box-shadow:inset 0 0 0 1px rgb(255 255 255 / .55), inset 0 1px 0 rgb(255 255 255 / .5), 0 18px 34px rgb(232 80 123 / .38); }
.phone .primary-button::after { background:linear-gradient(105deg,transparent 38%,rgb(255 255 255 / .55) 50%,transparent 62%); }
.phone .glass { border-color:rgb(255 150 180 / .5); box-shadow:inset 0 1px 0 #fff, 0 24px 50px rgb(232 80 123 / .18); }
.phone .keypad button { border-color:rgb(255 140 175 / .6); background:radial-gradient(circle at 32% 24%,#fff,#ffe9f0 75%); color:#4a1a33; box-shadow:0 8px 18px rgb(232 80 123 / .2), inset 0 1px 0 #fff; }
.phone .keypad .key-ok { background:linear-gradient(180deg,#ff8fb0,#e8507b); color:#fff; border-color:#fff; }
.phone .code-dots span { border-color:#e8507b; }
.phone .code-dots span.filled { background:linear-gradient(135deg,#ffb3c8,#e8507b); box-shadow:0 0 0 4px rgb(255 120 160 / .25),0 0 14px rgb(232 80 123 / .6); }
.phone .padlock { filter:drop-shadow(0 14px 24px rgb(232 80 123 / .38)); }
.orb { background:
  radial-gradient(circle at 31% 24%,#fff 0,rgb(255 255 255 / .85) 5%,rgb(255 255 255 / 0) 22%),
  radial-gradient(circle at 70% 82%,rgb(255 190 205 / .95) 0,transparent 50%),
  radial-gradient(circle at 50% 50%,#fff0f5 0%,#ffc2d6 42%,#f2789f 76%,#c93d72 100%);
  box-shadow:inset -16px -20px 44px rgb(170 30 80 / .4),inset 12px 14px 32px rgb(255 255 255 / .75),0 34px 60px rgb(232 80 123 / .42),0 0 90px rgb(255 160 190 / .9); }
.orb-ring { border-color:rgb(255 110 155 / .7); }
.orb-ring i { background:radial-gradient(circle,#fff,#ffc2d6 60%,#e8507b); box-shadow:0 0 12px 3px rgb(255 150 185 / .95); }
.phone .gift-halo { background:radial-gradient(circle,rgb(255 255 255 / .9),rgb(255 170 200 / .6) 38%,rgb(255 200 190 / .2) 60%,transparent 72%); }
.phone .scene-balloons { background:linear-gradient(180deg,#f7e0fb 0%,#ffd3e2 48%,#ffe0d0 100%); }
.phone .mback { background-image:repeating-radial-gradient(circle at 50% 46%,transparent 0 9px,rgb(255 255 255 / .1) 9px 10px),radial-gradient(120% 80% at 50% 0%,#ff8fb0,#c93d72 72%); box-shadow:0 28px 44px rgb(232 80 123 / .45),0 0 0 1px rgb(255 255 255 / .7) inset; }
.phone .back-eyebrow, .phone .back-script { color:#fff; }
.phone .seal { background:radial-gradient(circle at 34% 26%,#fff,#ffd3e0 52%,#ff8fb0); }
.phone .seal svg { fill:#d6406d; }
.phone .mfront { background:linear-gradient(180deg,#fff,#ffe9f0); }

/* ===================== NEW: pop-up card (cover) + trace the heart (finale) ===================== */
/* ----- COVER: pop-up birthday card ----- */
.pc-wrap {
  --cw: min(45cqw, 30cqh, 200px);
  --ch: calc(var(--cw) * 1.32);
  position: absolute;
  z-index: 1;
  inset: 0;
  perspective: 1300px;
  cursor: grab;
  outline: none;
  touch-action: none;
}
.pc-wrap.drag { cursor: grabbing; }
.pc-wrap:focus-visible .pc-front { box-shadow: 0 0 0 3px rgb(255 255 255 / 0.9), 0 0 0 6px #e8507b; }
.pc-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--cw);
  height: var(--ch);
  margin-top: calc(var(--ch) * -0.5);
  margin-left: calc(var(--cw) * (var(--p) * 0.5 - 0.5));
  transform-style: preserve-3d;
  transform: rotateX(calc(9deg * (1 - var(--p)))) rotateY(calc(-12deg * (1 - var(--p))));
  animation: pcfloat 4.6s ease-in-out infinite;
}
.pc-wrap.done .pc-card { animation: none; }
@keyframes pcfloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -7px; } }
.pc-shadow {
  position: absolute;
  left: 50%;
  top: calc(50% + var(--ch) * 0.5 + 12px);
  width: calc(var(--cw) * (1.1 + var(--p) * 0.9));
  height: 22px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgb(190 60 100 / 0.38), transparent 70%);
  transform: translateX(-50%);
  pointer-events: none;
}
.pc-right {
  position: absolute;
  inset: 0;
  border: 1px solid rgb(255 160 190 / 0.55);
  border-radius: 3px 12px 12px 3px;
  background:
    radial-gradient(rgb(255 150 180 / 0.16) 1.4px, transparent 2px) 0 0 / 13px 13px,
    linear-gradient(160deg, #fffaf6, #ffe8ef);
  box-shadow: 0 20px 34px rgb(232 80 123 / 0.26), inset 8px 0 14px rgb(232 80 123 / 0.1);
  transform: translateZ(-1px);
}
.pc-cover {
  position: absolute;
  inset: 0;
  transform-origin: 0 50%;
  transform-style: preserve-3d;
  transform: rotateY(calc(var(--p) * -180deg));
}
.pc-face {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10%;
  overflow: hidden;
  text-align: center;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.pc-front {
  border-radius: 3px 12px 12px 3px;
  background: linear-gradient(160deg, #ffe1ec 0%, #ffa9c6 48%, #ec6a96 100%);
  box-shadow: 0 20px 34px rgb(232 80 123 / 0.34), inset 0 0 0 1px rgb(255 255 255 / 0.6);
}
.pc-front::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 38%, rgb(255 255 255 / 0.5) 50%, transparent 62%);
  transform: translateX(-120%);
  animation: sweep 3.8s ease-in-out infinite;
  pointer-events: none;
}
.pc-back {
  border-radius: 12px 3px 3px 12px;
  background: linear-gradient(200deg, #fffaf6, #ffe8ef);
  box-shadow: inset -8px 0 14px rgb(232 80 123 / 0.1), 0 20px 34px rgb(232 80 123 / 0.22);
  padding-right: 26%;
  transform: rotateY(180deg);
}
.pc-frame {
  position: absolute;
  inset: 7px;
  border: 1px solid rgb(255 255 255 / 0.75);
  border-radius: 3px 9px 9px 3px;
  pointer-events: none;
}
.pc-back .pc-frame { border-color: rgb(255 140 175 / 0.5); border-radius: 9px 3px 3px 9px; }
.pc-bow {
  width: calc(var(--cw) * 0.42);
  height: auto;
  aspect-ratio: 60 / 44;
  margin-bottom: 5%;
  filter: drop-shadow(0 3px 4px rgb(150 30 80 / 0.3));
}
.pc-small {
  margin: 0 0 3%;
  color: #fff;
  font-family: var(--ui);
  font-size: calc(var(--cw) * 0.062);
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  opacity: 0.92;
}
.pc-big {
  margin: 0;
  color: #fff;
  font-family: var(--serif);
  font-size: calc(var(--cw) * 0.17);
  font-style: italic;
  font-weight: 500;
  line-height: 1.02;
  text-shadow: 0 2px 10px rgb(170 30 80 / 0.35);
}
.pc-pull {
  position: absolute;
  right: 9%;
  bottom: 7%;
  color: #fff;
  font-family: var(--ui);
  font-size: calc(var(--cw) * 0.055);
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}
.pc-pull i {
  display: inline-block;
  margin-right: 4px;
  font-style: normal;
  animation: nudgel 1.2s ease-in-out infinite;
}
.pc-hi {
  margin: 0 0 6%;
  color: #d6406d;
  font-family: var(--script);
  font-size: calc(var(--cw) * 0.19);
  font-weight: 700;
  line-height: 1;
}
.pc-msg {
  margin: 0;
  color: var(--ink);
  font-family: var(--serif);
  font-size: calc(var(--cw) * 0.088);
  font-style: italic;
  line-height: 1.35;
}
.pc-sign {
  margin: 8% 0 0;
  color: #d6406d;
  font-family: var(--script);
  font-size: calc(var(--cw) * 0.15);
  font-weight: 700;
}
.pc-pop {
  position: absolute;
  left: 0;
  bottom: 6%;
  width: calc(var(--cw) * 1.34);
  aspect-ratio: 260 / 220;
  margin-left: calc(var(--cw) * -0.34);
  transform-origin: 50% 100%;
  transform: translateZ(2px) scale(var(--pop));
  filter: drop-shadow(0 10px 10px rgb(200 70 110 / 0.25));
  pointer-events: none;
}
.pc-pop svg { display: block; width: 100%; height: 100%; overflow: visible; }
.pc-cake-text {
  fill: #fff;
  font-family: var(--serif);
  font-size: 16px;
  font-style: italic;
  stroke: rgb(214 64 109 / 0.5);
  stroke-width: 0.7px;
  paint-order: stroke;
}
.pc-flame {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: pcflick 0.45s ease-in-out infinite alternate;
}
@keyframes pcflick { from { transform: scale(1, 1) rotate(-3deg); } to { transform: scale(0.9, 1.12) rotate(3deg); } }
.pc-glow { opacity: 0; transition: opacity 0.8s ease; }
.pc-wrap.done .pc-glow { opacity: 1; }
.pc-tw { animation: twinkle 1.6s ease-in-out infinite alternate; }
.pc-tw.t2 { animation-delay: 0.4s; }
.pc-tw.t3 { animation-delay: 0.8s; }
.pc-tw.t4 { animation-delay: 1.2s; }
.pc-wrap.done .pc-bunting { transform-box: fill-box; transform-origin: 50% 0; animation: pcsway 3s ease-in-out infinite alternate; }
@keyframes pcsway { from { transform: rotate(-1.2deg); } to { transform: rotate(1.2deg); } }
.pc-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3%;
  z-index: 2;
  margin: 0;
  color: var(--ink-soft);
  font-family: var(--ui);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-align: center;
  text-transform: uppercase;
  transition: opacity 0.3s;
  pointer-events: none;
}
.pc-hint.off { opacity: 0; }

/* ----- FINALE: trace the heart ----- */
.trace {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  outline: none;
}
.trace .sky-hint { text-align: center; }
.trace-svg {
  width: min(80cqw, 340px, 46cqh);
  aspect-ratio: 200 / 190;
  height: auto;
  overflow: visible;
  cursor: crosshair;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  filter: drop-shadow(0 0 18px rgb(255 140 190 / 0.35));
}
.trace.lit .trace-svg { animation: trbeat 0.9s ease-in-out infinite; }
@keyframes trbeat { 0%, 100% { scale: 1; } 50% { scale: 1.05; } }
.trace-fill { fill: url(#tr-fill); opacity: 0; transition: opacity 0.9s ease; }
.trace.lit .trace-fill { opacity: 0.92; }
.trace-guide {
  fill: none;
  stroke: rgb(255 255 255 / 0.34);
  stroke-dasharray: 2 5;
  stroke-linecap: round;
  stroke-width: 1.4;
}
.trace-link {
  fill: none;
  stroke: rgb(255 214 232 / 0.85);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
  filter: drop-shadow(0 0 3px #ff9fc3);
}
.trace-line {
  fill: none;
  stroke: #fff;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
  opacity: 0.8;
  filter: drop-shadow(0 0 5px #ff9fc3);
}
.trace-halo { fill: rgb(255 200 220 / 0); transition: fill 0.3s; }
.trace-st {
  fill: #ffe9a8;
  opacity: 0.6;
  transform-box: fill-box;
  transform-origin: center;
  animation: twinkle 2.4s ease-in-out infinite alternate;
}
.trace-star:nth-child(odd) .trace-st { animation-delay: 0.7s; }
.trace-star.on .trace-halo { fill: rgb(255 190 215 / 0.4); }
.trace-star.on .trace-st {
  fill: #fff;
  opacity: 1;
  scale: 1.5;
  animation: none;
  filter: drop-shadow(0 0 4px #ffd36b);
  transition: scale 0.25s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.trace-star.pulse .trace-halo { animation: trpulse 1s ease-in-out infinite; }
@keyframes trpulse { 0%, 100% { fill: rgb(255 200 220 / 0.12); } 50% { fill: rgb(255 200 220 / 0.6); } }
.trace-tip { fill: #fff; filter: drop-shadow(0 0 6px #ff9fc3); pointer-events: none; }

@media (prefers-reduced-motion: reduce) {
  .pc-card,
  .pc-front::after,
  .pc-flame,
  .pc-tw,
  .pc-bunting,
  .trace-svg,
  .trace-star,
  .aurora i,
  .ambient i,
  .rays,
  .gift,
  .gift-float,
  .glid,
  .orbit,
  .primary-button::after,
  .scene-title em,
  .finale-card h3 em,
  .tw,
  .cards-aura,
  .sheen,
  .seal,
  .csp,
  .arr,
  .cloud,
  .balloon,
  .string,
  .stars,
  .shoot,
  .gacha-knob.ready,
  .capsule {
    animation: none;
  }
}
</style>