import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type SubcategoryRow = { id: string; name: string; fabric: string };
export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  subcategories: SubcategoryRow[];
};

export async function getCategories(): Promise<CategoryRow[]> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, subcategories(id, name, fabric)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "subcategories" })
    .returns<CategoryRow[]>();
  return data ?? [];
}
