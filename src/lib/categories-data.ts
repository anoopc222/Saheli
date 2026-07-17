import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type SubcategoryRow = { id: string; name: string; fabric: string };
export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  main_category_id: string;
  show_on_menu: boolean;
  subcategories: SubcategoryRow[];
};
export type MainCategoryRow = { id: string; name: string; slug: string };

export type MenuMainCategory = MainCategoryRow & {
  categories: CategoryRow[];
};

export async function getMainCategories(): Promise<MainCategoryRow[]> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("main_categories")
    .select("id, name, slug")
    .order("sort_order")
    .returns<MainCategoryRow[]>();
  return data ?? [];
}

export async function getCategories(): Promise<CategoryRow[]> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, main_category_id, show_on_menu, subcategories(id, name, fabric)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "subcategories" })
    .returns<CategoryRow[]>();
  return data ?? [];
}

// Storefront navigation tree: main categories, each with only the
// categories (and their subcategories) an admin has opted to show on menu.
export async function getMenuTree(): Promise<MenuMainCategory[]> {
  const [mainCategories, categories] = await Promise.all([
    getMainCategories(),
    getCategories(),
  ]);

  return mainCategories.map((mainCategory) => ({
    ...mainCategory,
    categories: categories.filter(
      (category) =>
        category.main_category_id === mainCategory.id && category.show_on_menu
    ),
  }));
}
