"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function updateProductSettingsAction(formData: FormData) {
  const days = Math.max(1, Math.round(Number(formData.get("new_badge_days")) || 30));
  const bestsellerCount = Math.max(
    0,
    Math.round(Number(formData.get("bestseller_count")) || 0)
  );
  const shippingFeeCents = Math.max(
    0,
    Math.round(Number(formData.get("shipping_fee")) * 100 || 0)
  );
  const supabase = createServiceRoleSupabaseClient();

  const { data: existing } = await supabase
    .from("product_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("product_settings")
      .update({
        new_badge_days: days,
        bestseller_count: bestsellerCount,
        shipping_fee_cents: shippingFeeCents,
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("product_settings").insert({
      new_badge_days: days,
      bestseller_count: bestsellerCount,
      shipping_fee_cents: shippingFeeCents,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}
