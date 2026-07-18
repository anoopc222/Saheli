import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type ProductSettings = {
  id: string;
  new_badge_days: number;
  bestseller_count: number;
  shipping_fee_cents: number;
  gst_threshold_cents: number;
  gst_low_rate_percent: number;
  gst_high_rate_percent: number;
};

const DEFAULT_SETTINGS: ProductSettings = {
  id: "",
  new_badge_days: 30,
  bestseller_count: 5,
  shipping_fee_cents: 0,
  gst_threshold_cents: 250000,
  gst_low_rate_percent: 5,
  gst_high_rate_percent: 18,
};

export async function getProductSettings(): Promise<ProductSettings> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("product_settings")
    .select(
      "id, new_badge_days, bestseller_count, shipping_fee_cents, gst_threshold_cents, gst_low_rate_percent, gst_high_rate_percent"
    )
    .limit(1)
    .maybeSingle();
  return (data as ProductSettings | null) ?? DEFAULT_SETTINGS;
}
