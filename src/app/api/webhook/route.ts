import { NextResponse } from "next/server";
import { Razorpay } from "@/lib/razorpay";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { finalizePaidOrder } from "@/lib/order-fulfillment";

// Razorpay's server-to-server webhook — the authoritative fallback in case
// the client never gets back to /api/verify-payment (closed tab, network
// drop right after paying, etc). Both paths call the same idempotent
// finalizePaidOrder, so whichever fires first wins and the other is a no-op.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let isValid = false;
  try {
    isValid = Razorpay.validateWebhookSignature(
      body,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature validation error:", err);
  }
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(body) as {
      event: string;
      payload?: { payment?: { entity?: { id: string; order_id: string } } };
    };

    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id && payment.id) {
        const supabase = createServiceRoleSupabaseClient();
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("razorpay_order_id", payment.order_id)
          .maybeSingle<{ id: string }>();

        if (order) {
          await finalizePaidOrder(supabase, order.id, payment.id);
        }
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
  }

  return NextResponse.json({ received: true });
}
