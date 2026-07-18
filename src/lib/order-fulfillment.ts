import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type ServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;

// Both the client-side payment verification call and the Razorpay webhook
// can independently be the one to observe a successful payment first, so
// this is written to run safely from either (or both) — it's a no-op once
// the order is already marked paid.
export async function finalizePaidOrder(
  supabase: ServiceClient,
  orderId: string,
  razorpayPaymentId: string
): Promise<{ alreadyPaid: boolean } | null> {
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle<{ id: string; status: string }>();

  if (!order) return null;
  if (order.status === "paid") return { alreadyPaid: true };

  await supabase
    .from("orders")
    .update({ status: "paid", razorpay_payment_id: razorpayPaymentId })
    .eq("id", orderId);

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId)
    .returns<{ product_id: string | null; quantity: number }[]>();

  for (const item of items ?? []) {
    if (!item.product_id) continue;
    const { data: product } = await supabase
      .from("products")
      .select("id, stock")
      .eq("id", item.product_id)
      .maybeSingle<{ id: string; stock: number }>();
    if (product) {
      await supabase
        .from("products")
        .update({ stock: Math.max(product.stock - item.quantity, 0) })
        .eq("id", item.product_id);
    }
  }

  return { alreadyPaid: false };
}
