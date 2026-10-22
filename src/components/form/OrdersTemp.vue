<template>
  <main class="orders-page">
    <div class="orders-header">
      <div>
        <h2 class="section-title">My orders</h2>
        <p class="section-intro">All the surprises you have created with your account.</p>
      </div>
      <button class="new-order-button" type="button" @click="router.push('/create/occasion')">
        + New surprise
      </button>
    </div>

    <p v-if="isLoading" class="state-card">Loading your orders...</p>

    <div v-else-if="needsLogin" class="state-card">
      <p>Please log in to see your orders.</p>
    </div>

    <div v-else-if="loadError" class="state-card" role="alert">
      <p>{{ loadError }}</p>
      <button class="retry-button" type="button" @click="loadOrders">Try again</button>
    </div>

    <div v-else-if="!orders.length" class="state-card">
      <p>You don't have any orders yet.</p>
      <button class="retry-button" type="button" @click="router.push('/create/occasion')">
        Create your first surprise
      </button>
    </div>

    <ul v-else class="order-list">
      <li v-for="order in orders" :key="order.order_id" class="order-card">
        <span
          class="order-thumb"
          :style="{ background: templateFor(order).background }"
          aria-hidden="true"
        ></span>
        <div class="order-info">
          <p class="order-name">{{ templateFor(order).name }}</p>
          <p class="muted">
            {{ packageFor(order).name }} · for {{ order.recipient_name || "No recipient" }}
          </p>
          <p class="muted">
            Order #{{ shortId(order.order_id) }} · {{ formatDate(order.created_at) }}
          </p>
        </div>
        <span class="status-pill" :class="statusFor(order).tone">{{ statusFor(order).label }}</span>
        <strong class="order-price">{{ formatPeso(packageFor(order).price) }}</strong>
      </li>
    </ul>
  </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

// kapareho ng templates sa BirthdayTemp
const templates = {
  "sky-balloons": { name: "Sky Balloons", background: "#c9e7ff" },
  "starry-night": { name: "Starry Night", background: "#292b70" },
  "golden-confetti": { name: "Golden Confetti", background: "#fff0cf" },
  "garden-bloom": { name: "Garden Bloom", background: "#e5f4df" },
  "pastel-party": { name: "Pastel Party", background: "#f4dcf4" },
  "midnight-sparkle": { name: "Midnight Sparkle", background: "#22233c" },
  "sunny-picnic": { name: "Sunny Picnic", background: "#fff0c8" },
  "ocean-breeze": { name: "Ocean Breeze", background: "#ccecf0" },
};

// kapareho ng packages sa PackageTemp
const packages = {
  "greeting-card": { name: "Greeting Card", price: 149 },
  "surprise-website": { name: "Surprise Website", price: 299 },
  "complete-surprise": { name: "Complete Surprise", price: 449 },
};

const status = {
  pending_payment: { label: "Awaiting payment", tone: "pending" },
  paid: { label: "Paid", tone: "paid" },
  scheduled: { label: "Scheduled", tone: "pending" },
  sent: { label: "Sent", tone: "paid" },
  failed: { label: "Failed", tone: "failed" },
  cancelled: { label: "Cancelled", tone: "failed" },
};

// ang server ang tumutukoy kung sino ang naka-login (session cookie) at siya lang ang orders na ibinabalik
const ORDERS_ENDPOINT = "/api/orders";

const router = useRouter();
const orders = ref([]);
const isLoading = ref(true);
const needsLogin = ref(false);
const loadError = ref("");

async function loadOrders() {
  isLoading.value = true;
  needsLogin.value = false;
  loadError.value = "";

  try {
    const response = await fetch(ORDERS_ENDPOINT, { credentials: "include" });
    if (response.status === 401) {
      needsLogin.value = true;
      return;
    }
    if (!response.ok) throw new Error(`Orders request failed with status ${response.status}.`);

    const data = await response.json();
    orders.value = Array.isArray(data) ? data : data.orders || [];
  } catch (error) {
    console.error(error);
    loadError.value = "We couldn't load your orders. Please try again.";
  } finally {
    isLoading.value = false;
  }
}

function templateFor(order) {
  return templates[order.template_id] || { name: "Custom template", background: "#eef1f7" };
}

function packageFor(order) {
  return packages[order.package_id] || { name: "Package", price: order.amount || 0 };
}

function statusFor(order) {
  return status[order.order_status] || { label: order.order_status || "Draft", tone: "pending" };
}

function shortId(id) {
  return String(id || "")
    .slice(0, 8)
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  });
}

function formatPeso(amount) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

onMounted(loadOrders);
</script>

<style scoped>
.orders-page {
  width: min(1100px, 92%);
  margin: 0 auto;
  padding: 30px 0;
}
.orders-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 17px;
}
.section-title {
  margin: 0;
  color: #1c2344;
  font-size: 22px;
  font-weight: 900;
}
.section-intro {
  margin: 2px 0 0;
  font-size: 13px;
  color: #1c2344;
}
.new-order-button,
.retry-button {
  border: 0;
  border-radius: 10px;
  padding: 10px 16px;
  background: var(--sl-blue);
  color: #fff;
  font-weight: 700;
  white-space: nowrap;
}
.new-order-button:hover,
.retry-button:hover {
  background: var(--sl-blue-dark);
}
.state-card {
  margin: 0;
  padding: 36px 20px;
  border: 1px solid #e9e1d3;
  border-radius: 14px;
  background: #fff;
  text-align: center;
  color: #69738a;
}
.state-card p {
  margin: 0 0 14px;
}
.order-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}
.order-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border: 1px solid #e9e1d3;
  border-radius: 14px;
  background: #fff;
}
.order-thumb {
  width: 64px;
  height: 46px;
  flex: 0 0 64px;
  border-radius: 8px;
}
.order-info {
  flex: 1;
  min-width: 0;
}
.order-name {
  margin: 0 0 3px;
  color: #1c2344;
  font-size: 15px;
  font-weight: 800;
}
.muted {
  margin: 0;
  color: #69738a;
  font-size: 12px;
}
.status-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.status-pill.pending {
  background: #fff3d6;
  color: #9a6400;
}
.status-pill.paid {
  background: #e3f4e4;
  color: #2e7d32;
}
.status-pill.failed {
  background: #fde7e5;
  color: #c62828;
}
.order-price {
  min-width: 90px;
  text-align: right;
  color: #1c2344;
}
@media (max-width: 640px) {
  .orders-header {
    flex-direction: column;
    align-items: stretch;
  }
  .order-card {
    flex-wrap: wrap;
  }
  .order-price {
    min-width: 0;
    margin-left: auto;
  }
}
</style>
