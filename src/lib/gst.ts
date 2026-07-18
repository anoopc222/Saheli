export type GstSettings = {
  gst_threshold_cents: number;
  gst_low_rate_percent: number;
  gst_high_rate_percent: number;
};

// Prices are GST-inclusive, so this backs the tax out of what was actually
// charged (unit_price_cents is already the final, post-discount price) —
// it's a display breakdown, never an amount added on top.
export function gstRateForUnitPrice(unitPriceCents: number, settings: GstSettings): number {
  return unitPriceCents <= settings.gst_threshold_cents
    ? settings.gst_low_rate_percent
    : settings.gst_high_rate_percent;
}

export function gstAmountForLine(
  unitPriceCents: number,
  quantity: number,
  settings: GstSettings
): number {
  const rate = gstRateForUnitPrice(unitPriceCents, settings);
  const lineTotal = unitPriceCents * quantity;
  return Math.round((lineTotal * rate) / (100 + rate));
}

export function totalGstCents(
  items: { unitPriceCents: number; quantity: number }[],
  settings: GstSettings
): number {
  return items.reduce(
    (sum, item) => sum + gstAmountForLine(item.unitPriceCents, item.quantity, settings),
    0
  );
}
