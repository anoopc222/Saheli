import { notFound } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { AddToCartForm } from "@/components/AddToCartForm";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createBrowserSupabaseClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle<Product>();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-lg text-black/60 dark:text-white/60">
            {formatPrice(product.price_cents)}
          </p>
          <p className="mt-4 text-sm text-black/70 dark:text-white/70">
            {product.description}
          </p>
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
