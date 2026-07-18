"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { optimizeAndUploadImage, deleteStoredImages } from "@/lib/image-optimize";

const PRODUCT_MAX_DIMENSION = 1200; // longest side, px
const MAX_IMAGES = 4;

async function uploadImages(files: File[]): Promise<string[]> {
  const valid = files.filter((file) => file && file.size > 0).slice(0, MAX_IMAGES);
  const urls: string[] = [];
  for (const file of valid) {
    const url = await optimizeAndUploadImage(file, {
      folder: "",
      maxDimension: PRODUCT_MAX_DIMENSION,
    });
    if (url) urls.push(url);
  }
  return urls;
}

const deleteManagedImages = deleteStoredImages;

function parseProductFields(formData: FormData) {
  const comparePrice = formData.get("compare_price");
  const costPrice = formData.get("cost_price");
  const priceCents = Math.round(Number(formData.get("price") || 0) * 100);
  const compareAtPriceCents = comparePrice
    ? Math.round(Number(comparePrice) * 100)
    : null;
  const costPriceCents = costPrice ? Math.round(Number(costPrice) * 100) : null;

  if (compareAtPriceCents !== null && compareAtPriceCents <= priceCents) {
    throw new Error("Strike price must be higher than the selling price.");
  }

  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || ""),
    fabric: String(formData.get("fabric") || ""),
    product_code: String(formData.get("product_code") || "").trim() || null,
    price_cents: priceCents,
    compare_at_price_cents: compareAtPriceCents,
    cost_price_cents: costPriceCents,
    badge: (formData.get("badge") as string) || null,
    stock: Number(formData.get("stock") || 0),
    category_id: (formData.get("category_id") as string) || null,
    subcategory_id: (formData.get("subcategory_id") as string) || null,
    tags,
    show_on_store: formData.get("show_on_store") === "true",
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
