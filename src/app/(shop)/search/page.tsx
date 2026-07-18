"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types/product";
import { SearchIcon, XIcon } from "@/components/icons";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const term = query.trim();
    let cancelled = false;

    const timeout = setTimeout(async () => {
      if (!term) {
        if (!cancelled) {
          setProducts([]);
          setSearched(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("show_on_store", true)
        .or(`name.ilike.%${term}%,fabric.ilike.%${term}%`)
        .returns<Product[]>();
      if (!cancelled) {
        setProducts(data ?? []);
        setLoading(false);
        setSearched(true);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div className="mx-auto max-w-[480px] px-4 py-6">
      <h1 className="mb-4 font-heading text-2xl font-semibold text-ink">
        Search
      </h1>
      <div className="relative mb-5">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sarees, fabrics..."
          autoFocus
          className="w-full rounded-full border border-line bg-paper-raised py-3 pl-11 pr-11 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:text-ink"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading && (
        <p className="py-8 text-center text-sm text-ink-muted">Searching...</p>
      )}

      {!loading && searched && products.length === 0 && (
        <div className="rounded-2xl border border-line bg-paper-raised p-6 text-center">
          <p className="text-sm text-ink-muted">
            No results for &ldquo;{query.trim()}&rdquo;.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Browse sarees
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
