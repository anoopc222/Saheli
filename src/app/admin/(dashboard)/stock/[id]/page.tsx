import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductStockDetail,
  getProductStockHistory,
} from "@/lib/stock-data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductStockHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductStockDetail(id);
  if (!product) notFound();

  const history = await getProductStockHistory(id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/stock" className="text-sm text-accent hover:underline">
          &larr; Stock &amp; Sales
        </Link>
        <h1 className="mt-2 font-heading text-xl font-semibold text-ink">{product.name}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {product.stock} in stock &middot; {formatPrice(product.price_cents)}
          {product.cost_price_cents != null && (
            <> &middot; {formatPrice(product.cost_price_cents)} cost</>
          )}
        </p>
      </div>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Stock history
        </h2>
        {history.length === 0 ? (
          <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm text-ink-muted">
            No stock movement recorded yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{entry.reason}</p>
                  <p className="text-xs text-ink-muted">
                    {new Date(entry.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    entry.delta > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
