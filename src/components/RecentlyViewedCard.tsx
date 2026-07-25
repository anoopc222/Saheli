"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { FadeImage } from "@/components/FadeImage";

export function RecentlyViewedCard({ product }: { product: Product }) {
  const { addItem, lines } = useCart();
  const quantityInCart = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;

  return (
    <div className="w-24 shrink-0">
      <Link href={`/product/${product.id}`} className="relative block">
        {product.stock <= 0 && (
          <span className="absolute left-1 top-1 z-10 rounded-full bg-ink/80 px-1.5 py-0.5 text-[9px] font-medium text-white">
            Sold Out
          </span>
        )}
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-line">
          {product.image_url && (
            <FadeImage
              src={product.image_url}
              alt={product.name}
              sizes="96px"
              className={`object-cover ${product.stock <= 0 ? "grayscale" : ""}`}
            />
          )}
        </div>
      </Link>
      <Link href={`/product/${product.id}`}>
        <p className="mt-1.5 line-clamp-1 text-xs font-medium leading-snug text-ink">
          {product.name}
        </p>
      </Link>
      <p className="text-xs font-semibold tabular-nums text-accent">
        {formatPrice(product.price_cents)}
      </p>
      {product.stock > 0 && (
        <button
          onClick={() => addItem(product, 1)}
          disabled={quantityInCart >= product.stock}
          className="mt-1 w-full rounded-full bg-brand px-2 py-1 text-[11px] font-medium text-white shadow-sm transition-colors hover:bg-brand-dark disabled:opacity-40"
        >
          {quantityInCart > 0 ? `In cart (${quantityInCart})` : "Add to cart"}
        </button>
      )}
    </div>
  );
}
