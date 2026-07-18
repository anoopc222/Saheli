import sharp from "sharp";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB raw upload ceiling
const WEBP_QUALITY = 78;
// Higher effort spends more CPU per image to squeeze out a smaller file at
// the same quality — worth it here since uploads are infrequent admin
// actions, not a hot request path. (0-6, sharp default is 4.)
const WEBP_EFFORT = 6;
const BUCKET = "product-images";
const STORAGE_PATH_MARKER = `/object/public/${BUCKET}/`;

async function resizeToWebp(inputBuffer: Buffer, maxDimension: number): Promise<Buffer> {
  return sharp(inputBuffer)
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
    .toBuffer();
}

// Resizes + re-encodes to WebP server-side and uploads to storage. Skips
// re-encoding a file that's already an optimized WebP within bounds (the
// client compresses before upload) to avoid a second lossy pass — this only
// does real work as a fallback for browsers that couldn't compress client-side.
export async function optimizeAndUploadImage(
  file: File,
  { folder, maxDimension }: { folder: string; maxDimension: number }
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
      (meta.width ?? 0) <= maxDimension && (meta.height ?? 0) <= maxDimension;
    outputBuffer = withinBounds ? inputBuffer : await resizeToWebp(inputBuffer, maxDimension);
  } else {
    outputBuffer = await resizeToWebp(inputBuffer, maxDimension);
  }

  const supabase = createServiceRoleSupabaseClient();
  const path = `${folder}${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, outputBuffer, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function extractStoragePath(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const idx = imageUrl.indexOf(STORAGE_PATH_MARKER);
  if (idx === -1) return null;
  return imageUrl.slice(idx + STORAGE_PATH_MARKER.length);
}

export async function deleteStoredImage(imageUrl: string | null | undefined) {
  const path = extractStoragePath(imageUrl);
  if (!path) return;
  const supabase = createServiceRoleSupabaseClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function deleteStoredImages(imageUrls: (string | null | undefined)[]) {
  const paths = imageUrls
    .map(extractStoragePath)
    .filter((path): path is string => Boolean(path));
  if (paths.length === 0) return;
  const supabase = createServiceRoleSupabaseClient();
  await supabase.storage.from(BUCKET).remove(paths);
}
