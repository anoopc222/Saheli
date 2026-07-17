"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB raw upload ceiling
const MAX_DIMENSION = 1200; // longest side, px
const WEBP_QUALITY = 80;
const STORAGE_PATH_MARKER = "/object/public/product-images/";

async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large (max 20MB).");
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const outputBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const supabase = createServiceRoleSupabaseClient();
  const path = `${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, outputBuffer, {
      contentType: "image/webp",
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

function extractStoragePath(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const idx = imageUrl.indexOf(STORAGE_PATH_MARKER);
  if (idx === -1) return null;
  return imageUrl.slice(idx + STORAGE_PATH_MARKER.length);
}

async function deleteManagedImage(imageUrl: string | null | undefined) {
  const path = extractStoragePath(imageUrl);
  if (!path) return;
  const supabase = createServiceRoleSupabaseClient();
  await supabase.storage.from("product-images").remove([path]);
}

function parseProductFields(formData: FormData) {
  const comparePrice = formData.get("compare_price");
  return {
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || ""),
    fabric: String(formData.get("fabric") || ""),
    price_cents: Math.round(Number(formData.get("price") || 0) * 100),
    compare_at_price_cents: comparePrice
      ? Math.round(Number(comparePrice) * 100)
      : null,
    badge: (formData.get("badge") as string) || null,
    stock: Number(formData.get("stock") || 0),
  };
}

export async function createProductAction(formData: FormData) {
  const supabase = createServiceRoleSupabaseClient();
  const fields = parseProductFields(formData);
  const file = formData.get("image") as File | null;
  const imageUrl = file ? await uploadImage(file) : null;

  const { error } = await supabase.from("products").insert({
    ...fields,
    image_url: imageUrl || "",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProductAction(
  productId: string,
  oldImageUrl: string,
  formData: FormData
) {
  const supabase = createServiceRoleSupabaseClient();
  const fields = parseProductFields(formData);
  const file = formData.get("image") as File | null;
  const imageUrl = file ? await uploadImage(file) : null;

  const update: Record<string, unknown> = { ...fields };
  if (imageUrl) update.image_url = imageUrl;

  const { error } = await supabase
    .from("products")
    .update(update)
    .eq("id", productId);
  if (error) throw new Error(error.message);

  if (imageUrl) {
    await deleteManagedImage(oldImageUrl);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get("id"));
  const imageUrl = String(formData.get("image_url") || "");
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await deleteManagedImage(imageUrl);

  revalidatePath("/admin/products");
  revalidatePath("/");
}
