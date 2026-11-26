import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import process from "node:process";
import express from "express";
import { supabase } from "./supabase.js";
import { sendOwnerAlertEmail, sendSenderCopyEmail, sendSmileLinkEmail } from "./email.js";
import { paymongo } from "./paymongo.js";
import {
  closeOpenPayments,
  isCurrentPayment,
  markPaymentPaid,
  recordPayment,
} from "./payments.js";
import {
  deletePhoto,
  isJpeg,
  isPhotoId,
  listPhotoIds,
  MAX_PHOTO_BYTES,
  photoLinks,
  savePhoto,
} from "./photos.js";
import { addressKey, clearLimits, isLimited, LIMITS } from "./ratelimit.js";
import {
  cleanFields,
  draftProblem,
  isEmail,
  isMusicLink,
  isVideoLink,
  unpayableReason,
} from "./validate.js";
import { DEFAULT_PACKAGE_ID, PACKAGES } from "../../src/shared/catalog.js";
export let registerapp = null;

// Statuses where the customer can still edit and (re)start a checkout.
const UNPAID_STATUSES = ["draft", "pending_payment", "failed"];

const UUID_PATTERN = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

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
  "template_content",
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
  if (!UUID_PATTERN.test(slug)) return null;
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_status, occasion, template_id, package_id")
    .eq("id", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!order || !["paid", "scheduled", "sent"].includes(order.order_status)) return null;

  const [
    { data: delivery, error: deliveryError },
    { data: content, error: contentError },
  ] = await Promise.all([
    supabase
      .from("order_delivery")
      .select("recipient_name, sender_name, scheduled_at")
      .eq("order_id", order.id)
      .maybeSingle(),
    supabase.from("order_content").select("*").eq("order_id", order.id).maybeSingle(),
  ]);
  // Without the content we couldn't tell whether there's a password, so don't open it
  if (deliveryError || contentError) throw new Error((deliveryError ?? contentError).message);
  if (order.order_status === "scheduled" && new Date(delivery?.scheduled_at) > new Date()) {
    return null;
  }
  return { order, delivery: delivery ?? {}, content: content ?? {} };
}

// Links to the photos the package includes, as [{ id, url }]. A storage problem must not stop the surprise opening.
async function surprisePhotos(order) {
  try {
    const ids = await listPhotoIds(order.id);
    return await photoLinks(order.id, ids.slice(0, PACKAGES[order.package_id]?.max_photos ?? 0));
  } catch (error) {
    console.error(`[photos] surprise ${order.id}:`, error.message);
    return [];
  }
}

// What the recipient sees. Never includes emails, tokens or the password hash.
async function surpriseBody({ order, delivery, content }) {
  const limits = PACKAGES[order.package_id];
  const photos = await surprisePhotos(order);
  // only when it was made for this template (the customer may have switched templates since)
  const templateContent =
    content.template_content?.template === order.template_id ? content.template_content : null;
  return {
    photos: photos.map((photo) => photo.url),
    ...(templateContent && {
      template_content: templateContent,
      photo_urls: Object.fromEntries(photos.map((photo) => [photo.id, photo.url])),
    }),
    occasion: order.occasion,
    template_id: order.template_id,
    package_id: order.package_id,
    recipient_name: delivery.recipient_name,
    sender_name: delivery.sender_name,
    ...pick(content, ["headline", "message", "sign_off"]),
    ...(limits?.has_music && pick(content, ["music_track"])),
    ...(limits?.has_music && isMusicLink(content.music_link) && pick(content, ["music_link"])),
    ...(limits?.has_video && isVideoLink(content.video_link) && pick(content, ["video_link"])),
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
  if (typeof token !== "string" || !token || !UUID_PATTERN.test(req.params.id ?? "")) return null;

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_status, occasion, template_id, package_id")
    .eq("id", req.params.id)
    .eq("access_token", hashToken(token))
    .maybeSingle();
  // Not "not found": the browser would start a second order for something already being paid
  if (error) throw new Error(error.message);
  return data;
}

// Loads what a payment needs and checks the order is complete, whatever the browser allowed.
async function checkPayable(order, expectedPhotos) {
  const [
    { data: delivery, error: deliveryError },
    { data: content, error: contentError },
    photoIds,
  ] = await Promise.all([
    supabase
      .from("order_delivery")
      .select(
        "recipient_name, recipient_email, sender_name, sender_email, delivery_mode, scheduled_at",
      )
      .eq("order_id", order.id)
      .maybeSingle(),
    supabase
      .from("order_content")
      .select("message, music_track, music_link, video_link, password_enabled, password_hash")
      .eq("order_id", order.id)
      .maybeSingle(),
    listPhotoIds(order.id),
  ]);
  if (deliveryError || contentError) throw new Error((deliveryError ?? contentError).message);
  return {
    delivery,
    problem: unpayableReason(order, delivery, content, photoIds.length, expectedPhotos),
  };
}

// Emails the sender their own copy of the link. The order is already safe, so a failure is only logged.
async function emailSenderCopy(delivery, link, scheduledAt) {
  if (!delivery.send_copy || !isEmail(delivery.sender_email)) return;
  try {
    await sendSenderCopyEmail({
      to: delivery.sender_email.trim(),
      senderName: delivery.sender_name,
      recipientName: delivery.recipient_name,
      link,
      scheduledAt,
    });
  } catch (error) {
    console.error("[email] sender copy:", error.message);
  }
}

// How long one attempt may hold the right to send the email before a retry may take over
const EMAIL_CLAIM_MS = 5 * 60 * 1000;

// Marks the order paid, then emails the link (or leaves it "scheduled"). Safe to call again for an
// order that is already "paid": sent_at lets only one attempt send, so retries don't email twice.
async function fulfillPaidOrder(orderId, packageId) {
  const { data: delivery, error: deliveryError } = await supabase
    .from("order_delivery")
    .select(
      "id, recipient_name, recipient_email, sender_name, sender_email, send_copy, delivery_mode, scheduled_at",
    )
    .eq("order_id", orderId)
    .maybeSingle();
  if (deliveryError) return { status: 500, error: deliveryError.message };

  // package_id becomes the one that was paid for, even if the draft changed after the QR was shown
  const { data: paidRows, error: paidError } = await supabase
    .from("orders")
    .update({
      order_status: "paid",
      ...(packageId && { package_id: packageId }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .not("order_status", "in", "(scheduled,sent)")
    .select("id");
  if (paidError) return { status: 500, error: paidError.message };
  if (paidRows.length === 0) return { status: 200 }; // another attempt already finished

  // Checked again: it can be edited between showing the QR and paying
  if (!isEmail(delivery?.recipient_email)) {
    return { status: 400, error: "Payment saved, but the recipient email isn't valid." };
  }

  // Moves the order on from "paid". Returns true only for the attempt that made the change.
  const finishAs = async (order_status) => {
    const { data, error } = await supabase
      .from("orders")
      .update({ order_status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("order_status", "paid")
      .select("id");
    if (error) throw new Error(error.message);
    return data.length > 0;
  };

  const link = `${process.env.APP_URL || "http://localhost:5173"}/s/${orderId}`;

  // There is no scheduler yet, so scheduled orders stay "scheduled" and are not emailed.
  if (delivery.delivery_mode === "scheduled") {
    try {
      if (await finishAs("scheduled")) await emailSenderCopy(delivery, link, delivery.scheduled_at);
    } catch (error) {
      return { status: 500, error: error.message };
    }
    return { status: 200, order_status: "scheduled" };
  }

  const claimedAt = new Date();
  const staleBefore = new Date(claimedAt.getTime() - EMAIL_CLAIM_MS).toISOString();
  const { data: claimed, error: claimError } = await supabase
    .from("order_delivery")
    .update({ sent_at: claimedAt.toISOString() })
    .eq("id", delivery.id)
    .or(`sent_at.is.null,sent_at.lt.${staleBefore}`)
    .select("id");
  if (claimError) return { status: 500, error: claimError.message };
  if (claimed.length === 0) return { status: 503, error: "The email is already being sent." };

  try {
    await sendSmileLinkEmail({
      to: delivery.recipient_email.trim(),
      recipientName: delivery.recipient_name,
      senderName: delivery.sender_name,
      link,
    });
  } catch (error) {
    console.error("[email]", error.message);
    await supabase.from("order_delivery").update({ sent_at: null }).eq("id", delivery.id);
    return { status: 502, error: "Payment saved, but the email could not be sent." };
  }

  try {
    await finishAs("sent");
  } catch (error) {
    // The email went out, so a retry would only send it twice. "paid" still opens the link.
    console.error(`[order] ${orderId} was emailed but couldn't be set to sent:`, error.message);
  }
  await emailSenderCopy(delivery, link);
  return { status: 200, order_status: "sent" };
}

// Tells the shop owner about a payment that needs a person (refund, missing email). Also logged.
async function alertOwner(subject, details) {
  console.error(`[alert] ${subject}`, JSON.stringify(details));
  try {
    await sendOwnerAlertEmail({ subject, details });
  } catch (error) {
    console.error("[alert] email failed:", error.message);
  }
}

// Features that aren't in the chosen package are never stored.
function enforcePackage(order, content, limits) {
  if (!limits) return;
  if (!limits.has_group) order.is_group = false;
  if (!limits.has_music) Object.assign(content, { music_track: null, music_link: null });
  if (!limits.has_video) content.video_link = null;
  if (!limits.has_password) {
    Object.assign(content, { password_enabled: false, password_hash: null, password_hint: null });
  }
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

  // Creates the order and its access token. The raw token is only ever sent back here.
  app.post("/api/orders", async (req, res) => {
    if (await isLimited(res, [[`order:${addressKey(req)}`, LIMITS.createOrder]])) return;
    const draft = req.body ?? {};
    const problem = draftProblem(draft);
    if (problem) return res.status(400).json({ error: problem });

    const accessToken = crypto.randomBytes(32).toString("hex");

    const { data, error } = await supabase
      .from("orders")
      .insert({
        ...cleanFields(pick(draft, ORDER_FIELDS)),
        access_token: hashToken(accessToken),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    res.status(201).json({ order_id: data.id, access_token: accessToken });
  });

  // Saves the draft into orders, order_delivery and order_content.
  app.patch("/api/orders/:id", async (req, res) => {
    const order = await findAuthorizedOrder(req);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (!UNPAID_STATUSES.includes(order.order_status)) {
      return res.status(409).json({ error: "This order can no longer be edited." });
    }

    if (await isLimited(res, [[`save:${order.id}`, LIMITS.saveOrder]])) return;

    const draft = req.body ?? {};
    const problem = draftProblem(draft);
    if (problem) return res.status(400).json({ error: problem });

    const orderFields = cleanFields(pick(draft, ORDER_FIELDS));
    const packageId = orderFields.package_id ?? order.package_id;
    const content = cleanFields(pick(draft, CONTENT_FIELDS));
    if (draft.password_enabled && draft.password)
      content.password_hash = hashPassword(draft.password);
    if (draft.password_enabled === false) content.password_hash = null;
    enforcePackage(orderFields, content, PACKAGES[packageId]);

    // Checked again here, in case the webhook marked the order paid in the meantime
    const { data: saved, error: orderError } = await supabase
      .from("orders")
      .update({ ...orderFields, updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .in("order_status", UNPAID_STATUSES)
      .select("id");
    if (orderError) throw new Error(orderError.message);
    if (saved.length === 0) {
      return res.status(409).json({ error: "This order can no longer be edited." });
    }

    const childError =
      (await saveChildRow("order_delivery", order.id, cleanFields(pick(draft, DELIVERY_FIELDS)))) ||
      (await saveChildRow("order_content", order.id, content));
    if (childError) throw new Error(childError.message);

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

  // Photos can only be seen and changed here while the order can still be edited.
  async function editableOrder(req, res, next) {
    const order = await findAuthorizedOrder(req);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (!UNPAID_STATUSES.includes(order.order_status)) {
      return res.status(409).json({ error: "This order can no longer be edited." });
    }
    res.locals.order = order;
    next();
  }

  app.get("/api/orders/:id/photos", editableOrder, async (req, res) => {
    const { order } = res.locals;
    res.json({ photos: await photoLinks(order.id, await listPhotoIds(order.id)) });
  });

  // One JPEG per request. Checked before the body is read, so strangers can't send large files.
  app.post(
    "/api/orders/:id/photos",
    editableOrder,
    async (req, res, next) => {
      const { order } = res.locals;
      if (await isLimited(res, [[`photo:${order.id}`, LIMITS.photoPerOrder]])) return;
      if (await isLimited(res, [[`photo:${addressKey(req)}`, LIMITS.photoPerAddress]])) return;
      next();
    },
    express.raw({ type: "image/jpeg", limit: MAX_PHOTO_BYTES }),
    async (req, res) => {
      const { order } = res.locals;
      if (!isJpeg(req.body)) return res.status(400).json({ error: "That file isn't a photo we can use." });

      const max = (PACKAGES[order.package_id] ?? PACKAGES[DEFAULT_PACKAGE_ID]).max_photos;
      const tooMany = { error: `Your package allows ${max} photos.` };
      if ((await listPhotoIds(order.id)).length >= max) return res.status(400).json(tooMany);

      const id = await savePhoto(order.id, req.body);
      // Two uploads at the same moment could both pass the check above
      if ((await listPhotoIds(order.id)).length > max) {
        await deletePhoto(order.id, id);
        return res.status(400).json(tooMany);
      }
      res.status(201).json({ id });
    },
  );

  app.delete("/api/orders/:id/photos/:photoId", editableOrder, async (req, res) => {
    if (!isPhotoId(req.params.photoId)) return res.status(404).json({ error: "Photo not found." });
    await deletePhoto(res.locals.order.id, req.params.photoId);
    res.json({ ok: true });
  });

  // Creates a PayMongo Checkout Session (GCash or card). The amount comes from the server catalog,
  // never from the browser. The order is only marked paid later, by the verified webhook.
  app.post("/api/checkout-sessions", async (req, res) => {
    req.params.id = req.body?.order_id;
    const order = await findAuthorizedOrder(req);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (await isLimited(res, [[`pay:${order.id}`, LIMITS.payPerOrder]])) return;
    if (await isLimited(res, [[`pay:${addressKey(req)}`, LIMITS.payPerAddress]])) return;
    if (!UNPAID_STATUSES.includes(order.order_status)) {
      return res.status(409).json({ error: "This order was already paid." });
    }

    const { delivery, problem } = await checkPayable(order, req.body?.photo_count);
    if (problem) return res.status(400).json(problem);
    const selectedPackage = PACKAGES[order.package_id];

    // qrph shows a QR on PayMongo's page that GCash, Maya or any bank app can scan
    const methods = { gcash: ["gcash"], qrph: ["qrph"], card: ["card"] };
    const paymentMethodTypes = methods[req.body?.payment_method] ?? ["gcash", "qrph", "card"];

    // Return to the address the customer is browsing from, so their saved draft is still there
    const origin = /^https?:\/\/[^/]+$/.test(req.get("origin") ?? "")
      ? req.get("origin")
      : process.env.APP_URL || "http://localhost:5173";

    const amount = Math.round(selectedPackage.price * 100); // centavos
    try {
      // Any earlier QR, GCash link or checkout stops working, so the customer can't pay twice
      if (!(await closeOpenPayments(order.id))) {
        return res.status(409).json({ error: "A payment for this order is already being confirmed." });
      }
      const session = await paymongo("/checkout_sessions", {
        method: "POST",
        body: {
          line_items: [
            {
              name: `SmileLink ${selectedPackage.name}`,
              amount,
              currency: "PHP",
              quantity: 1,
            },
          ],
          payment_method_types: paymentMethodTypes,
          reference_number: order.id,
          description: `SmileLink order ${order.id}`,
          metadata: { order_id: order.id, package_id: selectedPackage.id },
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
      await recordPayment({
        orderId: order.id,
        paymongoId: session.id,
        method: paymentMethodTypes.join(","),
        amount,
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

  // Direct GCash payment without PayMongo's checkout page. "qrph" returns a QR image GCash can scan
  // (shown on our own page); "gcash" returns a link that opens GCash on a phone. The amount comes
  // from the server catalog, and the order is only marked paid later, by the verified webhook.
  app.post("/api/payment-intents", async (req, res) => {
    req.params.id = req.body?.order_id;
    const order = await findAuthorizedOrder(req);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (await isLimited(res, [[`pay:${order.id}`, LIMITS.payPerOrder]])) return;
    if (await isLimited(res, [[`pay:${addressKey(req)}`, LIMITS.payPerAddress]])) return;
    if (!UNPAID_STATUSES.includes(order.order_status)) {
      return res.status(409).json({ error: "This order was already paid." });
    }

    const type = req.body?.payment_method === "qrph" ? "qrph" : "gcash";
    const { delivery, problem } = await checkPayable(order, req.body?.photo_count);
    if (problem) return res.status(400).json(problem);
    const selectedPackage = PACKAGES[order.package_id];

    const origin = /^https?:\/\/[^/]+$/.test(req.get("origin") ?? "")
      ? req.get("origin")
      : process.env.APP_URL || "http://localhost:5173";

    const amount = Math.round(selectedPackage.price * 100); // centavos
    try {
      // Any earlier QR, GCash link or checkout stops working, so the customer can't pay twice
      if (!(await closeOpenPayments(order.id))) {
        return res.status(409).json({ error: "A payment for this order is already being confirmed." });
      }
      const intent = await paymongo("/payment_intents", {
        method: "POST",
        body: {
          amount,
          currency: "PHP",
          payment_method_allowed: [type],
          description: `SmileLink ${selectedPackage.name} (order ${order.id})`,
          statement_descriptor: "SmileLink",
          // flow marks intents made here, so the webhook doesn't also act on checkout-session payments
          // package_id is what this payment buys, even if the draft changes later
          metadata: { order_id: order.id, package_id: selectedPackage.id, flow: "direct" },
        },
      });
      await recordPayment({ orderId: order.id, paymongoId: intent.id, method: type, amount });
      const method = await paymongo("/payment_methods", {
        method: "POST",
        body: {
          type,
          // PayMongo's default is 30 minutes
          ...(type === "qrph" && { expiry_seconds: 5 * 60 }),
          billing: {
            name: delivery?.sender_name || "SmileLink customer",
            ...(delivery?.sender_email && { email: delivery.sender_email }),
          },
        },
      });
      const attached = await paymongo(`/payment_intents/${intent.id}/attach`, {
        method: "POST",
        body: {
          payment_method: method.id,
          client_key: intent.attributes.client_key,
          return_url: `${origin}/order/${order.id}/processing`,
        },
      });

      const { error: statusError } = await supabase
        .from("orders")
        .update({ order_status: "pending_payment", updated_at: new Date().toISOString() })
        .eq("id", order.id);
      if (statusError) console.error("[payment] couldn't set pending_payment:", statusError.message);

      const next = attached.attributes.next_action;
      if (next?.type === "consume_qr" && next.code?.image_url) {
        return res.json({
          kind: "qr",
          image: next.code.image_url,
          expires_at: next.code.expires_at,
          reference: intent.id,
        });
      }
      if (next?.type === "redirect" && next.redirect?.url) {
        return res.json({ kind: "redirect", url: next.redirect.url, reference: intent.id });
      }
      throw new Error(`Unexpected next action: ${next?.type ?? "none"}`);
    } catch (error) {
      console.error("[paymongo]", error.message);
      res.status(502).json({ error: "Couldn't start the GCash payment." });
    }
  });

  // PayMongo calls this. Only a correctly signed checkout_session.payment.paid marks an order paid.
  // Answering non-2xx makes PayMongo retry, which is what we want if the database or email failed.
  app.post("/api/webhooks/paymongo", async (req, res) => {
    const event = req.body?.data?.attributes;
    if (!verifyPaymongoSignature(req.get("paymongo-signature"), req.rawBody, event?.livemode)) {
      console.warn("[webhook] rejected: bad or missing signature");
      return res.status(401).json({ error: "Invalid signature." });
    }

    const resource = event?.data?.attributes ?? {};
    let orderId = resource.metadata?.order_id || resource.reference_number;

    // Direct GCash/QR payments (POST /api/payment-intents) arrive as payment.paid / payment.failed.
    // Their order id is on the payment intent. Checkout sessions also send payment.paid, but those
    // intents lack flow "direct", so they're left to checkout_session.payment.paid below.
    let isDirect = false;
    let paymongoId = event?.data?.id;
    let packageId = resource.metadata?.package_id;
    let expectedCentavos;
    if (["payment.paid", "payment.failed"].includes(event?.type) && resource.payment_intent_id) {
      try {
        const intent = await paymongo(`/payment_intents/${resource.payment_intent_id}`);
        if (intent.attributes.metadata?.flow === "direct") {
          isDirect = true;
          orderId = intent.attributes.metadata.order_id;
          paymongoId = intent.id;
          packageId = intent.attributes.metadata.package_id;
          expectedCentavos = intent.attributes.amount;
        }
      } catch (error) {
        console.error("[webhook] couldn't read payment intent:", error.message);
        return res.status(500).json({ error: "Try again." }); // PayMongo retries
      }
    }
    console.log(`[webhook] ${event?.type} for order ${orderId ?? "(none)"}${isDirect ? " (direct)" : ""}`);

    const isPaidEvent =
      event?.type === "checkout_session.payment.paid" || (event?.type === "payment.paid" && isDirect);
    if (isPaidEvent) {
      if (!UUID_PATTERN.test(orderId ?? "")) return res.json({ ignored: "not a SmileLink order" });
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, order_status, package_id")
        .eq("id", orderId)
        .maybeSingle();
      if (orderError) {
        console.error("[webhook] couldn't read the order:", orderError.message);
        return res.status(500).json({ error: "Try again." }); // PayMongo retries
      }
      if (!order) {
        await alertOwner("Payment received for an order that doesn't exist", { orderId, paymongoId });
        return res.json({ ignored: "unknown order" });
      }

      // A checkout session lists its payments; a payment.paid event is a single payment
      const paidCentavos =
        event.type === "payment.paid"
          ? resource.status === "paid"
            ? (resource.amount ?? 0)
            : 0
          : (resource.payments ?? [])
              .filter((payment) => payment.attributes?.status === "paid")
              .reduce((sum, payment) => sum + (payment.attributes.amount ?? 0), 0);
      // Compare with what this payment was created for, not with the draft's current package
      const paidPackage = PACKAGES[packageId] ?? PACKAGES[order.package_id];
      const priceCentavos = expectedCentavos ?? Math.round((paidPackage?.price ?? 0) * 100);
      if (!priceCentavos || paidCentavos < priceCentavos) {
        await alertOwner("Payment amount doesn't match the order", {
          orderId: order.id,
          paymongoId,
          paidCentavos,
          priceCentavos,
        });
        return res.json({ ignored: "amount mismatch" });
      }

      let isExtra;
      try {
        ({ isExtra } = await markPaymentPaid({
          orderId: order.id,
          paymongoId,
          method: resource.source?.type ?? null,
          amount: paidCentavos,
        }));
      } catch (error) {
        console.error(`[webhook] order ${order.id}: couldn't record the payment:`, error.message);
        return res.status(500).json({ error: "Try again." }); // PayMongo retries
      }
      if (isExtra) {
        await alertOwner("An order was paid twice and may need a refund", {
          orderId: order.id,
          paymongoId,
          paidCentavos,
        });
      }
      // A repeat delivery of an event we already handled
      if (["scheduled", "sent"].includes(order.order_status)) return res.json({ ok: true });

      const result = await fulfillPaidOrder(order.id, isExtra ? undefined : paidPackage?.id);
      if (result.error) console.error(`[webhook] order ${order.id}: ${result.error}`);
      if (result.status === 400) {
        await alertOwner("Paid order has no valid recipient email", { orderId: order.id, paymongoId });
      }
      // 5xx: the database or email failed, so let PayMongo retry
      return res.status(result.status >= 500 ? 500 : 200).json({ ok: !result.error });
    }

    if (event?.type === "payment.failed" && UUID_PATTERN.test(orderId ?? "")) {
      try {
        // An old, replaced payment failing says nothing about the one the customer is paying now
        if (isDirect && !(await isCurrentPayment(orderId, paymongoId))) return res.json({ ok: true });
      } catch (error) {
        console.error("[webhook] couldn't check the failed payment:", error.message);
        return res.status(500).json({ error: "Try again." }); // PayMongo retries
      }
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
    res.json({ locked: false, ...(await surpriseBody(surprise)) });
  });

  app.post("/api/surprise/:slug/unlock", async (req, res) => {
    const surprise = await findSurprise(req.params.slug);
    if (!surprise) return res.status(404).json({ error: "Surprise not found." });

    const { password_enabled: enabled, password_hash: hash } = surprise.content;
    if (enabled && hash) {
      // Counted before checking, so many guesses at the same moment can't slip through
      const slugKey = `unlock:${surprise.order.id}`;
      const visitorKey = `${slugKey}:${addressKey(req)}`;
      if (await isLimited(res, [[visitorKey, LIMITS.unlockPerAddress]])) return;
      if (await isLimited(res, [[slugKey, LIMITS.unlockPerSurprise]])) return;

      const password = req.body?.password;
      const isGuessable = typeof password === "string" && password.length <= 200;
      if (!isGuessable || !verifyPassword(password, hash)) {
        return res.status(401).json({ error: "That password isn't right. Try again." });
      }
      await clearLimits([visitorKey, slugKey]);
    }
    res.json({ locked: false, ...(await surpriseBody(surprise)) });
  });

  registerapp = app;
}
