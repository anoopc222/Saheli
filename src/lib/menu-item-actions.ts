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

export async function createMenuItemAction(formData: FormData) {
  const label = String(formData.get("label") || "").trim();
  const tag = String(formData.get("tag") || "").trim();
  if (!label || !tag) return;
  const supabase = createServiceRoleSupabaseClient();
  const { count } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true });
  const { error } = await supabase.from("menu_items").insert({
    key: null,
    label,
    tag,
    show_on_menu: true,
    protected: false,
    sort_order: (count ?? 0) + 1,
  });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function updateMenuItemTagAction(formData: FormData) {
  const id = String(formData.get("id"));
  const tag = String(formData.get("tag") || "").trim();
  if (!tag) return;
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("menu_items").update({ tag }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteMenuItemAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = createServiceRoleSupabaseClient();
  const { data: row } = await supabase
    .from("menu_items")
    .select("protected")
    .eq("id", id)
    .maybeSingle<{ protected: boolean }>();
  if (row?.protected) throw new Error("This menu item can't be deleted.");
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function moveMenuItemAction(formData: FormData) {
  const id = String(formData.get("id"));
  const direction = String(formData.get("direction"));
  const supabase = createServiceRoleSupabaseClient();
  const { data: rows } = await supabase
    .from("menu_items")
    .select("id, sort_order")
    .order("sort_order")
    .returns<{ id: string; sort_order: number }[]>();
  const list = rows ?? [];
  const index = list.findIndex((row) => row.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= list.length) return;
  const current = list[index];
  const swapWith = list[swapIndex];
  await supabase.from("menu_items").update({ sort_order: swapWith.sort_order }).eq("id", current.id);
  await supabase.from("menu_items").update({ sort_order: current.sort_order }).eq("id", swapWith.id);
  revalidateAll();
}
