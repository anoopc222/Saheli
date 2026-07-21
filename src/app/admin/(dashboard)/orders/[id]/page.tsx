import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/order-lookup-data";
import { OrderDetailCard } from "@/components/OrderDetailCard";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const isOffline = order.source === "offline";

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/admin/orders?type=${isOffline ? "offline" : "online"}`}
        className="inline-block text-sm text-accent hover:underline"
      >
        &larr; Back to orders
      </Link>
      <span
        className={`self-start rounded-full px-2.5 py-1 text-xs font-medium ${
          isOffline ? "bg-line text-ink-muted" : "bg-accent-soft text-accent"
        }`}
      >
        {isOffline ? "Offline sale" : "Online order"}
      </span>
      <OrderDetailCard order={order} />
    </div>
  );
}
