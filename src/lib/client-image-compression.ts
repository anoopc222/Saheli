const DEFAULT_MAX_DIMENSION = 1200;
const IMAGE_QUALITY = 0.88;

// Resize + re-encode an image in the browser before upload. Server Actions
// (and Vercel's underlying function invocation) cap request bodies well
// under what a raw phone photo can be, so shrinking client-side is what
// keeps multi-image / banner uploads from failing with a generic server
// error on large originals.
export async function compressImageFile(
  file: File,
  maxDimension: number = DEFAULT_MAX_DIMENSION
): Promise<File> {
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Prefer WebP (smaller at equal quality); some browsers silently fall
    // back to PNG for unsupported types, which would bloat the upload, so
    // verify the result and re-encode as JPEG if that happened.
    let blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY)
    );
    let type = "image/webp";
    let ext = "webp";
    if (!blob || blob.type !== "image/webp") {
      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", IMAGE_QUALITY)
      );
      type = "image/jpeg";
      ext = "jpg";
    }
    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
    return new File([blob], name, { type });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}
