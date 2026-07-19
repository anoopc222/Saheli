"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { ProductBadge } from "@/components/ProductBadge";
import { RatingStars } from "@/components/RatingStars";
import { HeartIcon } from "@/components/icons";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, setQuantity, lines } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const quantityInCart = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;
  const [limitMessage, setLimitMessage] = useState(false);

  function handleIncrement() {
    if (quantityInCart >= product.stock) {
      setLimitMessage(true);
      setTimeout(() => setLimitMessage(false), 2000);
      return;
    }
    addItem(product, 1);
  }
  const discountPct = product.compare_at_price_cents
    ? Math.round(
        ((product.compare_at_price_cents - product.price_cents) / product.compare_at_price_cents) * 100
      )
    : 0;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-paper-raised shadow-sm transition-shadow hover:shadow-md">
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
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                product.stock <= 0 ? "grayscale" : ""
              }`}
            />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink">
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
        <div className="mt-auto pt-2">
          {product.stock <= 0 ? (
            <button
              disabled
              className="rounded-md bg-brand px-3 py-2 text-xs font-medium text-white opacity-40"
            >
              Sold Out
            </button>
          ) : quantityInCart > 0 ? (
            <div>
              <div className="flex items-center justify-between rounded-md bg-brand px-1 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity(product.id, quantityInCart - 1)}
                  aria-label="Decrease quantity"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm font-medium text-white transition-colors hover:bg-brand-dark"
                >
                  &minus;
                </button>
                <span className="text-xs font-medium tabular-nums text-white">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm font-medium text-white transition-colors hover:bg-brand-dark ${
                    quantityInCart >= product.stock ? "opacity-40" : ""
                  }`}
                >
                  +
                </button>
              </div>
              {limitMessage && (
                <p className="mt-1 text-[10px] text-accent">
                  Only {product.stock} in stock
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => addItem(product)}
              className="rounded-md bg-brand px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
