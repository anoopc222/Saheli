import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";

export default async function Home() {
  const supabase = createBrowserSupabaseClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<Product[]>();

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-red-600">Failed to load products: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Shop</h1>
      {products.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          No products yet. Add some to the `products` table in Supabase.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
