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
      <input
        type="number"
        min={1}
        max={Math.max(product.stock, 1)}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value) || 1)}
        className="w-16 rounded-md border border-black/10 px-2 py-2 text-sm dark:border-white/10"
      />
      <button
        onClick={() => {
          addItem(product, quantity);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        disabled={product.stock <= 0}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
      >
        {product.stock <= 0 ? "Out of stock" : added ? "Added!" : "Add to cart"}
      </button>
    </div>
  );
}
