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
      <h1 className="font-heading text-2xl font-semibold text-ink">
        Payment successful
      </h1>
      <p className="mt-3 text-ink-muted">
        Thanks for your order! A confirmation has been recorded.
      </p>
      {session_id && (
        <p className="mt-1 text-xs text-ink-muted/70">
          Session: {session_id}
        </p>
      )}
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-accent"
      >
        Continue shopping
      </Link>
    </div>
  );
}
