import { notFound } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { AddToCartForm } from "@/components/AddToCartForm";
import { ProductBadge } from "@/components/ProductBadge";
import { RatingStars } from "@/components/RatingStars";

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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-brand-line">
          <ProductBadge badge={product.badge} />
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
          <p className="text-xs uppercase tracking-wide text-brand-maroon-dark/60">
            {product.fabric}
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-maroon">
            {product.name}
          </h1>
          <div className="mt-2">
            <RatingStars rating={product.rating} count={product.rating_count} />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-xl font-semibold text-brand-maroon">
              {formatPrice(product.price_cents)}
            </p>
            {product.compare_at_price_cents && (
              <p className="text-brand-maroon-dark/40 line-through">
                {formatPrice(product.compare_at_price_cents)}
              </p>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-brand-maroon-dark/70">
            {product.description}
          </p>
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
