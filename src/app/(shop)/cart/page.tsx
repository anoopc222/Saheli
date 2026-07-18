"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

type AppliedCoupon = {
  code: string;
  percentOff: number | null;
  amountOffCents: number | null;
};

export default function CartPage() {
  const router = useRouter();
  const { lines, setQuantity, removeItem, totalCents } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const discountCents = appliedCoupon
    ? appliedCoupon.percentOff
      ? Math.round((totalCents * appliedCoupon.percentOff) / 100)
      : Math.min(appliedCoupon.amountOffCents ?? 0, totalCents)
    : 0;
  const discountedTotalCents = Math.max(0, totalCents - discountCents);

  async function handleApplyCoupon() {
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (!data.valid) {
        setAppliedCoupon(null);
        setCouponError(data.message || "That code isn't valid.");
        return;
      }
      setAppliedCoupon({
        code: data.code,
        percentOff: data.percentOff,
        amountOffCents: data.amountOffCents,
      });
    } catch {
      setCouponError("Couldn't check that code. Try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  function handleCheckout() {
    const query = appliedCoupon?.code
      ? `?coupon=${encodeURIComponent(appliedCoupon.code)}`
      : "";
    router.push(`/checkout${query}`);
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

      <div className="mt-6">
        {appliedCoupon ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-accent bg-accent-soft px-3 py-2.5">
            <p className="text-sm font-medium text-accent">
              &quot;{appliedCoupon.code}&quot; applied
            </p>
            <button
              onClick={handleRemoveCoupon}
              className="shrink-0 text-xs font-medium text-accent hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Discount code"
              className="min-w-0 flex-1 rounded-xl border border-line bg-paper-raised px-3 py-2.5 text-sm uppercase outline-none focus:border-accent"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              className="shrink-0 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
            >
              {couponLoading ? "Checking..." : "Apply"}
            </button>
          </div>
        )}
        {couponError && <p className="mt-1.5 text-xs text-accent">{couponError}</p>}
      </div>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">Subtotal</p>
          <p className="text-sm tabular-nums text-ink">{formatPrice(totalCents)}</p>
        </div>
        {discountCents > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-muted">Discount</p>
            <p className="text-sm tabular-nums text-accent">-{formatPrice(discountCents)}</p>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <p className="text-base font-semibold text-ink">Total</p>
          <p className="text-lg font-semibold tabular-nums text-accent">
            {formatPrice(discountedTotalCents)}
          </p>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        className="mt-6 w-full rounded-full bg-ink px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent"
      >
        Checkout
      </button>
    </div>
  );
}
