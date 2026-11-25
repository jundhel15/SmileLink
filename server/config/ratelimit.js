import crypto from "node:crypto";
import process from "node:process";
import { supabase } from "./supabase.js";

// Counters live in Supabase (server/sql/001_rate_limits.sql), because Vercel runs several copies of
// this server and they need to share them.

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Mobile networks put many customers behind one address, so the per-address limits are generous.
export const LIMITS = {
  createOrder: { max: 60, seconds: HOUR },
  saveOrder: { max: 120, seconds: 10 * MINUTE },
  payPerOrder: { max: 15, seconds: 10 * MINUTE },
  payPerAddress: { max: 60, seconds: HOUR },
  photoPerOrder: { max: 100, seconds: 10 * MINUTE },
  photoPerAddress: { max: 300, seconds: HOUR },
  unlockPerAddress: { max: 10, seconds: 15 * MINUTE },
  unlockPerSurprise: { max: 100, seconds: DAY },
};

// The caller's address, hashed so the table never holds a readable one.
export function addressKey(req) {
  // Vercel sets this header itself, so a visitor can't fake it. Elsewhere, only trust the connection.
  const forwarded = process.env.VERCEL && req.get("x-forwarded-for")?.split(",")[0].trim();
  let address = forwarded || req.socket.remoteAddress || "unknown";
  if (address.startsWith("::ffff:")) address = address.slice(7);
  // One home or phone gets a whole IPv6 /64, so count that as one address
  if (address.includes(":")) {
    const [head, tail = ""] = address.split("::");
    const start = head.split(":").filter(Boolean);
    const end = tail.split(":").filter(Boolean);
    const zeros = address.includes("::") ? Math.max(0, 8 - start.length - end.length) : 0;
    address = [...start, ...Array(zeros).fill("0"), ...end].slice(0, 4).join(":");
  }
  return crypto
    .createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "")
    .update(address)
    .digest("hex")
    .slice(0, 32);
}

async function countHit(key, { max, seconds }) {
  const { data, error } = await supabase.rpc("hit_rate_limit", {
    p_key: key,
    p_window_seconds: seconds,
  });
  // A counter problem must not stop customers from ordering or opening their surprise
  if (error) {
    console.error("[ratelimit] not counting, has server/sql/001_rate_limits.sql been run?", error.message);
    return 0;
  }
  const { total, retry_after: retryAfter } = data[0];
  return total > max ? retryAfter : 0;
}

// Counts one attempt against each [key, limit]. If any is used up, answers 429 and returns true.
export async function isLimited(res, checks) {
  const waits = await Promise.all(checks.map(([key, limit]) => countHit(key, limit)));
  const wait = Math.max(...waits);
  if (wait === 0) return false;

  const minutes = Math.ceil(wait / MINUTE);
  const time =
    minutes < 60
      ? `${minutes} minute${minutes === 1 ? "" : "s"}`
      : `${Math.ceil(minutes / 60)} hour${minutes > 60 ? "s" : ""}`;
  res.set("Retry-After", String(wait));
  res.status(429).json({ error: `Too many tries. Please wait ${time} and try again.` });
  return true;
}

export async function clearLimits(keys) {
  const { error } = await supabase.from("rate_limits").delete().in("key", keys);
  if (error) console.error("[ratelimit] couldn't clear:", error.message);
}
