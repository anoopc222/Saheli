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

type OrderRow = { id: string };
type OrderItemRow = { order_id: string; product_id: string | null; quantity: number };
type ProductBadgeRow = { id: string; badge: string | null };

// Re-ranks the "bestseller" badge against real sales instead of leaving
// it as a one-off manual tag — the top N products by units sold (from
// paid orders, same source as the admin Stock page) get promoted, and
// anything that previously earned the badge but has since fallen out of
// that ranking is demoted back to no badge. This overrides whatever
// badge a product had before it became a top seller (and before it
// fell out again), the same way the new->sale sweep is a one-way,
// fully-computed transition.
export async function sweepBestsellerBadges() {
  const { bestseller_count } = await getProductSettings();
  if (bestseller_count <= 0) return;

  const supabase = createServiceRoleSupabaseClient();
  const [{ data: orders }, { data: orderItems }, { data: products }] = await Promise.all([
    supabase.from("orders").select("id").eq("status", "paid").returns<OrderRow[]>(),
    supabase
      .from("order_items")
      .select("order_id, product_id, quantity")
      .returns<OrderItemRow[]>(),
    supabase.from("products").select("id, badge").returns<ProductBadgeRow[]>(),
  ]);

  const paidOrderIds = new Set((orders ?? []).map((o) => o.id));
  const soldQtyByProduct = new Map<string, number>();
  for (const item of orderItems ?? []) {
    if (!item.product_id || !paidOrderIds.has(item.order_id)) continue;
    soldQtyByProduct.set(
      item.product_id,
      (soldQtyByProduct.get(item.product_id) ?? 0) + item.quantity
    );
  }

  const topSellerIds = new Set(
    Array.from(soldQtyByProduct.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, bestseller_count)
      .map(([id]) => id)
  );

  const toPromote = (products ?? []).filter(
    (p) => topSellerIds.has(p.id) && p.badge !== "bestseller"
  );
  const toDemote = (products ?? []).filter(
    (p) => p.badge === "bestseller" && !topSellerIds.has(p.id)
  );

  await Promise.all([
    ...toPromote.map((p) =>
      supabase.from("products").update({ badge: "bestseller" }).eq("id", p.id)
    ),
    ...toDemote.map((p) => supabase.from("products").update({ badge: null }).eq("id", p.id)),
  ]);
}
