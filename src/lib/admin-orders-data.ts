import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type AdminOrderSummary = {
  id: string;
  created_at: string;
  status: string;
  source: string;
  amount_total_cents: number;
  item_count: number;
  customer_name: string | null;
  customer_phone: string | null;
};

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  source: string;
  amount_total_cents: number;
  shipping_name: string | null;
  shipping_phone: string | null;
};

type OrderItemRow = { order_id: string; quantity: number };

// "Online" covers anything not recorded from the Stock page's offline-sale
// flow — in practice that's razorpay orders, plus any legacy stripe rows
// from before the Razorpay migration.
export async function getAdminOrders(filter: "online" | "offline"): Promise<AdminOrderSummary[]> {
  const supabase = createServiceRoleSupabaseClient();

  let query = supabase
    .from("orders")
    .select("id, created_at, status, source, amount_total_cents, shipping_name, shipping_phone")
    .order("created_at", { ascending: false });
  query = filter === "offline" ? query.eq("source", "offline") : query.neq("source", "offline");

  const { data: orders } = await query.returns<OrderRow[]>();
  const rows = orders ?? [];
  if (rows.length === 0) return [];

  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, quantity")
    .in(
      "order_id",
      rows.map((o) => o.id)
    )
    .returns<OrderItemRow[]>();

  const countByOrder = new Map<string, number>();
  for (const item of items ?? []) {
    countByOrder.set(item.order_id, (countByOrder.get(item.order_id) ?? 0) + item.quantity);
  }

  return rows.map((o) => ({
    id: o.id,
    created_at: o.created_at,
    status: o.status,
    source: o.source,
    amount_total_cents: o.amount_total_cents,
    item_count: countByOrder.get(o.id) ?? 0,
    customer_name: o.shipping_name,
    customer_phone: o.shipping_phone,
  }));
}
