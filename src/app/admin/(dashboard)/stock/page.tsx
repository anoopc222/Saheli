import { getStockOverview, getRecentStockAdjustments } from "@/lib/stock-data";
import { formatPrice } from "@/lib/format";
import { StockAdjustModal } from "@/components/admin/StockAdjustModal";

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
  const [overview, adjustments] = await Promise.all([
    getStockOverview(),
    getRecentStockAdjustments(),
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

      <section className="flex flex-col gap-2.5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Stock by product
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Use the adjust icon to add or subtract stock for a sale made outside the site.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {overview.products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-paper-raised p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                <p className="text-xs text-ink-muted">
                  {product.stock} in stock &middot; {product.sold_qty} sold
                  {product.stock <= 0 && (
                    <span className="ml-1.5 font-medium text-red-600">Sold out</span>
                  )}
                </p>
              </div>
              <StockAdjustModal
                productId={product.id}
                productName={product.name}
                currentStock={product.stock}
              />
            </div>
          ))}
        </div>
      </section>

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
                {adj.reason && <p className="text-xs text-ink-muted">{adj.reason}</p>}
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
