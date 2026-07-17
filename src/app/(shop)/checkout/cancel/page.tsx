import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-heading text-2xl font-semibold text-ink">
        Checkout cancelled
      </h1>
      <p className="mt-3 text-ink-muted">
        Your payment was cancelled. Your cart is still saved.
      </p>
      <Link
        href="/cart"
        className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-accent"
      >
        Back to cart
      </Link>
    </div>
  );
}
