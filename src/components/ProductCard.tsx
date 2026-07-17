"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { ProductBadge } from "@/components/ProductBadge";
import { RatingStars } from "@/components/RatingStars";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/product/${product.id}`} className="relative block">
        <ProductBadge badge={product.badge} />
        <div className="aspect-[3/4] w-full overflow-hidden bg-line">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-medium leading-snug text-ink">
            {product.name}
          </h3>
        </Link>
        <p className="text-[11px] uppercase tracking-wide text-ink-muted">
          {product.fabric}
        </p>
        <RatingStars rating={product.rating} count={product.rating_count} />
        <div className="mt-0.5 flex items-baseline gap-2">
          <p className="font-semibold tabular-nums text-accent">
            {formatPrice(product.price_cents)}
          </p>
          {product.compare_at_price_cents && (
            <p className="text-xs tabular-nums text-ink-muted line-through">
              {formatPrice(product.compare_at_price_cents)}
            </p>
          )}
        </div>
        <button
          onClick={() => addItem(product)}
          disabled={product.stock <= 0}
          className="mt-2 rounded-full bg-ink px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-40"
        >
          {product.stock > 0 ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </div>
  );
}
