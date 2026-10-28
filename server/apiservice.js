import { supabase } from "./supabase.js";

export function registerRoutes(app) {
  console.log("okoko");
  app.get("/api/orders", async (req, res) => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_delivery(*), order_content(*), payments(*)");

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });
}
