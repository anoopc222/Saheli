import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getCategories } from "@/lib/categories-data";
import { AdminProductsList } from "@/components/admin/AdminProductsList";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
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
      <AdminProductsList products={products ?? []} categories={categories} />
    </div>
  );
}
