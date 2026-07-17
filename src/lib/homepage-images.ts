import sharp from "sharp";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB raw upload ceiling
const MAX_DIMENSION = 1600; // longest side, px — homepage banners run full-width
const WEBP_QUALITY = 85;
const BUCKET = "product-images";
const STORAGE_PATH_MARKER = `/object/public/${BUCKET}/`;

async function resizeToWebp(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer)
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

export async function uploadHomepageImage(
  file: File,
  folder: "hero" | "promo"
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large (max 20MB).");
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let outputBuffer: Buffer;
  if (file.type === "image/webp") {
    const meta = await sharp(inputBuffer).metadata();
    const withinBounds =
      (meta.width ?? 0) <= MAX_DIMENSION && (meta.height ?? 0) <= MAX_DIMENSION;
    outputBuffer = withinBounds ? inputBuffer : await resizeToWebp(inputBuffer);
  } else {
    outputBuffer = await resizeToWebp(inputBuffer);
  }

  const supabase = createServiceRoleSupabaseClient();
  const path = `${folder}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, outputBuffer, {
      contentType: "image/webp",
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function extractStoragePath(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const idx = imageUrl.indexOf(STORAGE_PATH_MARKER);
  if (idx === -1) return null;
  return imageUrl.slice(idx + STORAGE_PATH_MARKER.length);
}

export async function deleteHomepageImage(imageUrl: string | null | undefined) {
  const path = extractStoragePath(imageUrl);
  if (!path) return;
  const supabase = createServiceRoleSupabaseClient();
  await supabase.storage.from(BUCKET).remove([path]);
}
