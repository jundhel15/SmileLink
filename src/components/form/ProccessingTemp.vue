<template>
  <main class="processing-page">
    <section v-if="!paymentFailed" class="processing-card" aria-live="polite">
      <span class="status-icon" aria-hidden="true">
        <span class="spinner"></span>
      </span>
      <h2 class="processing-title">Confirming your payment</h2>
      <p class="processing-intro">This usually takes a few seconds. Please keep this page open.</p>

      <ol class="step-list">
        <li
          v-for="(step, index) in steps"
          :key="step"
          class="step-item"
          :class="{ done: index < currentStep, active: index === currentStep }"
        >
          <span class="step-mark" aria-hidden="true">
            <svg v-if="index < currentStep" viewBox="0 0 24 24" fill="none">
              <path
                d="m7 12.5 3.2 3.2L17 9"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-else-if="index === currentStep" class="spinner small"></span>
          </span>
          <span>{{ step }}</span>
        </li>
      </ol>

      <p v-if="pollError" class="poll-note" role="status">{{ pollError }}</p>
      <p class="order-ref">
        Order <code>{{ orderId }}</code>
      </p>
    </section>

    <section v-else class="failed-card" role="alert" aria-labelledby="failed-heading">
      <span class="failed-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8" />
          <path
            d="m9.5 9.5 5 5m0-5-5 5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </span>
      <h3 id="failed-heading">Payment didn't go through</h3>
      <p class="muted">Your card was not charged. Try again or use a different card.</p>
      <div class="failed-actions">
        <button class="primary-button" type="button" :disabled="isRetrying" @click="retryCheckout">
          {{ isRetrying ? "Opening checkout..." : "Try again" }}
        </button>
        <button class="secondary-button" type="button" @click="router.push('/create/review')">
          Back to review
        </button>
      </div>
      <p v-if="retryError" class="field-error">{{ retryError }}</p>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { readOrderDraft } from "@/utils/orderDraft";
import { useOrderStore } from "@/stores/order";

// ang status ay galing lang sa server (PayMongo webhook na checkout_session.payment.paid na na-verify ang signature)
const orders_endpoint = "/api/orders";
const checkout_endpoint = "/api/checkout-sessions";
const poll_interval_ms = 3000;

const paid_status = ["paid", "scheduled", "sent"];
const failed_status = ["failed", "cancelled", "expired"];

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const draft = readOrderDraft();
const orderId = route.params.orderId;

const recipientName = draft.recipient_name?.trim().split(" ")[0] || "the recipient";
const steps = [
  "Payment submitted to PayMongo",
  "Waiting for payment confirmation",
  "Creating your SmileLink",
  `Scheduling the email to ${recipientName}`,
];

const orderStatus = ref("paid");
const pollError = ref("");
const isRetrying = ref(false);
const retryError = ref("");
let pollTimer;

const paymentFailed = computed(() => failed_status.includes(orderStatus.value));
const currentStep = computed(() => {
  if (orderStatus.value === "sent" || orderStatus.value === "scheduled") return 3;
  if (orderStatus.value === "paid") return 2;
  return 1;
});

async function checkStatus() {
  try {
    const response = await fetch(`${orders_endpoint}/${encodeURIComponent(orderId)}`, {
      credentials: "include",
    });
    if (!response.ok)
      throw new Error(`Order status request failed with status ${response.status}.`);

    const order = await response.json();
    orderStatus.value = order.order_status;
    pollError.value = "";

    if (paid_status.includes(order.order_status)) {
      stopPolling();
      orderStore.updateOrderDraft({ order_status: order.order_status, link_slug: order.link_slug });
      router.replace(`/order/${encodeURIComponent(orderId)}/complete`);
    } else if (failed_status.includes(order.order_status)) {
      stopPolling();
    }
  } catch (error) {
    console.error(error);
    pollError.value = "Still checking… your connection may be slow.";
  }
}

function startPolling() {
  stopPolling();
  checkStatus();
  pollTimer = setInterval(checkStatus, poll_interval_ms);
}

function stopPolling() {
  clearInterval(pollTimer);
}

// bagong checkout session para sa parehong order
async function retryCheckout() {
  isRetrying.value = true;
  retryError.value = "";

  try {
    const response = await fetch(checkout_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        payment_method: draft.payment_method,
        order: { ...readOrderDraft(), order_id: orderId },
      }),
    });
    if (!response.ok) throw new Error(`Checkout request failed with status ${response.status}.`);

    const { checkout_url: checkoutUrl } = await response.json();
    if (!checkoutUrl?.startsWith("https://")) throw new Error("Checkout URL is missing.");

    orderStore.updateOrderDraft({ order_status: "pending_payment" });
    window.location.assign(checkoutUrl);
  } catch (error) {
    console.error(error);
    retryError.value = "We couldn't open the secure checkout. Please try again.";
    isRetrying.value = false;
  }
}

onMounted(startPolling);
onBeforeUnmount(stopPolling);
</script>

<style scoped>
.processing-page {
  width: min(1490px, 92%);
  margin: 0 auto;
  padding: 40px 0;
  display: flex;
  justify-content: center;
}
.processing-card,
.failed-card {
  width: min(460px, 100%);
  border: 1px solid #e9e1d3;
  border-radius: 14px;
  background: #fff;
}
.processing-card {
  padding: 28px 30px 22px;
  text-align: center;
}
.status-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #e8efff;
}
.spinner {
  width: 26px;
  height: 26px;
  border: 3px solid #c9d7ff;
  border-top-color: #3265df;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
.spinner.small {
  width: 14px;
  height: 14px;
  border-width: 2px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.processing-title {
  margin: 0;
  color: #1c2344;
  font-family: var(--sl-font-display);
  font-size: 24px;
  font-weight: 700;
}
.processing-intro {
  margin: 6px 0 18px;
  color: #69738a;
  font-size: 12px;
}
.step-list {
  margin: 0;
  padding: 18px 0 0;
  list-style: none;
  border-top: 1px solid #efe8dc;
  text-align: left;
}
.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  color: #69738a;
  font-size: 12px;
}
.step-item.active {
  color: #1c2344;
  font-weight: 700;
}
.step-item.done {
  color: #1c2344;
}
.step-mark {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1.5px solid #ddd5c6;
  border-radius: 50%;
}
.step-item.active .step-mark {
  border: 0;
}
.step-item.done .step-mark {
  border-color: #43a047;
  color: #43a047;
}
.step-mark svg {
  width: 14px;
  height: 14px;
}
.poll-note {
  margin: 10px 0 0;
  color: #b7791f;
  font-size: 11px;
}
.order-ref {
  margin: 16px 0 0;
  color: #69738a;
  font-size: 11px;
}
.order-ref code {
  color: #1c2344;
  font-weight: 700;
}
.failed-card {
  padding: 20px;
}
.failed-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #fde8e8;
  color: #d83a3a;
}
.failed-icon svg {
  width: 20px;
  height: 20px;
}
.failed-card h3 {
  margin: 14px 0 4px;
  color: #1c2344;
  font-size: 15px;
  font-weight: 900;
}
.muted {
  margin: 0;
  color: #69738a;
  font-size: 11px;
}
.failed-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
.primary-button,
.secondary-button {
  min-height: 36px;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 800;
}
.primary-button {
  border: 0;
  background: #3265df;
  color: #fff;
}
.primary-button:hover:not(:disabled) {
  background: #2654d1;
}
.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.secondary-button {
  border: 1px solid #e9e1d3;
  background: #fff;
  color: #1c2344;
}
.secondary-button:hover {
  border-color: #c9d7ff;
  color: #3265df;
}
.field-error {
  margin: 10px 0 0;
  color: #d83a3a;
  font-size: 11px;
  font-weight: 600;
}
</style>
