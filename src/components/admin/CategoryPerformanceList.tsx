import { CategoryPerformance } from "@/lib/admin-analytics-data";
import { formatPrice } from "@/lib/format";

export function CategoryPerformanceList({ categories }: { categories: CategoryPerformance[] }) {
  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-4">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Best-selling categories
        </h2>
        <p className="mt-3 text-sm text-ink-muted">No sales yet.</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...categories.map((c) => c.revenue_cents));

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Best-selling categories
      </h2>
      <div className="flex flex-col gap-3">
        {categories.map((cat) => {
          const widthPct = Math.max(4, (cat.revenue_cents / maxRevenue) * 100);
          return (
            <div key={cat.category_id}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <p className="truncate font-medium text-ink">{cat.category_name}</p>
                <p className="shrink-0 tabular-nums text-ink-muted">
                  {formatPrice(cat.revenue_cents)} &middot; {cat.units_sold} sold
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${widthPct}%`, backgroundColor: "var(--accent)" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
