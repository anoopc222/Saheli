"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="flex flex-col rounded-lg border border-black/10 p-4 dark:border-white/10">
      <Link href={`/product/${product.id}`} className="block">
        <div className="mb-3 aspect-square w-full overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <h3 className="font-medium">{product.name}</h3>
      </Link>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        {formatPrice(product.price_cents)}
      </p>
      <button
        onClick={() => addItem(product)}
        disabled={product.stock <= 0}
        className="mt-3 rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
      >
        {product.stock > 0 ? "Add to cart" : "Out of stock"}
      </button>
    </div>
  );
}
