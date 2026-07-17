"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { uploadHomepageImage, deleteHomepageImage } from "@/lib/homepage-images";

function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

function parsePromoFields(formData: FormData) {
  return {
    title: String(formData.get("title") || "").trim(),
    subtitle: String(formData.get("subtitle") || "").trim(),
    button_text: String(formData.get("button_text") || "Shop Now").trim(),
    button_link: String(formData.get("button_link") || "/").trim(),
  };
}

export async function createPromoAction(formData: FormData) {
  const supabase = createServiceRoleSupabaseClient();
  const fields = parsePromoFields(formData);
  const file = formData.get("image") as File | null;
  const imageUrl = file ? await uploadHomepageImage(file, "promo") : null;

  const { error } = await supabase.from("promo_banners").insert({
    ...fields,
    image_url: imageUrl || "",
  });
  if (error) throw new Error(error.message);

  revalidateHome();
  redirect("/admin/homepage");
}

export async function updatePromoAction(
  promoId: string,
  oldImageUrl: string,
  formData: FormData
) {
  const supabase = createServiceRoleSupabaseClient();
  const fields = parsePromoFields(formData);
  const file = formData.get("image") as File | null;
  const imageUrl = file && file.size > 0 ? await uploadHomepageImage(file, "promo") : null;

  const update: Record<string, unknown> = { ...fields };
  if (imageUrl) update.image_url = imageUrl;

  const { error } = await supabase
    .from("promo_banners")
    .update(update)
    .eq("id", promoId);
  if (error) throw new Error(error.message);

  if (imageUrl) {
    await deleteHomepageImage(oldImageUrl);
  }

  revalidateHome();
  redirect("/admin/homepage");
}

export async function deletePromoAction(formData: FormData) {
  const id = String(formData.get("id"));
  const imageUrl = String(formData.get("image_url") || "");
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("promo_banners").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await deleteHomepageImage(imageUrl);
  revalidateHome();
}

export async function setActivePromoAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = createServiceRoleSupabaseClient();

  const { error: deactivateError } = await supabase
    .from("promo_banners")
    .update({ is_active: false })
    .neq("id", id);
  if (deactivateError) throw new Error(deactivateError.message);

  const { error } = await supabase
    .from("promo_banners")
    .update({ is_active: true })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateHome();
}
