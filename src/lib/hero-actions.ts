"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { uploadHomepageImage, deleteHomepageImage } from "@/lib/homepage-images";

const MAX_HERO_IMAGES = 6;

function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

export type AddHeroImagesState = { error: string | null };

type HeroRow = { id: string; image_url: string; sort_order: number; created_at: string };

export async function addHeroImagesAction(
  _prevState: AddHeroImagesState,
  formData: FormData
): Promise<AddHeroImagesState> {
  try {
    const supabase = createServiceRoleSupabaseClient();
    const files = (formData.getAll("images") as File[]).filter(
      (file) => file && file.size > 0
    );
    if (files.length === 0) return { error: null };

    const { data: existing } = await supabase
      .from("hero_banners")
      .select("id, image_url, sort_order, created_at")
      .order("created_at", { ascending: true })
      .returns<HeroRow[]>();
    const current = existing ?? [];
    let maxSortOrder = current.reduce((max, row) => Math.max(max, row.sort_order), 0);

    for (const file of files) {
      // Upload first, before touching any existing row — if this fails, an
      // existing hero image should never be evicted for nothing.
      const imageUrl = await uploadHomepageImage(file, "hero");
      if (!imageUrl) continue;

      // Now that the replacement is safely uploaded, keep a rolling cap of
      // MAX_HERO_IMAGES by dropping the oldest hero image if needed.
      while (current.length >= MAX_HERO_IMAGES) {
        const oldest = current.shift();
        if (!oldest) break;
        await supabase.from("hero_banners").delete().eq("id", oldest.id);
        await deleteHomepageImage(oldest.image_url);
      }

      maxSortOrder += 1;
      const { data: inserted, error } = await supabase
        .from("hero_banners")
        .insert({ image_url: imageUrl, sort_order: maxSortOrder })
        .select("id, image_url, sort_order, created_at")
        .single<HeroRow>();
      if (error) return { error: error.message };
      if (inserted) current.push(inserted);
    }

    revalidateHome();
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't upload images." };
  }
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
