import Link from "next/link";
import { getAdminOrders } from "@/lib/admin-orders-data";
import { getStockOverview } from "@/lib/stock-data";
import { AddOfflineOrderForm } from "@/components/admin/AddOfflineOrderForm";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
};

const STATUS_CLASSES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-accent-soft text-accent",
  failed: "bg-red-100 text-red-700",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeTab = type === "offline" ? "offline" : "online";

  const [orders, stockOverview] = await Promise.all([
    getAdminOrders(activeTab),
    activeTab === "offline" ? getStockOverview() : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-semibold text-ink">Orders</h1>

      <div className="flex gap-2 rounded-full border border-line bg-paper-raised p-1">
        <Link
          href="/admin/orders?type=online"
          className={`flex-1 rounded-full py-2 text-center text-sm font-medium transition-colors ${
            activeTab === "online" ? "bg-ink text-white" : "text-ink-muted"
          }`}
        >
          Online
        </Link>
        <Link
          href="/admin/orders?type=offline"
          className={`flex-1 rounded-full py-2 text-center text-sm font-medium transition-colors ${
            activeTab === "offline" ? "bg-ink text-white" : "text-ink-muted"
          }`}
        >
          Offline
        </Link>
      </div>

      {activeTab === "offline" && stockOverview && (
        <AddOfflineOrderForm
          products={stockOverview.products.map((p) => ({
            id: p.id,
            name: p.name,
            price_cents: p.price_cents,
            product_code: p.product_code,
          }))}
        />
      )}

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-line bg-paper-raised p-6 text-center text-sm text-ink-muted">
          No {activeTab} orders yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-3 transition-colors hover:border-accent"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {order.customer_name || "Guest"}
                  {order.customer_phone && (
                    <span className="text-ink-muted"> &middot; {order.customer_phone}</span>
                  )}
                </p>
                <p className="text-xs text-ink-muted">
                  {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  {" · "}
                  {order.item_count} item{order.item_count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="text-sm font-semibold tabular-nums text-ink">
                  {formatPrice(order.amount_total_cents)}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    STATUS_CLASSES[order.status] ?? "bg-line text-ink-muted"
                  }`}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
