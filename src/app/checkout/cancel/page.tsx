import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Checkout cancelled</h1>
      <p className="mt-3 text-black/60 dark:text-white/60">
        Your payment was cancelled. Your cart is still saved.
      </p>
      <Link
        href="/cart"
        className="mt-6 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        Back to cart
      </Link>
    </div>
  );
}
