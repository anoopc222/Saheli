import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { getProductSettings } from "@/lib/product-settings-data";

// Flips any product still marked "new" past the configured age into
// "sale", so the transition needs no cron job — it happens the next
// time a shop or admin page reads the products table.
export async function sweepExpiredNewBadges() {
  const { new_badge_days } = await getProductSettings();
  const cutoff = new Date(Date.now() - new_badge_days * 24 * 60 * 60 * 1000).toISOString();

  const supabase = createServiceRoleSupabaseClient();
  await supabase
    .from("products")
    .update({ badge: "sale" })
    .eq("badge", "new")
    .lt("created_at", cutoff);
}
