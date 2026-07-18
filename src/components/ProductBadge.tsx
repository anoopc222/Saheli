import { ProductBadge as ProductBadgeType } from "@/types/product";

const LABELS: Record<ProductBadgeType, string> = {
  bestseller: "Bestseller",
  new: "New",
  sale: "Sale",
};

const STYLES: Record<ProductBadgeType, string> = {
  bestseller: "bg-ink text-white",
  new: "bg-paper-raised text-ink",
  sale: "bg-accent text-white",
};

export function ProductBadge({
  badge,
  stock,
}: {
  badge: ProductBadgeType | null;
  stock?: number;
}) {
  if (stock !== undefined && stock <= 0) {
    return (
      <span className="absolute left-3 top-3 flex h-7 items-center rounded-full bg-ink/80 px-3 text-[0.8125rem] font-medium text-white">
        Sold Out
      </span>
    );
  }
  if (!badge) return null;
  return (
    <span
      className={`absolute left-3 top-3 flex h-7 items-center rounded-full px-3 text-[0.8125rem] font-medium ${STYLES[badge]}`}
    >
      {LABELS[badge]}
    </span>
  );
}
