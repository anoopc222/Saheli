import Link from "next/link";
import { ClearCartOnLoad } from "@/components/ClearCartOnLoad";
import { getOrderBySessionId } from "@/lib/order-lookup-data";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const order = session_id ? await getOrderBySessionId(session_id) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <ClearCartOnLoad />
      <h1 className="font-heading text-2xl font-semibold text-ink">
        Payment successful
      </h1>
      <p className="mt-3 text-ink-muted">
        Thanks for your order! A confirmation has been recorded.
      </p>
      {order ? (
        <div className="mx-auto mt-4 max-w-sm rounded-2xl border border-line bg-paper-raised p-4 text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Save this order reference
          </p>
          <p className="mt-1 break-all text-sm font-medium text-ink">{order.id}</p>
          <p className="mt-2 text-xs text-ink-muted">
            Use it with your email on the{" "}
            <Link href="/orders" className="text-accent hover:underline">
              Track your order
            </Link>{" "}
            page any time.
          </p>
          {order.shipping && (
            <div className="mt-3 border-t border-line pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Shipping to
              </p>
              <p className="mt-1 text-sm text-ink">{order.shipping.name}</p>
              <p className="text-xs text-ink-muted">
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
        </div>
      ) : session_id ? (
        <p className="mt-2 text-xs text-ink-muted">
          Still finalizing your order — refresh in a moment to see your reference number.
        </p>
      ) : null}
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-accent"
      >
        Continue shopping
      </Link>
    </div>
  );
}
