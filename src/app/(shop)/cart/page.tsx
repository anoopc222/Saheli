"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { getProductSettings, ProductSettings } from "@/lib/product-settings-data";
import { computeOrderTotals } from "@/lib/pricing";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { EmptyState } from "@/components/EmptyState";
import { BagIcon } from "@/components/icons";
import { FadeImage } from "@/components/FadeImage";
import { useToast } from "@/lib/toast-context";

type AppliedCoupon = {
  code: string;
  percentOff: number | null;
  amountOffCents: number | null;
};

export default function CartPage() {
  const router = useRouter();
  const { lines, setQuantity, removeItem, totalCents, syncWithLiveProducts } = useCart();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<ProductSettings | null>(null);
  const [stockAdjusted, setStockAdjusted] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    getProductSettings().then(setSettings);
  }, []);

  // Cart lines are a localStorage snapshot, so stock shown there can go
  // stale (another sale, an admin adjustment) — refresh against the live
  // product rows on load and clamp any quantity that now exceeds stock.
  useEffect(() => {
    if (lines.length === 0) return;
    const ids = lines.map((l) => l.product.id);
    const supabase = createBrowserSupabaseClient();
    supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .returns<Product[]>()
      .then(({ data }) => {
        if (!data) return;
        const reduced = lines.some((line) => {
          const live = data.find((p) => p.id === line.product.id);
          return !live || live.stock < line.quantity;
        });
        syncWithLiveProducts(data);
        if (reduced) setStockAdjusted(true);
      });
    // Only re-check when the set of product ids in the cart changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.map((l) => l.product.id).join(",")]);

  // The destination pincode (and so the real shipping fee) isn't known
  // until the checkout page's shipping form — this total is subtotal,
  // discount, and GST only, with shipping called out separately below.
  const totals = settings
    ? computeOrderTotals(
        lines.map((l) => ({ unitPriceCents: l.product.price_cents, quantity: l.quantity })),
        appliedCoupon,
        settings,
        0
      )
    : null;
  const discountCents = totals?.discountCents ?? 0;
  const gstCents = totals?.gstCents ?? 0;
  const discountedTotalCents = totals?.grandTotalCents ?? totalCents;

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
      <div className="mx-auto max-w-[480px] px-4 py-10 lg:max-w-2xl">
        <h1 className="mb-4 font-heading text-2xl font-semibold text-ink">
          Your cart
        </h1>
        <EmptyState
          icon={<BagIcon className="h-9 w-9" />}
          title="Your cart is empty."
          actionHref="/"
          actionLabel="Continue shopping"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[480px] px-4 py-10 lg:max-w-2xl">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-ink">
        Your cart
      </h1>
      {stockAdjusted && (
        <p className="mb-4 rounded-xl border border-accent bg-accent-soft px-3 py-2.5 text-sm text-accent">
          We adjusted a quantity or two to match what&apos;s currently in stock.
        </p>
      )}
      <div className="flex flex-col gap-4">
        {lines.map((line) => (
          <div
            key={line.product.id}
            className="flex gap-3 rounded-2xl border border-line bg-paper-raised p-4"
          >
            <Link href={`/product/${line.product.id}`} className="shrink-0">
              <div className="relative h-20 w-16 overflow-hidden rounded-xl bg-line">
                {line.product.image_url && (
                  <FadeImage
                    src={line.product.image_url}
                    alt={line.product.name}
                    lazy={false}
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
            </Link>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/product/${line.product.id}`}
                  className="text-sm font-medium text-ink transition-colors hover:text-accent"
                >
                  {line.product.name}
                </Link>
                <button
                  onClick={() => {
                    removeItem(line.product.id);
                    showToast("Removed from cart");
                  }}
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
        {gstCents > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-muted">GST</p>
            <p className="text-sm tabular-nums text-ink">{formatPrice(gstCents)}</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">Shipping</p>
          <p className="text-sm text-ink-muted">Calculated at checkout</p>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-base font-semibold text-ink">Total</p>
          <p className="text-lg font-semibold tabular-nums text-accent">
            {formatPrice(discountedTotalCents)}
          </p>
        </div>
        <p className="text-right text-xs text-ink-muted">plus shipping</p>
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
