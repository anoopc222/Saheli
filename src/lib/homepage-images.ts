import { optimizeAndUploadImage, deleteStoredImage } from "@/lib/image-optimize";

const HOMEPAGE_MAX_DIMENSION = 1600; // longest side, px — homepage banners run full-width

export async function uploadHomepageImage(
  file: File,
  folder: "hero" | "promo"
): Promise<string | null> {
  return optimizeAndUploadImage(file, {
    folder: `${folder}/`,
    maxDimension: HOMEPAGE_MAX_DIMENSION,
  });
}

export { deleteStoredImage as deleteHomepageImage };
