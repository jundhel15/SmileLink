import { createClient } from "@supabase/supabase-js";
import process from "node:process";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
