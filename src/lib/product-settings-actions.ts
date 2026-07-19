"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type SettingsRow = {
  new_badge_days: number;
  bestseller_count: number;
  gst_enabled: boolean;
  gst_threshold_cents: number;
  gst_low_rate_percent: number;
  gst_high_rate_percent: number;
  gstin_field_enabled: boolean;
};

const DEFAULTS: SettingsRow = {
  new_badge_days: 30,
  bestseller_count: 5,
  gst_enabled: true,
  gst_threshold_cents: 250000,
  gst_low_rate_percent: 5,
  gst_high_rate_percent: 18,
  gstin_field_enabled: true,
};

// Each settings section on the Dashboard submits only the field(s) it owns —
// whatever isn't present in this particular submission is left untouched.
export async function updateProductSettingsAction(formData: FormData) {
  const supabase = createServiceRoleSupabaseClient();
  const { data: existing } = await supabase
    .from("product_settings")
    .select(
      "id, new_badge_days, bestseller_count, gst_enabled, gst_threshold_cents, gst_low_rate_percent, gst_high_rate_percent, gstin_field_enabled"
    )
    .limit(1)
    .maybeSingle<SettingsRow & { id: string }>();

  const current: SettingsRow = existing ?? DEFAULTS;

  const fields: SettingsRow = {
    new_badge_days: formData.has("new_badge_days")
      ? Math.max(1, Math.round(Number(formData.get("new_badge_days")) || 30))
      : current.new_badge_days,
    bestseller_count: formData.has("bestseller_count")
      ? Math.max(0, Math.round(Number(formData.get("bestseller_count")) || 0))
      : current.bestseller_count,
    gst_enabled: formData.has("gst_enabled")
      ? formData.get("gst_enabled") === "true"
      : current.gst_enabled,
    gst_threshold_cents: formData.has("gst_threshold")
      ? Math.max(0, Math.round(Number(formData.get("gst_threshold")) * 100 || 0))
      : current.gst_threshold_cents,
    gst_low_rate_percent: formData.has("gst_low_rate")
      ? Math.max(0, Number(formData.get("gst_low_rate")) || 0)
      : current.gst_low_rate_percent,
    gst_high_rate_percent: formData.has("gst_high_rate")
      ? Math.max(0, Number(formData.get("gst_high_rate")) || 0)
      : current.gst_high_rate_percent,
    gstin_field_enabled: formData.has("gstin_field_enabled")
      ? formData.get("gstin_field_enabled") === "true"
      : current.gstin_field_enabled,
  };

  if (existing) {
    const { error } = await supabase
      .from("product_settings")
      .update(fields)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("product_settings").insert(fields);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}
