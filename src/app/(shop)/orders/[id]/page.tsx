"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { OrderDetail } from "@/lib/order-lookup-data";
import { OrderDetailCard } from "@/components/OrderDetailCard";
import { Spinner } from "@/components/Skeleton";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const contact = searchParams.get("contact");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "not-found">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");

      let body: { orderId: string; contact?: string } = { orderId: id };
      let headers: HeadersInit = { "Content-Type": "application/json" };

      if (contact) {
        body = { orderId: id, contact };
      } else {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          if (!cancelled) setStatus("not-found");
          return;
        }
        headers = { ...headers, Authorization: `Bearer ${data.session.access_token}` };
      }

      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (cancelled) return;
      if (!res.ok) {
        setStatus("not-found");
        return;
      }
      const data = await res.json();
      setOrder(data.order);
      setStatus("found");
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, contact]);

  return (
    <div className="mx-auto max-w-[480px] px-4 py-6">
      <Link
        href={contact ? `/orders?contact=${encodeURIComponent(contact)}` : "/account"}
        className="mb-4 inline-block text-sm text-accent hover:underline"
      >
        &larr; Back to orders
      </Link>

      {status === "loading" && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      {status === "not-found" && (
        <div className="rounded-2xl border border-line bg-paper-raised p-6 text-center">
          <p className="text-sm text-ink-muted">
            We couldn&apos;t find this order. If you followed a link, make sure you&apos;re
            logged in, or look it up from the Track your orders page.
          </p>
        </div>
      )}

      {status === "found" && order && (
        <>
          <OrderDetailCard order={order} />
          <Link
            href="/contact"
            className="mt-4 block text-center text-sm text-accent hover:underline"
          >
            Need help with this order? Contact us
          </Link>
        </>
      )}
    </div>
  );
}
