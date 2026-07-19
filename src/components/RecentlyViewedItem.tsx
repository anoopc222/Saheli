"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { HeartIcon } from "@/components/icons";

export function RecentlyViewedItem({ product }: { product: Product }) {
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
    <div className="flex gap-3 rounded-md border border-line bg-paper-raised p-3 shadow-sm">
      <Link href={`/product/${product.id}`} className="relative block shrink-0">
        <div className="h-24 w-24 overflow-hidden rounded bg-line">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className={`h-full w-full object-cover ${product.stock <= 0 ? "grayscale" : ""}`}
            />
          )}
        </div>
        {product.stock <= 0 && (
          <span className="absolute left-1 top-1 rounded-full bg-ink/80 px-1.5 py-0.5 text-[9px] font-medium text-white">
            Sold Out
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.id}`} className="min-w-0">
            <h3 className="truncate text-sm font-medium leading-snug text-ink">
              {product.name}
            </h3>
          </Link>
          <button
            type="button"
            onClick={() => toggle(product.id)}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            className={`shrink-0 ${wishlisted ? "text-accent" : "text-ink-muted"}`}
          >
            <HeartIcon className="h-4 w-4" filled={wishlisted} />
          </button>
        </div>
        <p className="text-[11px] uppercase tracking-wide text-ink-muted">{product.fabric}</p>
        <div className="flex items-baseline gap-1.5">
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
        <div className="mt-auto">
          {product.stock <= 0 ? (
            <button
              disabled
              className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white opacity-40"
            >
              Sold Out
            </button>
          ) : quantityInCart > 0 ? (
            <div>
              <div className="flex w-fit items-center justify-between gap-3 rounded-md bg-brand px-1 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity(product.id, quantityInCart - 1)}
                  aria-label="Decrease quantity"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-sm font-medium text-white transition-colors hover:bg-brand-dark"
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
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-sm font-medium text-white transition-colors hover:bg-brand-dark ${
                    quantityInCart >= product.stock ? "opacity-40" : ""
                  }`}
                >
                  +
                </button>
              </div>
              {limitMessage && (
                <p className="mt-1 text-[10px] text-accent">Only {product.stock} in stock</p>
              )}
            </div>
          ) : (
            <button
              onClick={() => addItem(product)}
              className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
