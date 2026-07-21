"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@/types/product";
import { useCart } from "@/lib/cart-context";
import { CheckIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";

export function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [limitMessage, setLimitMessage] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { rootMargin: "-60px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleIncrement() {
    if (quantity >= product.stock) {
      setLimitMessage(true);
      setTimeout(() => setLimitMessage(false), 2000);
      return;
    }
    setQuantity((q) => q + 1);
  }

  function handleAdd() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <>
      <div ref={sentinelRef} className="mt-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-line">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-accent-soft hover:text-accent"
            >
              &minus;
            </button>
            <span className="w-6 text-center text-sm tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={handleIncrement}
              aria-label="Increase quantity"
              className={`flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-accent-soft hover:text-accent ${
                quantity >= product.stock ? "opacity-30" : ""
              }`}
            >
              +
            </button>
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`flex-1 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-40 ${
              added ? "animate-bump" : ""
            }`}
          >
            {product.stock <= 0 ? (
              "Sold Out"
            ) : added ? (
              <span className="flex items-center justify-center gap-1.5">
                <CheckIcon className="h-4 w-4 animate-pop-in" />
                Added!
              </span>
            ) : (
              "Add to cart"
            )}
          </button>
        </div>
        {limitMessage && (
          <p className="mt-1.5 text-xs text-accent">Only {product.stock} in stock</p>
        )}
      </div>

      {showSticky && product.stock > 0 && (
        <div className="fixed inset-x-0 bottom-[3.675rem] z-20 border-t border-line bg-paper-raised/95 px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="mx-auto flex max-w-[480px] items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{product.name}</p>
              <p className="text-sm font-semibold text-accent">
                {formatPrice(product.price_cents)}
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent"
            >
              {added ? "Added!" : "Add to cart"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
