import Link from "next/link";
import { getOrdersByContact } from "@/lib/order-lookup-data";
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
  searchParams: Promise<{ contact?: string }>;
}) {
  const { contact } = await searchParams;
  const searched = Boolean(contact?.trim());
  const orders = searched ? await getOrdersByContact(contact!.trim()) : [];

  return (
    <div className="mx-auto max-w-[480px] px-4 py-6">
      <h1 className="mb-1 font-heading text-2xl font-semibold text-ink">Track your orders</h1>
      <p className="mb-5 text-xs text-ink-muted">
        Enter the email or phone number you used at checkout to see every order placed with it.
        Have an account?{" "}
        <Link href="/account" className="text-accent hover:underline">
          Log in instead
        </Link>
        .
      </p>

      <form className="mb-6 flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email or phone</label>
          <input
            type="text"
            name="contact"
            defaultValue={contact}
            placeholder="you@example.com or 9876543210"
            required
            className="w-full rounded-xl border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Find my orders
        </button>
      </form>

      {searched && orders.length === 0 && (
        <div className="rounded-2xl border border-line bg-paper-raised p-6 text-center">
          <p className="text-sm text-ink-muted">
            No orders found for that email or phone. Double-check it and try again.
          </p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}?contact=${encodeURIComponent(contact!.trim())}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-4 transition-colors hover:border-accent"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {STATUS_LABELS[order.status] ?? order.status}
                </p>
                <p className="text-xs text-ink-muted">
                  {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  {" · "}
                  {order.item_count} item{order.item_count === 1 ? "" : "s"}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                {formatPrice(order.amount_total_cents)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
