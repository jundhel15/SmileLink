import crypto from "node:crypto";
import { supabase } from "./supabase.js";
export let registerapp = null;

// Fields the client may save, per table. Anything else in the draft is ignored.
const ORDER_FIELDS = ["occasion", "template_id", "package_id", "is_group"];
const DELIVERY_FIELDS = [
  "recipient_name",
  "recipient_email",
  "sender_name",
  "sender_email",
  "send_copy",
  "delivery_mode",
  "scheduled_at",
];
const CONTENT_FIELDS = [
  "headline",
  "message",
  "sign_off",
  "music_track",
  "music_link",
  "video_link",
  "password_enabled",
  "password_hint",
];

// Only the hash is stored, so a leaked database does not give out working tokens.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function pick(source, fields) {
  return Object.fromEntries(fields.filter((field) => field in source).map((field) => [field, source[field]]));
}

// Updates the order's row in a child table, or inserts one if it does not exist yet.
async function saveChildRow(table, orderId, values) {
  if (Object.keys(values).length === 0) return null;

  const { data: existing, error: findError } = await supabase
    .from(table)
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();
  if (findError) return findError;

  const { error } = existing
    ? await supabase.from(table).update(values).eq("id", existing.id)
    : await supabase.from(table).insert({ ...values, order_id: orderId });
  return error;
}

// Token comes from the x-order-token header, or order_token in the body (the draft sends it there).
async function findAuthorizedOrder(req) {
  const token = req.get("x-order-token") || req.body?.order_token;
  if (!token) return null;

  const { data } = await supabase
    .from("orders")
    .select("id, order_status")
    .eq("id", req.params.id)
    .eq("access_token", hashToken(token))
    .maybeSingle();
  return data;
}

export function registerRoutes(app) {
  // Confirms Express handed us the app
  console.log("[apiservice] registerRoutes connected:", typeof app?.get === "function");

  // Test route: proves this file's routes are mounted
  app.get("/api/ping", (req, res) => {
    res.json({ ok: true, from: "apiservice.js" });
  });

  // Optional: also checks the Supabase connection
  app.get("/api/db-check", async (req, res) => {
    const { error } = await supabase.from("orders").select("*").limit(1);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, db: "connected" });
  });

  // Creates the order and its access token. The raw token is only ever sent back here.
  app.post("/api/orders", async (req, res) => {
    const accessToken = crypto.randomBytes(32).toString("hex");

    const { data, error } = await supabase
      .from("orders")
      .insert({
        ...pick(req.body ?? {}, ORDER_FIELDS),
        access_token: hashToken(accessToken),
      })
      .select("id")
      .single();
    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ order_id: data.id, access_token: accessToken });
  });

  // Saves the draft into orders, order_delivery and order_content.
  app.patch("/api/orders/:id", async (req, res) => {
    const order = await findAuthorizedOrder(req);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (order.order_status !== "draft") {
      return res.status(409).json({ error: "This order can no longer be edited." });
    }

    const draft = req.body ?? {};
    const content = pick(draft, CONTENT_FIELDS);
    if (draft.password_enabled && draft.password) content.password_hash = hashPassword(draft.password);
    if (draft.password_enabled === false) content.password_hash = null;

    const { error: orderError } = await supabase
      .from("orders")
      .update({ ...pick(draft, ORDER_FIELDS), updated_at: new Date().toISOString() })
      .eq("id", order.id);
    if (orderError) return res.status(500).json({ error: orderError.message });

    const childError =
      (await saveChildRow("order_delivery", order.id, pick(draft, DELIVERY_FIELDS))) ||
      (await saveChildRow("order_content", order.id, content));
    if (childError) return res.status(500).json({ error: childError.message });

    res.json({ ok: true, order_id: order.id });
  });

  registerapp = app;
}
