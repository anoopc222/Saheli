"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { getProductSettings, ProductSettings } from "@/lib/product-settings-data";
import { getShippingZones } from "@/lib/shipping-zones-data";
import { matchShippingZone, ShippingZone } from "@/lib/shipping-zones";
import { computeOrderTotals } from "@/lib/pricing";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { INSTAGRAM_URL } from "@/lib/social-links";
import { InstagramIcon } from "@/components/icons";

type Discount = {
  code: string;
  percentOff: number | null;
  amountOffCents: number | null;
} | null;

type CheckoutResponse = {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  error?: string;
};

type RazorpayInstance = { open: () => void };
type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const inputClasses =
  "w-full rounded-xl border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-accent";

type ShippingForm = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  gstin: string;
};

type BillingForm = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

const EMPTY_BILLING: BillingForm = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutForm />
    </Suspense>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponCode = searchParams.get("coupon") ?? "";
  const { lines, totalCents, clear, syncWithLiveProducts } = useCart();

  const [discount, setDiscount] = useState<Discount>(null);
  const [settings, setSettings] = useState<ProductSettings | null>(null);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [scriptReady, setScriptReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ShippingForm>({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    gstin: "",
  });
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingForm, setBillingForm] = useState<BillingForm>(EMPTY_BILLING);

  useEffect(() => {
    getProductSettings().then(setSettings);
    getShippingZones().then(setShippingZones);
  }, []);

  // Same staleness guard as the cart page — a customer can land here
  // directly (back button, bookmark) without the cart page's own sync
  // having run first.
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
        if (data) syncWithLiveProducts(data);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.map((l) => l.product.id).join(",")]);

  useEffect(() => {
    if (!couponCode) return;
    fetch("/api/validate-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setDiscount({
            code: data.code,
            percentOff: data.percentOff,
            amountOffCents: data.amountOffCents,
          });
        }
      })
      .catch(() => {});
  }, [couponCode]);

  const matchedZone =
    form.postalCode.trim().length === 6 ? matchShippingZone(form.postalCode, shippingZones) : null;
  const shippingFeeCents = matchedZone?.rate_cents ?? 0;

  const totals = settings
    ? computeOrderTotals(
        lines.map((l) => ({ unitPriceCents: l.product.price_cents, quantity: l.quantity })),
        discount,
        settings,
        shippingFeeCents
      )
    : null;
  const discountCents = totals?.discountCents ?? 0;
  const gstCents = totals?.gstCents ?? 0;
  const payableCents = totals?.grandTotalCents ?? totalCents;

  function updateField(field: keyof ShippingForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateBillingField(field: keyof BillingForm, value: string) {
    setBillingForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (sessionData.session) {
        headers.Authorization = `Bearer ${sessionData.session.access_token}`;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
          couponCode: discount?.code,
          shipping: form,
          billing: billingSameAsShipping ? null : billingForm,
        }),
      });

      let data: CheckoutResponse;
      try {
        data = await res.json();
      } catch {
        throw new Error("Something went wrong. Please try again.");
      }
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed. Please try again.");
      }
      if (!scriptReady || typeof window.Razorpay === "undefined") {
        throw new Error("Payment couldn't load. Please refresh and try again.");
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "Saheli Sarees",
        order_id: data.razorpayOrderId,
        prefill: {
          name: data.customerName,
          email: data.customerEmail,
          contact: data.customerPhone,
        },
        handler: async (response: RazorpayHandlerResponse) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, orderId: data.orderId }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                "We couldn't confirm your payment. Contact us with your order reference."
              );
            }
            clear();
            router.push(`/checkout/success?order_id=${data.orderId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed.");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[480px] px-4 py-10">
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
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
      />
      <h1 className="mb-6 font-heading text-2xl font-semibold text-ink">Checkout</h1>

      <div className="mb-6 rounded-2xl border border-line bg-paper-raised p-4">
        <div className="flex items-center justify-between text-sm">
          <p className="text-ink-muted">Subtotal</p>
          <p className="tabular-nums text-ink">{formatPrice(totalCents)}</p>
        </div>
        {discountCents > 0 && (
          <div className="mt-1 flex items-center justify-between text-sm">
            <p className="text-ink-muted">Discount ({discount?.code})</p>
            <p className="tabular-nums text-accent">-{formatPrice(discountCents)}</p>
          </div>
        )}
        {gstCents > 0 && (
          <div className="mt-1 flex items-center justify-between text-sm">
            <p className="text-ink-muted">GST</p>
            <p className="tabular-nums text-ink">{formatPrice(gstCents)}</p>
          </div>
        )}
        <div className="mt-1 flex items-center justify-between text-sm">
          <p className="text-ink-muted">
            Shipping{matchedZone ? ` (${matchedZone.name})` : ""}
          </p>
          <p className="tabular-nums text-ink">
            {form.postalCode.trim().length !== 6
              ? "Enter pincode"
              : shippingFeeCents > 0
                ? formatPrice(shippingFeeCents)
                : "Free"}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
          <p className="text-base font-semibold text-ink">Total to pay</p>
          <p className="text-lg font-semibold tabular-nums text-accent">
            {formatPrice(payableCents)}
          </p>
        </div>
      </div>

      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-6 flex items-center gap-3 rounded-xl border border-line bg-accent-soft p-3 text-sm text-ink transition-colors hover:border-accent"
      >
        <InstagramIcon className="h-5 w-5 shrink-0 text-accent" />
        <span>
          We currently ship only within India. For orders outside India,{" "}
          <span className="font-medium text-accent underline">DM us on Instagram</span>.
        </span>
      </a>

      <form onSubmit={handlePay} className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Shipping details
        </h2>
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className={inputClasses}
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={inputClasses}
        />
        <input
          required
          type="tel"
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className={inputClasses}
        />
        <input
          required
          placeholder="Address line 1"
          value={form.addressLine1}
          onChange={(e) => updateField("addressLine1", e.target.value)}
          className={inputClasses}
        />
        <input
          placeholder="Address line 2 (optional)"
          value={form.addressLine2}
          onChange={(e) => updateField("addressLine2", e.target.value)}
          className={inputClasses}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            placeholder="City"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            className={inputClasses}
          />
          <input
            required
            placeholder="State"
            value={form.state}
            onChange={(e) => updateField("state", e.target.value)}
            className={inputClasses}
          />
        </div>
        <input
          required
          inputMode="numeric"
          maxLength={6}
          placeholder="Pincode"
          value={form.postalCode}
          onChange={(e) => updateField("postalCode", e.target.value.replace(/\D/g, ""))}
          className={inputClasses}
        />
        {(settings?.gstin_field_enabled ?? true) && (
          <input
            placeholder="GSTIN (optional, for a business invoice)"
            value={form.gstin}
            onChange={(e) => updateField("gstin", e.target.value.toUpperCase())}
            className={`${inputClasses} uppercase`}
          />
        )}

        <h2 className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Billing address
        </h2>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={billingSameAsShipping}
            onChange={(e) => setBillingSameAsShipping(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-accent"
          />
          Same as shipping address
        </label>

        {!billingSameAsShipping && (
          <>
            <input
              required
              placeholder="Full name"
              value={billingForm.name}
              onChange={(e) => updateBillingField("name", e.target.value)}
              className={inputClasses}
            />
            <input
              required
              placeholder="Address line 1"
              value={billingForm.addressLine1}
              onChange={(e) => updateBillingField("addressLine1", e.target.value)}
              className={inputClasses}
            />
            <input
              placeholder="Address line 2 (optional)"
              value={billingForm.addressLine2}
              onChange={(e) => updateBillingField("addressLine2", e.target.value)}
              className={inputClasses}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="City"
                value={billingForm.city}
                onChange={(e) => updateBillingField("city", e.target.value)}
                className={inputClasses}
              />
              <input
                required
                placeholder="State"
                value={billingForm.state}
                onChange={(e) => updateBillingField("state", e.target.value)}
                className={inputClasses}
              />
            </div>
            <input
              required
              inputMode="numeric"
              maxLength={6}
              placeholder="Pincode"
              value={billingForm.postalCode}
              onChange={(e) => updateBillingField("postalCode", e.target.value.replace(/\D/g, ""))}
              className={inputClasses}
            />
          </>
        )}

        {error && (
          <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-3 w-full rounded-full bg-ink px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-40"
        >
          {submitting ? "Processing..." : `Pay ${formatPrice(payableCents)}`}
        </button>
      </form>
    </div>
  );
}
