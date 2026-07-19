export type GstSettings = {
  gst_enabled: boolean;
  gst_threshold_cents: number;
  gst_low_rate_percent: number;
  gst_high_rate_percent: number;
};

// Prices are GST-exclusive — this is tax added on top of what's charged,
// not backed out of it. unitPriceCents is the base (post-discount) price;
// the per-piece sale value decides which slab applies.
export function gstRateForUnitPrice(unitPriceCents: number, settings: GstSettings): number {
  if (!settings.gst_enabled) return 0;
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
  return Math.round((lineTotal * rate) / 100);
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
