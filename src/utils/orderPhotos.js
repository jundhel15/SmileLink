import { ensureServerOrder, OrderMessageError, readOrderDraft, throwIfRefused } from "@/utils/orderDraft";
import { useOrderStore } from "@/stores/order";

const MAX_PHOTO_SIDE = 1600;

function photosUrl(orderId, photoId = "") {
  return `/api/orders/${encodeURIComponent(orderId)}/photos${photoId && `/${encodeURIComponent(photoId)}`}`;
}

function tokenHeader() {
  return { "x-order-token": readOrderDraft().order_token ?? "" };
}

// Pinapaliit ang litrato at ginagawang JPEG; natatanggal din ang GPS at ibang nakatagong datos
export async function resizePhoto(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  context.fillStyle = "#fff"; // walang transparent sa JPEG
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("The photo could not be converted.");
  return blob;
}

// Mga litratong nasa server na. Walang laman kapag wala pang order o hindi na ma-edit ang luma.
export async function loadPhotos() {
  const { order_id: orderId, order_token: token } = readOrderDraft();
  if (!orderId || !token) return [];
  const response = await fetch(photosUrl(orderId), { headers: tokenHeader() });
  if (response.status === 404 || response.status === 409) return [];
  if (!response.ok) throw new Error(`Load photos request failed with status ${response.status}.`);
  const { photos } = await response.json();
  return photos.map((photo) => ({ ...photo, orderId }));
}

// Ibinabalik ang { id, orderId } ng na-save na litrato
export async function uploadPhoto(blob, retried = false) {
  const { order_id: orderId } = await ensureServerOrder();
  const response = await fetch(photosUrl(orderId), {
    method: "POST",
    headers: { "Content-Type": "image/jpeg", ...tokenHeader() },
    body: blob,
  });
  // 404: wala na ang order; 409: bayad na. Bagong order, kapareho ng saveServerOrder
  if ((response.status === 404 || response.status === 409) && !retried) {
    useOrderStore().updateOrderDraft({ order_id: null, order_token: null, password_set: false });
    return uploadPhoto(blob, true);
  }
  await throwIfRefused(response);
  if (response.status === 413) throw new OrderMessageError("That photo is too large.");
  if (!response.ok) throw new Error(`Upload photo request failed with status ${response.status}.`);
  const { id } = await response.json();
  return { id, orderId };
}

export async function removeSavedPhoto({ id, orderId }) {
  const response = await fetch(photosUrl(orderId, id), { method: "DELETE", headers: tokenHeader() });
  if (!response.ok && response.status !== 404) {
    throw new Error(`Delete photo request failed with status ${response.status}.`);
  }
}
