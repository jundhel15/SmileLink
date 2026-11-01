import { useOrderStore } from "@/stores/order";

export const ORDER_DRAFT_KEY = "smilelink-order-draft";

export function readOrderDraft() {
  const savedDraft = localStorage.getItem(ORDER_DRAFT_KEY);
  if (!savedDraft) return {};

  const draft = JSON.parse(savedDraft);
  if (typeof draft !== "object" || draft === null || Array.isArray(draft)) {
    throw new Error("The saved order draft must be an object.");
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
  if (!response.ok) throw new Error(`Create order request failed with status ${response.status}.`);

  const order = await response.json();
  return useOrderStore().updateOrderDraft({
    order_id: order.order_id,
    order_token: order.access_token,
  });
}

// Ipinapadala ang buong draft sa server. Kinikilala lang ng server ang fields na alam niya.
export async function saveServerOrder(extra = {}, retried = false) {
  const { order_id: orderId } = await ensureServerOrder();
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ...readOrderDraft(), ...extra }),
  });
  // 404: wala na sa server ang order (nabura o luma ang token), kaya gagawa ng bago
  if (response.status === 404 && !retried) {
    useOrderStore().updateOrderDraft({ order_id: null, order_token: null });
    return saveServerOrder(extra, true);
  }
  if (!response.ok) throw new Error(`Save order request failed with status ${response.status}.`);
  return response.json();
}
