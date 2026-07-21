import Link from "next/link";
import { ClearCartOnLoad } from "@/components/ClearCartOnLoad";
import { getOrderById } from "@/lib/order-lookup-data";
import { CheckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;
  const order = order_id ? await getOrderById(order_id) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <ClearCartOnLoad />
      <div className="mx-auto flex h-16 w-16 animate-pop-in items-center justify-center rounded-full bg-accent-soft text-accent">
        <CheckIcon className="h-8 w-8" />
      </div>
      <h1 className="mt-4 font-heading text-2xl font-semibold text-ink">
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
          {order.billing && (
            <div className="mt-3 border-t border-line pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Billing address
              </p>
              <p className="mt-1 text-sm text-ink">{order.billing.name}</p>
              <p className="text-xs text-ink-muted">
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
        </div>
      ) : order_id ? (
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
