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

export async function createCategoryAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const supabase = createServiceRoleSupabaseClient();
  const { count } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });
  const { error } = await supabase.from("categories").insert({
    name,
    slug: slugify(name),
    sort_order: (count ?? 0) + 1,
  });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function createSubcategoryAction(formData: FormData) {
  const categoryId = String(formData.get("category_id"));
  const name = String(formData.get("name") || "").trim();
  const fabric = String(formData.get("fabric") || "").trim();
  if (!name || !fabric) return;
  const supabase = createServiceRoleSupabaseClient();
  const { count } = await supabase
    .from("subcategories")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);
  const { error } = await supabase.from("subcategories").insert({
    category_id: categoryId,
    name,
    fabric,
    sort_order: (count ?? 0) + 1,
  });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteSubcategoryAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("subcategories")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}
