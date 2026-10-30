import { supabase } from "./supabase.js";
import { readOrderDraft, updateOrderDraft } from "@/utils/orderDraft";
export let registerapp = null;

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
  registerapp = app;
}

// Gumagawa ng order sa server kung wala pa (kailangan bago mag-upload ng litrato o magbayad).
export async function ensureServerOrder() {
  const draft = readOrderDraft();
  if (draft.order_id && draft.order_token) return draft;
  const order = await registerapp.api("/api/orders", { method: "POST", body: draft });
  return updateOrderDraft({ order_id: order.order_id, order_token: order.access_token });
}

// Ipinapadala ang buong draft sa server. Kinikilala lang ng server ang fields na alam niya.
export async function saveServerOrder(extra = {}) {
  const { order_id: orderId } = await ensureServerOrder();
  return registerapp.api(`/api/orders/${orderId}`, {
    method: "PATCH",
    body: { ...readOrderDraft(), ...extra },
  });
}
