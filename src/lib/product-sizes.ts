import { ProductSize } from "@/types/product";

export const COMMON_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];

export const SIZES_SELECT = "sizes:product_sizes(size, stock, sort_order)";

export function sortSizes(sizes: ProductSize[] | undefined): ProductSize[] {
  return [...(sizes ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}

export function totalSizeStock(sizes: ProductSize[] | undefined): number {
  return (sizes ?? []).reduce((sum, s) => sum + s.stock, 0);
}

export function stockForSize(
  sizes: ProductSize[] | undefined,
  size: string | null
): number {
  if (!size) return 0;
  return sizes?.find((s) => s.size === size)?.stock ?? 0;
}
