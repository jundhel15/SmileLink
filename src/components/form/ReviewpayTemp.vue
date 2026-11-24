<template>
  <main class="review-page">
    <h2 class="section-title">Review and pay</h2>
    <p class="section-intro">Check everything before you pay. You can still go back and edit.</p>

    <div class="review-layout">
      <section class="review-card summary-card" aria-labelledby="summary-heading">
        <h3 id="summary-heading">Order summary</h3>

        <div class="product-row">
          <span class="product-thumb" aria-hidden="true">
            <img v-if="template.image" :src="template.image" alt="" />
          </span>
          <div class="product-info">
            <p class="product-name">{{ template.name }}</p>
            <p class="muted">{{ occasionLabel }} template</p>
            <span class="package-pill">{{ selectedPackage.name }}</span>
          </div>
          <!-- <a
            class="edit-link product-edit"
            href="/create/template"
            @click.prevent="router.push('/create/template')"
            >Edit</a -->
          >
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

        <label
          v-if="card_payment_enabled"
          class="method-option"
          :class="{ selected: paymentMethod === 'card' }"
        >
          <input v-model="paymentMethod" type="radio" name="payment-method" value="card" />
          <span class="card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="5.5"
                width="18"
                height="13"
                rx="2"
                stroke="currentColor"
                stroke-width="1.8"
              />
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

        <label class="method-option" :class="{ selected: paymentMethod === 'gcash' }">
          <input v-model="paymentMethod" type="radio" name="payment-method" value="gcash" />
          <span class="card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="6"
                y="2.5"
                width="12"
                height="19"
                rx="2.5"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path d="M10.5 18.5h3" stroke="currentColor" stroke-width="1.8" />
            </svg>
          </span>
          <span class="method-text">
            <strong>GCash</strong>
            <span class="muted">Pay with your GCash wallet</span>
          </span>
          <span class="card-brands">
            <span class="brand-gcash">GCash</span>
          </span>
        </label>

        <div class="secure-note">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path
              d="m9 12 2 2 4-4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p v-if="paymentMethod === 'gcash'">
            On your phone, the GCash app opens so you can approve the payment. On a computer, a QR
            code appears. Scan it with GCash.
          </p>
          <p v-else>
            You will pay on PayMongo's secure checkout. SmileLink never sees or stores your card
            number.
          </p>
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

        <button class="pay-button" type="button" :disabled="!canPay" @click="onPayClick">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
              x="5"
              y="10"
              width="14"
              height="11"
              rx="2"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.8" />
          </svg>
          {{
            isPaying
              ? paymentMethod === "gcash"
                ? "Preparing GCash..."
                : "Opening secure checkout..."
              : paymentMethod === "gcash"
                ? `Pay ${formatPeso(selectedPackage.price)} with GCash`
                : `Pay ${formatPeso(selectedPackage.price)} securely`
          }}
        </button>
        <p v-if="missingStep" class="field-error" role="alert">
          {{ missingStep.message }}
          <a href="#" @click.prevent="router.push(missingStep.to)">Go to {{ missingStep.label }}</a>
        </p>
        <p v-if="paymentError" class="field-error" role="alert">{{ paymentError }}</p>
      </section>

      <footer class="form-actions">
        <button class="back-button" type="button" @click="router.push('/create/content')">
          Back
        </button>
      </footer>
    </div>

    <Teleport to="body">
      <div v-if="showGcashModal" class="qr-backdrop" @click.self="closeGcashModal">
        <div
          class="qr-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-heading"
          @keydown.esc="closeGcashModal"
        >
          <button class="qr-close" type="button" aria-label="Close" @click="closeGcashModal">
            &times;
          </button>

          <div class="qr-header">
            <span class="brand-gcash qr-brand">GCash</span>
            <h3 id="qr-heading">Scan to pay</h3>
            <p class="muted">Open your GCash app, tap <strong>QR</strong>, then scan this code.</p>
          </div>

          <div class="qr-box" :class="{ expired: secondsLeft === 0 }">
            <img
              :src="qrImage"
              :alt="`GCash QR code to pay ${formatPeso(selectedPackage.price)} to SmileLink`"
              width="184"
              height="184"
            />
            <span v-if="secondsLeft === 0" class="qr-expired-label">QR expired</span>
          </div>

          <dl class="qr-details">
            <div>
              <dt>Amount</dt>
              <dd class="qr-amount">{{ formatPeso(selectedPackage.price) }}</dd>
            </div>
            <div>
              <dt>Merchant</dt>
              <dd>SmileLink</dd>
            </div>
            <div>
              <dt>Expires in</dt>
              <dd :class="{ 'qr-warning': secondsLeft < 60 }">{{ countdownLabel }}</dd>
            </div>
          </dl>

          <p v-if="secondsLeft > 0" class="qr-waiting" role="status">
            <span class="qr-pulse" aria-hidden="true"></span>
            Waiting for your payment.
          </p>
          <button v-else class="pay-button" type="button" :disabled="isPaying" @click="showGcashQr">
            {{ isPaying ? "Preparing GCash..." : "Generate a new QR code" }}
          </button>

          <button class="qr-secondary" type="button" :disabled="isPaying" @click="openGcashApp">
            Open GCash
          </button>
          <button class="qr-cancel" type="button" @click="closeGcashModal">Cancel</button>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import {
  errorMessage,
  OrderPaidError,
  readOrderDraft,
  saveServerOrder,
  throwIfRefused,
} from "@/utils/orderDraft";
import { useOrderStore } from "@/stores/order";
import { PACKAGES, TEMPLATES } from "@/shared/catalog";

// mga thumbnail ng template (WebP); ang malalaking *-full ay hindi kasama
const templateImages = import.meta.glob(["@/assets/templates/*/*.webp", "!**/*-full.webp"], {
  eager: true,
  import: "default",
});

// ang PACKAGES ay galing sa shared catalog; display lang dito, sa server kinukuwenta ang totoong halaga
const CHECKOUT_ENDPOINT = "/api/checkout-sessions";
// GCash direct: phone -> opens GCash, computer -> real QR shown here (no PayMongo checkout page)
const PAYMENT_INTENT_ENDPOINT = "/api/payment-intents";
const PAID_STATUSES = ["paid", "scheduled", "sent"];
// naka-off muna ang card; gawing true para ipakita ulit
const card_payment_enabled = false;

const router = useRouter();
const orderStore = useOrderStore();
const draft = readOrderDraft();
const chosenTemplate = TEMPLATES.find((item) => item.id === draft.template_id);
const template = {
  name: chosenTemplate?.name || "No template chosen",
  image: Object.entries(templateImages).find(
    ([path]) =>
      path.endsWith(`/${draft.template_id}.webp`) || path.endsWith(`-${draft.template_id}.webp`),
  )?.[1],
};
const selectedPackage = PACKAGES[draft.package_id] || PACKAGES["surprise-website"];
const occasionLabel = draft.occasion
  ? draft.occasion.charAt(0).toUpperCase() + draft.occasion.slice(1)
  : "Birthday";

const paymentMethod = ref(
  card_payment_enabled && draft.payment_method === "card" ? "card" : "gcash",
);
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
  if (draft.photo_count)
    parts.push(`${draft.photo_count} photo${draft.photo_count === 1 ? "" : "s"}`);
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
  if (
    !draft.recipient_name ||
    !draft.recipient_email ||
    !draft.sender_name ||
    !draft.sender_email
  ) {
    return {
      label: "Recipient",
      to: "/create/recipient",
      message: "Add the recipient and sender details first.",
    };
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

// GCash QR popup: the QR image, reference and expiry come from PayMongo through our server
const showGcashModal = ref(false);
const qrImage = ref("");
const secondsLeft = ref(0);
let countdownTimer = null;
let paidCheckTimer = null;

const countdownLabel = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60);
  const seconds = String(secondsLeft.value % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
});

function onPayClick() {
  if (paymentMethod.value !== "gcash") return startCheckout();
  if (!canPay.value) return;
  // a phone has GCash installed, so open it; a computer can't, so show a QR to scan with the phone
  if (isPhone()) openGcashApp();
  else showGcashQr();
}

function isPhone() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

// PayMongo sends expires_at as an ISO date with nanoseconds; Date only reads milliseconds
function secondsUntil(expiresAt) {
  const ms =
    typeof expiresAt === "number"
      ? expiresAt * 1000
      : Date.parse(String(expiresAt ?? "").replace(/(\.\d{3})\d+/, "$1"));
  return Number.isFinite(ms) ? Math.max(0, Math.round((ms - Date.now()) / 1000)) : 5 * 60;
}

// Saves the order, then asks the server for a GCash payment: "qrph" (QR image) or "gcash" (app link)
async function requestGcashPayment(type) {
  const { order_id: orderId } = await saveServerOrder({}, { newOrderIfPaid: false });
  orderStore.updateOrderDraft({ payment_method: "gcash" });

  const response = await fetch(PAYMENT_INTENT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-order-token": readOrderDraft().order_token ?? "",
    },
    body: JSON.stringify({ order_id: orderId, payment_method: type }),
  });
  if (response.status === 409) throw new OrderPaidError(orderId);
  await throwIfRefused(response);
  if (!response.ok) throw new Error(`Payment request failed with status ${response.status}.`);

  orderStore.updateOrderDraft({ order_status: "pending_payment" });
  return { orderId, ...(await response.json()) };
}

// Already paid, or a payment is going through: go wait for it instead of paying again
function goToProcessing(orderId) {
  stopGcashTimers();
  showGcashModal.value = false;
  router.push(`/order/${orderId}/processing`);
}

async function openGcashApp() {
  isPaying.value = true;
  paymentError.value = "";
  try {
    const payment = await requestGcashPayment("gcash");
    if (payment.kind !== "redirect" || !payment.url?.startsWith("https://")) {
      throw new Error("GCash link is missing.");
    }
    stopGcashTimers();
    // GCash sends the customer back to /order/:id/processing, which waits for the webhook
    window.location.assign(payment.url);
  } catch (error) {
    if (error instanceof OrderPaidError) return goToProcessing(error.orderId);
    console.error(error);
    paymentError.value = errorMessage(error, "We couldn't open GCash. Please try again.");
    showGcashModal.value = false;
    isPaying.value = false;
  }
}

async function showGcashQr() {
  isPaying.value = true;
  paymentError.value = "";
  try {
    const payment = await requestGcashPayment("qrph");
    if (payment.kind !== "qr" || !payment.image?.startsWith("data:image/")) {
      throw new Error("QR code is missing.");
    }
    qrImage.value = payment.image;
    secondsLeft.value = secondsUntil(payment.expires_at);
    showGcashModal.value = true;
    startGcashTimers(payment.orderId);

    await nextTick();
    document.querySelector(".qr-modal .qr-close")?.focus();
  } catch (error) {
    if (error instanceof OrderPaidError) return goToProcessing(error.orderId);
    console.error(error);
    paymentError.value = errorMessage(error, "We couldn't create the GCash QR code. Please try again.");
    showGcashModal.value = false;
  } finally {
    isPaying.value = false;
  }
}

// Counts down the QR expiry and checks every 3 seconds whether the webhook marked the order paid.
// Only the server (verified PayMongo webhook) marks it paid; this page only reads the status.
function startGcashTimers(orderId) {
  stopGcashTimers();
  countdownTimer = setInterval(() => {
    if (secondsLeft.value > 0) secondsLeft.value--;
    else clearInterval(countdownTimer);
  }, 1000);
  paidCheckTimer = setInterval(() => checkGcashPaid(orderId), 3000);
}

function stopGcashTimers() {
  clearInterval(countdownTimer);
  clearInterval(paidCheckTimer);
}

async function checkGcashPaid(orderId) {
  try {
    const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      headers: { "x-order-token": readOrderDraft().order_token ?? "" },
    });
    if (!response.ok) return;
    const { order_status: orderStatus } = await response.json();
    if (PAID_STATUSES.includes(orderStatus)) {
      stopGcashTimers();
      showGcashModal.value = false;
      router.push(`/order/${orderId}/processing`);
    }
  } catch {
    // a dropped connection just means we check again on the next tick
  }
}

function closeGcashModal() {
  stopGcashTimers();
  showGcashModal.value = false;
}

onBeforeUnmount(stopGcashTimers);

// gumagawa ang server ng PayMongo Checkout Session; walang halaga o card number na galing dito
async function startCheckout() {
  if (!canPay.value) return;
  isPaying.value = true;
  paymentError.value = "";

  try {
    const { order_id: orderId } = await saveServerOrder({}, { newOrderIfPaid: false });
    orderStore.updateOrderDraft({ payment_method: paymentMethod.value });

    const response = await fetch(CHECKOUT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-order-token": readOrderDraft().order_token ?? "",
      },
      body: JSON.stringify({ order_id: orderId, payment_method: paymentMethod.value }),
    });
    if (response.status === 409) throw new OrderPaidError(orderId);
    await throwIfRefused(response);
    if (!response.ok) throw new Error(`Checkout request failed with status ${response.status}.`);

    const { checkout_url: checkoutUrl } = await response.json();
    if (!checkoutUrl?.startsWith("https://")) throw new Error("Checkout URL is missing.");

    orderStore.updateOrderDraft({ order_status: "pending_payment" });
    window.location.assign(checkoutUrl);
  } catch (error) {
    if (error instanceof OrderPaidError) return goToProcessing(error.orderId);
    console.error(error);
    paymentError.value = errorMessage(error, "We couldn't open the secure checkout. Please try again.");
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
  background: #eef2fb;
}
.product-thumb img {
  display: block;
  object-fit: cover;
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
  border: 1.5px solid #e2dacb;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
}
.method-option + .method-option {
  margin-top: 10px;
}
.method-option.selected {
  border-color: #3265df;
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
.brand-gcash {
  background: #007dfe;
  color: #fff;
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
.qr-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  overflow-y: auto;
  background: rgba(20, 26, 48, 0.55);
  padding: 16px;
}
.qr-modal {
  position: relative;
  width: min(380px, 100%);
  border-radius: 16px;
  background: #fff;
  padding: 24px 22px 18px;
  box-shadow: 0 20px 50px rgba(20, 26, 48, 0.25);
  text-align: center;
}
.qr-modal h3 {
  margin: 8px 0 4px;
  color: #1c2344;
  font-size: 17px;
  font-weight: 900;
}
.qr-close {
  position: absolute;
  top: 10px;
  right: 12px;
  border: 0;
  background: none;
  color: #69738a;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}
.qr-brand {
  display: inline-block;
  border-radius: 5px;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 800;
}
.qr-box {
  position: relative;
  width: 200px;
  margin: 16px auto 14px;
  border: 3px solid #007dfe;
  border-radius: 12px;
  padding: 8px;
}
.qr-box img {
  display: block;
  width: 100%;
  height: auto;
  image-rendering: pixelated;
}
.qr-box.expired img {
  opacity: 0.15;
}
.qr-expired-label {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #d83a3a;
  font-size: 13px;
  font-weight: 800;
}
.qr-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 0;
  border-radius: 10px;
  background: #f7f4ee;
  padding: 12px;
  text-align: left;
}
.qr-details dt {
  color: #69738a;
  font-size: 10px;
}
.qr-details dd {
  margin: 2px 0 0;
  color: #1c2344;
  font-size: 12px;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.qr-amount {
  color: #3265df !important;
  font-size: 15px !important;
}
.qr-warning {
  color: #d83a3a !important;
}
.qr-waiting {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 14px 0 4px;
  color: #3e4864;
  font-size: 12px;
  font-weight: 600;
}
.qr-pulse {
  flex: none;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #007dfe;
  animation: qr-pulse 1.2s ease-in-out infinite;
}
@keyframes qr-pulse {
  50% {
    opacity: 0.25;
    transform: scale(0.7);
  }
}
@media (prefers-reduced-motion: reduce) {
  .qr-pulse {
    animation: none;
  }
}
.qr-secondary {
  display: block;
  width: 100%;
  margin-top: 10px;
  border: 1px solid #cfd8ea;
  border-radius: 10px;
  background: #fff;
  padding: 10px;
  color: #007dfe;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.qr-secondary:hover:not(:disabled) {
  background: #f1f6ff;
}
.qr-secondary:disabled {
  cursor: wait;
  opacity: 0.6;
}
.qr-cancel {
  margin-top: 8px;
  border: 0;
  background: none;
  padding: 6px;
  color: #69738a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
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
