"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";

type OrderSummary = {
  id: string;
  status: string;
  amount_total_cents: number;
  created_at: string;
  item_count: number;
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Payment confirmed",
  pending: "Payment pending",
  failed: "Payment failed",
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/account/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserSupabaseClient();

    async function load() {
      try {
        const { data: orderRows } = await supabase
          .from("orders")
          .select("id, status, amount_total_cents, created_at")
          .order("created_at", { ascending: false })
          .returns<
            { id: string; status: string; amount_total_cents: number; created_at: string }[]
          >();

        const orderIds = (orderRows ?? []).map((o) => o.id);
        const { data: itemRows } =
          orderIds.length > 0
            ? await supabase
                .from("order_items")
                .select("order_id")
                .in("order_id", orderIds)
                .returns<{ order_id: string }[]>()
            : { data: [] as { order_id: string }[] };

        const countByOrder = new Map<string, number>();
        for (const item of itemRows ?? []) {
          countByOrder.set(item.order_id, (countByOrder.get(item.order_id) ?? 0) + 1);
        }

        setOrders(
          (orderRows ?? []).map((o) => ({
            ...o,
            item_count: countByOrder.get(o.id) ?? 0,
          }))
        );
      } catch {
        // Never leave the page stuck on "Loading..." — treat a failed
        // fetch the same as "nothing to show" rather than hanging forever.
        setOrders([]);
      }
    }
    load();
  }, [user]);

  if (loading || !user) {
    return <div className="mx-auto max-w-[480px] px-4 py-10" />;
  }

  return (
    <div className="mx-auto max-w-[480px] px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-ink">My account</h1>
          <p className="text-sm text-ink-muted">{user.email}</p>
        </div>
        <button
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Log out
        </button>
      </div>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Your orders
      </h2>
      {orders === null ? (
        <p className="text-sm text-ink-muted">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="rounded-2xl border border-line bg-paper-raised p-6 text-center text-sm text-ink-muted">
          No orders yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
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
