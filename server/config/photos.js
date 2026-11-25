import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import { supabase } from "./supabase.js";

// Private bucket (server/sql/002_photos.sql). One folder per order: "<order id>/<photo id>".
const bucket = () => supabase.storage.from("order-photos");

// Long enough for one visit; the page gets fresh links every time it's opened
const LINK_SECONDS = 24 * 60 * 60;

// Starts with the upload time, so sorting by name keeps the customer's order
const PHOTO_ID_PATTERN = /^\d{14}-[0-9a-f-]{36}\.jpg$/;
export const isPhotoId = (id) => PHOTO_ID_PATTERN.test(id ?? "");

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

// The browser sends every photo as a JPEG, whatever the customer picked
export function isJpeg(data) {
  return Buffer.isBuffer(data) && data.length > 100 && data.subarray(0, 3).toString("hex") === "ffd8ff";
}

export async function listPhotoIds(orderId) {
  const { data, error } = await bucket().list(orderId, {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw new Error(`Couldn't list photos: ${error.message}`);
  return data.map((file) => file.name).filter(isPhotoId);
}

// Temporary links, in the same order as the ids
export async function photoLinks(orderId, ids) {
  if (ids.length === 0) return [];
  const { data, error } = await bucket().createSignedUrls(
    ids.map((id) => `${orderId}/${id}`),
    LINK_SECONDS,
  );
  if (error) throw new Error(`Couldn't link photos: ${error.message}`);
  return data
    .map((link, index) => ({ id: ids[index], url: link.signedUrl }))
    .filter((photo) => photo.url);
}

export async function savePhoto(orderId, data) {
  const id = `${String(Date.now()).padStart(14, "0")}-${crypto.randomUUID()}.jpg`;
  const { error } = await bucket().upload(`${orderId}/${id}`, data, { contentType: "image/jpeg" });
  if (error) {
    throw new Error(`Couldn't save a photo (has server/sql/002_photos.sql been run?): ${error.message}`);
  }
  return id;
}

export async function deletePhoto(orderId, id) {
  const { error } = await bucket().remove([`${orderId}/${id}`]);
  if (error) throw new Error(`Couldn't delete a photo: ${error.message}`);
}
