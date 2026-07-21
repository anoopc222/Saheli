"use client";

import { useState } from "react";
import { DailyRevenuePoint } from "@/lib/admin-analytics-data";
import { formatPrice } from "@/lib/format";

export function RevenueChart({ data }: { data: DailyRevenuePoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maxRevenue = Math.max(1, ...data.map((d) => d.revenue_cents));
  const maxIndex = data.reduce(
    (best, d, i) => (d.revenue_cents > data[best].revenue_cents ? i : best),
    0
  );
  const active = hoverIndex ?? null;

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Revenue — last 30 days
        </h2>
        {active !== null && (
          <p className="text-xs text-ink-muted">
            <span className="font-semibold text-ink">
              {formatPrice(data[active].revenue_cents)}
            </span>{" "}
            &middot;{" "}
            {new Date(data[active].date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}{" "}
            &middot; {data[active].order_count} order{data[active].order_count === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div className="relative mt-3 flex h-32 items-end gap-[2px]">
        {data.map((point, i) => {
          const heightPct = Math.max(2, (point.revenue_cents / maxRevenue) * 100);
          const isHovered = active === i;
          return (
            <button
              key={point.date}
              type="button"
              onPointerEnter={() => setHoverIndex(i)}
              onFocus={() => setHoverIndex(i)}
              onPointerLeave={() => setHoverIndex(null)}
              onBlur={() => setHoverIndex(null)}
              aria-label={`${point.date}: ${formatPrice(point.revenue_cents)}, ${point.order_count} orders`}
              className="group relative flex-1"
              style={{ height: "100%" }}
            >
              <span
                className={`absolute bottom-0 left-0 block w-full rounded-t-[4px] transition-opacity ${
                  isHovered ? "opacity-100" : "opacity-80"
                }`}
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: "var(--accent)",
                }}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
        <span>
          {new Date(data[0].date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
        {maxRevenue > 1 && (
          <span>
            Best day: {formatPrice(data[maxIndex].revenue_cents)} on{" "}
            {new Date(data[maxIndex].date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
        <span>
          {new Date(data[data.length - 1].date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </div>
  );
}
