import { ProductBadge as ProductBadgeType } from "@/types/product";

const LABELS: Record<ProductBadgeType, string> = {
  bestseller: "Bestseller",
  new: "New",
  sale: "Sale",
};

const STYLES: Record<ProductBadgeType, string> = {
  bestseller: "bg-ink text-white",
  new: "bg-accent-soft text-ink",
  sale: "bg-accent text-white",
};

// A ribbon/tag shape (flush to the image edge, notched point on the right)
// instead of a plain rounded pill — reads as a proper badge rather than a
// floating button.
const RIBBON_CLIP =
  "polygon(0 0, calc(100% - 9px) 0, 100% 50%, calc(100% - 9px) 100%, 0 100%)";

export function ProductBadge({
  badge,
  stock,
}: {
  badge: ProductBadgeType | null;
  stock?: number;
}) {
  if (stock !== undefined && stock <= 0) {
    return (
      <span
        className="absolute left-0 top-3 flex h-7 items-center bg-ink/80 py-1 pl-3 pr-4 text-[0.8125rem] font-medium text-white"
        style={{ clipPath: RIBBON_CLIP }}
      >
        Sold Out
      </span>
    );
  }
  if (!badge) return null;
  return (
    <span
      className={`absolute left-0 top-3 flex h-7 items-center py-1 pl-3 pr-4 text-[0.8125rem] font-medium ${STYLES[badge]}`}
      style={{ clipPath: RIBBON_CLIP }}
    >
      {LABELS[badge]}
    </span>
  );
}
