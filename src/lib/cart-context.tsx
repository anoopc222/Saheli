"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/types/product";
import { stockForSize } from "@/lib/product-sizes";

export type CartLine = {
  product: Product;
  quantity: number;
  selectedSize: string | null;
};

type CartContextValue = {
  lines: CartLine[];
  addItem: (product: Product, quantity?: number, selectedSize?: string | null) => void;
  removeItem: (productId: string, selectedSize?: string | null) => void;
  setQuantity: (productId: string, quantity: number, selectedSize?: string | null) => void;
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

  // For a sized product, `product.stock` is the aggregate across every
  // size — not what a single cart line can actually sell. Each line's
  // `product.stock` is overridden to the selected size's own stock, so
  // every existing quantity clamp below (and everywhere lines are read
  // elsewhere) naturally clamps to the right number without needing to
  // thread size lookups through each of those call sites.
  function effectiveStock(product: Product, selectedSize: string | null): number {
    if (!selectedSize) return product.stock;
    return stockForSize(product.sizes, selectedSize);
  }

  function addItem(product: Product, quantity = 1, selectedSize: string | null = null) {
    const stock = effectiveStock(product, selectedSize);
    const lineProduct = { ...product, stock };
    setLines((prev) => {
      const existing = prev.find(
        (l) => l.product.id === product.id && l.selectedSize === selectedSize
      );
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id && l.selectedSize === selectedSize
            ? { ...l, product: lineProduct, quantity: Math.min(l.quantity + quantity, stock) }
            : l
        );
      }
      return [...prev, { product: lineProduct, quantity: Math.min(quantity, stock), selectedSize }];
    });
  }

  function removeItem(productId: string, selectedSize: string | null = null) {
    setLines((prev) =>
      prev.filter((l) => !(l.product.id === productId && l.selectedSize === selectedSize))
    );
  }

  function setQuantity(productId: string, quantity: number, selectedSize: string | null = null) {
    if (quantity <= 0) {
      removeItem(productId, selectedSize);
      return;
    }
    setLines((prev) =>
      prev.map((l) =>
        l.product.id === productId && l.selectedSize === selectedSize
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
          const stock = effectiveStock(live, line.selectedSize);
          return { ...line, product: { ...live, stock }, quantity: Math.min(line.quantity, stock) };
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
