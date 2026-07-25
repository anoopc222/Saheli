import { notFound } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { AddToCartForm } from "@/components/AddToCartForm";
import { ProductBadge } from "@/components/ProductBadge";
import { ProductGallery } from "@/components/ProductGallery";
import { RatingStars } from "@/components/RatingStars";
import { ProductRail } from "@/components/ProductRail";
import { RecordRecentlyViewed } from "@/components/RecordRecentlyViewed";
import { RecentlyViewedRail } from "@/components/RecentlyViewedRail";
import { scheduleBadgeSweep } from "@/lib/badge-sweep";
import { getProductSettings } from "@/lib/product-settings-data";
import { getFeatureItems } from "@/lib/feature-items-data";
import { IconFeatureRow } from "@/components/IconFeatureRow";
import { SITE_URL } from "@/lib/site-url";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  scheduleBadgeSweep();
  const supabase = createBrowserSupabaseClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle<Product>();

  if (error || !product || !product.show_on_store) {
    notFound();
  }

  let relatedQuery = supabase
    .from("products")
    .select("*")
    .eq("show_on_store", true)
    .neq("id", id)
    .limit(8);
  relatedQuery = product.category_id
    ? relatedQuery.eq("category_id", product.category_id)
    : relatedQuery.eq("fabric", product.fabric);
  const { data: related } = await relatedQuery.returns<Product[]>();
  const settings = await getProductSettings();
  const featureItems = await getFeatureItems();

  const images = product.image_urls?.length ? product.image_urls : [product.image_url].filter(Boolean);
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.description || undefined,
    sku: product.product_code || undefined,
    brand: { "@type": "Brand", name: "Saheli" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: "INR",
      price: (product.price_cents / 100).toFixed(2),
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(settings.show_ratings && product.rating && product.rating_count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.rating_count,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-[480px] px-4 py-6 lg:max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <RecordRecentlyViewed productId={product.id} />
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:gap-y-8">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-line lg:sticky lg:top-24">
          <ProductBadge badge={product.badge} stock={product.stock} />
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
          {settings.show_ratings && (
            <div className="mt-3">
              <RatingStars rating={product.rating} count={product.rating_count} />
            </div>
          )}
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-xl font-semibold tabular-nums text-accent">
              {formatPrice(product.price_cents)}
            </p>
            {product.compare_at_price_cents && (
              <p className="tabular-nums text-ink-muted line-through">
                {formatPrice(product.compare_at_price_cents)}
              </p>
            )}
            {product.compare_at_price_cents && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                {Math.round(
                  ((product.compare_at_price_cents - product.price_cents) /
                    product.compare_at_price_cents) *
                    100
                )}
                % off
              </span>
            )}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            {product.description}
          </p>
          <AddToCartForm product={product} />
        </div>
        {featureItems.length > 0 && (
          <div className="-mx-4 lg:col-span-2 lg:mx-0">
            <IconFeatureRow items={featureItems} />
          </div>
        )}
        <div className="lg:col-span-2">
          <ProductRail title="You may also like" products={related ?? []} />
        </div>
        <div className="lg:col-span-2">
          <RecentlyViewedRail excludeId={product.id} />
        </div>
      </div>
    </div>
  );
}
