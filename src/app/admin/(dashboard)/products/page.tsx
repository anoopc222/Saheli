import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getCategories } from "@/lib/categories-data";
import { AdminProductsList } from "@/components/admin/AdminProductsList";
import { Product } from "@/types/product";
import { sweepExpiredNewBadges, sweepBestsellerBadges } from "@/lib/badge-sweep";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleteBlocked?: string }>;
}) {
  const { deleteBlocked } = await searchParams;
  await sweepExpiredNewBadges();
  await sweepBestsellerBadges();
  const supabase = createBrowserSupabaseClient();
  const [{ data: products }, categories] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<Product[]>(),
    getCategories(),
  ]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold text-ink">
          Products ({products?.length ?? 0})
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Add product
        </Link>
      </div>
      {deleteBlocked && (
        <p className="mb-4 rounded-xl border border-accent bg-accent-soft px-3 py-2.5 text-sm text-accent">
          Can&apos;t delete that product — it has past orders on record. Open it and turn
          off &quot;Show on store&quot; to hide it from customers instead.
        </p>
      )}
      <AdminProductsList products={products ?? []} categories={categories} />
    </div>
  );
}
