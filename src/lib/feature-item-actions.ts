"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function createFeatureItemAction(formData: FormData) {
  const icon = String(formData.get("icon") || "truck");
  const label = String(formData.get("label") || "").trim();
  const sub = String(formData.get("sub") || "").trim();
  if (!label) return;
  const supabase = createServiceRoleSupabaseClient();
  const { count } = await supabase
    .from("feature_items")
    .select("*", { count: "exact", head: true });
  const { error } = await supabase.from("feature_items").insert({
    icon,
    label,
    sub,
    sort_order: (count ?? 0) + 1,
  });
  if (error) throw new Error(error.message);
  revalidateHome();
}

export async function updateFeatureItemAction(formData: FormData) {
  const id = String(formData.get("id"));
  const icon = String(formData.get("icon") || "truck");
  const label = String(formData.get("label") || "").trim();
  const sub = String(formData.get("sub") || "").trim();
  if (!label) return;
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("feature_items")
    .update({ icon, label, sub })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateHome();
}

export async function deleteFeatureItemAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("feature_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateHome();
}

export async function moveFeatureItemAction(formData: FormData) {
  const id = String(formData.get("id"));
  const direction = String(formData.get("direction"));
  const supabase = createServiceRoleSupabaseClient();
  const { data: rows } = await supabase
    .from("feature_items")
    .select("id, sort_order")
    .order("sort_order")
    .returns<{ id: string; sort_order: number }[]>();
  const list = rows ?? [];
  const index = list.findIndex((row) => row.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= list.length) return;
  const current = list[index];
  const swapWith = list[swapIndex];
  await supabase.from("feature_items").update({ sort_order: swapWith.sort_order }).eq("id", current.id);
  await supabase.from("feature_items").update({ sort_order: current.sort_order }).eq("id", swapWith.id);
  revalidateHome();
}

export async function setFeatureRowVisibilityAction(formData: FormData) {
  const id = String(formData.get("id"));
  const showOnHome = formData.get("show_on_home") === "true";
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("feature_row_settings")
    .update({ show_on_home: showOnHome })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateHome();
}
