"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { ProductBadge } from "@/components/ProductBadge";
import { RatingStars } from "@/components/RatingStars";
import { HeartIcon } from "@/components/icons";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discountPct = product.compare_at_price_cents
    ? Math.round(
        ((product.compare_at_price_cents - product.price_cents) / product.compare_at_price_cents) * 100
      )
    : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-md border border-line bg-paper-raised shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/product/${product.id}`} className="relative block">
        <ProductBadge badge={product.badge} stock={product.stock} />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors ${
            wishlisted ? "text-accent" : "text-ink"
          }`}
        >
          <HeartIcon className="h-[1.375rem] w-[1.375rem]" filled={wishlisted} />
        </button>
        <div className="aspect-[164/180] w-full overflow-hidden bg-line">
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
          <p className="text-sm font-semibold tabular-nums text-accent">
            {formatPrice(product.price_cents)}
          </p>
          {product.compare_at_price_cents && (
            <p className="text-xs tabular-nums text-ink-muted line-through">
              {formatPrice(product.compare_at_price_cents)}
            </p>
          )}
          {discountPct > 0 && (
            <p className="text-xs font-medium text-accent">{discountPct}% off</p>
          )}
        </div>
        <button
          onClick={() => addItem(product)}
          disabled={product.stock <= 0}
          className="mt-2 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
        >
          {product.stock > 0 ? "Add to cart" : "Sold Out"}
        </button>
      </div>
    </div>
  );
}
