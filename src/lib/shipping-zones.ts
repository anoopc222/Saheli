export type ShippingZone = {
  id: string;
  name: string;
  pin_prefixes: string[];
  rate_cents: number;
  sort_order: number;
};

// Zones are checked in sort_order — first one with a matching prefix wins,
// so more specific zones (a local district) should sit at a lower
// sort_order than broad ones (the whole state), and a catch-all zone
// (an empty-string prefix, e.g. "Rest of India") belongs last.
export function matchShippingZone(
  postalCode: string,
  zones: ShippingZone[]
): ShippingZone | null {
  const pin = postalCode.trim();
  if (!pin) return null;

  const sorted = [...zones].sort((a, b) => a.sort_order - b.sort_order);
  for (const zone of sorted) {
    for (const prefix of zone.pin_prefixes) {
      if (prefix === "" || pin.startsWith(prefix)) return zone;
    }
  }
  return null;
}
