import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { Product } from "@/types/product";

type CheckoutItem = { productId: string; quantity: number };

export async function POST(request: Request) {
  const { items } = (await request.json()) as { items: CheckoutItem[] };

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const productIds = items.map((i) => i.productId);
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .returns<Product[]>();

  if (error || !products || products.length === 0) {
    return NextResponse.json({ error: "Products not found" }, { status: 400 });
  }

  const lineItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Unknown product ${item.productId}`);
    return {
      quantity: item.quantity,
      price_data: {
        currency: "inr",
        unit_amount: product.price_cents,
        product_data: {
          name: product.name,
          images: product.image_url ? [product.image_url] : undefined,
        },
      },
    };
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel`,
    metadata: {
      items: JSON.stringify(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      ),
    },
  });

  return NextResponse.json({ url: session.url });
}
