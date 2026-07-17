import { notFound } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { AddToCartForm } from "@/components/AddToCartForm";
import { ProductBadge } from "@/components/ProductBadge";
import { ProductGallery } from "@/components/ProductGallery";
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
    <div className="mx-auto max-w-[480px] px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-line">
          <ProductBadge badge={product.badge} />
          <ProductGallery
            images={
              product.image_urls?.length
                ? product.image_urls
                : [product.image_url].filter(Boolean)
            }
            alt={product.name}
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-muted">
            {product.fabric}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-ink">
            {product.name}
          </h1>
          <div className="mt-3">
            <RatingStars rating={product.rating} count={product.rating_count} />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-xl font-semibold tabular-nums text-accent">
              {formatPrice(product.price_cents)}
            </p>
            {product.compare_at_price_cents && (
              <p className="tabular-nums text-ink-muted line-through">
                {formatPrice(product.compare_at_price_cents)}
              </p>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            {product.description}
          </p>
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
