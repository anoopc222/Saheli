import Link from "next/link";
import { getCustomers } from "@/lib/customers-data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Customers ({customers.length})
      </h1>

      {customers.length === 0 ? (
        <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm text-ink-muted">
          No customers yet — this fills in once orders with a phone number come through
          checkout.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {customers.map((customer) => (
            <Link
              key={customer.phone}
              href={`/admin/customers/${encodeURIComponent(customer.phone)}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-3 transition-colors hover:border-accent"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {customer.name || "Unnamed customer"}
                </p>
                <p className="text-xs text-ink-muted">{customer.phone}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-ink">
                  {formatPrice(customer.totalSpentCents)}
                </p>
                <p className="text-xs text-ink-muted">
                  {customer.orderCount} order{customer.orderCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
