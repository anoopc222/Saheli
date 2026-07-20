import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { validateDiscountCode } from "@/lib/discount-data";
import { getProductSettings } from "@/lib/product-settings-data";
import { getShippingZones } from "@/lib/shipping-zones-data";
import { matchShippingZone } from "@/lib/shipping-zones";
import { applyDiscountToItems, computeOrderTotals } from "@/lib/pricing";
import { Product } from "@/types/product";

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

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
  gstin?: string;
};
type BillingDetails = {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export async function POST(request: Request) {
  try {
    const { items, couponCode, shipping, billing } = (await request.json()) as {
      items: CheckoutItem[];
      couponCode?: string;
      shipping: ShippingDetails;
      billing: BillingDetails | null;
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

    if (!/^[0-9]{6}$/.test(shipping.postalCode.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit pincode." },
        { status: 400 }
      );
    }

    const gstin = shipping.gstin?.trim().toUpperCase() || null;
    if (gstin && !GSTIN_PATTERN.test(gstin)) {
      return NextResponse.json(
        { error: "That GSTIN doesn't look right. Double-check it or leave it blank." },
        { status: 400 }
      );
    }

    const billingSameAsShipping = !billing;
    if (
      billing &&
      (!billing.name?.trim() ||
        !billing.addressLine1?.trim() ||
        !billing.city?.trim() ||
        !billing.state?.trim() ||
        !billing.postalCode?.trim() ||
        !/^[0-9]{6}$/.test(billing.postalCode.trim()))
    ) {
      return NextResponse.json(
        { error: "Please fill in all the required billing details." },
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

    // Never trust the client's idea of available stock — the cart is a
    // localStorage snapshot that can go stale (another sale, an admin
    // adjustment), so this is the actual gate against overselling.
    const overStockedItem = items.find((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return item.quantity > product.stock;
    });
    if (overStockedItem) {
      const product = products.find((p) => p.id === overStockedItem.productId)!;
      return NextResponse.json(
        {
          error:
            product.stock > 0
              ? `Only ${product.stock} of "${product.name}" left in stock. Please update the quantity in your cart.`
              : `"${product.name}" just sold out. Please remove it from your cart.`,
        },
        { status: 400 }
      );
    }

    const priceInputs = items.map((item) => ({
      unitPriceCents: products.find((p) => p.id === item.productId)!.price_cents,
      quantity: item.quantity,
    }));
    const discountedLines = applyDiscountToItems(
      priceInputs,
      discount?.valid
        ? { percentOff: discount.percentOff, amountOffCents: discount.amountOffCents }
        : null
    );
    const discountedItems = items.map((item, index) => ({
      product: products.find((p) => p.id === item.productId)!,
      quantity: item.quantity,
      unitPriceCents: discountedLines[index].unitPriceCents,
    }));

    const [settings, shippingZones] = await Promise.all([
      getProductSettings(),
      getShippingZones(),
    ]);
    const matchedZone = matchShippingZone(shipping.postalCode, shippingZones);
    const shippingFeeCents = matchedZone?.rate_cents ?? 0;

    const totals = computeOrderTotals(
      priceInputs,
      discount?.valid
        ? { percentOff: discount.percentOff, amountOffCents: discount.amountOffCents }
        : null,
      settings,
      shippingFeeCents
    );
    const { gstCents: gstAmountCents, grandTotalCents: amountTotalCents } = totals;

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
        shipping_fee_cents: shippingFeeCents,
        shipping_zone_name: matchedZone?.name ?? null,
        gst_amount_cents: gstAmountCents,
        customer_email: shipping.email.trim(),
        customer_gstin: gstin,
        discount_code: discount?.valid ? discount.code : null,
        shipping_name: shipping.name.trim(),
        shipping_phone: shipping.phone.trim(),
        shipping_address_line1: shipping.addressLine1.trim(),
        shipping_address_line2: shipping.addressLine2?.trim() || null,
        shipping_city: shipping.city.trim(),
        shipping_state: shipping.state.trim(),
        shipping_postal_code: shipping.postalCode.trim(),
        shipping_country: shipping.country?.trim() || "IN",
        billing_same_as_shipping: billingSameAsShipping,
        billing_name: billingSameAsShipping ? shipping.name.trim() : billing!.name.trim(),
        billing_address_line1: billingSameAsShipping
          ? shipping.addressLine1.trim()
          : billing!.addressLine1.trim(),
        billing_address_line2: billingSameAsShipping
          ? shipping.addressLine2?.trim() || null
          : billing!.addressLine2?.trim() || null,
        billing_city: billingSameAsShipping ? shipping.city.trim() : billing!.city.trim(),
        billing_state: billingSameAsShipping ? shipping.state.trim() : billing!.state.trim(),
        billing_postal_code: billingSameAsShipping
          ? shipping.postalCode.trim()
          : billing!.postalCode.trim(),
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
      shippingFeeCents,
      gstAmountCents,
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
