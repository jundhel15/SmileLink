<template>
  <main class="recipient-page">
    <h2 class="section-title">Who is it for?</h2>
    <p class="section-intro">We email the surprise link only after your payment is confirmed.</p>

    <form class="recipient-layout" novalidate @submit.prevent="saveRecipient">
      <section class="form-card sender-card" aria-labelledby="sender-heading">
        <h3 id="sender-heading">Recipient and sender</h3>

        <div class="field-grid">
          <label class="field">
            <span>Recipient's name <span class="required-mark">*</span></span>
            <input
              v-model="form.recipient_name"
              type="text"
              autocomplete="name"
              placeholder="Maria Santos"
              required
              :aria-invalid="Boolean(fieldError('recipient_name'))"
              :aria-describedby="fieldError('recipient_name') ? 'recipient-name-error' : undefined"
              @blur="touched.recipient_name = true"
            />
            <small v-if="fieldError('recipient_name')" id="recipient-name-error" class="field-error">
              {{ fieldError("recipient_name") }}
            </small>
          </label>

          <label class="field">
            <span>Recipient's email <span class="required-mark">*</span></span>
            <input
              v-model="form.recipient_email"
              type="email"
              autocomplete="email"
              placeholder="maria.santos@gmail.com"
              required
              :aria-invalid="Boolean(fieldError('recipient_email'))"
              :aria-describedby="fieldError('recipient_email') ? 'recipient-email-error' : undefined"
              @blur="touched.recipient_email = true"
            />
            <small v-if="fieldError('recipient_email')" id="recipient-email-error" class="field-error">
              {{ fieldError("recipient_email") }}
            </small>
          </label>

          <label class="field">
            <span>Your name (shown as sender) <span class="required-mark">*</span></span>
            <input
              v-model="form.sender_name"
              type="text"
              autocomplete="name"
              placeholder="Juan"
              required
              :aria-invalid="Boolean(fieldError('sender_name'))"
              :aria-describedby="fieldError('sender_name') ? 'sender-name-error' : undefined"
              @blur="touched.sender_name = true"
            />
            <small v-if="fieldError('sender_name')" id="sender-name-error" class="field-error">
              {{ fieldError("sender_name") }}
            </small>
          </label>

          <label class="field">
            <span>Your email (for receipt) <span class="required-mark">*</span></span>
            <input
              v-model="form.sender_email"
              type="email"
              autocomplete="email"
              placeholder="juan@email.com"
              required
              :aria-invalid="Boolean(fieldError('sender_email'))"
              :aria-describedby="fieldError('sender_email') ? 'sender-email-error' : undefined"
              @blur="touched.sender_email = true"
            />
            <small v-if="fieldError('sender_email')" id="sender-email-error" class="field-error">
              {{ fieldError("sender_email") }}
            </small>
          </label>
        </div>

        <div class="preview-block">
          <h4>What they will receive</h4>
          <div class="email-preview">
            <span class="mail-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.8" />
                <path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <div>
              <p class="email-from">SmileLink <span>&lt;hello@smilelink&gt;</span></p>
              <p><strong>{{ form.sender_name.trim() || "Your name" }}</strong> sent you a surprise</p>
              <p class="email-snippet">
                Hi {{ form.recipient_name.trim() || "there" }}, someone special made something for you. Tap to open it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="form-card delivery-card" aria-labelledby="delivery-heading">
        <h3 id="delivery-heading">Delivery</h3>

        <label class="radio-option">
          <input v-model="form.delivery_mode" type="radio" value="now" />
          <span>Send right after payment</span>
        </label>
        <label class="radio-option">
          <input v-model="form.delivery_mode" type="radio" value="scheduled" />
          <span>Schedule for later</span>
        </label>

        <div v-if="form.delivery_mode === 'scheduled'" class="schedule-fields">
          <label class="field">
            <span>Date</span>
            <input
              v-model="form.scheduled_date"
              type="date"
              :min="minimumDate"
              required
              :aria-invalid="Boolean(scheduleError)"
              aria-describedby="schedule-help"
            />
          </label>
          <label class="field">
            <span>Time</span>
            <input
              v-model="form.scheduled_time"
              type="time"
              :min="form.scheduled_date === minimumDate ? minimumTime : undefined"
              required
              :aria-invalid="Boolean(scheduleError)"
              aria-describedby="schedule-help"
            />
          </label>
          <small id="schedule-help" class="timezone-note">Philippine time (UTC+8)</small>
          <small v-if="scheduleError" class="field-error schedule-error" role="alert">
            {{ scheduleError }}
          </small>
        </div>

        <label class="copy-option">
          <input v-model="form.send_copy" type="checkbox" />
          <span>Send me a copy of the link</span>
        </label>

        <div class="delivery-note">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.8" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.8" />
          </svg>
          <p>The link is created only after payment is confirmed. Nothing is sent before that.</p>
        </div>
      </section>

      <footer class="form-actions">
        <button class="back-button" type="button" @click="router.push('/create/package')">
          Back
        </button>
        <button class="continue-button" type="submit">
          Continue
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </footer>
      <p v-if="statusMessage" class="status-message" role="status">{{ statusMessage }}</p>
    </form>
  </main>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { readOrderDraft, updateOrderDraft } from "@/utils/orderDraft";

const PHILIPPINE_OFFSET_HOURS = 8;
const router = useRouter();
const draft = readOrderDraft();
const currentTime = ref(Date.now());
const clock = setInterval(() => {
  currentTime.value = Date.now();
}, 30_000);
onUnmounted(() => clearInterval(clock));

const form = reactive({
  recipient_name: draft.recipient_name || "",
  recipient_email: draft.recipient_email || "",
  sender_name: draft.sender_name || "",
  sender_email: draft.sender_email || "",
  delivery_mode: draft.delivery_mode || "now",
  scheduled_date: draft.scheduled_date || "",
  scheduled_time: draft.scheduled_time || "",
  send_copy: draft.send_copy ?? true,
});
const touched = reactive({
  recipient_name: false,
  recipient_email: false,
  sender_name: false,
  sender_email: false,
});
const submitted = ref(false);
const statusMessage = ref("");

const minimumTimestamp = computed(
  () => Math.ceil((currentTime.value + 10 * 60 * 1000) / 60_000) * 60_000,
);
const minimumDate = computed(() => {
  const minimum = new Date(minimumTimestamp.value + PHILIPPINE_OFFSET_HOURS * 60 * 60 * 1000);
  return `${minimum.getUTCFullYear()}-${String(minimum.getUTCMonth() + 1).padStart(2, "0")}-${String(minimum.getUTCDate()).padStart(2, "0")}`;
});
const minimumTime = computed(() => {
  const minimum = new Date(minimumTimestamp.value + PHILIPPINE_OFFSET_HOURS * 60 * 60 * 1000);
  return `${String(minimum.getUTCHours()).padStart(2, "0")}:${String(minimum.getUTCMinutes()).padStart(2, "0")}`;
});
const scheduleError = computed(() => {
  if (form.delivery_mode !== "scheduled") return "";
  if (!form.scheduled_date || !form.scheduled_time) return "Choose a delivery date and time.";
  if (scheduledDateTimeUtc() < minimumTimestamp.value) {
    return "Choose a time at least 10 minutes from now.";
  }
  return "";
});

watch(
  form,
  (details) => {
    updateOrderDraft({
      recipient_name: details.recipient_name,
      recipient_email: details.recipient_email,
      sender_name: details.sender_name,
      sender_email: details.sender_email,
      delivery_mode: details.delivery_mode,
      scheduled_date: details.scheduled_date,
      scheduled_time: details.scheduled_time,
      scheduled_at:
        details.delivery_mode === "scheduled" &&
        details.scheduled_date &&
        details.scheduled_time
          ? new Date(scheduledDateTimeUtc()).toISOString()
          : null,
      send_copy: details.send_copy,
    });
  },
  { deep: true },
);

function scheduledDateTimeUtc() {
  const [year, month, day] = form.scheduled_date.split("-").map(Number);
  const [hours, minutes] = form.scheduled_time.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hours - PHILIPPINE_OFFSET_HOURS, minutes);
}

function emailError(value) {
  if (!value.trim()) return "This field is required.";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Enter a valid email address.";
}

function fieldError(field) {
  if (!submitted.value && !touched[field]) return "";
  const value = form[field].trim();
  if (!value) return "This field is required.";
  return field.endsWith("_email") ? emailError(value) : "";
}

function saveRecipient() {
  submitted.value = true;
  Object.keys(touched).forEach((field) => {
    touched[field] = true;
  });
  statusMessage.value = "";

  const hasInvalidContact = Object.keys(touched).some((field) => fieldError(field));
  if (hasInvalidContact || scheduleError.value) return;

  updateOrderDraft({
    recipient_name: form.recipient_name.trim(),
    recipient_email: form.recipient_email.trim(),
    sender_name: form.sender_name.trim(),
    sender_email: form.sender_email.trim(),
    delivery_mode: form.delivery_mode,
    scheduled_at:
      form.delivery_mode === "scheduled" ? new Date(scheduledDateTimeUtc()).toISOString() : null,
    send_copy: form.send_copy,
  });
  statusMessage.value = "Recipient and delivery details saved.";
  router.push("/create/content");
}
</script>

<style scoped>
.recipient-page {
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
.recipient-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.95fr);
  align-items: start;
  gap: 18px;
}
.form-card {
  min-width: 0;
  border: 1px solid #e9e1d3;
  border-radius: 14px;
  background: #fff;
  padding: 20px;
}
.form-card h3 {
  margin: 0 0 16px;
  color: #1c2344;
  font-size: 15px;
  font-weight: 900;
}
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
}
.field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
  color: #404a63;
  font-size: 11px;
  font-weight: 800;
}
.required-mark {
  color: #ef5350;
}
.field input {
  width: 100%;
  min-width: 0;
  min-height: 39px;
  border: 1px solid #e2dacb;
  border-radius: 8px;
  background: #fff;
  padding: 8px 10px;
  color: #27314f;
  font-size: 12px;
  font-weight: 500;
}
.field input::placeholder {
  color: #8b93a4;
}
.field input[aria-invalid="true"] {
  border-color: #df4949;
}
.field-error {
  color: #d83a3a;
  font-size: 11px;
  font-weight: 600;
}
.preview-block {
  margin-top: 18px;
}
.preview-block h4 {
  margin: 0 0 8px;
  color: #404a63;
  font-size: 11px;
  font-weight: 800;
}
.email-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px dashed #e4dccd;
  border-radius: 10px;
  background: #fffaf2;
  padding: 12px;
}
.mail-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 9px;
  background: #e8efff;
  color: #3265df;
}
.mail-icon svg {
  width: 18px;
  height: 18px;
}
.email-preview p {
  margin: 0;
  color: #27314f;
  font-size: 10px;
  line-height: 1.5;
}
.email-preview .email-from {
  color: #3c465f;
}
.email-from span,
.email-snippet {
  color: #69738a !important;
}
.delivery-card {
  display: flex;
  flex-direction: column;
}
.delivery-card h3 {
  margin-bottom: 9px;
}
.radio-option,
.copy-option {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #404a63;
  font-size: 12px;
}
.radio-option {
  margin: 3px 0;
}
.radio-option input,
.copy-option input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #3265df;
}
.schedule-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 12px;
}
.schedule-fields .field {
  gap: 5px;
}
.timezone-note,
.schedule-error {
  grid-column: 1 / -1;
}
.timezone-note {
  margin-top: -5px;
  color: #768099;
  font-size: 10px;
}
.schedule-error {
  margin-top: -5px;
}
.copy-option {
  margin-top: 15px;
}
.delivery-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 17px;
  border-radius: 9px;
  background: #eaf0ff;
  padding: 10px;
  color: #3265df;
}
.delivery-note svg {
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
}
.delivery-note p {
  margin: 0;
  font-size: 10px;
  line-height: 1.4;
}
.form-actions {
  display: flex;
  grid-column: 1 / -1;
  justify-content: space-between;
  gap: 12px;
  margin-top: 2px;
}
.back-button,
.continue-button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 800;
}
.back-button {
  border: 1px solid #d9d0c0;
  background: #fff;
  color: #1c2344;
}
.continue-button {
  border: 0;
  background: #3265df;
  color: #fff;
}
.continue-button svg {
  width: 17px;
  height: 17px;
}
.status-message {
  grid-column: 1 / -1;
  margin: -7px 0 0;
  color: #247a3b;
  font-size: 13px;
  font-weight: 700;
}
@media (max-width: 760px) {
  .recipient-page {
    width: auto;
    padding: 24px 18px 32px;
  }
  .recipient-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 480px) {
  .recipient-page {
    padding-inline: 14px;
  }
  .form-card {
    padding: 16px;
  }
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
