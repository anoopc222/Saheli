import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { validateDiscountCode } from "@/lib/discount-data";
import { Product } from "@/types/product";

type CheckoutItem = { productId: string; quantity: number };
type ShippingDetails = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
};

export async function POST(request: Request) {
  try {
    const { items, couponCode, shipping } = (await request.json()) as {
      items: CheckoutItem[];
      couponCode?: string;
      shipping: ShippingDetails;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (
      !shipping?.name?.trim() ||
      !shipping.email?.trim() ||
      !shipping.phone?.trim() ||
      !shipping.addressLine1?.trim() ||
      !shipping.city?.trim() ||
      !shipping.state?.trim() ||
      !shipping.postalCode?.trim()
    ) {
      return NextResponse.json(
        { error: "Please fill in all the required shipping details." },
        { status: 400 }
      );
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
    // the code here and apply it ourselves so the order/order_items rows
    // always agree with what actually gets charged.
    let discount: Awaited<ReturnType<typeof validateDiscountCode>> | null = null;
    if (couponCode?.trim()) {
      const result = await validateDiscountCode(couponCode);
      if (!result.valid) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      discount = result;
    }

    const missingProduct = items.find(
      (item) => !products.find((p) => p.id === item.productId)
    );
    if (missingProduct) {
      return NextResponse.json(
        { error: "One of the items in your cart is no longer available." },
        { status: 400 }
      );
    }

    const subtotalCents = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product?.price_cents ?? 0) * item.quantity;
    }, 0);

    const discountedItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemTotal = product.price_cents * item.quantity;

      let discountedItemTotal = itemTotal;
      if (discount?.valid) {
        if (discount.percentOff) {
          discountedItemTotal = Math.round((itemTotal * (100 - discount.percentOff)) / 100);
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

    const amountTotalCents = discountedItems.reduce(
      (sum, i) => sum + i.unitPriceCents * i.quantity,
      0
    );

    // The order (and its items) are recorded up front, before payment —
    // Razorpay's checkout widget doesn't collect shipping details for us
    // the way Stripe's hosted page did, so we need it in hand already.
    // Status starts "pending" and only flips to "paid" once the payment
    // is verified (see /api/verify-payment and /api/webhook).
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        source: "razorpay",
        amount_total_cents: amountTotalCents,
        customer_email: shipping.email.trim(),
        discount_code: discount?.valid ? discount.code : null,
        shipping_name: shipping.name.trim(),
        shipping_phone: shipping.phone.trim(),
        shipping_address_line1: shipping.addressLine1.trim(),
        shipping_address_line2: shipping.addressLine2?.trim() || null,
        shipping_city: shipping.city.trim(),
        shipping_state: shipping.state.trim(),
        shipping_postal_code: shipping.postalCode.trim(),
        shipping_country: shipping.country?.trim() || "IN",
      })
      .select("id")
      .single<{ id: string }>();

    if (orderError || !order) {
      console.error("Checkout order insert error:", orderError);
      return NextResponse.json(
        { error: "Something went wrong starting checkout. Please try again." },
        { status: 500 }
      );
    }

    const orderItems = discountedItems.map(({ product, quantity, unitPriceCents }) => ({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      unit_price_cents: unitPriceCents,
      quantity,
    }));
    await supabase.from("order_items").insert(orderItems);

    let razorpayOrder;
    try {
      razorpayOrder = await getRazorpay().orders.create({
        amount: amountTotalCents,
        currency: "INR",
        receipt: order.id,
        notes: { order_id: order.id },
      });
    } catch (err) {
      console.error("Razorpay order creation error:", err);
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return NextResponse.json(
        { error: "Something went wrong starting checkout. Please try again." },
        { status: 500 }
      );
    }

    await supabase
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", order.id);

    return NextResponse.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: amountTotalCents,
      orderId: order.id,
      customerName: shipping.name.trim(),
      customerEmail: shipping.email.trim(),
      customerPhone: shipping.phone.trim(),
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Something went wrong starting checkout. Please try again." },
      { status: 500 }
    );
  }
}
