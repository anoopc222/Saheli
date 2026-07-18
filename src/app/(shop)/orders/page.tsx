import Link from "next/link";
import { getOrderByReference } from "@/lib/order-lookup-data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  paid: "Payment confirmed",
  pending: "Payment pending",
  failed: "Payment failed",
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; email?: string }>;
}) {
  const { order_id, email } = await searchParams;
  const searched = Boolean(order_id?.trim() && email?.trim());
  const order = searched ? await getOrderByReference(order_id!.trim(), email!.trim()) : null;

  return (
    <div className="mx-auto max-w-[480px] px-4 py-6">
      <h1 className="mb-1 font-heading text-2xl font-semibold text-ink">Track your order</h1>
      <p className="mb-5 text-xs text-ink-muted">
        Enter the order reference and email you used at checkout.
      </p>

      <form className="mb-6 flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Order reference</label>
          <input
            type="text"
            name="order_id"
            defaultValue={order_id}
            placeholder="From your confirmation page"
            required
            className="w-full rounded-xl border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={email}
            placeholder="you@example.com"
            required
            className="w-full rounded-xl border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Find my order
        </button>
      </form>

      {searched && !order && (
        <div className="rounded-2xl border border-line bg-paper-raised p-6 text-center">
          <p className="text-sm text-ink-muted">
            No order found for that reference and email. Double-check both and try again.
          </p>
        </div>
      )}

      {order && (
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
                    <p className="text-xs text-ink-muted">Qty {item.quantity}</p>
                  </div>
                  <p className="shrink-0 tabular-nums text-ink">
                    {formatPrice(item.unit_price_cents * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
              <p className="text-ink-muted">Shipping</p>
              <p className="tabular-nums text-ink">
                {order.shipping_fee_cents > 0 ? formatPrice(order.shipping_fee_cents) : "Free"}
              </p>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm font-semibold">
              <p className="text-ink">Total</p>
              <p className="tabular-nums text-ink">{formatPrice(order.amount_total_cents)}</p>
            </div>
            {order.gst_amount_cents > 0 && (
              <p className="mt-1 text-xs text-ink-muted">
                Includes GST of {formatPrice(order.gst_amount_cents)}
              </p>
            )}
          </div>

          <Link
            href="/contact"
            className="text-center text-sm text-accent hover:underline"
          >
            Need help with this order? Contact us
          </Link>
        </div>
      )}
    </div>
  );
}
