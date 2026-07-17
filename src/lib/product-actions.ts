"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB raw upload ceiling
const MAX_DIMENSION = 1200; // longest side, px
const WEBP_QUALITY = 85;
const STORAGE_PATH_MARKER = "/object/public/product-images/";

const MAX_IMAGES = 4;

async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large (max 20MB).");
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // The client already resizes and compresses to WebP before upload. Only
  // re-encode here as a fallback (e.g. the browser couldn't compress, or a
  // non-standard file slipped through) — re-encoding an already-optimized
  // WebP would just add a second lossy pass for no benefit.
  let outputBuffer: Buffer;
  if (file.type === "image/webp") {
    const meta = await sharp(inputBuffer).metadata();
    const withinBounds =
      (meta.width ?? 0) <= MAX_DIMENSION && (meta.height ?? 0) <= MAX_DIMENSION;
    outputBuffer = withinBounds
      ? inputBuffer
      : await sharp(inputBuffer)
          .rotate()
          .resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();
  } else {
    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  }

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

async function uploadImages(files: File[]): Promise<string[]> {
  const valid = files.filter((file) => file && file.size > 0).slice(0, MAX_IMAGES);
  const urls: string[] = [];
  for (const file of valid) {
    const url = await uploadImage(file);
    if (url) urls.push(url);
  }
  return urls;
}

function extractStoragePath(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const idx = imageUrl.indexOf(STORAGE_PATH_MARKER);
  if (idx === -1) return null;
  return imageUrl.slice(idx + STORAGE_PATH_MARKER.length);
}

async function deleteManagedImages(imageUrls: (string | null | undefined)[]) {
  const paths = imageUrls
    .map(extractStoragePath)
    .filter((path): path is string => Boolean(path));
  if (paths.length === 0) return;
  const supabase = createServiceRoleSupabaseClient();
  await supabase.storage.from("product-images").remove(paths);
}

function parseProductFields(formData: FormData) {
  const comparePrice = formData.get("compare_price");
  const priceCents = Math.round(Number(formData.get("price") || 0) * 100);
  const compareAtPriceCents = comparePrice
    ? Math.round(Number(comparePrice) * 100)
    : null;

  if (compareAtPriceCents !== null && compareAtPriceCents <= priceCents) {
    throw new Error("Strike price must be higher than the selling price.");
  }

  return {
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || ""),
    fabric: String(formData.get("fabric") || ""),
    price_cents: priceCents,
    compare_at_price_cents: compareAtPriceCents,
    badge: (formData.get("badge") as string) || null,
    stock: Number(formData.get("stock") || 0),
    category_id: (formData.get("category_id") as string) || null,
    subcategory_id: (formData.get("subcategory_id") as string) || null,
  };
}

export async function createProductAction(formData: FormData) {
  const supabase = createServiceRoleSupabaseClient();
  const fields = parseProductFields(formData);
  const files = formData.getAll("images") as File[];
  const imageUrls = await uploadImages(files);

  const { error } = await supabase.from("products").insert({
    ...fields,
    image_url: imageUrls[0] || "",
    image_urls: imageUrls,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/categories");
  redirect("/admin/products");
}

export async function updateProductAction(
  productId: string,
  oldImageUrls: string[],
  formData: FormData
) {
  const supabase = createServiceRoleSupabaseClient();
  const fields = parseProductFields(formData);

  const keepUrls = formData.getAll("keep_images").map(String);
  const removedUrls = oldImageUrls.filter((url) => !keepUrls.includes(url));

  const remainingSlots = Math.max(0, MAX_IMAGES - keepUrls.length);
  const files = (formData.getAll("images") as File[]).slice(0, remainingSlots);
  const newUrls = await uploadImages(files);

  const imageUrls = [...keepUrls, ...newUrls].slice(0, MAX_IMAGES);

  const { error } = await supabase
    .from("products")
    .update({
      ...fields,
      image_url: imageUrls[0] || "",
      image_urls: imageUrls,
    })
    .eq("id", productId);
  if (error) throw new Error(error.message);

  await deleteManagedImages(removedUrls);

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/categories");
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get("id"));
  const imageUrls = formData.getAll("image_urls").map(String);
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await deleteManagedImages(imageUrls);

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/categories");
}
