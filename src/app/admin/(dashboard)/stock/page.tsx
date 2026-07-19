import { getStockOverview, getRecentStockAdjustments } from "@/lib/stock-data";
import { getPurchaseOrders } from "@/lib/purchase-orders-data";
import { formatPrice } from "@/lib/format";
import { BulkStockEditor } from "@/components/admin/BulkStockEditor";
import { PurchaseOrderManager } from "@/components/admin/PurchaseOrderManager";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-paper-raised p-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 font-heading text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

export default async function AdminStockPage() {
  const [overview, adjustments, purchaseOrders] = await Promise.all([
    getStockOverview(),
    getRecentStockAdjustments(),
    getPurchaseOrders(),
  ]);

  const topSellers = overview.products.filter((p) => p.sold_qty > 0).slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-semibold text-ink">Stock &amp; Sales</h1>

      <section className="grid grid-cols-2 gap-2.5">
        <StatCard label="Items sold" value={overview.totalSoldQty.toString()} />
        <StatCard label="Revenue" value={formatPrice(overview.totalRevenueCents)} />
        <StatCard label="Profit" value={formatPrice(overview.totalProfitCents)} />
        <StatCard label="Units in stock" value={overview.totalStockUnits.toString()} />
        <StatCard label="Stock value (at cost)" value={formatPrice(overview.totalStockValueCents)} />
        <StatCard
          label="Orders (7 / 30 days)"
          value={`${overview.ordersLast7Days} / ${overview.ordersLast30Days}`}
        />
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Top sellers
        </h2>
        {topSellers.length === 0 ? (
          <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm text-ink-muted">
            No sales yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {topSellers.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-paper-raised p-3"
              >
                <span className="w-5 shrink-0 text-center text-sm font-semibold text-ink-muted">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                  <p className="text-xs text-ink-muted">
                    {product.sold_qty} sold &middot; {formatPrice(product.revenue_cents)} revenue
                    &middot; {formatPrice(product.profit_cents)} profit
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <BulkStockEditor products={overview.products} />

      <PurchaseOrderManager
        products={overview.products.map((p) => ({ id: p.id, name: p.name }))}
        purchaseOrders={purchaseOrders}
      />

      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Recent stock adjustments
        </h2>
        {adjustments.length === 0 ? (
          <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm text-ink-muted">
            No manual adjustments yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {adjustments.map((adj) => (
              <div key={adj.id} className="rounded-xl border border-line bg-paper-raised p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-ink">{adj.product_name}</p>
                  <span
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      adj.delta > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {adj.delta > 0 ? `+${adj.delta}` : adj.delta}
                  </span>
                </div>
                {adj.counted_as_sale && (
                  <span className="mt-1 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                    Counted as a sale
                  </span>
                )}
                {adj.reason && <p className="mt-1 text-xs text-ink-muted">{adj.reason}</p>}
                <p className="text-xs text-ink-muted">
                  {new Date(adj.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
