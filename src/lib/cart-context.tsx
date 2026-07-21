"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/types/product";

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  syncWithLiveProducts: (liveProducts: Product[]) => void;
  clear: () => void;
  totalCents: number;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "shopping-cart-app:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setLines(JSON.parse(stored));
      } catch {
        // ignore corrupt cart data
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    }
  }, [lines, hydrated]);

  function addItem(product: Product, quantity = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id
            ? { ...l, product, quantity: Math.min(l.quantity + quantity, product.stock) }
            : l
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
  }

  function removeItem(productId: string) {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }

  function setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setLines((prev) =>
      prev.map((l) =>
        l.product.id === productId
          ? { ...l, quantity: Math.min(quantity, l.product.stock) }
          : l
      )
    );
  }

  // Cart lines are a localStorage snapshot — if stock has since changed
  // (another sale, an admin adjustment), this brings quantities in line
  // with what's actually available and refreshes the stock/price shown.
  function syncWithLiveProducts(liveProducts: Product[]) {
    setLines((prev) =>
      prev
        .map((line) => {
          const live = liveProducts.find((p) => p.id === line.product.id);
          // Missing entirely means the product was deleted — drop it below.
          if (!live) return { ...line, quantity: 0 };
          return { product: live, quantity: Math.min(line.quantity, live.stock) };
        })
        .filter((line) => line.quantity > 0)
    );
  }

  function clear() {
    setLines([]);
  }

  const totalCents = lines.reduce(
    (sum, l) => sum + l.product.price_cents * l.quantity,
    0
  );
  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        lines,
        addItem,
        removeItem,
        setQuantity,
        syncWithLiveProducts,
        clear,
        totalCents,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
