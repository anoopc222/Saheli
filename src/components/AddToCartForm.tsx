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
        className="w-16 rounded-md border border-brand-line px-2 py-2 text-sm"
      />
      <button
        onClick={() => {
          addItem(product, quantity);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        disabled={product.stock <= 0}
        className="rounded-md bg-brand-maroon px-4 py-2 text-sm font-medium text-brand-cream transition-colors hover:bg-brand-maroon-dark disabled:opacity-40"
      >
        {product.stock <= 0 ? "Out of stock" : added ? "Added!" : "Add to cart"}
      </button>
    </div>
  );
}
