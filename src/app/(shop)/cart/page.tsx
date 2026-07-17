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
      <div className="mx-auto max-w-[480px] px-4 py-10">
        <h1 className="mb-4 font-heading text-2xl font-semibold text-ink">
          Your cart
        </h1>
        <p className="text-ink-muted">
          Your cart is empty.{" "}
          <Link href="/" className="text-accent underline">
            Continue shopping
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[480px] px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-ink">
        Your cart
      </h1>
      <div className="flex flex-col gap-4">
        {lines.map((line) => (
          <div
            key={line.product.id}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">
                {line.product.name}
              </p>
              <button
                onClick={() => removeItem(line.product.id)}
                className="shrink-0 text-xs font-medium text-accent hover:underline"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-ink-muted">
                {formatPrice(line.product.price_cents)} each
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-line">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(line.product.id, line.quantity - 1)
                    }
                    aria-label="Decrease quantity"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-accent-soft hover:text-accent"
                  >
                    &minus;
                  </button>
                  <span className="w-5 text-center text-sm tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(line.product.id, line.quantity + 1)
                    }
                    disabled={line.quantity >= line.product.stock}
                    aria-label="Increase quantity"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-accent-soft hover:text-accent disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                <p className="w-20 text-right text-sm font-semibold tabular-nums text-ink">
                  {formatPrice(line.product.price_cents * line.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <p className="text-base font-semibold text-ink">Total</p>
        <p className="text-lg font-semibold tabular-nums text-accent">
          {formatPrice(totalCents)}
        </p>
      </div>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="mt-6 w-full rounded-full bg-ink px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-40"
      >
        {loading ? "Redirecting to checkout..." : "Checkout"}
      </button>
    </div>
  );
}
