"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { Product } from "@/types/product";
import { SearchIcon, XIcon } from "@/components/icons";
import { SIZES_SELECT } from "@/lib/product-sizes";

const RECENT_SEARCHES_KEY = "shopping-cart-app:recent-searches";
const MAX_RECENT = 6;

function loadRecentSearches(): string[] {
  try {
    const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const existing = loadRecentSearches().filter(
    (t) => t.toLowerCase() !== term.toLowerCase()
  );
  const updated = [term, ...existing].slice(0, MAX_RECENT);
  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  return updated;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

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
        .select(`*, ${SIZES_SELECT}`)
        .eq("show_on_store", true)
        .or(`name.ilike.%${term}%,fabric.ilike.%${term}%`)
        .returns<Product[]>();
      if (!cancelled) {
        setProducts(data ?? []);
        setLoading(false);
        setSearched(true);
        if ((data ?? []).length > 0) {
          setRecentSearches(saveRecentSearch(term));
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  function clearRecentSearches() {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  }

  return (
    <div className="mx-auto max-w-[480px] px-4 py-6 lg:max-w-6xl">
      <h1 className="mb-4 font-heading text-2xl font-semibold text-ink">
        Search
      </h1>
      <div className="lg:mx-auto lg:max-w-xl">
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

        {!query.trim() && recentSearches.length > 0 && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Recent searches
              </h2>
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-xs text-accent hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-full border border-line bg-paper-raised px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <p className="py-8 text-center text-sm text-ink-muted">Searching...</p>
        )}

        {!loading && searched && products.length === 0 && (
          <EmptyState
            icon={<SearchIcon className="h-9 w-9" />}
            title={`No results for "${query.trim()}".`}
            actionHref="/"
            actionLabel="Browse sarees"
          />
        )}
      </div>

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
