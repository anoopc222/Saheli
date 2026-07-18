import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      const items = JSON.parse(session.metadata?.items ?? "[]") as {
        productId: string;
        quantity: number;
        unitPriceCents?: number;
      }[];

      const supabase = createServiceRoleSupabaseClient();
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .in(
          "id",
          items.map((i) => i.productId)
        );

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          stripe_session_id: session.id,
          customer_email: session.customer_details?.email,
          amount_total_cents: session.amount_total ?? 0,
          status: "paid",
          discount_code: session.metadata?.discount_code || null,
        })
        .select()
        .single();

      if (!orderError && order) {
        const orderItems = items.map((item) => {
          const product = products?.find((p) => p.id === item.productId);
          return {
            order_id: order.id,
            product_id: item.productId,
            product_name: product?.name ?? "Unknown product",
            unit_price_cents: item.unitPriceCents ?? product?.price_cents ?? 0,
            quantity: item.quantity,
          };
        });
        await supabase.from("order_items").insert(orderItems);

        for (const item of items) {
          const product = products?.find((p) => p.id === item.productId);
          if (product) {
            await supabase
              .from("products")
              .update({ stock: Math.max(product.stock - item.quantity, 0) })
              .eq("id", item.productId);
          }
        }
      } else if (orderError) {
        console.error("Webhook order insert error:", orderError);
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
