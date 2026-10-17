const ORDER_DRAFT_KEY = "smilelink-order-draft";

export function readOrderDraft() {
  const savedDraft = localStorage.getItem(ORDER_DRAFT_KEY);
  if (!savedDraft) return {};

  const draft = JSON.parse(savedDraft);
  if (typeof draft !== "object" || draft === null || Array.isArray(draft)) {
    throw new Error("The saved order draft must be an object.");
  }
  return draft;
}

export function updateOrderDraft(updates) {
  const draft = { ...readOrderDraft(), ...updates };
  localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(draft));
  return draft;
}
