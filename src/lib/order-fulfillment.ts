import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/order-email";

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
    .select("product_id, quantity, selected_size")
    .eq("order_id", orderId)
    .returns<{ product_id: string | null; quantity: number; selected_size: string | null }[]>();

  for (const item of items ?? []) {
    if (!item.product_id) continue;
    const { data: product } = await supabase
      .from("products")
      .select("id, stock")
      .eq("id", item.product_id)
      .maybeSingle<{ id: string; stock: number }>();
    if (!product) continue;

    await supabase
      .from("products")
      .update({ stock: Math.max(product.stock - item.quantity, 0) })
      .eq("id", item.product_id);

    // The aggregate above always moves in step with the sale; a sized
    // product additionally needs its specific size row decremented so
    // the size picker reflects what's actually left.
    if (item.selected_size) {
      const { data: sizeRow } = await supabase
        .from("product_sizes")
        .select("id, stock")
        .eq("product_id", item.product_id)
        .eq("size", item.selected_size)
        .maybeSingle<{ id: string; stock: number }>();
      if (sizeRow) {
        await supabase
          .from("product_sizes")
          .update({ stock: Math.max(sizeRow.stock - item.quantity, 0) })
          .eq("id", sizeRow.id);
      }
    }
  }

  // A failed send here shouldn't fail the payment confirmation the
  // customer is waiting on — log and move on.
  try {
    await sendOrderConfirmationEmail(supabase, orderId);
  } catch (err) {
    console.error("Order confirmation email failed:", err);
  }

  return { alreadyPaid: false };
}
