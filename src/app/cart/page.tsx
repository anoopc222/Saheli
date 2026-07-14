"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { lines, setQuantity, removeItem, totalCents } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.product.id,
            quantity: l.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-semibold">Your cart</h1>
        <p className="text-black/60 dark:text-white/60">
          Your cart is empty.{" "}
          <Link href="/" className="underline">
            Continue shopping
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Your cart</h1>
      <div className="flex flex-col gap-4">
        {lines.map((line) => (
          <div
            key={line.product.id}
            className="flex items-center justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10"
          >
            <div>
              <p className="font-medium">{line.product.name}</p>
              <p className="text-sm text-black/60 dark:text-white/60">
                {formatPrice(line.product.price_cents)} each
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) =>
                  setQuantity(line.product.id, Number(e.target.value) || 1)
                }
                className="w-16 rounded-md border border-black/10 px-2 py-1 text-sm dark:border-white/10"
              />
              <p className="w-20 text-right text-sm font-medium">
                {formatPrice(line.product.price_cents * line.quantity)}
              </p>
              <button
                onClick={() => removeItem(line.product.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-lg font-semibold">Total</p>
        <p className="text-lg font-semibold">{formatPrice(totalCents)}</p>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-6 w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
      >
        {loading ? "Redirecting to checkout..." : "Checkout"}
      </button>
    </div>
  );
}
