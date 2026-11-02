import crypto from "node:crypto";
import process from "node:process";
import { supabase } from "./supabase.js";
import { sendSmileLinkEmail } from "./email.js";
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
  return Object.fromEntries(
    fields.filter((field) => field in source).map((field) => [field, source[field]]),
  );
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
  console.log("[apiserver] registerRoutes connected:", typeof app?.get === "function");

  // Test route: proves this file's routes are mounted
  app.get("/api/ping", (req, res) => {
    res.json({ ok: true, from: "apiserver.js" });
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
    if (draft.password_enabled && draft.password)
      content.password_hash = hashPassword(draft.password);
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

  // Status for the processing and complete screens. The slug is the order id, shown only once paid.
  app.get("/api/orders/:id", async (req, res) => {
    const order = await findAuthorizedOrder(req);
    if (!order) return res.status(404).json({ error: "Order not found." });

    const { data: delivery } = await supabase
      .from("order_delivery")
      .select("scheduled_at")
      .eq("order_id", order.id)
      .maybeSingle();

    const isPaid = ["paid", "scheduled", "sent"].includes(order.order_status);
    res.json({
      order_id: order.id,
      order_status: order.order_status,
      link_slug: isPaid ? order.id : null,
      scheduled_at: delivery?.scheduled_at ?? null,
    });
  });

  // DEV ONLY: stands in for the PayMongo webhook so "I've completed the payment" marks the order
  // paid and emails the link. Only runs when DEV_FAKE_PAYMENT=true; remove once the webhook exists.
  app.post("/api/orders/:id/dev-confirm", async (req, res) => {
    if (process.env.DEV_FAKE_PAYMENT !== "true") {
      return res.status(404).json({ error: "Not found." });
    }

    const order = await findAuthorizedOrder(req);
    if (!order) return res.status(404).json({ error: "Order not found." });
    // "paid" is allowed so a failed email can be retried
    if (!["draft", "paid"].includes(order.order_status)) {
      return res.status(409).json({ error: "This order was already processed." });
    }

    const { data: delivery, error: deliveryError } = await supabase
      .from("order_delivery")
      .select("recipient_name, recipient_email, sender_name, delivery_mode")
      .eq("order_id", order.id)
      .maybeSingle();
    if (deliveryError) return res.status(500).json({ error: deliveryError.message });
    if (!delivery?.recipient_email) {
      return res.status(400).json({ error: "The recipient email is missing." });
    }

    const setStatus = (order_status) =>
      supabase
        .from("orders")
        .update({ order_status, updated_at: new Date().toISOString() })
        .eq("id", order.id);

    const { error: paidError } = await setStatus("paid");
    if (paidError) return res.status(500).json({ error: paidError.message });

    // There is no scheduler yet, so scheduled orders stay "scheduled" and are not emailed.
    if (delivery.delivery_mode === "scheduled") {
      await setStatus("scheduled");
      return res.json({ ok: true, order_status: "scheduled", link_slug: order.id });
    }

    const link = `${process.env.APP_URL || "http://localhost:5173"}/s/${order.id}`;
    try {
      await sendSmileLinkEmail({
        to: delivery.recipient_email,
        recipientName: delivery.recipient_name,
        senderName: delivery.sender_name,
        link,
      });
    } catch (error) {
      // The order stays "paid" so the email can be retried without charging again.
      console.error("[email]", error.message);
      return res.status(502).json({ error: "Payment saved, but the email could not be sent." });
    }

    const { error: sentError } = await setStatus("sent");
    if (sentError) return res.status(500).json({ error: sentError.message });

    res.json({ ok: true, order_status: "sent", link_slug: order.id });
  });

  registerapp = app;
}
