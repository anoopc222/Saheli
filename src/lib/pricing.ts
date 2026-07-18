import { GstSettings, totalGstCents } from "@/lib/gst";

export type CartItemInput = { unitPriceCents: number; quantity: number };
export type DiscountInput = {
  percentOff: number | null;
  amountOffCents: number | null;
} | null;

export type DiscountedLine = { unitPriceCents: number; quantity: number };

// Distributes a coupon (percent or flat amount) across cart lines
// proportionally, so a partial-cart discount never over- or under-counts
// against the subtotal. Shared between the checkout API (authoritative)
// and the cart/checkout pages (live preview) so the number a customer
// sees never surprises them once they submit.
export function applyDiscountToItems(
  items: CartItemInput[],
  discount: DiscountInput
): DiscountedLine[] {
  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  return items.map((item) => {
    const itemTotal = item.unitPriceCents * item.quantity;
    let discountedItemTotal = itemTotal;
    if (discount) {
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
      unitPriceCents: Math.max(0, Math.round(discountedItemTotal / item.quantity)),
      quantity: item.quantity,
    };
  });
}

export type OrderTotals = {
  subtotalCents: number;
  discountCents: number;
  gstCents: number;
  shippingFeeCents: number;
  grandTotalCents: number;
};

export function computeOrderTotals(
  items: CartItemInput[],
  discount: DiscountInput,
  settings: GstSettings & { shipping_fee_cents: number }
): OrderTotals {
  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  const discountedLines = applyDiscountToItems(items, discount);
  const discountedSubtotalCents = discountedLines.reduce(
    (sum, l) => sum + l.unitPriceCents * l.quantity,
    0
  );
  const discountCents = subtotalCents - discountedSubtotalCents;
  const gstCents = totalGstCents(discountedLines, settings);
  const shippingFeeCents = settings.shipping_fee_cents;
  const grandTotalCents = discountedSubtotalCents + gstCents + shippingFeeCents;

  return { subtotalCents, discountCents, gstCents, shippingFeeCents, grandTotalCents };
}
