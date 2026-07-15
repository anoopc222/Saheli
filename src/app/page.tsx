import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";
import { PromoStrip } from "@/components/PromoStrip";

const FILTER_LABELS: Record<string, string> = {
  new: "New Arrivals",
  sale: "On Sale",
  bestseller: "Bestsellers",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const supabase = createBrowserSupabaseClient();

  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (filter && FILTER_LABELS[filter]) {
    query = query.eq("badge", filter);
  }

  const { data: products, error } = await query.returns<Product[]>();

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-red-600">Failed to load sarees: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <Hero />
      <PromoStrip />
      <div id="shop" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
        <h2 className="mb-6 font-serif text-2xl font-semibold text-brand-maroon">
          {filter && FILTER_LABELS[filter] ? FILTER_LABELS[filter] : "All Sarees"}
        </h2>
        {products.length === 0 ? (
          <p className="text-brand-maroon-dark/60">
            No sarees found for this filter.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
