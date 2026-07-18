import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { validateDiscountCode } from "@/lib/discount-data";
import { Product } from "@/types/product";

type CheckoutItem = { productId: string; quantity: number };

export async function POST(request: Request) {
  const { items, couponCode } = (await request.json()) as {
    items: CheckoutItem[];
    couponCode?: string;
  };

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

  // Never trust a discount amount computed on the client — re-validate
  // the code here and apply it ourselves so the Stripe session, and the
  // order/order_items rows the webhook records, always agree.
  let discount: Awaited<ReturnType<typeof validateDiscountCode>> | null = null;
  if (couponCode?.trim()) {
    const result = await validateDiscountCode(couponCode);
    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    discount = result;
  }

  const subtotalCents = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price_cents ?? 0) * item.quantity;
  }, 0);

  const discountedItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Unknown product ${item.productId}`);
    const itemTotal = product.price_cents * item.quantity;

    let discountedItemTotal = itemTotal;
    if (discount?.valid) {
      if (discount.percentOff) {
        discountedItemTotal = Math.round(itemTotal * (100 - discount.percentOff) / 100);
      } else if (discount.amountOffCents && subtotalCents > 0) {
        const share = itemTotal / subtotalCents;
        discountedItemTotal = Math.max(
          0,
          itemTotal - Math.round(discount.amountOffCents * share)
        );
      }
    }

    return {
      product,
      quantity: item.quantity,
      unitPriceCents: Math.max(0, Math.round(discountedItemTotal / item.quantity)),
    };
  });

  const lineItems = discountedItems.map(({ product, quantity, unitPriceCents }) => ({
    quantity,
    price_data: {
      currency: "inr",
      unit_amount: unitPriceCents,
      product_data: {
        name: product.name,
        images: product.image_url ? [product.image_url] : undefined,
      },
    },
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel`,
    metadata: {
      items: JSON.stringify(
        discountedItems.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPriceCents: i.unitPriceCents,
        }))
      ),
      ...(discount?.valid ? { discount_code: discount.code } : {}),
    },
  });

  return NextResponse.json({ url: session.url });
}
