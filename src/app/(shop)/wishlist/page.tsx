"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useWishlist } from "@/lib/wishlist-context";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { HeartIcon } from "@/components/icons";
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
        .eq("show_on_store", true)
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
    <div className="mx-auto max-w-[480px] px-4 py-6 lg:max-w-6xl">
      <h1 className="mb-1 font-heading text-2xl font-semibold text-ink">
        Wishlist
      </h1>
      <p className="mb-5 text-xs text-ink-muted">
        {ids.length} {ids.length === 1 ? "item" : "items"}
      </p>
      {ids.length === 0 ? (
        <EmptyState
          icon={<HeartIcon className="h-9 w-9" />}
          title="Your wishlist is empty."
          actionHref="/"
          actionLabel="Browse sarees"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
