<template>
  <!-- Pahina ng tatanggap (/s/:slug): loading → password (kung naka-on) → ang surprise mismo -->
  <component
    :is="surpriseComponents[surprise.template_id]"
    v-if="surprise && surpriseComponents[surprise.template_id]"
    live
    :content="templateContent"
  />

  <main
    v-else
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-amber-50 px-4 py-10"
  >
    <p v-if="status === 'loading'" class="text-slate-500" aria-live="polite">Opening your surprise…</p>

    <section
      v-else-if="status === 'missing'"
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
    >
      <h1 class="text-2xl font-bold text-slate-900">This surprise isn't ready</h1>
      <p class="mt-2 text-slate-600">
        The link may be wrong, or the surprise hasn't been sent yet. Please check the link in your email.
      </p>
    </section>

    <form
      v-else-if="status === 'locked'"
      class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      @submit.prevent="unlock"
    >
      <h1 class="text-center text-2xl font-bold text-slate-900">
        Hi{{ lockInfo.recipient_name ? `, ${lockInfo.recipient_name}` : "" }}! 🔒
      </h1>
      <p class="mt-2 text-center text-slate-600">Someone made you a surprise. Enter the password to open it.</p>

      <label class="mt-6 block text-sm font-semibold text-slate-700" for="surprise-password">Password</label>
      <input
        id="surprise-password"
        v-model="password"
        type="password"
        autocomplete="off"
        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        :aria-invalid="Boolean(unlockError)"
        aria-describedby="surprise-password-help"
      />
      <p id="surprise-password-help" class="mt-2 text-sm" :class="unlockError ? 'text-red-600' : 'text-slate-500'">
        {{ unlockError || (lockInfo.password_hint ? `Hint: ${lockInfo.password_hint}` : "") }}
      </p>

      <button
        type="submit"
        class="mt-5 w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
        :disabled="!password || isUnlocking"
      >
        {{ isUnlocking ? "Checking…" : "Open my surprise" }}
      </button>
    </form>

    <!-- para sa mga template na wala pang interactive na bersyon -->
    <article
      v-else-if="surprise"
      class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg sm:p-12"
    >
      <p class="text-4xl" aria-hidden="true">🎉</p>
      <h1 class="mt-4 text-3xl font-bold text-slate-900">
        {{ surprise.headline || `Happy ${occasionLabel}, ${surprise.recipient_name || "you"}!` }}
      </h1>
      <p class="mt-6 whitespace-pre-line text-lg leading-relaxed text-slate-700">{{ surprise.message }}</p>
      <p class="mt-8 font-semibold text-slate-900">
        {{ surprise.sign_off || (surprise.sender_name ? `Love, ${surprise.sender_name}` : "") }}
      </p>
    </article>
  </main>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const surprise_endpoint = "/api/surprise";

// kapareho ng surpriseComponents sa BirthdayTemp at MonthsaryTemp; lazy para hindi lahat nilo-load
const surpriseComponents = {
  "soft-celebration": defineAsyncComponent(() => import("@/components/surprise/BirthdaySoftCelebration.vue")),
  "starry-night": defineAsyncComponent(() => import("@/components/surprise/BirthdayStarryNight.vue")),
  "memory-lane": defineAsyncComponent(() => import("@/components/surprise/BirthdayMemoryLane.vue")),
  "cozy-corner": defineAsyncComponent(() => import("@/components/surprise/BirthdayCozyCorner.vue")),
  "happy-vibes": defineAsyncComponent(() => import("@/components/surprise/BirthdayGoldenHour.vue")),
  "timeless-elegance": defineAsyncComponent(() => import("@/components/surprise/BirthdayTimelessElegance.vue")),
  "ocean-breeze": defineAsyncComponent(() => import("@/components/surprise/BirthdayOceanBreeze.vue")),
  "garden-bloom": defineAsyncComponent(() => import("@/components/surprise/BirthdayGardenBloom.vue")),
  "monthsary-template-1": defineAsyncComponent(() => import("@/components/surprise/MonthsaryTemplate1.vue")),
};

const route = useRoute();
const slug = route.params.slug;

const status = ref("loading");
const surprise = ref(null);
const lockInfo = ref({});
const password = ref("");
const unlockError = ref("");
const isUnlocking = ref(false);

const occasionLabel = computed(() => (surprise.value?.occasion === "monthsary" ? "Monthsary" : "Birthday"));

// ang ibang laman ng template (wishes, photos, atbp.) ay sample pa; wala pa sa server
const templateContent = computed(() => {
  const s = surprise.value ?? {};
  return Object.fromEntries(
    Object.entries({
      recipient: s.recipient_name,
      sender: s.sender_name,
      message: s.message,
    }).filter(([, value]) => value),
  );
});

function showSurprise(body) {
  surprise.value = body;
  status.value = "open";
}

async function loadSurprise() {
  try {
    const response = await fetch(`${surprise_endpoint}/${encodeURIComponent(slug)}`);
    if (!response.ok) throw new Error(`Surprise request failed with status ${response.status}.`);

    const body = await response.json();
    if (body.locked) {
      lockInfo.value = body;
      status.value = "locked";
    } else {
      showSurprise(body);
    }
  } catch (error) {
    console.error(error);
    status.value = "missing";
  }
}

async function unlock() {
  isUnlocking.value = true;
  unlockError.value = "";
  try {
    const response = await fetch(`${surprise_endpoint}/${encodeURIComponent(slug)}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password.value }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      unlockError.value = body.error || "We couldn't open the surprise. Please try again.";
      return;
    }
    showSurprise(body);
  } catch (error) {
    console.error(error);
    unlockError.value = "We couldn't open the surprise. Please try again.";
  } finally {
    isUnlocking.value = false;
  }
}

onMounted(loadSurprise);
</script>
