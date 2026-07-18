import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type ProductSettings = {
  id: string;
  new_badge_days: number;
  bestseller_count: number;
};

const DEFAULT_SETTINGS: ProductSettings = {
  id: "",
  new_badge_days: 30,
  bestseller_count: 5,
};

export async function getProductSettings(): Promise<ProductSettings> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("product_settings")
    .select("id, new_badge_days, bestseller_count")
    .limit(1)
    .maybeSingle();
  return (data as ProductSettings | null) ?? DEFAULT_SETTINGS;
}
