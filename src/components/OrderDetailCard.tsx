import { OrderDetail } from "@/lib/order-lookup-data";
import { formatPrice } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  paid: "Payment confirmed",
  pending: "Payment pending",
  failed: "Payment failed",
};

export function OrderDetailCard({ order }: { order: OrderDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-line bg-paper-raised p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">Order reference</p>
          <p className="shrink-0 text-xs text-ink-muted">
            {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
          </p>
        </div>
        <p className="mt-0.5 break-all text-xs text-ink-muted">{order.id}</p>
        <p className="mt-3 inline-flex items-center rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          {STATUS_LABELS[order.status] ?? order.status}
        </p>
      </div>

      {order.shipping && (
        <div className="rounded-2xl border border-line bg-paper-raised p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Shipping to
          </p>
          <p className="text-sm text-ink">{order.shipping.name}</p>
          {order.shipping.phone && (
            <p className="text-xs text-ink-muted">{order.shipping.phone}</p>
          )}
          <p className="mt-1 text-xs text-ink-muted">
            {[
              order.shipping.address_line1,
              order.shipping.address_line2,
              order.shipping.city,
              order.shipping.state,
              order.shipping.postal_code,
              order.shipping.country,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          {order.customer_gstin && (
            <p className="mt-1 text-xs text-ink-muted">GSTIN: {order.customer_gstin}</p>
          )}
        </div>
      )}

      {order.billing && (
        <div className="rounded-2xl border border-line bg-paper-raised p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Billing address
          </p>
          <p className="text-sm text-ink">{order.billing.name}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {[
              order.billing.address_line1,
              order.billing.address_line2,
              order.billing.city,
              order.billing.state,
              order.billing.postal_code,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-line bg-paper-raised p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Items
        </p>
        <div className="flex flex-col gap-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate text-ink">{item.product_name}</p>
                <p className="text-xs text-ink-muted">
                  {item.selected_size && <>Size {item.selected_size} &middot; </>}
                  Qty {item.quantity}
                </p>
              </div>
              <p className="shrink-0 tabular-nums text-ink">
                {formatPrice(item.unit_price_cents * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-1 border-t border-line pt-3 text-sm">
          {order.gst_amount_cents > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-ink-muted">GST</p>
              <p className="tabular-nums text-ink">{formatPrice(order.gst_amount_cents)}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-ink-muted">
              Shipping{order.shipping_zone_name ? ` (${order.shipping_zone_name})` : ""}
            </p>
            <p className="tabular-nums text-ink">
              {order.shipping_fee_cents > 0 ? formatPrice(order.shipping_fee_cents) : "Free"}
            </p>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <p className="text-ink">Total</p>
            <p className="tabular-nums text-ink">{formatPrice(order.amount_total_cents)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
