"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

function revalidateAll() {
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function updateMenuItemLabelAction(formData: FormData) {
  const id = String(formData.get("id"));
  const label = String(formData.get("label") || "").trim();
  if (!label) return;
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("menu_items").update({ label }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function setMenuItemVisibilityAction(formData: FormData) {
  const id = String(formData.get("id"));
  const showOnMenu = formData.get("show_on_menu") === "true";
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ show_on_menu: showOnMenu })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}
