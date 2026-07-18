"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { useCart } from "@/lib/cart-context";

export function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-6 flex items-center gap-3">
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
          onClick={() =>
            setQuantity((q) => Math.min(Math.max(product.stock, 1), q + 1))
          }
          disabled={quantity >= product.stock}
          aria-label="Increase quantity"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-accent-soft hover:text-accent disabled:opacity-30"
        >
          +
        </button>
      </div>
      <button
        onClick={() => {
          addItem(product, quantity);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        disabled={product.stock <= 0}
        className="flex-1 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-40"
      >
        {product.stock <= 0 ? "Sold Out" : added ? "Added!" : "Add to cart"}
      </button>
    </div>
  );
}
