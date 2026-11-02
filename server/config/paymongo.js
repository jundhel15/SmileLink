import { Buffer } from "node:buffer";
import process from "node:process";

const PAYMONGO_API_URL = "https://api.paymongo.com/v1";

if (!process.env.PAYMONGO_SECRET_KEY) {
  throw new Error("PAYMONGO_SECRET_KEY is missing from server/.env");
}

// PayMongo uses Basic auth: the secret key as the username, with an empty password.
const authHeader = `Basic ${Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString("base64")}`;

export const paymongoPublicKey = process.env.PAYMONGO_PUBLIC_KEY;

// Calls the PayMongo API and returns the parsed JSON, or throws with PayMongo's error message.
export async function paymongo(path, { method = "GET", body } = {}) {
  const response = await fetch(`${PAYMONGO_API_URL}${path}`, {
    method,
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...(body && { body: JSON.stringify({ data: { attributes: body } }) }),
  });

  const json = await response.json();
  if (!response.ok) {
    const message = json.errors?.map((error) => error.detail).join(" ") || response.statusText;
    throw new Error(`PayMongo ${method} ${path} failed: ${message}`);
  }
  return json.data;
}
