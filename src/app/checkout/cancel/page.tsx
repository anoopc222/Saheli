import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-serif text-2xl font-semibold text-brand-maroon">
        Checkout cancelled
      </h1>
      <p className="mt-3 text-brand-maroon-dark/60">
        Your payment was cancelled. Your cart is still saved.
      </p>
      <Link
        href="/cart"
        className="mt-6 inline-block rounded-md bg-brand-maroon px-4 py-2 text-sm font-medium text-brand-cream hover:bg-brand-maroon-dark"
      >
        Back to cart
      </Link>
    </div>
  );
}
