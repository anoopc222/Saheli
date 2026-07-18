import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerByPhone } from "@/lib/customers-data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone } = await params;
  const customer = await getCustomerByPhone(decodeURIComponent(phone));
  if (!customer) notFound();

  return (
    <div>
      <Link
        href="/admin/customers"
        className="mb-4 inline-block text-sm text-ink-muted hover:text-accent"
      >
        &larr; Customers
      </Link>

      <div className="mb-4 rounded-2xl border border-line bg-paper-raised p-4">
        <p className="font-heading text-lg font-semibold text-ink">
          {customer.name || "Unnamed customer"}
        </p>
        <p className="text-sm text-ink-muted">{customer.phone}</p>
        {customer.email && <p className="text-sm text-ink-muted">{customer.email}</p>}
        <div className="mt-3 flex gap-6 border-t border-line pt-3">
          <div>
            <p className="text-xs text-ink-muted">Orders</p>
            <p className="text-sm font-semibold text-ink">{customer.orderCount}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Total spent</p>
            <p className="text-sm font-semibold text-ink">
              {formatPrice(customer.totalSpentCents)}
            </p>
          </div>
        </div>
      </div>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Purchase history
      </h2>
      <div className="flex flex-col gap-3">
        {customer.orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-line bg-paper-raised p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-ink-muted">
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  dateStyle: "medium",
                })}
              </p>
              <p className="text-sm font-semibold tabular-nums text-ink">
                {formatPrice(order.amount_total_cents)}
              </p>
            </div>
            <div className="mt-2 flex flex-col gap-1.5 border-t border-line pt-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-3 text-sm">
                  <p className="min-w-0 truncate text-ink">
                    {item.product_name}
                    <span className="text-ink-muted"> &times; {item.quantity}</span>
                  </p>
                  <p className="shrink-0 tabular-nums text-ink-muted">
                    {formatPrice(item.unit_price_cents * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
