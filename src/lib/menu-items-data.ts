import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type MenuItemKey = "onam" | "new_arrivals" | "bestsellers";
export type MenuItemRow = {
  id: string;
  key: MenuItemKey;
  label: string | null;
  show_on_menu: boolean;
};

export async function getMenuItems(): Promise<MenuItemRow[]> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("menu_items")
    .select("id, key, label, show_on_menu")
    .returns<MenuItemRow[]>();
  return data ?? [];
}
