import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ShippingZone } from "@/lib/shipping-zones";

export async function getShippingZones(): Promise<ShippingZone[]> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("shipping_zones")
    .select("id, name, pin_prefixes, rate_cents, sort_order")
    .order("sort_order", { ascending: true })
    .returns<ShippingZone[]>();
  return data ?? [];
}
