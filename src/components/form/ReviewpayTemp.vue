<template>
  <main class="review-page">
    <h2 class="section-title">Review and pay</h2>
    <p class="section-intro">Check everything before you pay. You can still go back and edit.</p>

    <div class="review-layout">
      <section class="review-card summary-card" aria-labelledby="summary-heading">
        <h3 id="summary-heading">Order summary</h3>

        <div class="product-row">
          <span class="product-thumb" :style="{ background: template.background }" aria-hidden="true">
            <svg viewBox="0 0 120 80" fill="none">
              <path d="M22 28v30M98 24v34M60 14v22" stroke="#9aa6c0" stroke-width="1" />
              <ellipse cx="22" cy="20" rx="8" ry="10" :fill="template.accent" />
              <ellipse cx="98" cy="16" rx="8" ry="10" :fill="template.secondary" />
              <ellipse cx="60" cy="8" rx="6" ry="7.5" :fill="template.icing" />
              <rect x="40" y="46" width="40" height="22" rx="3" :fill="template.cake" />
              <path d="M40 50c5 5 8-3 13 0s8 5 14 0 8 4 13 0v-4H40z" :fill="template.icing" />
              <path d="M0 68h120v12H0z" fill="#f6e6c4" />
            </svg>
          </span>
          <div class="product-info">
            <p class="product-name">{{ template.name }}</p>
            <p class="muted">{{ occasionLabel }} template</p>
            <span class="package-pill">{{ selectedPackage.name }}</span>
          </div>
          <a class="edit-link product-edit" href="/create/template" @click.prevent="router.push('/create/template')">Edit</a>
        </div>

        <dl class="summary-list">
          <div v-for="row in summaryRows" :key="row.label" class="summary-row">
            <dt>{{ row.label }}</dt>
            <dd>
              <strong>{{ row.value }}</strong>
              <span class="muted">{{ row.detail }}</span>
            </dd>
            <a class="edit-link" :href="row.to" @click.prevent="router.push(row.to)">
              Edit<span class="visually-hidden"> {{ row.label.toLowerCase() }}</span>
            </a>
          </div>
        </dl>
      </section>

      <section class="review-card payment-card" aria-labelledby="payment-heading">
        <h3 id="payment-heading">Payment</h3>

        <label class="method-option">
          <input type="radio" name="payment-method" value="card" checked />
          <span class="card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.8" />
              <path d="M3 10h18" stroke="currentColor" stroke-width="1.8" />
            </svg>
          </span>
          <span class="method-text">
            <strong>Credit or debit card</strong>
            <span class="muted">Visa and Mastercard</span>
          </span>
          <span class="card-brands">
            <span class="brand-visa">VISA</span>
            <span class="brand-mastercard">Mastercard</span>
          </span>
        </label>

        <div class="secure-note">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
            <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p>You will pay on PayMongo's secure checkout. SmileLink never sees or stores your card number.</p>
        </div>

        <div class="price-line">
          <span>{{ selectedPackage.name }}</span>
          <span>{{ formatPeso(selectedPackage.price) }}</span>
        </div>
        <div class="total-line">
          <span>Total</span>
          <strong>{{ formatPeso(selectedPackage.price) }}</strong>
        </div>

        <label class="terms-option">
          <input v-model="agreedToTerms" type="checkbox" />
          <span>I agree to the Terms. Payments can't be refunded once the link has been sent.</span>
        </label>

        <button class="pay-button" type="button" :disabled="!canPay" @click="startCheckout">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.8" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.8" />
          </svg>
          {{ isPaying ? "Opening secure checkout..." : `Pay ${formatPeso(selectedPackage.price)} securely` }}
        </button>
        <p v-if="missingStep" class="field-error" role="alert">
          {{ missingStep.message }}
          <a href="#" @click.prevent="router.push(missingStep.to)">Go to {{ missingStep.label }}</a>
        </p>
        <p v-if="paymentError" class="field-error" role="alert">{{ paymentError }}</p>
      </section>

      <footer class="form-actions">
        <button class="back-button" type="button" @click="router.push('/create/content')">Back</button>
      </footer>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { readOrderDraft, updateOrderDraft } from "@/utils/orderDraft";

// kapareho ng templates sa BirthdayTemp
const TEMPLATES = {
  "sky-balloons": { name: "Sky Balloons", background: "#c9e7ff", accent: "#2865d8", secondary: "#ffb629", icing: "#ff8f88", cake: "#fff0c4" },
  "starry-night": { name: "Starry Night", background: "#292b70", accent: "#ffd036", secondary: "#8997ff", icing: "#fff3d0", cake: "#f6bd42" },
  "golden-confetti": { name: "Golden Confetti", background: "#fff0cf", accent: "#e6a51b", secondary: "#4881ed", icing: "#fff8e8", cake: "#f4c35c" },
  "garden-bloom": { name: "Garden Bloom", background: "#e5f4df", accent: "#45a767", secondary: "#ff8580", icing: "#fff4dc", cake: "#76c279" },
  "pastel-party": { name: "Pastel Party", background: "#f4dcf4", accent: "#a879dc", secondary: "#f6b642", icing: "#fff9ff", cake: "#c5a9ee" },
  "midnight-sparkle": { name: "Midnight Sparkle", background: "#22233c", accent: "#f5b932", secondary: "#ff8580", icing: "#fff0c7", cake: "#304b9a" },
  "sunny-picnic": { name: "Sunny Picnic", background: "#fff0c8", accent: "#3879e8", secondary: "#fa856c", icing: "#fffaf0", cake: "#ffca4f" },
  "ocean-breeze": { name: "Ocean Breeze", background: "#ccecf0", accent: "#287bda", secondary: "#ff906f", icing: "#f7fbf8", cake: "#3a82da" },
};

// kapareho ng packages sa PackageTemp; display lang, sa server kinukuwenta ang totoong halaga
const PACKAGES = {
  "greeting-card": { name: "Greeting Card", price: 149 },
  "surprise-website": { name: "Surprise Website", price: 299 },
  "complete-surprise": { name: "Complete Surprise", price: 449 },
};

const CHECKOUT_ENDPOINT = "/api/checkout-sessions";

const router = useRouter();
const draft = readOrderDraft();
const template = TEMPLATES[draft.template_id] || TEMPLATES["sky-balloons"];
const selectedPackage = PACKAGES[draft.package_id] || PACKAGES["surprise-website"];
const occasionLabel = draft.occasion
  ? draft.occasion.charAt(0).toUpperCase() + draft.occasion.slice(1)
  : "Birthday";

const agreedToTerms = ref(false);
const isPaying = ref(false);
const paymentError = ref("");

const deliveryRow = computed(() => {
  if (draft.delivery_mode !== "scheduled" || !draft.scheduled_at) {
    return { value: "Right after payment", detail: "Sent by email to the recipient" };
  }
  const scheduled = new Date(draft.scheduled_at);
  const date = scheduled.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  });
  const time = scheduled.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
  return { value: `${date} at ${time}`, detail: "Philippine time (UTC+8)" };
});

const contentRow = computed(() => {
  const parts = [];
  if (draft.message?.trim()) parts.push("Message");
  if (draft.photo_count) parts.push(`${draft.photo_count} photo${draft.photo_count === 1 ? "" : "s"}`);
  if (draft.music_track) parts.push("music");
  if (draft.video_link?.trim()) parts.push("video");
  return {
    value: parts.length ? parts.join(", ") : "No content yet",
    detail: draft.password_enabled ? "Password lock on" : "Password lock off",
  };
});

const summaryRows = computed(() => [
  {
    label: "Recipient",
    value: draft.recipient_name || "Not set",
    detail: draft.recipient_email || "",
    to: "/create/recipient",
  },
  { label: "Delivery", ...deliveryRow.value, to: "/create/recipient" },
  { label: "Content", ...contentRow.value, to: "/create/content" },
  {
    label: "Sender",
    value: draft.sender_name || "Not set",
    detail: draft.sender_email ? `Receipt to ${draft.sender_email}` : "",
    to: "/create/recipient",
  },
]);

const missingStep = computed(() => {
  if (!draft.template_id) {
    return { label: "Template", to: "/create/template", message: "Choose a template first." };
  }
  if (!draft.recipient_name || !draft.recipient_email || !draft.sender_name || !draft.sender_email) {
    return { label: "Recipient", to: "/create/recipient", message: "Add the recipient and sender details first." };
  }
  if (!draft.message?.trim()) {
    return { label: "Content", to: "/create/content", message: "Write your message first." };
  }
  return null;
});

const canPay = computed(() => agreedToTerms.value && !missingStep.value && !isPaying.value);

function formatPeso(amount) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

// gumagawa ang server ng PayMongo Checkout Session; walang halaga o card number na galing dito
async function startCheckout() {
  if (!canPay.value) return;
  isPaying.value = true;
  paymentError.value = "";

  const orderId = draft.order_id || crypto.randomUUID();
  updateOrderDraft({ order_id: orderId });

  try {
    const response = await fetch(CHECKOUT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, order: { ...readOrderDraft(), order_id: orderId } }),
    });
    if (!response.ok) throw new Error(`Checkout request failed with status ${response.status}.`);

    const { checkout_url: checkoutUrl } = await response.json();
    if (!checkoutUrl?.startsWith("https://")) throw new Error("Checkout URL is missing.");

    updateOrderDraft({ order_status: "pending_payment" });
    window.location.assign(checkoutUrl);
  } catch (error) {
    console.error(error);
    paymentError.value = "We couldn't open the secure checkout. Please try again.";
    isPaying.value = false;
  }
}
</script>

<style scoped>
.review-page {
  width: min(1490px, 92%);
  margin: 0 auto;
  padding: 30px 0 30px;
}
.section-title {
  margin: 0;
  color: #1c2344;
  font-size: 22px;
  font-weight: 900;
}
.section-intro {
  margin: 2px 0 17px;
  font-size: 13px;
  color: #1c2344;
}
.review-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.95fr);
  align-items: start;
  gap: 18px;
}
.review-card {
  min-width: 0;
  border: 1px solid #e9e1d3;
  border-radius: 14px;
  background: #fff;
  padding: 20px;
}
.review-card h3 {
  margin: 0 0 16px;
  color: #1c2344;
  font-size: 15px;
  font-weight: 900;
}
.muted {
  display: block;
  color: #69738a;
  font-size: 11px;
}
.product-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #efe8dc;
}
.product-thumb {
  width: 96px;
  height: 64px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 9px;
}
.product-thumb svg {
  width: 100%;
  height: 100%;
}
.product-info {
  flex: 1;
  min-width: 0;
}
.product-info p {
  margin: 0;
}
.product-name {
  color: #1c2344;
  font-size: 13px;
  font-weight: 800;
}
.package-pill {
  display: inline-block;
  margin-top: 6px;
  border-radius: 999px;
  background: #e8efff;
  padding: 3px 9px;
  color: #3265df;
  font-size: 10px;
  font-weight: 700;
}
.summary-list {
  margin: 0;
}
.summary-row {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr) auto;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid #efe8dc;
}
.summary-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.summary-row dt {
  color: #404a63;
  font-size: 11px;
}
.summary-row dd {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
}
.summary-row strong {
  display: block;
  color: #1c2344;
  font-size: 12px;
  font-weight: 800;
}
.edit-link {
  color: #3265df;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
}
.edit-link:hover {
  text-decoration: underline;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.method-option {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid #3265df;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
}
.method-option input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #3265df;
}
.card-icon {
  display: grid;
  color: #3265df;
}
.card-icon svg {
  width: 18px;
  height: 18px;
}
.method-text {
  flex: 1;
  min-width: 0;
}
.method-text strong {
  display: block;
  color: #1c2344;
  font-size: 12px;
  font-weight: 700;
}
.card-brands {
  display: flex;
  gap: 6px;
}
.card-brands span {
  border-radius: 5px;
  padding: 2px 7px;
  font-size: 9px;
  font-weight: 800;
}
.brand-visa {
  background: #1a2a6c;
  color: #fff;
  font-style: italic;
}
.brand-mastercard {
  border: 1px solid #e2dacb;
  background: #fffaf2;
  color: #27314f;
}
.secure-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  border-radius: 9px;
  background: #eaf0ff;
  padding: 10px 12px;
  color: #3265df;
}
.secure-note svg {
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
}
.secure-note p {
  margin: 0;
  font-size: 10px;
  line-height: 1.4;
}
.price-line,
.total-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.price-line {
  margin-top: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #efe8dc;
  color: #69738a;
  font-size: 11px;
}
.total-line {
  padding: 16px 0 12px;
  color: #1c2344;
  font-size: 13px;
  font-weight: 800;
}
.total-line strong {
  font-family: var(--sl-font-display);
  font-size: 22px;
}
.terms-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #404a63;
  font-size: 11px;
  line-height: 1.4;
}
.terms-option input {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  margin: 0;
  accent-color: #3265df;
}
.pay-button {
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
  border: 0;
  border-radius: 10px;
  background: #3265df;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}
.pay-button:hover:not(:disabled) {
  background: #2654d1;
}
.pay-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.pay-button svg {
  width: 16px;
  height: 16px;
}
.field-error {
  margin: 10px 0 0;
  color: #d83a3a;
  font-size: 11px;
  font-weight: 600;
}
.field-error a {
  color: #3265df;
}
.form-actions {
  display: flex;
  grid-column: 1 / -1;
  justify-content: flex-start;
  margin-top: 2px;
}
.back-button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  border: 1px solid #d9d0c0;
  border-radius: 10px;
  background: #fff;
  padding: 10px 18px;
  color: #1c2344;
  font-size: 13px;
  font-weight: 800;
}
@media (max-width: 760px) {
  .review-page {
    width: auto;
    padding: 24px 18px 32px;
  }
  .review-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 480px) {
  .review-page {
    padding-inline: 14px;
  }
  .review-card {
    padding: 16px;
  }
  .summary-row {
    grid-template-columns: 1fr auto;
  }
  .summary-row dd {
    grid-column: 1 / 2;
  }
  .card-brands {
    display: none;
  }
}
</style>
