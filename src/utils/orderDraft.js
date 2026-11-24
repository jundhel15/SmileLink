import { useOrderStore } from "@/stores/order";

export const ORDER_DRAFT_KEY = "smilelink-order-draft";

// Bayad na (o kinukumpirma na ang bayad) ang order, kaya huwag nang pagbayarin ulit
export class OrderPaidError extends Error {
  constructor(orderId) {
    super("This order is already paid or being confirmed.");
    this.orderId = orderId;
  }
}

// Tinanggihan ng server; puwedeng ipakita sa customer ang mensahe
export class OrderMessageError extends Error {}

export async function throwIfRefused(response) {
  if (response.status !== 400 && response.status !== 429) return;
  const body = await response.json().catch(() => ({}));
  if (!body.error) return;
  // nawala sa server ang password (hal. bagong order), kaya ipa-type ulit
  if (body.field === "password") useOrderStore().updateOrderDraft({ password_set: false });
  throw new OrderMessageError(body.error);
}

export function errorMessage(error, fallback) {
  return error instanceof OrderMessageError ? error.message : fallback;
}

export function readOrderDraft() {
  const savedDraft = localStorage.getItem(ORDER_DRAFT_KEY);
  if (!savedDraft) return {};

  const draft = JSON.parse(savedDraft);
  if (typeof draft !== "object" || draft === null || Array.isArray(draft)) {
    throw new Error("The saved order draft must be an object.");
  }
  // hindi dapat naiiwan sa browser ang password; burahin kung may luma pa
  if ("password" in draft) {
    delete draft.password;
    localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(draft));
  }
  return draft;
}
// bagong surprise pagkatapos ng bayad na order
export function clearOrderDraft() {
  localStorage.removeItem(ORDER_DRAFT_KEY);
}

// Gumagawa ng order sa server kung wala pa (kailangan bago mag-upload ng litrato o magbayad).
export async function ensureServerOrder() {
  const draft = readOrderDraft();
  if (draft.order_id && draft.order_token) return draft;
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(draft),
  });
  await throwIfRefused(response);
  if (!response.ok) throw new Error(`Create order request failed with status ${response.status}.`);

  const order = await response.json();
  return useOrderStore().updateOrderDraft({
    order_id: order.order_id,
    order_token: order.access_token,
  });
}

// Ipinapadala ang buong draft sa server. Kinikilala lang ng server ang fields na alam niya.
// newOrderIfPaid: false kapag magbabayad na, para hindi gumawa ng pangalawang order ang bayad na
export async function saveServerOrder(extra = {}, { newOrderIfPaid = true, retried = false } = {}) {
  const { order_id: orderId } = await ensureServerOrder();
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...readOrderDraft(), ...extra }),
  });
  if (response.status === 409 && !newOrderIfPaid) throw new OrderPaidError(orderId);
  // 404: wala na sa server ang order (nabura o luma ang token)
  // 409: bayad na ang lumang order kaya hindi na ma-edit
  // sa parehong kaso, gagawa ng bagong order
  if ((response.status === 404 || response.status === 409) && !retried) {
    useOrderStore().updateOrderDraft({ order_id: null, order_token: null, password_set: false });
    return saveServerOrder(extra, { newOrderIfPaid, retried: true });
  }
  await throwIfRefused(response);
  if (!response.ok) throw new Error(`Save order request failed with status ${response.status}.`);
  return response.json();
}
