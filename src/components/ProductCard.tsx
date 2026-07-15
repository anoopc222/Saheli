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
    <div className="flex flex-col overflow-hidden rounded-xl border border-brand-line bg-white/60 transition-shadow hover:shadow-lg dark:bg-white/5">
      <Link href={`/product/${product.id}`} className="relative block">
        <ProductBadge badge={product.badge} />
        <div className="aspect-[3/4] w-full overflow-hidden bg-brand-line">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium leading-snug">{product.name}</h3>
        </Link>
        <p className="text-xs uppercase tracking-wide text-brand-maroon-dark/60">
          {product.fabric}
        </p>
        <RatingStars rating={product.rating} count={product.rating_count} />
        <div className="mt-1 flex items-baseline gap-2">
          <p className="font-semibold text-brand-maroon">
            {formatPrice(product.price_cents)}
          </p>
          {product.compare_at_price_cents && (
            <p className="text-sm text-brand-maroon-dark/40 line-through">
              {formatPrice(product.compare_at_price_cents)}
            </p>
          )}
        </div>
        <button
          onClick={() => addItem(product)}
          disabled={product.stock <= 0}
          className="mt-3 rounded-md bg-brand-maroon px-3 py-2 text-sm font-medium text-brand-cream transition-colors hover:bg-brand-maroon-dark disabled:opacity-40"
        >
          {product.stock > 0 ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </div>
  );
}
