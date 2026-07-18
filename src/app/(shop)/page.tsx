import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";
import { IconFeatureRow } from "@/components/IconFeatureRow";
import { PromoStrip } from "@/components/PromoStrip";
import { ChevronRightIcon } from "@/components/icons";
import { getCategories } from "@/lib/categories-data";
import { getHeroBanners, getActivePromoBanner } from "@/lib/homepage-data";

const FILTER_LABELS: Record<string, string> = {
  new: "New Arrivals",
  sale: "On Sale",
  bestseller: "Bestsellers",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; fabric?: string }>;
}) {
  const { filter, fabric } = await searchParams;
  const supabase = createBrowserSupabaseClient();

  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (fabric) {
    query = query.eq("fabric", fabric);
  } else if (filter && FILTER_LABELS[filter]) {
    query = query.eq("badge", filter);
  }

  const [{ data: products, error }, heroImages, activePromo] = await Promise.all([
    query.returns<Product[]>(),
    getHeroBanners(),
    getActivePromoBanner(),
  ]);

  if (error) {
    return (
      <div className="mx-auto max-w-[480px] px-4 py-10">
        <p className="text-red-600">Failed to load sarees: {error.message}</p>
      </div>
    );
  }

  const categories = fabric ? await getCategories() : [];
  const subcategory = fabric
    ? categories
        .flatMap((category) => category.subcategories)
        .find((sub) => sub.fabric === fabric)
    : undefined;

  const heading = subcategory
    ? subcategory.name
    : filter && FILTER_LABELS[filter]
      ? FILTER_LABELS[filter]
      : "All Sarees";

  return (
    <div>
      <Hero images={heroImages.map((h) => h.image_url)} />
      <IconFeatureRow />
      <PromoStrip promo={activePromo} />
      <div id="shop" className="mx-auto max-w-[480px] scroll-mt-16 px-4 pb-8 pt-[1.125rem]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-ink">{heading}</h2>
          <Link
            href="/"
            className="flex items-center gap-0.5 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
          >
            View all
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-ink-muted">No sarees found for this filter.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
