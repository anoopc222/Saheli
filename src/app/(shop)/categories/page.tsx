import { Suspense } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { SortSelect } from "@/components/SortSelect";
import { scheduleBadgeSweep } from "@/lib/badge-sweep";
import { SIZES_SELECT } from "@/lib/product-sizes";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  scheduleBadgeSweep();
  const supabase = createBrowserSupabaseClient();

  let query = supabase
    .from("products")
    .select(`*, ${SIZES_SELECT}`)
    .eq("show_on_store", true);
  if (sort === "price_asc") {
    query = query.order("price_cents", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price_cents", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: products, error } = await query.returns<Product[]>();

  if (error) {
    return (
      <div className="mx-auto max-w-[480px] px-4 py-10">
        <p className="text-red-600">Failed to load products: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[480px] px-4 py-6 lg:max-w-6xl">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-ink">All Collections</h1>
      </div>
      <div className="mb-4 flex justify-end">
        <Suspense fallback={null}>
          <SortSelect />
        </Suspense>
      </div>
      {products.length === 0 ? (
        <p className="text-ink-muted">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
