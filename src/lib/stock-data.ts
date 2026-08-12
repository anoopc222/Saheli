import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { ProductSize } from "@/types/product";
import { SIZES_SELECT } from "@/lib/product-sizes";

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
  sizes: ProductSize[];
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
  sizes: ProductSize[];
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
      .select(`id, name, product_code, image_url, stock, price_cents, cost_price_cents, ${SIZES_SELECT}`)
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

export type ProductStockDetail = {
  id: string;
  name: string;
  stock: number;
  price_cents: number;
  cost_price_cents: number | null;
};

export async function getProductStockDetail(
  productId: string
): Promise<ProductStockDetail | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, stock, price_cents, cost_price_cents")
    .eq("id", productId)
    .maybeSingle<ProductStockDetail>();
  return data ?? null;
}

export type StockHistoryEntry = {
  id: string;
  delta: number;
  reason: string;
  createdAt: string;
  countedAsSale: boolean;
};

// Merges two independent sources into one timeline: manual stock_adjustments
// (single edits, bulk edits, offline sales, PO receipts — all logged there
// already) and online Razorpay sales (which only ever touch products.stock
// directly in finalizePaidOrder, with no stock_adjustments row of their
// own). Offline sales are excluded from the order_items side since they're
// already represented via their stock_adjustments row — including both
// would double-count the same stock change.
export async function getProductStockHistory(productId: string): Promise<StockHistoryEntry[]> {
  const supabase = createServiceRoleSupabaseClient();

  const [{ data: adjustments }, { data: items }] = await Promise.all([
    supabase
      .from("stock_adjustments")
      .select("id, delta, reason, counted_as_sale, created_at")
      .eq("product_id", productId)
      .returns<
        { id: string; delta: number; reason: string; counted_as_sale: boolean; created_at: string }[]
      >(),
    supabase
      .from("order_items")
      .select("id, order_id, quantity")
      .eq("product_id", productId)
      .returns<{ id: string; order_id: string; quantity: number }[]>(),
  ]);

  const orderIds = [...new Set((items ?? []).map((i) => i.order_id))];
  const { data: orders } =
    orderIds.length > 0
      ? await supabase
          .from("orders")
          .select("id, created_at, status, source")
          .in("id", orderIds)
          .returns<{ id: string; created_at: string; status: string; source: string }[]>()
      : { data: [] as { id: string; created_at: string; status: string; source: string }[] };
  const ordersById = new Map((orders ?? []).map((o) => [o.id, o]));

  const adjustmentEntries: StockHistoryEntry[] = (adjustments ?? []).map((a) => ({
    id: a.id,
    delta: a.delta,
    reason: a.reason || (a.counted_as_sale ? "Offline sale" : "Manual adjustment"),
    createdAt: a.created_at,
    countedAsSale: a.counted_as_sale,
  }));

  const saleEntries: StockHistoryEntry[] = (items ?? [])
    .map((item) => {
      const order = ordersById.get(item.order_id);
      if (!order || order.status !== "paid" || order.source === "offline") return null;
      return {
        id: item.id,
        delta: -item.quantity,
        reason: "Online sale",
        createdAt: order.created_at,
        countedAsSale: true,
      };
    })
    .filter((e): e is StockHistoryEntry => e !== null);

  return [...adjustmentEntries, ...saleEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
