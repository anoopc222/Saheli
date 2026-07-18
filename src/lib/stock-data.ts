import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type ProductStockRow = {
  id: string;
  name: string;
  product_code: string | null;
  image_url: string;
  stock: number;
  price_cents: number;
  cost_price_cents: number | null;
  sold_qty: number;
  revenue_cents: number;
  profit_cents: number;
};

export type StockOverview = {
  products: ProductStockRow[];
  totalSoldQty: number;
  totalRevenueCents: number;
  totalProfitCents: number;
  totalStockUnits: number;
  totalStockValueCents: number;
  ordersLast7Days: number;
  ordersLast30Days: number;
};

type ProductRow = {
  id: string;
  name: string;
  product_code: string | null;
  image_url: string;
  stock: number;
  price_cents: number;
  cost_price_cents: number | null;
};

type OrderRow = { id: string; created_at: string };
type OrderItemRow = {
  order_id: string;
  product_id: string | null;
  unit_price_cents: number;
  quantity: number;
};

// Orders/order_items have no public RLS read policy (they hold
// customer emails), so this must run through the service-role
// client — the anon client the storefront uses would just see an
// empty result set here.
export async function getStockOverview(): Promise<StockOverview> {
  const supabase = createServiceRoleSupabaseClient();

  const [{ data: products }, { data: orders }, { data: orderItems }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, product_code, image_url, stock, price_cents, cost_price_cents")
      .returns<ProductRow[]>(),
    supabase.from("orders").select("id, created_at").eq("status", "paid").returns<OrderRow[]>(),
    supabase
      .from("order_items")
      .select("order_id, product_id, unit_price_cents, quantity")
      .returns<OrderItemRow[]>(),
  ]);

  const paidOrderIds = new Set((orders ?? []).map((o) => o.id));
  const soldByProduct = new Map<string, { qty: number; revenueCents: number }>();
  for (const item of orderItems ?? []) {
    if (!item.product_id || !paidOrderIds.has(item.order_id)) continue;
    const entry = soldByProduct.get(item.product_id) ?? { qty: 0, revenueCents: 0 };
    entry.qty += item.quantity;
    entry.revenueCents += item.unit_price_cents * item.quantity;
    soldByProduct.set(item.product_id, entry);
  }

  const productRows: ProductStockRow[] = (products ?? []).map((product) => {
    const sold = soldByProduct.get(product.id) ?? { qty: 0, revenueCents: 0 };
    const costCents = product.cost_price_cents ?? 0;
    return {
      ...product,
      sold_qty: sold.qty,
      revenue_cents: sold.revenueCents,
      profit_cents: sold.revenueCents - costCents * sold.qty,
    };
  });
  productRows.sort((a, b) => b.sold_qty - a.sold_qty);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const ordersLast7Days = (orders ?? []).filter(
    (o) => now - new Date(o.created_at).getTime() <= 7 * day
  ).length;
  const ordersLast30Days = (orders ?? []).filter(
    (o) => now - new Date(o.created_at).getTime() <= 30 * day
  ).length;

  return {
    products: productRows,
    totalSoldQty: productRows.reduce((sum, p) => sum + p.sold_qty, 0),
    totalRevenueCents: productRows.reduce((sum, p) => sum + p.revenue_cents, 0),
    totalProfitCents: productRows.reduce((sum, p) => sum + p.profit_cents, 0),
    totalStockUnits: productRows.reduce((sum, p) => sum + p.stock, 0),
    totalStockValueCents: productRows.reduce(
      (sum, p) => sum + p.stock * (p.cost_price_cents ?? 0),
      0
    ),
    ordersLast7Days,
    ordersLast30Days,
  };
}

export type StockAdjustmentRow = {
  id: string;
  product_name: string;
  delta: number;
  reason: string;
  counted_as_sale: boolean;
  created_at: string;
};

export async function getRecentStockAdjustments(limit = 15): Promise<StockAdjustmentRow[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data } = await supabase
    .from("stock_adjustments")
    .select("id, product_name, delta, reason, counted_as_sale, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<StockAdjustmentRow[]>();
  return data ?? [];
}
