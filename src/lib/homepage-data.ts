import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type HeroBanner = {
  id: string;
  image_url: string;
  sort_order: number;
  category_id: string | null;
  subcategory_id: string | null;
};
export type PromoBanner = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
};

export async function getHeroBanners(): Promise<HeroBanner[]> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("hero_banners")
    .select("id, image_url, sort_order, category_id, subcategory_id")
    .order("sort_order")
    .returns<HeroBanner[]>();
  return data ?? [];
}

export async function getActivePromoBanner(): Promise<PromoBanner | null> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("promo_banners")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle<PromoBanner>();
  return data ?? null;
}

export async function getAllPromoBanners(): Promise<PromoBanner[]> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("promo_banners")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<PromoBanner[]>();
  return data ?? [];
}
