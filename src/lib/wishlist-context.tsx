"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type WishlistContextValue = {
  ids: string[];
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "shopping-cart-app:wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setIds(JSON.parse(stored));
      } catch {
        // ignore corrupt wishlist data
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  }, [ids, hydrated]);

  function isWishlisted(productId: string) {
    return ids.includes(productId);
  }

  function toggle(productId: string) {
    setIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  function remove(productId: string) {
    setIds((prev) => prev.filter((id) => id !== productId));
  }

  return (
    <WishlistContext.Provider
      value={{ ids, isWishlisted, toggle, remove, count: ids.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
