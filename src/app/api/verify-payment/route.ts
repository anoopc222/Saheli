import { NextResponse } from "next/server";
import { Razorpay } from "@/lib/razorpay";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { finalizePaidOrder } from "@/lib/order-fulfillment";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } =
      (await request.json()) as {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
        orderId?: string;
      };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: "Missing verification fields" }, { status: 400 });
    }

    // Same check as Razorpay's (unexported) validatePaymentVerification helper:
    // HMAC-SHA256 of "order_id|payment_id" using the account's key secret.
    const isValid = Razorpay.validateWebhookSignature(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET!
    );
    if (!isValid) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const supabase = createServiceRoleSupabaseClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, razorpay_order_id")
      .eq("id", orderId)
      .maybeSingle<{ id: string; razorpay_order_id: string | null }>();

    if (!order || order.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const result = await finalizePaidOrder(supabase, orderId, razorpay_payment_id);
    if (!result) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json(
      { error: "Something went wrong verifying your payment." },
      { status: 500 }
    );
  }
}
