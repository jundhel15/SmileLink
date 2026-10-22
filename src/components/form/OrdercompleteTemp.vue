<template>
  <main class="complete-page">
    <div class="confetti" aria-hidden="true">
      <span
        v-for="piece in confetti"
        :key="piece.id"
        class="confetti-piece"
        :style="{
          left: piece.left,
          top: piece.top,
          background: piece.color,
          transform: `rotate(${piece.rotate}deg)`,
        }"
      ></span>
    </div>

    <section class="complete-content" aria-labelledby="complete-heading">
      <span class="success-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="m6.5 12.5 3.8 3.8L17.5 9"
            stroke="currentColor"
            stroke-width="2.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <h2 id="complete-heading" class="complete-title">All set! Your SmileLink is ready</h2>
      <p class="complete-intro">{{ deliveryMessage }}</p>

      <p v-if="loadError" class="field-error" role="alert">{{ loadError }}</p>

      <div class="complete-grid">
        <div class="link-column">
          <div class="link-card">
            <label class="link-label" for="surprise-link">Your surprise link</label>
            <div class="link-row">
              <div class="link-field">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
                <input
                  id="surprise-link"
                  :value="displayLink"
                  type="text"
                  readonly
                  @focus="$event.target.select()"
                />
              </div>
              <button class="copy-button" type="button" :disabled="!surpriseLink" @click="copyLink">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect
                    x="8"
                    y="8"
                    width="12"
                    height="12"
                    rx="2.5"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <path
                    d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                </svg>
                <span>Copy</span>
              </button>
            </div>
          </div>

          <div class="action-grid">
            <button class="action-button" type="button" :disabled="!qrDataUrl" @click="downloadQr">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>Download QR</span>
            </button>
            <button class="action-button" type="button" :disabled="!surpriseLink" @click="shareLink">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="17" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.8" />
                <circle cx="6.5" cy="12" r="2.5" stroke="currentColor" stroke-width="1.8" />
                <circle cx="17" cy="18.5" r="2.5" stroke="currentColor" stroke-width="1.8" />
                <path d="m8.7 10.7 6.1-3.9m-6.1 6.5 6.1 3.9" stroke="currentColor" stroke-width="1.8" />
              </svg>
              <span>Share</span>
            </button>
            <button class="action-button" type="button" :disabled="!surpriseLink" @click="viewSurprise">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <circle cx="12" cy="12" r="2.8" stroke="currentColor" stroke-width="1.8" />
              </svg>
              <span>View surprise</span>
            </button>
          </div>
        </div>

        <div class="qr-card">
          <div class="qr-frame">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR code for your surprise link" />
            <span v-else class="qr-placeholder" aria-hidden="true"></span>
            <span v-if="qrDataUrl" class="qr-badge" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path
                  d="M9 22c4-8 8 8 13 8s9-12 14-8"
                  stroke="white"
                  stroke-width="5"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </div>
          <p>Print it on a card or gift tag. It opens the same link.</p>
        </div>
      </div>
    </section>

    <p v-if="toastMessage" class="toast" role="status">{{ toastMessage }}</p>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import QRCode from "qrcode";
import { readOrderDraft, updateOrderDraft } from "@/utils/orderDraft";

// ang link_slug ay gawa ng server (random, 8+ characters) para hindi mahulaan
const orders_endpoint = "/api/orders";
const min_slug_length = 8;
const toast_duration_ms = 2000;

const route = useRoute();
const draft = readOrderDraft();
const orderId = route.params.orderId;

const recipientName = draft.recipient_name?.trim().split(" ")[0] || "the recipient";
const linkSlug = ref(draft.link_slug || "");
const scheduledAt = ref(draft.delivery_mode === "scheduled" ? draft.scheduled_at : "");
const qrDataUrl = ref("");
const loadError = ref("");
const toastMessage = ref("");
let toastTimer;

const surpriseLink = computed(() =>
  linkSlug.value.length >= min_slug_length
    ? `${window.location.origin}/s/${encodeURIComponent(linkSlug.value)}`
    : "",
);
const displayLink = computed(() => surpriseLink.value.replace(/^https?:\/\//, ""));

const deliveryMessage = computed(() => {
  if (!scheduledAt.value) {
    return `We've emailed it to ${recipientName}. A copy was sent to you.`;
  }
  const scheduled = new Date(scheduledAt.value);
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
  return `We'll email it to ${recipientName} on ${date} at ${time} (PH time). A copy was sent to you.`;
});

const confetti = [
  { left: "10%", top: "6%", color: "#ffb629", rotate: -30 },
  { left: "22%", top: "14%", color: "#43a047", rotate: 35 },
  { left: "13%", top: "30%", color: "#3264e8", rotate: 60 },
  { left: "6%", top: "52%", color: "#3264e8", rotate: 15 },
  { left: "31%", top: "24%", color: "#ffb629", rotate: -20 },
  { left: "70%", top: "11%", color: "#ffb629", rotate: 70 },
  { left: "84%", top: "16%", color: "#43a047", rotate: -15 },
  { left: "78%", top: "36%", color: "#3264e8", rotate: 50 },
  { left: "91%", top: "58%", color: "#ffb629", rotate: 30 },
].map((piece, id) => ({ ...piece, id }));

async function loadOrder() {
  try {
    const response = await fetch(`${orders_endpoint}/${encodeURIComponent(orderId)}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Order request failed with status ${response.status}.`);

    const order = await response.json();
    if (order.link_slug) linkSlug.value = order.link_slug;
    if (order.scheduled_at) scheduledAt.value = order.scheduled_at;
    updateOrderDraft({ link_slug: linkSlug.value, order_status: order.order_status });
  } catch (error) {
    console.error(error);
    if (!surpriseLink.value) loadError.value = "We couldn't load your link. Please refresh the page.";
  }

  if (surpriseLink.value) {
    qrDataUrl.value = await QRCode.toDataURL(surpriseLink.value, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 480,
      color: { dark: "#1c2344", light: "#ffffff" },
    });
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  toastMessage.value = message;
  toastTimer = setTimeout(() => (toastMessage.value = ""), toast_duration_ms);
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(surpriseLink.value);
    showToast("Copied");
  } catch (error) {
    console.error(error);
    showToast("Couldn't copy. Select the link and copy it manually.");
  }
}

async function shareLink() {
  if (!navigator.share) {
    await copyLink();
    return;
  }
  try {
    await navigator.share({
      title: "A SmileLink surprise",
      text: `A surprise for ${recipientName}`,
      url: surpriseLink.value,
    });
  } catch (error) {
    // AbortError = isinara lang ng user ang share sheet
    if (error.name !== "AbortError") console.error(error);
  }
}

function downloadQr() {
  const anchor = document.createElement("a");
  anchor.href = qrDataUrl.value;
  anchor.download = `smilelink-${linkSlug.value}.png`;
  anchor.click();
}

function viewSurprise() {
  window.open(surpriseLink.value, "_blank", "noopener");
}

onMounted(loadOrder);
onBeforeUnmount(() => clearTimeout(toastTimer));
</script>

<style scoped>
.complete-page {
  position: relative;
  width: min(1490px, 92%);
  margin: 0 auto;
  padding: 40px 0 64px;
}
.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.confetti-piece {
  position: absolute;
  width: 12px;
  height: 6px;
  border-radius: 2px;
}
.complete-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.success-icon {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #43a047;
  color: #fff;
  box-shadow: 0 8px 18px rgba(67, 160, 71, 0.25);
}
.success-icon svg {
  width: 36px;
  height: 36px;
}
.complete-title {
  margin: 18px 0 0;
  color: #1c2344;
  font-family: var(--sl-font-display);
  font-size: 28px;
  font-weight: 700;
}
.complete-intro {
  margin: 8px 0 24px;
  color: #69738a;
  font-size: 13px;
}
.complete-grid {
  width: min(680px, 100%);
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 14px;
  text-align: left;
}
.link-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.link-card,
.qr-card,
.action-button {
  border: 1px solid #e9e1d3;
  border-radius: 12px;
  background: #fff;
}
.link-card {
  padding: 14px;
}
.link-label {
  display: block;
  margin-bottom: 10px;
  color: #1c2344;
  font-size: 12px;
  font-weight: 700;
}
.link-row {
  display: flex;
  gap: 8px;
}
.link-field {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid #e9e1d3;
  border-radius: 8px;
  background: #fffaf2;
  color: #69738a;
}
.link-field svg {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}
.link-field input {
  width: 100%;
  min-height: 38px;
  border: 0;
  background: transparent;
  color: #1c2344;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  outline: none;
}
.copy-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  background: #3265df;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}
.copy-button svg {
  width: 16px;
  height: 16px;
}
.copy-button:hover:not(:disabled) {
  background: #2654d1;
}
.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.action-button {
  min-height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #1c2344;
  font-size: 12px;
  font-weight: 700;
}
.action-button svg {
  width: 18px;
  height: 18px;
  color: #3265df;
}
.action-button:hover:not(:disabled) {
  border-color: #c9d7ff;
  color: #3265df;
}
.copy-button:disabled,
.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.qr-card {
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.qr-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}
.qr-frame img,
.qr-placeholder {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 6px;
}
.qr-placeholder {
  background: #f3eee5;
}
.qr-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  transform: translate(-50%, -50%);
  border: 3px solid #fff;
  border-radius: 7px;
  background: #3265df;
  box-sizing: content-box;
}
.qr-badge svg {
  width: 20px;
  height: 20px;
}
.qr-card p {
  margin: 10px 0 0;
  color: #69738a;
  font-size: 11px;
  line-height: 1.45;
}
.field-error {
  margin: 0 0 14px;
  color: #d83a3a;
  font-size: 12px;
  font-weight: 600;
}
.toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  margin: 0;
  padding: 10px 18px;
  border-radius: 999px;
  background: #1c2344;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(28, 35, 68, 0.2);
}

@media (max-width: 640px) {
  .complete-title {
    font-size: 22px;
  }
  .complete-grid {
    grid-template-columns: 1fr;
  }
  .qr-card {
    width: min(220px, 100%);
    justify-self: center;
  }
}
</style>
