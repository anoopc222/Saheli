"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useWishlist } from "@/lib/wishlist-context";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types/product";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (ids.length === 0) {
        setProducts([]);
        return;
      }
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .in("id", ids)
        .returns<Product[]>();
      if (!cancelled) setProducts(data ?? []);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="mx-auto max-w-[480px] px-4 py-6">
      <h1 className="mb-1 font-heading text-2xl font-semibold text-ink">
        Wishlist
      </h1>
      <p className="mb-5 text-xs text-ink-muted">
        {ids.length} {ids.length === 1 ? "item" : "items"}
      </p>
      {ids.length === 0 ? (
        <div className="rounded-2xl border border-line bg-paper-raised p-6 text-center">
          <p className="text-sm text-ink-muted">Your wishlist is empty.</p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Browse sarees
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
