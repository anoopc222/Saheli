import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type DailyRevenuePoint = {
  date: string; // YYYY-MM-DD
  revenue_cents: number;
  order_count: number;
};

export type CategoryPerformance = {
  category_id: string;
  category_name: string;
  revenue_cents: number;
  units_sold: number;
};

export type AnalyticsSummary = {
  totalRevenueCents: number;
  totalOrders: number;
  avgOrderValueCents: number;
  totalCustomers: number;
  repeatCustomers: number;
  repeatRatePercent: number;
  dailyRevenue: DailyRevenuePoint[];
  categoryPerformance: CategoryPerformance[];
};

type OrderRow = {
  id: string;
  created_at: string;
  amount_total_cents: number;
  shipping_phone: string | null;
};
type OrderItemRow = {
  order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price_cents: number;
};
type ProductRow = { id: string; category_id: string | null };
type CategoryRow = { id: string; name: string };

const DAYS = 30;

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

// Everything here is scoped to paid orders — pending/failed orders never
// happened as far as revenue and customer stats are concerned.
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = createServiceRoleSupabaseClient();

  const [{ data: orders }, { data: orderItems }, { data: products }, { data: categories }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, created_at, amount_total_cents, shipping_phone")
        .eq("status", "paid")
        .returns<OrderRow[]>(),
      supabase
        .from("order_items")
        .select("order_id, product_id, quantity, unit_price_cents")
        .returns<OrderItemRow[]>(),
      supabase.from("products").select("id, category_id").returns<ProductRow[]>(),
      supabase.from("categories").select("id, name").returns<CategoryRow[]>(),
    ]);

  const paidOrders = orders ?? [];
  const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.amount_total_cents, 0);
  const totalOrders = paidOrders.length;
  const avgOrderValueCents = totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0;

  const ordersByPhone = new Map<string, number>();
  for (const order of paidOrders) {
    if (!order.shipping_phone) continue;
    ordersByPhone.set(order.shipping_phone, (ordersByPhone.get(order.shipping_phone) ?? 0) + 1);
  }
  const totalCustomers = ordersByPhone.size;
  const repeatCustomers = Array.from(ordersByPhone.values()).filter((count) => count > 1).length;
  const repeatRatePercent =
    totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

  const dayBuckets = new Map<string, { revenue_cents: number; order_count: number }>();
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dayBuckets.set(d.toISOString().slice(0, 10), { revenue_cents: 0, order_count: 0 });
  }
  for (const order of paidOrders) {
    const key = toDateKey(order.created_at);
    const bucket = dayBuckets.get(key);
    if (!bucket) continue;
    bucket.revenue_cents += order.amount_total_cents;
    bucket.order_count += 1;
  }
  const dailyRevenue: DailyRevenuePoint[] = Array.from(dayBuckets.entries()).map(
    ([date, v]) => ({ date, ...v })
  );

  const paidOrderIds = new Set(paidOrders.map((o) => o.id));
  const categoryById = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const productCategoryById = new Map((products ?? []).map((p) => [p.id, p.category_id]));

  const perfByCategory = new Map<string, { revenue_cents: number; units_sold: number }>();
  for (const item of orderItems ?? []) {
    if (!item.product_id || !paidOrderIds.has(item.order_id)) continue;
    const categoryId = productCategoryById.get(item.product_id);
    if (!categoryId) continue;
    const entry = perfByCategory.get(categoryId) ?? { revenue_cents: 0, units_sold: 0 };
    entry.revenue_cents += item.unit_price_cents * item.quantity;
    entry.units_sold += item.quantity;
    perfByCategory.set(categoryId, entry);
  }

  const categoryPerformance: CategoryPerformance[] = Array.from(perfByCategory.entries())
    .map(([category_id, v]) => ({
      category_id,
      category_name: categoryById.get(category_id) ?? "Uncategorized",
      ...v,
    }))
    .sort((a, b) => b.revenue_cents - a.revenue_cents);

  return {
    totalRevenueCents,
    totalOrders,
    avgOrderValueCents,
    totalCustomers,
    repeatCustomers,
    repeatRatePercent,
    dailyRevenue,
    categoryPerformance,
  };
}
