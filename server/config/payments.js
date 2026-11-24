import { supabase } from "./supabase.js";
import { paymongo } from "./paymongo.js";

// One row in "payments" per payment we start. checkout_session_id holds the PayMongo id: a payment
// intent ("pi_...") for direct GCash/QR, or a checkout session ("cs_..."). amount is in centavos.
// paid_at stays empty until the verified webhook confirms that payment.
export async function recordPayment({ orderId, paymongoId, method, amount }) {
  const { error } = await supabase.from("payments").insert({
    order_id: orderId,
    checkout_session_id: paymongoId,
    payment_method: method,
    amount,
  });
  if (error) throw new Error(`Couldn't record the payment: ${error.message}`);
}

const IN_PROGRESS = ["processing", "succeeded"];

// "open" = can still be paid, "closed" = can't, "busy" = money is moving or already received
async function readPaymongoState(path, isSession) {
  let attributes;
  try {
    ({ attributes } = await paymongo(path));
  } catch (error) {
    // Started with other keys (for example test keys before going live), so it can't be paid here
    if (error.status === 404) return "closed";
    throw error;
  }

  if (!isSession) {
    if (IN_PROGRESS.includes(attributes.status)) return "busy";
    return attributes.status === "cancelled" ? "closed" : "open";
  }
  const intentStatus = attributes.payment_intent?.attributes?.status;
  const isPaid = attributes.payments?.some((payment) => payment.attributes?.status === "paid");
  if (isPaid || IN_PROGRESS.includes(intentStatus)) return "busy";
  return attributes.status === "expired" ? "closed" : "open";
}

async function closeAtPaymongo(paymongoId) {
  const isSession = paymongoId.startsWith("cs_");
  const path = isSession ? `/checkout_sessions/${paymongoId}` : `/payment_intents/${paymongoId}`;

  const state = await readPaymongoState(path, isSession);
  if (state !== "open") return state;
  try {
    await paymongo(`${path}/${isSession ? "expire" : "cancel"}`, { method: "POST" });
    return "closed";
  } catch (error) {
    // The customer may have paid between the check and the cancel, so look again
    const after = await readPaymongoState(path, isSession);
    if (after === "open") throw error;
    return after;
  }
}

// Called before starting a new payment, so an order never has two that can both be paid.
// Returns false if an earlier one is already going through. Throws if PayMongo can't be reached.
export async function closeOpenPayments(orderId) {
  const { data: open, error } = await supabase
    .from("payments")
    .select("id, checkout_session_id")
    .eq("order_id", orderId)
    .is("paid_at", null);
  if (error) throw new Error(`Couldn't read earlier payments: ${error.message}`);

  for (const payment of open) {
    if ((await closeAtPaymongo(payment.checkout_session_id)) === "busy") return false;
    const { error: deleteError } = await supabase
      .from("payments")
      .delete()
      .eq("id", payment.id)
      .is("paid_at", null);
    if (deleteError) throw new Error(`Couldn't clear an earlier payment: ${deleteError.message}`);
  }
  return true;
}

// True if this is a payment we started and haven't replaced with a newer one.
export async function isCurrentPayment(orderId, paymongoId) {
  const { data, error } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .eq("checkout_session_id", paymongoId)
    .is("paid_at", null);
  if (error) throw new Error(error.message);
  return data.length > 0;
}

async function findPaidIds(orderId) {
  const { data, error } = await supabase
    .from("payments")
    .select("checkout_session_id")
    .eq("order_id", orderId)
    .not("paid_at", "is", null);
  if (error) throw new Error(error.message);
  return data.map((payment) => payment.checkout_session_id);
}

// Saves that a payment was received. isExtra is true the first time we hear about a payment for an
// order that also has a different paid one.
export async function markPaymentPaid({ orderId, paymongoId, method, amount }) {
  const paidAt = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("payments")
    .update({ paid_at: paidAt, amount })
    .eq("order_id", orderId)
    .eq("checkout_session_id", paymongoId)
    .is("paid_at", null)
    .select("id");
  if (updateError) throw new Error(updateError.message);

  let isNew = updated.length > 0;
  let paidIds = await findPaidIds(orderId);
  // No row: the payment was started before this table was used, or its row was cleared
  if (!paidIds.includes(paymongoId)) {
    const { error: insertError } = await supabase.from("payments").insert({
      order_id: orderId,
      checkout_session_id: paymongoId,
      payment_method: method,
      amount,
      paid_at: paidAt,
    });
    if (insertError) throw new Error(insertError.message);
    isNew = true;
    paidIds = await findPaidIds(orderId);
  }
  return { isExtra: isNew && new Set(paidIds).size > 1 };
}
