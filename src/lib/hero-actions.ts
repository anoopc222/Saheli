"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { uploadHomepageImage, deleteHomepageImage } from "@/lib/homepage-images";

const MAX_HERO_IMAGES = 6;

function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export async function addHeroImagesAction(formData: FormData) {
  const supabase = createServiceRoleSupabaseClient();
  const files = (formData.getAll("images") as File[]).filter(
    (file) => file && file.size > 0
  );
  if (files.length === 0) return;

  const { count } = await supabase
    .from("hero_banners")
    .select("*", { count: "exact", head: true });
  const existingCount = count ?? 0;

  if (existingCount + files.length > MAX_HERO_IMAGES) {
    throw new Error(
      `Maximum ${MAX_HERO_IMAGES} hero images allowed. You can add ${Math.max(0, MAX_HERO_IMAGES - existingCount)} more.`
    );
  }

  // Upload and insert sequentially (not Promise.all) so sort_order reflects
  // the order the admin arranged the previews in, not upload completion order.
  for (let i = 0; i < files.length; i++) {
    const imageUrl = await uploadHomepageImage(files[i], "hero");
    if (!imageUrl) continue;
    const { error } = await supabase.from("hero_banners").insert({
      image_url: imageUrl,
      sort_order: existingCount + i + 1,
    });
    if (error) throw new Error(error.message);
  }

  revalidateHome();
}

export async function deleteHeroImageAction(formData: FormData) {
  const id = String(formData.get("id"));
  const imageUrl = String(formData.get("image_url") || "");
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("hero_banners").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await deleteHomepageImage(imageUrl);
  revalidateHome();
}

export async function reorderHeroImagesAction(orderedIds: string[]) {
  const supabase = createServiceRoleSupabaseClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("hero_banners").update({ sort_order: index + 1 }).eq("id", id)
    )
  );
  revalidateHome();
}
