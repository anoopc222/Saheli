import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type FeatureItemRow = {
  id: string;
  icon: string;
  label: string;
  sub: string;
  sort_order: number;
};

export type FeatureRowSettings = { id: string; show_on_home: boolean };

export async function getFeatureItems(): Promise<FeatureItemRow[]> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("feature_items")
    .select("id, icon, label, sub, sort_order")
    .order("sort_order")
    .returns<FeatureItemRow[]>();
  return data ?? [];
}

export async function getFeatureRowSettings(): Promise<FeatureRowSettings | null> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("feature_row_settings")
    .select("id, show_on_home")
    .limit(1)
    .maybeSingle<FeatureRowSettings>();
  return data ?? null;
}
