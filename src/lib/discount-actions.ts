"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function createDiscountCodeAction(formData: FormData) {
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const type = String(formData.get("type") || "percent");
  const amount = Number(formData.get("amount") || 0);
  if (!code || amount <= 0) return;

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("discount_codes").insert({
    code,
    percent_off: type === "percent" ? Math.round(amount) : null,
    amount_off_cents: type === "amount" ? Math.round(amount * 100) : null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function setDiscountCodeActiveAction(formData: FormData) {
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("discount_codes")
    .update({ active })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function deleteDiscountCodeAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("discount_codes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}
