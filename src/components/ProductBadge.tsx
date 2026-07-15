import { ProductBadge as ProductBadgeType } from "@/types/product";

const LABELS: Record<ProductBadgeType, string> = {
  bestseller: "Bestseller",
  new: "New",
  sale: "Sale",
};

const STYLES: Record<ProductBadgeType, string> = {
  bestseller: "bg-brand-maroon text-brand-cream",
  new: "bg-brand-gold text-brand-maroon-dark",
  sale: "bg-brand-terracotta text-brand-cream",
};

export function ProductBadge({ badge }: { badge: ProductBadgeType | null }) {
  if (!badge) return null;
  return (
    <span
      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STYLES[badge]}`}
    >
      {LABELS[badge]}
    </span>
  );
}
