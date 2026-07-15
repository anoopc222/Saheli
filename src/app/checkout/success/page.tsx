import Link from "next/link";
import { ClearCartOnLoad } from "@/components/ClearCartOnLoad";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <ClearCartOnLoad />
      <h1 className="font-serif text-2xl font-semibold text-brand-maroon">
        Payment successful
      </h1>
      <p className="mt-3 text-brand-maroon-dark/60">
        Thanks for your order! A confirmation has been recorded.
      </p>
      {session_id && (
        <p className="mt-1 text-xs text-brand-maroon-dark/40">
          Session: {session_id}
        </p>
      )}
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-brand-maroon px-4 py-2 text-sm font-medium text-brand-cream hover:bg-brand-maroon-dark"
      >
        Continue shopping
      </Link>
    </div>
  );
}
