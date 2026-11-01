<template>
  <!-- INTERACTIVE PREVIEW ng 01 Soft Celebration: cover + 5 eksena sa loob ng phone.
       Lahat ng laman ay galing sa `content` prop (sample muna habang wala pang form). -->
  <div
    ref="overlayEl"
    class="surprise-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Soft Celebration interactive preview"
    tabindex="-1"
  >
    <header class="surprise-topbar">
      <div class="topbar-title">
        <strong>01 Soft Celebration</strong>
        <span>Interactive preview</span>
      </div>
      <div class="topbar-actions">
        <button class="use-button" type="button" @click="emit('use')">Use this template</button>
        <button class="close-button" type="button" aria-label="Close preview" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </header>

    <div class="surprise-stage">
      <aside class="flow-info">
        <h2>Birthday surprise <span>flow</span></h2>
        <p>
          A sample of what the recipient experiences. Five interactive scenes, opening one by
          one inside their phone.
        </p>
        <ol class="flow-steps">
          <li v-for="(step, index) in scenes" :key="step.id">
            <button
              type="button"
              :class="{ active: index === sceneIndex, done: index < sceneIndex }"
              @click="goTo(step.id)"
            >
              <span class="step-number">{{ index + 1 }}</span>
              {{ step.label }}
            </button>
          </li>
        </ol>
        <p class="flow-note">
          <strong>Sample content only.</strong> The names, code, wishes, photos, captions and
          coupons come from the form the customer fills out. Photos needed: 1 to 3.
        </p>
      </aside>

      <div ref="phoneEl" class="phone" :class="{ 'is-dark': scene === 'finale' }">
        <!-- SVG DEFS: ribbon bow, bulaklak, puso, sparkle, garland (ginagamit sa lahat ng eksena) -->
        <svg class="svg-defs" width="0" height="0" aria-hidden="true">
          <defs>
            <radialGradient id="sl-shine" cx="32%" cy="26%" r="60%">
              <stop offset="0" stop-color="#fff" stop-opacity="0.75" />
              <stop offset="0.35" stop-color="#fff" stop-opacity="0.15" />
              <stop offset="1" stop-color="#fff" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="sl-rosegold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#f6cfb8" />
              <stop offset="0.5" stop-color="#d99a7e" />
              <stop offset="1" stop-color="#b9765d" />
            </linearGradient>
            <linearGradient id="sl-lockbody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ffa5b9" />
              <stop offset="1" stop-color="#ec6f8e" />
            </linearGradient>
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
          <symbol id="sl-garland" viewBox="0 0 340 90">
            <path d="M18 24C80 64 128 18 170 26c42-8 90 38 152-2" fill="none" stroke="#f4a7b9" stroke-width="4" stroke-linecap="round" />
            <path d="M18 29C80 69 128 23 170 31c42-8 90 38 152-2" fill="none" stroke="#fbd3dd" stroke-width="2" stroke-linecap="round" />
            <path d="M20 26c-8 16 8 26-2 44s6 12 2 18" fill="none" stroke="#f4a7b9" stroke-width="3" stroke-linecap="round" />
            <path d="M320 26c8 16-8 26 2 44s-6 12-2 18" fill="none" stroke="#f4a7b9" stroke-width="3" stroke-linecap="round" />
            <use href="#sl-bow" x="138" y="2" width="64" height="47" />
            <use href="#sl-flower" x="2" y="10" width="28" height="28" />
            <use href="#sl-flower" x="26" y="0" width="16" height="16" />
            <use href="#sl-flower" x="310" y="10" width="28" height="28" />
            <use href="#sl-flower" x="298" y="0" width="16" height="16" />
            <use href="#sl-heart" x="68" y="48" width="10" height="10" fill="#f59ab0" />
            <use href="#sl-heart" x="262" y="46" width="9" height="9" fill="#f59ab0" />
            <use href="#sl-sparkle" x="100" y="8" width="9" height="9" fill="#f8c3d0" />
            <use href="#sl-sparkle" x="232" y="8" width="9" height="9" fill="#f8c3d0" />
          </symbol>
        </svg>

        <!-- GARLAND sa itaas (ribbon + bulaklak sa kanto); wala sa Finale kasi madilim doon -->
        <template v-if="scene !== 'finale'">
          <img
            v-if="art['soft-garland-top']"
            class="garland garland-full"
            :src="art['soft-garland-top']"
            alt=""
            aria-hidden="true"
          />
          <div v-else-if="garlandArt" class="garland" aria-hidden="true">
            <!-- bow muna, tapos ang mga kanto sa ibabaw para matakpan ang dulo ng tails -->
            <img class="garland-bow" :src="garlandArt.bow" alt="" />
            <img class="garland-corner left" :src="garlandArt.left" alt="" />
            <img class="garland-corner right" :src="garlandArt.right" alt="" />
          </div>
          <svg v-else class="garland" aria-hidden="true"><use href="#sl-garland" /></svg>
        </template>

        <div v-if="sceneIndex >= 0" class="progress">
          <span v-for="(step, index) in scenes" :key="step.id" :class="{ on: index <= sceneIndex }" />
        </div>

        <Transition name="scene" mode="out-in">
          <!-- COVER -->
          <section v-if="scene === 'cover'" key="cover" class="scene scene-light scene-cover">
            <p class="eyebrow">A surprise for {{ c.recipient }}</p>
            <h3 class="scene-title">Someone made this just for you</h3>
            <div class="divider" aria-hidden="true"><svg><use href="#sl-heart" /></svg></div>
            <img class="cover-art" :src="coverImage" alt="Soft Celebration birthday card" />
            <button class="primary-button" type="button" @click="goTo('lock')">
              Start the surprise <span aria-hidden="true">→</span>
            </button>
            <p class="script-line">From {{ c.sender }}, with love 💗</p>
            <div class="divider" aria-hidden="true"><svg><use href="#sl-heart" /></svg></div>
          </section>

          <!-- 1. SECRET LOCK -->
          <section v-else-if="scene === 'lock'" key="lock" class="scene scene-light">
            <p class="eyebrow">A surprise for {{ c.recipient }}</p>
            <h3 class="scene-title">
              <svg class="title-sparkle" aria-hidden="true"><use href="#sl-sparkle" /></svg>
              Just for you
              <svg class="title-heart" aria-hidden="true"><use href="#sl-heart" /></svg>
            </h3>
            <p class="scene-sub">Enter the secret code to unlock.</p>
            <div class="padlock-wrap" :class="{ shake: lockShake, open: unlocked }">
              <img v-if="art.padlock" class="padlock-art" :src="art.padlock" alt="" />
              <svg v-else class="padlock" viewBox="0 0 160 150" aria-hidden="true">
                <use href="#sl-flower" x="6" y="84" width="34" height="34" />
                <use href="#sl-flower" x="120" y="84" width="34" height="34" />
                <use href="#sl-heart" x="12" y="30" width="14" height="14" fill="#f78fa9" />
                <use href="#sl-heart" x="132" y="40" width="12" height="12" fill="#f78fa9" />
                <use href="#sl-sparkle" x="138" y="16" width="10" height="10" fill="#f6b6c6" />
                <path
                  class="shackle"
                  d="M54 64V44a26 26 0 0 1 52 0v20"
                  fill="none"
                  stroke="url(#sl-rosegold)"
                  stroke-width="11"
                  stroke-linecap="round"
                />
                <rect x="36" y="58" width="88" height="70" rx="20" fill="url(#sl-lockbody)" />
                <rect x="36" y="58" width="88" height="70" rx="20" fill="url(#sl-shine)" />
                <path
                  d="M80 110s-16-9.5-16-20a9 9 0 0 1 16-5.6 9 9 0 0 1 16 5.6c0 10.5-16 20-16 20Z"
                  fill="#fff"
                />
                <use href="#sl-bow" x="52" y="112" width="56" height="41" />
              </svg>
            </div>
            <p class="hint">Hint: {{ c.hint }}</p>
            <div class="divider" aria-hidden="true"><svg><use href="#sl-heart" /></svg></div>
            <div class="code-dots" aria-live="polite" :aria-label="`${entered.length} of ${c.code.length} digits`">
              <span v-for="n in c.code.length" :key="n" :class="{ filled: n <= entered.length }" />
            </div>
            <div class="keypad">
              <button
                v-for="key in keypadKeys"
                :key="key"
                type="button"
                :aria-label="key === 'back' ? 'Delete' : key === 'ok' ? 'Unlock' : key"
                @click="pressKey(key)"
              >
                <svg v-if="key === 'back'" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7 6-7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
                  <path d="m11 9.5 5 5m0-5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                </svg>
                <svg v-else-if="key === 'ok'" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <template v-else>{{ key }}</template>
              </button>
            </div>
            <p class="demo-code">Demo code: {{ c.code }}</p>
          </section>

          <!-- 2. BALLOON POP WISHES -->
          <section
            v-else-if="scene === 'balloons'"
            key="balloons"
            class="scene scene-balloons"
            :style="art['bg-balloons'] ? { backgroundImage: `url(${art['bg-balloons']})` } : null"
          >
            <div v-if="!art['bg-balloons']" class="sky-fallback" aria-hidden="true">
              <span class="cloud cloud-1" />
              <span class="cloud cloud-2" />
              <span class="garden garden-left" />
              <span class="garden garden-right" />
            </div>
            <p class="eyebrow">Make a wish, {{ c.recipient }}</p>
            <h3 class="scene-title">
              Pop the balloons
              <svg class="title-heart" aria-hidden="true"><use href="#sl-heart" /></svg>
            </h3>
            <p class="scene-sub">Each balloon hides a birthday wish.</p>
            <div class="wish-card" aria-live="polite">
              <img v-if="smallBowArt" class="card-bow art" :src="smallBowArt" alt="" aria-hidden="true" />
              <svg v-else class="card-bow" aria-hidden="true"><use href="#sl-bow" /></svg>
              <svg class="card-flower" aria-hidden="true"><use href="#sl-flower" /></svg>
              <Transition name="pop-in" mode="out-in">
                <div :key="popped.length">
                  <template v-if="popped.length">
                    <span>Wish {{ popped.length }} of {{ wishes.length }}</span>
                    <p>{{ wishes[popped.length - 1] }}</p>
                  </template>
                  <p v-else>Tap a balloon to begin 🎈</p>
                </div>
              </Transition>
            </div>
            <div class="balloon-field">
              <button
                v-for="(wish, index) in wishes"
                :key="index"
                class="balloon"
                :class="{ popped: popped.includes(index) }"
                type="button"
                :disabled="popped.includes(index)"
                :aria-label="`Pop balloon ${index + 1}`"
                :style="balloonStyle(index)"
                @click="popBalloon(index, $event)"
              >
                <svg viewBox="0 0 70 140" aria-hidden="true">
                  <path d="M35 80c-7 12 7 20 0 32s6 14 0 26" fill="none" stroke="#e8809c" stroke-width="1.6" />
                  <ellipse cx="35" cy="37" rx="30" ry="34" fill="currentColor" />
                  <ellipse cx="35" cy="37" rx="30" ry="34" fill="url(#sl-shine)" />
                  <path d="M30 70h10l-5 7Z" fill="currentColor" />
                  <use href="#sl-bow" x="23" y="68" width="24" height="18" />
                  <g transform="rotate(12 44 104)">
                    <rect x="37" y="96" width="15" height="18" rx="2.5" fill="#fff" stroke="#f0b8c6" />
                    <use href="#sl-heart" x="40" y="100" width="9" height="9" fill="#f07a98" />
                  </g>
                </svg>
              </button>
            </div>
            <button
              v-if="popped.length === wishes.length"
              class="primary-button floating-cta"
              type="button"
              @click="goTo('polaroid')"
            >
              Next surprise <span aria-hidden="true">→</span>
            </button>
          </section>

          <!-- 3. POLAROID DEVELOP -->
          <section v-else-if="scene === 'polaroid'" key="polaroid" class="scene scene-light">
            <p class="eyebrow">Photo {{ photoIndex + 1 }} of {{ photos.length }}</p>
            <h3 class="scene-title">
              A memory is developing
              <svg class="title-heart" aria-hidden="true"><use href="#sl-heart" /></svg>
            </h3>
            <p class="scene-sub">Tap or rub the polaroid to reveal it.</p>
            <div class="divider" aria-hidden="true"><svg><use href="#sl-heart" /></svg></div>
            <div class="polaroid-stage">
              <template v-if="sprayArt">
                <img class="spray spray-top" :src="sprayArt.left" alt="" aria-hidden="true" />
                <img class="spray spray-bottom" :src="sprayArt.right" alt="" aria-hidden="true" />
              </template>
              <svg v-else class="polaroid-ribbon" viewBox="0 0 300 300" aria-hidden="true">
                <path
                  d="M30 150c-30 60 10 110 70 116 60 6 110-20 160-10s30-60 0-70"
                  fill="none"
                  stroke="#f4a7b9"
                  stroke-width="9"
                  stroke-linecap="round"
                  opacity="0.75"
                />
                <use href="#sl-flower" x="0" y="60" width="40" height="40" />
                <use href="#sl-flower" x="252" y="212" width="46" height="46" />
                <use href="#sl-flower" x="236" y="240" width="26" height="26" />
                <use href="#sl-heart" x="8" y="20" width="18" height="18" fill="#f78fa9" />
                <use href="#sl-heart" x="268" y="70" width="20" height="20" fill="#f78fa9" />
                <use href="#sl-heart" x="12" y="236" width="12" height="12" fill="#f9b3c5" />
                <use href="#sl-sparkle" x="270" y="20" width="14" height="14" fill="#f6c4d0" />
              </svg>
              <div
                :key="photoIndex"
                class="polaroid"
                :class="{ developed }"
                role="button"
                tabindex="0"
                aria-label="Develop the photo"
                @pointerdown="onPolaroidDown"
                @pointermove="onPolaroidMove"
                @pointerup="onPolaroidUp"
                @pointercancel="onPolaroidUp"
                @keydown.enter.prevent="addDevelop(14)"
                @keydown.space.prevent="addDevelop(14)"
              >
                <div class="polaroid-photo">
                  <img :src="currentPhoto.src" :alt="currentPhoto.caption" :style="photoFilter" draggable="false" />
                  <span class="polaroid-fog" :style="{ opacity: 1 - develop / 100 }" />
                </div>
                <p class="polaroid-caption">{{ developed ? currentPhoto.caption : "" }}</p>
              </div>
            </div>
            <div v-if="!developed" class="develop-bar" aria-hidden="true">
              <span :style="{ width: develop + '%' }" />
            </div>
            <button v-else class="primary-button" type="button" @click="nextPhoto">
              {{ photoIndex < photos.length - 1 ? "Next photo" : "Next surprise" }}
              <span aria-hidden="true">→</span>
            </button>
          </section>

          <!-- 4. GACHA LOVE COUPONS -->
          <section v-else-if="scene === 'gacha'" key="gacha" class="scene scene-light">
            <p class="eyebrow">♥ Love coupons for {{ c.recipient }} ♥</p>
            <h3 class="scene-title">
              Spin the gacha
              <svg class="title-heart" aria-hidden="true"><use href="#sl-heart" /></svg>
            </h3>
            <p class="scene-sub" aria-live="polite">{{ gachaHint }}</p>
            <div class="gacha">
              <svg class="gacha-bow" aria-hidden="true"><use href="#sl-bow" /></svg>
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
              <svg class="gacha-flowers left" aria-hidden="true"><use href="#sl-flower" /></svg>
              <svg class="gacha-flowers right" aria-hidden="true"><use href="#sl-flower" /></svg>
            </div>
            <Transition name="pop-in">
              <div v-if="gachaState === 'open'" :key="spin" class="coupon-wrap">
                <img v-if="smallBowArt" class="card-bow art" :src="smallBowArt" alt="" aria-hidden="true" />
                <svg v-else class="card-bow" aria-hidden="true"><use href="#sl-bow" /></svg>
                <div class="coupon">
                  <span class="coupon-tag">♥ Love coupon {{ spin }} of {{ coupons.length }} ♥</span>
                  <p>{{ coupons[spin - 1] }}</p>
                  <span v-if="redeemed.includes(spin - 1)" class="stamp">Redeemed ♥</span>
                  <button v-else class="coupon-redeem" type="button" @click="redeem">Redeem</button>
                </div>
              </div>
            </Transition>
            <button v-if="gachaDone" class="primary-button" type="button" @click="goTo('finale')">
              Next surprise <span aria-hidden="true">→</span>
            </button>
          </section>

          <!-- 5. FIREWORKS FINALE -->
          <section
            v-else
            key="finale"
            class="scene scene-finale"
            :style="art['bg-finale'] ? { backgroundImage: `url(${art['bg-finale']})` } : null"
            tabindex="0"
            aria-label="Tap the sky to light fireworks"
            @pointerdown="tapSky"
            @keydown.enter.self.prevent="tapSky"
          >
            <template v-if="!art['bg-finale']">
              <span class="stars" aria-hidden="true" />
              <span class="moon" aria-hidden="true" />
              <span class="night-clouds" aria-hidden="true" />
            </template>
            <p v-if="!revealed" class="sky-hint">
              Tap the sky to light fireworks ✨
              <span>{{ skyTaps }} / 3</span>
            </p>
            <Transition name="reveal">
              <div v-if="revealed" class="finale-card" @pointerdown.stop>
                <div class="finale-medallion">
                  <svg class="medallion-flower left" aria-hidden="true"><use href="#sl-flower" /></svg>
                  <svg class="medallion-flower right" aria-hidden="true"><use href="#sl-flower" /></svg>
                  <img :src="photos[0].src" :alt="photos[0].caption" />
                  <svg class="medallion-bow" aria-hidden="true"><use href="#sl-bow" /></svg>
                </div>
                <h3>Happy Birthday, {{ c.recipient }}!</h3>
                <p>{{ c.message }}</p>
                <p class="finale-from">— {{ c.sender }} ♡</p>
                <Transition name="pop-in">
                  <p v-if="showExtra" class="finale-extra">{{ c.extraMessage }}</p>
                </Transition>
                <div class="finale-actions">
                  <button v-if="!showExtra" class="primary-button" type="button" @click="showExtra = true">
                    <svg class="btn-flower left" aria-hidden="true"><use href="#sl-flower" /></svg>
                    One more sweet ✨
                    <svg class="btn-flower right" aria-hidden="true"><use href="#sl-flower" /></svg>
                  </button>
                  <button class="replay-button" type="button" @click="goTo('cover')">↻ Replay</button>
                </div>
              </div>
            </Transition>
          </section>
        </Transition>

        <!-- FX: confetti at fireworks (CSS lang, walang library) -->
        <div class="fx-layer" aria-hidden="true">
          <div
            v-for="burst in bursts"
            :key="burst.id"
            class="burst"
            :class="burst.kind"
            :style="{ left: burst.x + 'px', top: burst.y + 'px', '--glow': burst.glow }"
          >
            <i v-for="(part, index) in burst.parts" :key="index" :style="part" />
            <svg v-if="burst.kind === 'firework'" class="burst-heart"><use href="#sl-heart" /></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import softCelebrationFull from "@/assets/templates/birthday/birthday-soft-celebration-full.webp";
import birthdayCake from "@/assets/occasions/birthday-cake.webp";

/* OPTIONAL na painted illustrations: i-drop lang sa src/assets/surprise/ at kusa itong gagamitin.
   bg-balloons.webp = background ng Balloon Pop (portrait, ~9:19)
   bg-finale.webp   = langit ng Fireworks Finale (portrait, ~9:19)
   padlock.webp     = padlock na transparent ang background
   soft-garland-top = isang piraso na garland sa itaas ng bawat eksena (ito ang inuuna)
   soft-garland-bow / soft-corner-left / -right = lumang 3-piraso na garland (pamalit lang)
   soft-bow-small   = bow sa ibabaw ng wish card at coupon
   soft-spray-left / -right = bulaklak + ribbon sa paligid ng polaroid
   soft-cover-art   = larawan sa Cover (walang text)
   Habang wala pa, CSS/SVG ang pamalit. */
const artFiles = import.meta.glob("@/assets/surprise/*.webp", { eager: true, import: "default" });
const art = Object.fromEntries(
  Object.entries(artFiles).map(([path, url]) => [path.split("/").pop().replace(".webp", ""), url]),
);
const garlandArt =
  art["soft-garland-bow"] && art["soft-corner-left"] && art["soft-corner-right"]
    ? {
        bow: art["soft-garland-bow"],
        left: art["soft-corner-left"],
        right: art["soft-corner-right"],
      }
    : null;
const smallBowArt = art["soft-bow-small"];
const sprayArt =
  art["soft-spray-left"] && art["soft-spray-right"]
    ? { left: art["soft-spray-left"], right: art["soft-spray-right"] }
    : null;

/* SAMPLE na laman. Papalitan ito ng sagot ng customer sa form:
   recipient/sender, code + hint, 5 wishes, 1–3 photos (may caption), 3 coupons, message */
const sampleContent = {
  recipient: "Maria",
  sender: "Juan",
  code: "0214",
  hint: "the date of our first date 💌",
  wishes: [
    "May all your dreams come true this year.",
    "More laughter than ever, every single day.",
    "Good health, peace and endless joy.",
    "New adventures with the people you love.",
    "Cake that never runs out 🍰",
  ],
  photos: [
    { src: birthdayCake, caption: "Your best smile, always." },
    { src: softCelebrationFull, caption: "Here's to another beautiful year." },
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
const coverImage = art["soft-cover-art"] ?? softCelebrationFull;

const scenes = [
  { id: "lock", label: "Secret Lock" },
  { id: "balloons", label: "Balloon Pop Wishes" },
  { id: "polaroid", label: "Polaroid Develop" },
  { id: "gacha", label: "Gacha Love Coupons" },
  { id: "finale", label: "Fireworks Finale" },
];
const scene = ref("cover");
const sceneIndex = computed(() => scenes.findIndex((step) => step.id === scene.value));
const overlayEl = ref(null);
const phoneEl = ref(null);

/* ===== Timers: lahat ng setTimeout ay naka-track para malinis kapag lumipat/nagsara ===== */
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

/* ===== 1. Secret Lock ===== */
const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "ok"];
const entered = ref("");
const lockShake = ref(false);
const unlocked = ref(false);

function pressKey(key) {
  if (unlocked.value || lockShake.value) return;
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
    later(() => goTo("balloons"), 1100);
  } else {
    lockShake.value = true;
    later(() => {
      lockShake.value = false;
      entered.value = "";
    }, 550);
  }
}

/* ===== 2. Balloon Pop Wishes ===== */
const balloonColors = ["#f98fab", "#e8607f", "#f5a8cf", "#f7a3b8", "#ffc19a"];
const balloonSpots = [
  { x: 6, b: 44, d: 0 },
  { x: 38, b: 56, d: 0.6 },
  { x: 70, b: 46, d: 1.2 },
  { x: 20, b: 4, d: 0.3 },
  { x: 56, b: 10, d: 0.9 },
];
const popped = ref([]);

function balloonStyle(index) {
  const spot = balloonSpots[index % balloonSpots.length];
  return {
    color: balloonColors[index % balloonColors.length],
    left: `${spot.x}%`,
    bottom: `${spot.b}%`,
    animationDelay: `${spot.d}s`,
  };
}

function popBalloon(index, event) {
  if (popped.value.includes(index)) return;
  popped.value = [...popped.value, index];
  spawnBurst(pointFrom(event), "confetti");
}

/* ===== 3. Polaroid Develop ===== */
const photoIndex = ref(0);
const develop = ref(0);
const developed = computed(() => develop.value >= 100);
const currentPhoto = computed(() => photos.value[photoIndex.value]);
const photoFilter = computed(() => {
  const left = 1 - develop.value / 100;
  return { filter: `grayscale(${left}) blur(${left * 6}px) brightness(${1 + left * 0.5})` };
});
let rubbing = false;
let lastPoint = null;

function addDevelop(amount) {
  develop.value = Math.min(100, develop.value + amount);
}
function onPolaroidDown(event) {
  rubbing = true;
  lastPoint = { x: event.clientX, y: event.clientY };
  event.currentTarget.setPointerCapture?.(event.pointerId);
  addDevelop(8);
}
function onPolaroidMove(event) {
  if (!rubbing) return;
  const distance = Math.hypot(event.clientX - lastPoint.x, event.clientY - lastPoint.y);
  lastPoint = { x: event.clientX, y: event.clientY };
  addDevelop(distance * 0.12);
}
function onPolaroidUp() {
  rubbing = false;
}
function nextPhoto() {
  if (photoIndex.value < photos.value.length - 1) {
    photoIndex.value += 1;
    develop.value = 0;
  } else {
    goTo("gacha");
  }
}

/* ===== 4. Gacha Love Coupons (3 ikot) ===== */
const capsuleColors = ["#f98fab", "#9cc0f5", "#ffd166"];
const spin = ref(0); // ilang capsule na ang nabuksan
const gachaState = ref("idle"); // idle → turning → dropped → open
const redeemed = ref([]);
const spinsLeft = computed(() => coupons.value.length - spin.value);
const canTurn = computed(
  () => spinsLeft.value > 0 && (gachaState.value === "idle" || gachaState.value === "open"),
);
const gachaDone = computed(() => spinsLeft.value === 0 && gachaState.value === "open");
const gachaHint = computed(() => {
  if (gachaState.value === "turning") return "Rolling...";
  if (gachaState.value === "dropped") return "Tap the capsule to open it!";
  if (gachaDone.value) return "All coupons collected! 💝";
  return `Turn the knob · ${spinsLeft.value} ${spinsLeft.value === 1 ? "spin" : "spins"} left`;
});

function turnKnob() {
  if (!canTurn.value) return;
  gachaState.value = "turning";
  later(() => {
    gachaState.value = "dropped";
  }, 900);
}
function openCapsule(event) {
  if (gachaState.value !== "dropped") return;
  spin.value += 1;
  gachaState.value = "open";
  spawnBurst(pointFrom(event), "confetti");
}
function redeem() {
  redeemed.value = [...redeemed.value, spin.value - 1];
}

/* ===== 5. Fireworks Finale ===== */
const skyTaps = ref(0);
const revealed = ref(false);
const showExtra = ref(false);

function tapSky(event) {
  spawnBurst(pointFrom(event), "firework");
  if (revealed.value || skyTaps.value >= 3) return;
  skyTaps.value += 1;
  if (skyTaps.value === 3) {
    later(() => {
      revealed.value = true;
      fireworksInterval = setInterval(randomFirework, 1600);
    }, 700);
  }
}
function randomFirework() {
  const phone = phoneEl.value;
  if (!phone) return;
  spawnBurst(
    { x: phone.clientWidth * (0.15 + Math.random() * 0.7), y: phone.clientHeight * (0.08 + Math.random() * 0.14) },
    "firework",
  );
}

/* ===== FX: confetti / fireworks particles ===== */
const bursts = ref([]);
let burstId = 0;
const confettiColors = ["#ff8fab", "#ffc8dd", "#e8597a", "#ffd166", "#a0c4ff", "#cdb4db"];
const fireworkPalettes = [
  ["#ff9fbc", "#ffd1de", "#ffe3a3"],
  ["#ffd166", "#fff1c1", "#ff9fbc"],
  ["#f7a8d8", "#ffe0ef", "#ffffff"],
];

// posisyon ng pointer/button relative sa loob ng phone
function pointFrom(event) {
  const phone = phoneEl.value;
  const rect = phone.getBoundingClientRect();
  const offsetX = rect.left + phone.clientLeft;
  const offsetY = rect.top + phone.clientTop;
  if (event?.clientX || event?.clientY) {
    return { x: event.clientX - offsetX, y: event.clientY - offsetY };
  }
  const target = event?.currentTarget?.getBoundingClientRect?.();
  if (target) {
    return { x: target.left + target.width / 2 - offsetX, y: target.top + target.height / 2 - offsetY };
  }
  return { x: phone.clientWidth / 2, y: phone.clientHeight / 3 };
}

function spawnBurst({ x, y }, kind) {
  const firework = kind === "firework";
  const colors = firework
    ? fireworkPalettes[Math.floor(Math.random() * fireworkPalettes.length)]
    : confettiColors;
  const count = firework ? 36 : 22;
  const parts = Array.from({ length: count }, (_, index) => {
    if (firework) {
      // mahabang guhit na sumasabog palabas (parang totoong fireworks)
      return {
        "--a": `${(index / count) * 360 + Math.random() * 6}deg`,
        "--d": `${-(62 + Math.random() * 38)}px`,
        "--c": colors[index % colors.length],
        "--t": `${1100 + Math.random() * 300}ms`,
      };
    }
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 70;
    return {
      "--dx": `${Math.cos(angle) * distance}px`,
      "--dy": `${Math.sin(angle) * distance + 50}px`,
      "--c": colors[index % colors.length],
      "--s": `${5 + Math.random() * 4}px`,
      "--r": `${Math.random() * 540}deg`,
      "--t": `${850 + Math.random() * 350}ms`,
    };
  });
  const id = ++burstId;
  bursts.value = [...bursts.value, { id, x, y, kind, parts, glow: colors[0] }];
  later(() => {
    bursts.value = bursts.value.filter((burst) => burst.id !== id);
  }, 1500);
}

/* ===== Lipat ng eksena: laging fresh ang bawat eksena (para gumana ang Replay at step list) ===== */
function goTo(id) {
  clearTimers();
  bursts.value = [];
  entered.value = "";
  lockShake.value = false;
  unlocked.value = false;
  popped.value = [];
  photoIndex.value = 0;
  develop.value = 0;
  rubbing = false;
  spin.value = 0;
  gachaState.value = "idle";
  redeemed.value = [];
  skyTaps.value = 0;
  revealed.value = false;
  showExtra.value = false;
  scene.value = id;
}

/* Esc = isara; sa Secret Lock, gumagana rin ang number keys ng keyboard */
function onKeydown(event) {
  if (event.key === "Escape") {
    emit("close");
  } else if (scene.value === "lock") {
    if (/^[0-9]$/.test(event.key)) pressKey(event.key);
    else if (event.key === "Backspace") pressKey("back");
    else if (event.key === "Enter" && event.target === overlayEl.value) pressKey("ok");
  }
}

let previousOverflow = "";
onMounted(() => {
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", onKeydown);
  overlayEl.value?.focus();
});
onUnmounted(() => {
  clearTimers();
  document.body.style.overflow = previousOverflow;
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap");

.surprise-overlay {
  --navy: var(--sl-navy, #192448);
  --display: var(--sl-font-display, "Fredoka", sans-serif);
  --stretch: var(--sl-display-stretch, 86%);
  --serif: "Fraunces", Georgia, "Times New Roman", serif;
  --script: "Caveat", "Segoe Script", cursive;
  --rose: #e8597a;
  --rose-deep: #c9405f;
  --pink-line: #f3c6d2;
  --cream: #fdf6f3;
  --gold: #e2c07a;
  --muted: #5f6680;
  position: fixed;
  z-index: 20;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background:
    radial-gradient(circle at 12% 18%, #ffd3df 0, transparent 38%),
    radial-gradient(circle at 88% 82%, #ffe0cc 0, transparent 40%),
    linear-gradient(160deg, #fff3f6, #ffe6ee 55%, #fff1ea);
  color: var(--navy);
  font-family: var(--sl-font-body, "Nunito", sans-serif);
  outline: none;
}

/* ===== Top bar ===== */
.surprise-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px clamp(16px, 4vw, 40px);
  border-bottom: 1px solid #f6d3dd;
  background: rgb(255 250 247 / 0.85);
  backdrop-filter: blur(8px);
}
.topbar-title {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.topbar-title strong {
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: 19px;
}
.topbar-title span {
  color: var(--muted);
  font-size: 13px;
}
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.use-button {
  border: 0;
  border-radius: 999px;
  padding: 10px 20px;
  background: var(--rose);
  color: #fff;
  font-family: var(--display);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 16px rgb(232 89 122 / 0.3);
  transition: background 0.2s, transform 0.2s;
}
.use-button:hover {
  background: var(--rose-deep);
  transform: translateY(-1px);
}
.close-button {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid #f0cbd6;
  border-radius: 50%;
  background: #fff;
  color: var(--navy);
  cursor: pointer;
}
.close-button svg {
  width: 20px;
  height: 20px;
}

/* ===== Stage: info sa kaliwa + phone sa kanan ===== */
.surprise-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(32px, 6vw, 96px);
  padding: 20px 16px;
}
.flow-info {
  max-width: 420px;
}
.flow-info h2 {
  margin: 0 0 8px;
  font-family: var(--display);
  font-stretch: var(--stretch);
  font-size: clamp(30px, 3vw, 42px);
  line-height: 1.05;
}
.flow-info h2 span {
  color: var(--rose);
}
.flow-info > p {
  margin: 0 0 18px;
  color: var(--muted);
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
  color: var(--muted);
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.flow-steps button.active {
  color: var(--navy);
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
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}
.flow-note strong {
  color: var(--navy);
}

/* ===== Phone + manipis na pink frame sa loob ===== */
.phone {
  position: relative;
  flex: none;
  width: min(390px, 100%);
  height: min(780px, calc(100dvh - 110px));
  min-height: 620px;
  overflow: hidden;
  border: 12px solid var(--navy);
  border-radius: 48px;
  background: var(--cream);
  box-shadow: 0 30px 60px rgb(25 36 72 / 0.22);
}
.phone::after {
  content: "";
  position: absolute;
  z-index: 4;
  inset: 8px;
  border: 1.5px solid var(--pink-line);
  border-radius: 32px;
  pointer-events: none;
  transition: border-color 0.4s;
}
.phone.is-dark::after {
  border-color: rgb(255 255 255 / 0.16);
}
.svg-defs {
  position: absolute;
}
.progress {
  position: absolute;
  z-index: 6;
  top: 18px;
  left: 50%;
  display: flex;
  gap: 6px;
  transform: translateX(-50%);
}
.progress span {
  width: 30px;
  height: 5px;
  border-radius: 999px;
  background: #f1dde3;
  transition: background 0.3s;
}
.progress span.on {
  background: var(--rose);
}
.phone.is-dark .progress span {
  background: rgb(255 255 255 / 0.25);
}
.phone.is-dark .progress span.on {
  background: #ffc8dd;
}

/* ===== Eksena (common) ===== */
.scene {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 116px 22px 26px;
  overflow-x: hidden;
  overflow-y: auto;
  text-align: center;
}
.scene > * {
  position: relative;
  flex-shrink: 0;
}
/* flat na cream (gaya ng reference), konting liwanag lang sa gitna */
.scene-light {
  background: radial-gradient(circle at 50% 45%, #fffbf8 0, transparent 70%), var(--cream);
}
.garland {
  position: absolute;
  z-index: 3;
  top: 26px;
  left: 14px;
  width: calc(100% - 28px);
  height: 86px;
  pointer-events: none;
}
/* image garland (transparent webp): bow sa gitna, bulaklak sa dalawang kanto */
div.garland {
  top: 26px;
  left: 10px;
  width: calc(100% - 20px);
  height: 124px;
}
/* isang piraso na garland (soft-garland-top.webp): bow + bulaklak, buong lapad */
.garland.garland-full {
  top: 20px;
  left: 10px;
  width: calc(100% - 20px);
  height: auto;
}
/* mas maliit na bow: ang dulo ng tails ay tumatapat sa ribbon na lumalabas sa bulaklak sa kanto */
.garland-bow {
  position: absolute;
  top: 0;
  left: 50%;
  width: 62%;
  transform: translateX(-50%);
}
.garland-corner {
  position: absolute;
  top: 14px;
  width: 92px;
}
.garland-corner.left {
  left: -4px;
}
.garland-corner.right {
  right: -4px;
}
.eyebrow {
  margin: 0;
  color: var(--rose);
  font-family: var(--display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.scene-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
  color: var(--navy);
  font-family: var(--serif);
  font-size: 29px;
  font-weight: 700;
  letter-spacing: -0.4px;
  line-height: 1.12;
}
.title-heart,
.title-sparkle {
  flex: none;
  width: 22px;
  height: 22px;
}
.title-heart {
  fill: none;
  stroke: var(--rose);
  stroke-width: 1.6;
  transform: rotate(14deg) translateY(-8px);
}
.title-sparkle {
  width: 14px;
  height: 14px;
  fill: #f6a9bb;
}
.scene-sub {
  margin: 0;
  color: var(--muted);
  font-family: var(--serif);
  font-size: 15px;
}
.divider {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 150px;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #f2b3c3);
}
.divider::after {
  background: linear-gradient(90deg, #f2b3c3, transparent);
}
.divider svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: #ee8aa4;
  stroke-width: 2;
}
.script-line {
  margin: 0;
  color: var(--rose);
  font-family: var(--script);
  font-size: 26px;
}

/* pill button na may inner ring (gaya ng reference) */
.primary-button {
  margin-top: auto;
  border: 0;
  border-radius: 999px;
  padding: 14px 34px;
  background: linear-gradient(180deg, #f07c99, #d9506f);
  color: #fff;
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  box-shadow:
    inset 0 0 0 2px #d9506f,
    inset 0 0 0 3.5px rgb(255 255 255 / 0.55),
    0 10px 22px rgb(217 80 111 / 0.32);
  transition: transform 0.2s, filter 0.2s;
}
.primary-button:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

/* ===== Cover ===== */
.scene-cover {
  gap: 14px;
  padding-top: 126px;
}
.scene-cover .scene-title {
  font-size: 31px;
}
.cover-art {
  width: 100%;
  margin-top: 4px;
  border-radius: 20px;
  box-shadow: 0 16px 30px rgb(232 89 122 / 0.2);
  animation: float 5s ease-in-out infinite;
}
.scene-cover .primary-button {
  min-width: 72%;
  margin-top: 12px;
  padding: 15px 34px;
  font-size: 19px;
}

/* ===== 1. Secret Lock ===== */
.padlock-wrap {
  width: 132px;
}
.padlock,
.padlock-art {
  display: block;
  width: 100%;
  overflow: visible;
}
.padlock-wrap.shake {
  animation: shake 0.45s;
}
.padlock-wrap.open {
  animation: unlock 0.8s ease forwards;
}
.shackle {
  transition: transform 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.padlock-wrap.open .shackle {
  transform: translateY(-14px);
}
.hint {
  margin: 0;
  color: var(--rose);
  font-family: var(--script);
  font-size: 24px;
  line-height: 1.1;
}
.code-dots {
  display: flex;
  gap: 14px;
}
.code-dots span {
  width: 15px;
  height: 15px;
  border: 2px solid var(--navy);
  border-radius: 50%;
  transition: background 0.15s, transform 0.15s;
}
.code-dots span.filled {
  border-color: var(--rose);
  background: var(--rose);
  transform: scale(1.1);
}
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 66px);
  gap: 10px;
  margin-top: 4px;
}
.keypad button {
  display: grid;
  place-items: center;
  height: 48px;
  border: 1px solid #f3d2da;
  border-radius: 16px;
  background: linear-gradient(180deg, #fff, #fff7f8);
  box-shadow: 0 4px 10px rgb(232 89 122 / 0.1), 0 2px 0 #f6dfe5;
  color: var(--navy);
  font-family: var(--display);
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}
.keypad button svg {
  width: 24px;
  height: 24px;
}
.keypad button:active {
  transform: translateY(2px);
  box-shadow: 0 1px 4px rgb(232 89 122 / 0.1);
}
.demo-code {
  margin: 0;
  color: var(--muted);
  font-family: var(--serif);
  font-size: 12px;
}

/* ===== 2. Balloons: langit + hardin ===== */
.scene-balloons {
  background:
    linear-gradient(180deg, var(--cream) 0%, #fbe9ee 22%, #f6d6e3 45%, #f3cde0 62%, #ffd9c4 82%, #ffe6cf 100%);
  background-position: center;
  background-size: cover;
}
.scene-balloons::before {
  /* cream na fade sa itaas para mabasa ang title kahit may background image */
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 46%;
  background: linear-gradient(180deg, var(--cream) 45%, rgb(253 246 243 / 0));
  pointer-events: none;
}
.sky-fallback {
  position: absolute !important;
  inset: 0;
  pointer-events: none;
}
.cloud {
  position: absolute;
  height: 60px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.55);
  filter: blur(6px);
}
.cloud-1 {
  top: 50%;
  left: -30px;
  width: 200px;
}
.cloud-2 {
  top: 60%;
  right: -40px;
  width: 220px;
}
.garden {
  position: absolute;
  bottom: -20px;
  width: 60%;
  height: 30%;
  background:
    radial-gradient(circle at 20% 40%, #f7a6bd 0 9%, transparent 10%),
    radial-gradient(circle at 45% 30%, #fbc3d2 0 8%, transparent 9%),
    radial-gradient(circle at 70% 55%, #f592ad 0 9%, transparent 10%),
    radial-gradient(circle at 35% 70%, #fff 0 6%, transparent 7%),
    radial-gradient(ellipse at 50% 100%, #a9c193 0 55%, transparent 56%);
}
.garden-left {
  left: -14%;
}
.garden-right {
  right: -14%;
  transform: scaleX(-1);
}
.wish-card {
  width: 100%;
  min-height: 98px;
  margin-top: 16px;
  padding: 22px 18px 14px;
  border-radius: 18px;
  background: rgb(255 250 248 / 0.94);
  box-shadow: 0 12px 26px rgb(232 89 122 / 0.16);
}
.wish-card::after {
  content: "";
  position: absolute;
  inset: 6px;
  border: 1.5px dashed #f2b8c6;
  border-radius: 13px;
  pointer-events: none;
}
.card-bow {
  position: absolute;
  top: -20px;
  left: 50%;
  width: 66px;
  height: 48px;
  transform: translateX(-50%);
}
.card-bow.art {
  top: -30px;
  width: 150px;
  height: auto;
}
.card-flower {
  position: absolute;
  top: -8px;
  right: -6px;
  width: 30px;
  height: 30px;
}
.wish-card span {
  color: var(--rose);
  font-family: var(--display);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.wish-card p {
  margin: 4px 0 0;
  color: var(--navy);
  font-family: var(--script);
  font-size: 27px;
  line-height: 1.05;
}
.balloon-field {
  flex: 1 0 280px;
  width: 100%;
}
.balloon {
  position: absolute;
  width: 26%;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  filter: drop-shadow(0 8px 10px rgb(232 89 122 / 0.2));
  animation: bob 3.2s ease-in-out infinite;
  transition: transform 0.25s, opacity 0.25s;
}
.balloon svg {
  display: block;
  width: 100%;
  overflow: visible;
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

/* ===== 3. Polaroid ===== */
.polaroid-stage {
  display: grid;
  place-items: center;
  width: 300px;
  height: 330px;
}
/* bulaklak + ribbon (webp) sa likod ng polaroid */
.spray {
  position: absolute;
  pointer-events: none;
}
.spray-top {
  top: 4px;
  left: -48px;
  width: 190px;
}
.spray-bottom {
  right: -52px;
  bottom: -8px;
  width: 200px;
}
.polaroid-ribbon {
  position: absolute;
  inset: 10px 0 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.polaroid {
  position: relative;
  width: 232px;
  padding: 12px 12px 0;
  border: 1px solid #f2e6dd;
  background: #fffdf9;
  box-shadow: 0 16px 32px rgb(25 36 72 / 0.16);
  transform: rotate(-4deg);
  cursor: grab;
  touch-action: none;
  user-select: none;
  transition: transform 0.4s;
}
.polaroid::before {
  /* washi tape */
  content: "";
  position: absolute;
  z-index: 1;
  top: -12px;
  left: 50%;
  width: 84px;
  height: 24px;
  background: repeating-linear-gradient(45deg, rgb(247 172 194 / 0.8) 0 6px, rgb(252 206 219 / 0.8) 6px 12px);
  transform: translateX(-50%) rotate(-3deg);
}
.polaroid.developed {
  transform: rotate(-2deg) scale(1.02);
}
.polaroid-photo {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #eee;
}
.polaroid-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.polaroid-fog {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f6f1ea, #e9e4dc);
}
.polaroid-caption {
  min-height: 54px;
  margin: 0;
  padding: 8px 4px;
  color: var(--navy);
  font-family: var(--script);
  font-size: 25px;
  line-height: 1.05;
  animation: fade-in 0.6s;
}
.develop-bar {
  width: 200px;
  height: 6px;
  margin-top: auto;
  overflow: hidden;
  border-radius: 999px;
  background: #f1dde3;
}
.develop-bar span {
  display: block;
  height: 100%;
  background: var(--rose);
  transition: width 0.15s;
}

/* ===== 4. Gacha (CSS lang) ===== */
.gacha {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 220px;
  margin-top: 18px;
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
  border: 2px solid #f2bccb;
  border-radius: 50% 50% 44% 44% / 56% 56% 44% 44%;
  background: radial-gradient(circle at 50% 40%, rgb(255 255 255 / 0.7), rgb(252 225 233 / 0.65) 70%, rgb(244 190 205 / 0.7));
}
.gacha-dome::after {
  /* kinang ng salamin */
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
.gacha-dome.shaking {
  animation: shake 0.3s 3;
}
.mini-capsule {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 26%, rgb(255 255 255 / 0.85) 0 12%, transparent 13%),
    linear-gradient(180deg, var(--cap-top) 50%, #fff 50%);
  box-shadow: inset 0 0 0 1.5px rgb(25 36 72 / 0.08), 0 2px 4px rgb(0 0 0 / 0.08);
}
.cap-1 { --cap-top: #f98fab; left: 6px; bottom: 8px; transform: rotate(-20deg); }
.cap-2 { --cap-top: #9cc0f5; left: 46px; bottom: 2px; transform: rotate(30deg); }
.cap-3 { --cap-top: #ffd166; left: 88px; bottom: 4px; transform: rotate(-14deg); }
.cap-4 { --cap-top: #cdb4f0; left: 126px; bottom: 10px; transform: rotate(18deg); }
.cap-5 { --cap-top: #f7b6cc; left: 24px; bottom: 46px; transform: rotate(60deg); }
.cap-6 { --cap-top: #e8607f; left: 66px; bottom: 42px; }
.cap-7 { --cap-top: #a8e0c4; left: 106px; bottom: 48px; transform: rotate(-50deg); }
.gacha-body {
  position: relative;
  width: 210px;
  height: 104px;
  margin-top: -8px;
  border: 2px solid #e2728e;
  border-radius: 20px 20px 14px 14px;
  background: linear-gradient(180deg, #fbaabd, #ee7f9a);
  box-shadow: inset 0 -8px 0 rgb(0 0 0 / 0.06), 0 12px 20px rgb(232 89 122 / 0.22);
}
.gacha-body::before {
  /* rim sa ilalim ng dome */
  content: "";
  position: absolute;
  top: -4px;
  left: 10px;
  right: 10px;
  height: 10px;
  border-radius: 6px;
  background: linear-gradient(180deg, #ffe3c8, #e8b98f);
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
  border: 4px solid #f9d6de;
  border-radius: 50%;
  background:
    linear-gradient(90deg, transparent 47%, #f0c9d1 47% 53%, transparent 53%),
    linear-gradient(0deg, transparent 47%, #f0c9d1 47% 53%, transparent 53%),
    radial-gradient(circle, #fffaf5, #f8e6e0);
  box-shadow: 0 0 0 2px #d96583, 0 4px 8px rgb(0 0 0 / 0.15);
  cursor: pointer;
  transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1);
}
.gacha-knob svg {
  width: 24px;
  height: 24px;
  fill: #e8597a;
}
.gacha-knob.ready {
  animation: pulse 1.4s ease-in-out infinite;
}
.gacha-knob.turning {
  transform: rotate(360deg);
  animation: none;
}
.gacha-knob:disabled {
  cursor: default;
}
.gacha-chute {
  position: absolute;
  bottom: 10px;
  left: 18px;
  width: 72px;
  height: 50px;
  border: 3px solid #f9c6d2;
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
.gacha-flowers {
  position: absolute;
  bottom: -6px;
  width: 44px;
  height: 44px;
}
.gacha-flowers.left {
  left: -26px;
}
.gacha-flowers.right {
  right: -26px;
}
/* ticket coupon na may bingaw sa gilid */
.coupon-wrap {
  width: 100%;
  margin-top: 20px;
  filter: drop-shadow(0 10px 18px rgb(232 89 122 / 0.16));
}
.coupon-wrap .card-bow {
  z-index: 1;
  top: -22px;
}
.coupon-wrap .card-bow.art {
  top: -30px;
}
.coupon {
  position: relative;
  padding: 22px 18px 16px;
  border-radius: 16px;
  background: #fff6f8;
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
  border-radius: 10px;
  pointer-events: none;
}
.coupon-tag {
  color: var(--rose);
  font-family: var(--display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.coupon p {
  margin: 4px 0 10px;
  color: var(--navy);
  font-family: var(--serif);
  font-size: 25px;
  font-weight: 700;
}
.coupon-redeem {
  position: relative;
  z-index: 1;
  border: 0;
  border-radius: 999px;
  padding: 9px 30px;
  background: var(--navy);
  color: #fff;
  font-family: var(--display);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: inset 0 0 0 2px var(--navy), inset 0 0 0 3.5px rgb(255 255 255 / 0.35);
}
.stamp {
  display: inline-block;
  padding: 4px 16px;
  border: 3px solid #e2607f;
  border-radius: 10px;
  box-shadow: inset 0 0 0 2px #fff6f8, inset 0 0 0 3.5px rgb(226 96 127 / 0.5);
  color: #e2607f;
  font-family: var(--display);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  transform: rotate(-8deg);
  animation: stamp 0.4s cubic-bezier(0.3, 1.6, 0.5, 1);
}

/* ===== 5. Fireworks Finale ===== */
.scene-finale {
  justify-content: center;
  background:
    linear-gradient(180deg, #141a3e 0%, #252559 42%, #5a3a78 68%, #c9809c 90%, #e9a6a8 100%);
  background-position: center;
  background-size: cover;
  color: #fff;
  cursor: pointer;
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
    radial-gradient(1px 1px at 92% 52%, #fff, transparent);
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
  filter: drop-shadow(0 0 10px rgb(247 217 123 / 0.6));
  pointer-events: none;
}
.night-clouds {
  position: absolute !important;
  inset: auto 0 0;
  height: 32%;
  background:
    radial-gradient(ellipse 40% 34% at 8% 80%, #f2a3b7 0 60%, transparent 61%),
    radial-gradient(ellipse 36% 30% at 32% 96%, #e891ad 0 60%, transparent 61%),
    radial-gradient(ellipse 40% 34% at 92% 78%, #f2a3b7 0 60%, transparent 61%),
    radial-gradient(ellipse 34% 30% at 68% 98%, #d985a6 0 60%, transparent 61%),
    radial-gradient(ellipse 30% 20% at 50% 70%, rgb(201 128 172 / 0.7) 0 60%, transparent 61%);
  filter: blur(3px);
  pointer-events: none;
}
.sky-hint {
  margin: 0;
  color: #fff;
  font-family: var(--display);
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 0 14px rgb(255 168 200 / 0.8);
  pointer-events: none;
}
.sky-hint span {
  display: block;
  margin-top: 8px;
  color: #ffd1e0;
  font-size: 15px;
}
/* cream na papel + gold border */
.finale-card {
  width: 100%;
  margin-top: 58px;
  padding: 0 18px 20px;
  border: 2px solid var(--gold);
  border-radius: 20px;
  background: linear-gradient(180deg, #fdf8ee, #f8eedd);
  color: #6b4a4a;
  cursor: default;
  box-shadow:
    inset 0 0 0 5px #fdf8ee,
    inset 0 0 0 6px #ecd3a2,
    0 22px 44px rgb(0 0 0 / 0.3);
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
  border: 4px solid #fdf8ee;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 2px var(--gold), 0 0 22px rgb(255 213 140 / 0.55);
}
.medallion-bow {
  position: absolute;
  bottom: -20px;
  left: 50%;
  width: 92px;
  height: 66px;
  transform: translateX(-50%);
}
.medallion-flower {
  position: absolute;
  bottom: 6px;
  width: 34px;
  height: 34px;
}
.medallion-flower.left {
  left: -18px;
}
.medallion-flower.right {
  right: -18px;
}
.finale-card h3 {
  margin: 30px 0 6px;
  color: #c2455f;
  font-family: var(--serif);
  font-size: 29px;
  font-weight: 600;
  line-height: 1.1;
}
.finale-card p {
  margin: 0;
  color: #6b4a4a;
  font-family: var(--serif);
  font-size: 15px;
  line-height: 1.45;
}
.finale-card .finale-from {
  margin-top: 6px;
  color: #a2585f;
  font-family: var(--script);
  font-size: 25px;
}
.finale-card .finale-extra {
  margin-top: 10px;
  padding: 10px 12px;
  border: 1.5px dashed #f0b3c1;
  border-radius: 14px;
  background: #fff1f3;
  color: var(--navy);
  font-family: var(--script);
  font-size: 22px;
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
  position: relative;
  margin-top: 0;
  padding: 12px 34px;
  font-size: 17px;
}
.btn-flower {
  position: absolute;
  top: 50%;
  width: 28px;
  height: 28px;
  transform: translateY(-50%);
}
.btn-flower.left {
  left: -14px;
}
.btn-flower.right {
  right: -14px;
}
.replay-button {
  border: 1.5px solid var(--gold);
  border-radius: 999px;
  padding: 8px 26px;
  background: rgb(255 255 255 / 0.5);
  color: #7a5240;
  font-family: var(--serif);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
.replay-button:hover {
  background: #fff;
}

/* ===== FX particles ===== */
.fx-layer {
  position: absolute;
  z-index: 5;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.burst {
  position: absolute;
  width: 0;
  height: 0;
}
.burst i {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--s);
  height: var(--s);
  border-radius: 2px;
  background: var(--c);
  animation: fly var(--t) cubic-bezier(0.15, 0.7, 0.4, 1) forwards;
}
.burst.firework i {
  left: -1.25px;
  width: 2.5px;
  height: 14px;
  border-radius: 2px;
  box-shadow: 0 0 6px 1px var(--c);
  transform-origin: 50% 0;
  animation-name: streak;
}
.burst-heart {
  position: absolute;
  left: -9px;
  top: -9px;
  width: 18px;
  height: 18px;
  fill: #fff0f5;
  filter: drop-shadow(0 0 8px var(--glow));
  animation: heart-flash 1.1s ease-out forwards;
}

/* ===== Transitions & keyframes ===== */
.scene-enter-active,
.scene-leave-active {
  transition: opacity 0.35s, transform 0.35s;
}
.scene-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.scene-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
.pop-in-enter-active {
  transition: opacity 0.3s, transform 0.35s cubic-bezier(0.3, 1.5, 0.6, 1);
}
.pop-in-leave-active {
  transition: opacity 0.15s;
}
.pop-in-enter-from {
  opacity: 0;
  transform: scale(0.88);
}
.pop-in-leave-to {
  opacity: 0;
}
.reveal-enter-active {
  transition: opacity 0.6s, transform 0.6s cubic-bezier(0.3, 1.4, 0.6, 1);
}
.reveal-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
}
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
  0% { transform: scale(1); filter: none; }
  40% { transform: scale(1.08); filter: drop-shadow(0 0 16px rgb(255 143 171 / 0.8)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 10px rgb(255 143 171 / 0.5)); }
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
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes twinkle {
  from { opacity: 0.5; }
  to { opacity: 1; }
}
@keyframes fly {
  from { transform: translate(0, 0) rotate(0); opacity: 1; }
  to { transform: translate(var(--dx), var(--dy)) rotate(var(--r)); opacity: 0; }
}
@keyframes streak {
  0% { transform: rotate(var(--a)) translateY(0) scaleY(0.2); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: rotate(var(--a)) translateY(var(--d)) scaleY(1); opacity: 0; }
}
@keyframes heart-flash {
  0% { transform: scale(0.2); opacity: 1; }
  40% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}

/* ===== Responsive: sa phone, buong screen na ang "phone" ===== */
@media (max-width: 900px) {
  .flow-info {
    display: none;
  }
}
@media (max-width: 480px) {
  .surprise-stage {
    padding: 0;
  }
  .phone {
    width: 100%;
    height: calc(100dvh - 65px);
    min-height: 580px;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .topbar-title span {
    display: none;
  }
  .use-button {
    padding: 9px 14px;
    font-size: 14px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .cover-art,
  .balloon,
  .stars,
  .gacha-knob.ready,
  .capsule {
    animation: none;
  }
}
</style>
