"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function revalidateAll() {
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function createMainCategoryAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const supabase = createServiceRoleSupabaseClient();
  const { count } = await supabase
    .from("main_categories")
    .select("*", { count: "exact", head: true });
  const { error } = await supabase.from("main_categories").insert({
    name,
    slug: slugify(name),
    sort_order: (count ?? 0) + 1,
  });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function setMainCategoryMenuVisibilityAction(formData: FormData) {
  const id = String(formData.get("id"));
  const showOnMenu = formData.get("show_on_menu") === "true";
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("main_categories")
    .update({ show_on_menu: showOnMenu })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function updateMainCategoryAction(formData: FormData) {
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("main_categories")
    .update({ name, slug: slugify(name) })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteMainCategoryAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = createServiceRoleSupabaseClient();
  const { count } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
    .eq("main_category_id", id);
  if ((count ?? 0) > 0) {
    throw new Error(
      "Move or delete the categories under this main category first."
    );
  }
  const { error } = await supabase.from("main_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function moveMainCategoryAction(formData: FormData) {
  const id = String(formData.get("id"));
  const direction = String(formData.get("direction"));
  const supabase = createServiceRoleSupabaseClient();
  const { data: rows } = await supabase
    .from("main_categories")
    .select("id, sort_order")
    .order("sort_order")
    .returns<{ id: string; sort_order: number }[]>();
  const list = rows ?? [];
  const index = list.findIndex((row) => row.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= list.length) return;
  const current = list[index];
  const swapWith = list[swapIndex];
  await supabase
    .from("main_categories")
    .update({ sort_order: swapWith.sort_order })
    .eq("id", current.id);
  await supabase
    .from("main_categories")
    .update({ sort_order: current.sort_order })
    .eq("id", swapWith.id);
  revalidateAll();
}
