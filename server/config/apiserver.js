import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import process from "node:process";
import { supabase } from "./supabase.js";
import { sendSmileLinkEmail } from "./email.js";
import { paymongo } from "./paymongo.js";
import { PACKAGES } from "../../src/shared/catalog.js";
export let registerapp = null;

// Statuses where the customer can still edit and (re)start a checkout.
const UNPAID_STATUSES = ["draft", "pending_payment", "failed"];

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

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored ?? "").split(":");
  if (!salt || !hash) return false;
  const attempt = crypto.scryptSync(String(password ?? ""), salt, 64);
  return crypto.timingSafeEqual(attempt, Buffer.from(hash, "hex"));
}

// Loads a paid surprise by its slug (the order id). Scheduled ones open only after their send time.
async function findSurprise(slug) {
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_status, occasion, template_id, package_id")
    .eq("id", slug)
    .maybeSingle();
  if (!order || !["paid", "scheduled", "sent"].includes(order.order_status)) return null;

  const [{ data: delivery }, { data: content }] = await Promise.all([
    supabase
      .from("order_delivery")
      .select("recipient_name, sender_name, scheduled_at")
      .eq("order_id", order.id)
      .maybeSingle(),
    supabase.from("order_content").select("*").eq("order_id", order.id).maybeSingle(),
  ]);
  if (order.order_status === "scheduled" && new Date(delivery?.scheduled_at) > new Date()) {
    return null;
  }
  return { order, delivery: delivery ?? {}, content: content ?? {} };
}

// What the recipient sees. Never includes emails, tokens or the password hash.
function surpriseBody({ order, delivery, content }) {
  return {
    occasion: order.occasion,
    template_id: order.template_id,
    package_id: order.package_id,
    recipient_name: delivery.recipient_name,
    sender_name: delivery.sender_name,
    ...pick(content, ["headline", "message", "sign_off", "music_track", "music_link", "video_link"]),
  };
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

// Marks the order paid, then emails the link (or leaves it "scheduled"). Safe to call again
// for an order that is already "paid", so a failed email can be retried without charging again.
async function fulfillPaidOrder(orderId) {
  const { data: delivery, error: deliveryError } = await supabase
    .from("order_delivery")
    .select("recipient_name, recipient_email, sender_name, delivery_mode")
    .eq("order_id", orderId)
    .maybeSingle();
  if (deliveryError) return { status: 500, error: deliveryError.message };

  const setStatus = (order_status) =>
    supabase
      .from("orders")
      .update({ order_status, updated_at: new Date().toISOString() })
      .eq("id", orderId);

  const { error: paidError } = await setStatus("paid");
  if (paidError) return { status: 500, error: paidError.message };

  if (!delivery?.recipient_email) {
    return { status: 400, error: "Payment saved, but the recipient email is missing." };
  }

  // There is no scheduler yet, so scheduled orders stay "scheduled" and are not emailed.
  if (delivery.delivery_mode === "scheduled") {
    await setStatus("scheduled");
    return { status: 200, order_status: "scheduled" };
  }

  const link = `${process.env.APP_URL || "http://localhost:5173"}/s/${orderId}`;
  try {
    await sendSmileLinkEmail({
      to: delivery.recipient_email,
      recipientName: delivery.recipient_name,
      senderName: delivery.sender_name,
      link,
    });
  } catch (error) {
    console.error("[email]", error.message);
    return { status: 502, error: "Payment saved, but the email could not be sent." };
  }

  const { error: sentError } = await setStatus("sent");
  if (sentError) return { status: 500, error: sentError.message };
  return { status: 200, order_status: "sent" };
}

// PayMongo-Signature: "t=<timestamp>,te=<test sig>,li=<live sig>".
// The signature is HMAC-SHA256 of "<timestamp>.<raw body>" with the webhook's secret key.
function verifyPaymongoSignature(header, rawBody, livemode) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret || !header || !rawBody) return false;

  const parts = Object.fromEntries(
    String(header)
      .split(",")
      .map((part) => part.trim().split("=")),
  );
  const signature = livemode ? parts.li : parts.te;
  if (!parts.t || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${parts.t}.${rawBody.toString("utf8")}`)
    .digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
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
    if (!UNPAID_STATUSES.includes(order.order_status)) {
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
    if (![...UNPAID_STATUSES, "paid"].includes(order.order_status)) {
      return res.status(409).json({ error: "This order was already processed." });
    }

    const result = await fulfillPaidOrder(order.id);
    if (result.error) return res.status(result.status).json({ error: result.error });
    res.json({ ok: true, order_status: result.order_status, link_slug: order.id });
  });

  // Creates a PayMongo Checkout Session (GCash or card). The amount comes from the server catalog,
  // never from the browser. The order is only marked paid later, by the verified webhook.
  app.post("/api/checkout-sessions", async (req, res) => {
    req.params.id = req.body?.order_id;
    const order = await findAuthorizedOrder(req);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (!UNPAID_STATUSES.includes(order.order_status)) {
      return res.status(409).json({ error: "This order was already paid." });
    }

    const [{ data: details, error: detailsError }, { data: delivery }] = await Promise.all([
      supabase.from("orders").select("package_id").eq("id", order.id).single(),
      supabase
        .from("order_delivery")
        .select("sender_name, sender_email")
        .eq("order_id", order.id)
        .maybeSingle(),
    ]);
    if (detailsError) return res.status(500).json({ error: detailsError.message });

    const selectedPackage = PACKAGES[details.package_id];
    if (!selectedPackage) return res.status(400).json({ error: "Choose a package first." });

    const methods = { gcash: ["gcash"], card: ["card"] };
    const paymentMethodTypes = methods[req.body?.payment_method] ?? ["gcash", "card"];

    // Return to the address the customer is browsing from, so their saved draft is still there
    const origin = /^https?:\/\/[^/]+$/.test(req.get("origin") ?? "")
      ? req.get("origin")
      : process.env.APP_URL || "http://localhost:5173";

    try {
      const session = await paymongo("/checkout_sessions", {
        method: "POST",
        body: {
          line_items: [
            {
              name: `SmileLink ${selectedPackage.name}`,
              amount: Math.round(selectedPackage.price * 100), // centavos
              currency: "PHP",
              quantity: 1,
            },
          ],
          payment_method_types: paymentMethodTypes,
          reference_number: order.id,
          description: `SmileLink order ${order.id}`,
          metadata: { order_id: order.id },
          ...(delivery?.sender_email && {
            billing: { name: delivery.sender_name || "SmileLink customer", email: delivery.sender_email },
          }),
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          success_url: `${origin}/order/${order.id}/processing`,
          cancel_url: `${origin}/create/review`,
        },
      });

      const { error: statusError } = await supabase
        .from("orders")
        .update({ order_status: "pending_payment", updated_at: new Date().toISOString() })
        .eq("id", order.id);
      if (statusError) console.error("[checkout] couldn't set pending_payment:", statusError.message);

      res.json({ checkout_url: session.attributes.checkout_url });
    } catch (error) {
      console.error("[paymongo]", error.message);
      res.status(502).json({ error: "Couldn't open the PayMongo checkout." });
    }
  });

  // PayMongo calls this. Only a correctly signed checkout_session.payment.paid marks an order paid.
  // Answering non-2xx makes PayMongo retry, which is what we want if the email failed.
  app.post("/api/webhooks/paymongo", async (req, res) => {
    const event = req.body?.data?.attributes;
    if (!verifyPaymongoSignature(req.get("paymongo-signature"), req.rawBody, event?.livemode)) {
      console.warn("[webhook] rejected: bad or missing signature");
      return res.status(401).json({ error: "Invalid signature." });
    }

    const resource = event?.data?.attributes ?? {};
    const orderId = resource.metadata?.order_id || resource.reference_number;
    console.log(`[webhook] ${event?.type} for order ${orderId ?? "(none)"}`);

    if (event?.type === "checkout_session.payment.paid") {
      const { data: order } = await supabase
        .from("orders")
        .select("id, order_status, package_id")
        .eq("id", orderId)
        .maybeSingle();
      if (!order) return res.json({ ignored: "unknown order" });
      // A repeat delivery of an event we already handled
      if (["scheduled", "sent"].includes(order.order_status)) return res.json({ ok: true });

      const paidCentavos = (resource.payments ?? [])
        .filter((payment) => payment.attributes?.status === "paid")
        .reduce((sum, payment) => sum + (payment.attributes.amount ?? 0), 0);
      const priceCentavos = Math.round((PACKAGES[order.package_id]?.price ?? 0) * 100);
      if (paidCentavos < priceCentavos) {
        console.error(`[webhook] order ${order.id}: paid ${paidCentavos}, expected ${priceCentavos}`);
        return res.json({ ignored: "amount mismatch" });
      }

      const result = await fulfillPaidOrder(order.id);
      if (result.error) console.error(`[webhook] order ${order.id}: ${result.error}`);
      // 500 only when the email failed, so PayMongo retries and the email is resent
      return res.status(result.status === 502 ? 500 : 200).json({ ok: !result.error });
    }

    if (event?.type === "payment.failed" && orderId) {
      await supabase
        .from("orders")
        .update({ order_status: "failed", updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .eq("order_status", "pending_payment");
    }

    res.json({ ok: true });
  });

  // Recipient page. With the password lock on, only the hint is sent until /unlock succeeds.
  app.get("/api/surprise/:slug", async (req, res) => {
    const surprise = await findSurprise(req.params.slug);
    if (!surprise) return res.status(404).json({ error: "Surprise not found." });

    if (surprise.content.password_enabled && surprise.content.password_hash) {
      return res.json({
        locked: true,
        password_hint: surprise.content.password_hint ?? "",
        recipient_name: surprise.delivery.recipient_name,
      });
    }
    res.json({ locked: false, ...surpriseBody(surprise) });
  });

  app.post("/api/surprise/:slug/unlock", async (req, res) => {
    const surprise = await findSurprise(req.params.slug);
    if (!surprise) return res.status(404).json({ error: "Surprise not found." });

    const { password_enabled: enabled, password_hash: hash } = surprise.content;
    if (enabled && hash && !verifyPassword(req.body?.password, hash)) {
      return res.status(401).json({ error: "That password isn't right. Try again." });
    }
    res.json({ locked: false, ...surpriseBody(surprise) });
  });

  registerapp = app;
}
