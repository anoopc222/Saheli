import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type ProductSettings = {
  id: string;
  new_badge_days: number;
  bestseller_count: number;
  gst_enabled: boolean;
  gst_threshold_cents: number;
  gst_low_rate_percent: number;
  gst_high_rate_percent: number;
  gstin_field_enabled: boolean;
};

const DEFAULT_SETTINGS: ProductSettings = {
  id: "",
  new_badge_days: 30,
  bestseller_count: 5,
  gst_enabled: true,
  gst_threshold_cents: 250000,
  gst_low_rate_percent: 5,
  gst_high_rate_percent: 18,
  gstin_field_enabled: true,
};

export async function getProductSettings(): Promise<ProductSettings> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("product_settings")
    .select(
      "id, new_badge_days, bestseller_count, gst_enabled, gst_threshold_cents, gst_low_rate_percent, gst_high_rate_percent, gstin_field_enabled"
    )
    .limit(1)
    .maybeSingle();
  return (data as ProductSettings | null) ?? DEFAULT_SETTINGS;
}
