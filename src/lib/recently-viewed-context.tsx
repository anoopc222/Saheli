"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const MAX_RECENTLY_VIEWED = 12;

type RecentlyViewedContextValue = {
  ids: string[];
  record: (productId: string) => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);
const STORAGE_KEY = "shopping-cart-app:recently-viewed";

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setIds(JSON.parse(stored));
      } catch {
        // ignore corrupt recently-viewed data
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }
  }, [ids, hydrated]);

  function record(productId: string) {
    // Read localStorage directly rather than trusting the `prev` React
    // state: on a fresh page load, this can fire (as a mount effect in a
    // descendant) before the provider's own hydration effect above has
    // run, since child effects commit before ancestor effects. Trusting
    // `prev` there would still be the pre-hydration [], and the
    // hydration effect firing right after would then overwrite this
    // update with the stale stored value, silently dropping the product
    // just recorded.
    let current: string[] = [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) current = JSON.parse(stored);
    } catch {
      current = [];
    }
    const next = [productId, ...current.filter((id) => id !== productId)].slice(
      0,
      MAX_RECENTLY_VIEWED
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setIds(next);
  }

  return (
    <RecentlyViewedContext.Provider value={{ ids, record }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return ctx;
}
