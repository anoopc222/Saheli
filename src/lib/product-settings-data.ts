import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type ProductSettings = { id: string; new_badge_days: number };

const DEFAULT_SETTINGS: ProductSettings = { id: "", new_badge_days: 30 };

export async function getProductSettings(): Promise<ProductSettings> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("product_settings")
    .select("id, new_badge_days")
    .limit(1)
    .maybeSingle();
  return (data as ProductSettings | null) ?? DEFAULT_SETTINGS;
}
