import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";
import { IconFeatureRow } from "@/components/IconFeatureRow";
import { PromoStrip } from "@/components/PromoStrip";
import { ChevronRightIcon } from "@/components/icons";
import { getCategories, getMainCategories } from "@/lib/categories-data";
import { getHeroBanners, getActivePromoBanner } from "@/lib/homepage-data";
import { getFeatureItems, getFeatureRowSettings } from "@/lib/feature-items-data";

const FILTER_LABELS: Record<string, string> = {
  new: "New Arrivals",
  sale: "On Sale",
  bestseller: "Bestsellers",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
    fabric?: string;
    category?: string;
    main_category?: string;
  }>;
}) {
  const { filter, fabric, category, main_category: mainCategoryId } = await searchParams;
  const supabase = createBrowserSupabaseClient();

  const [categories, mainCategories] = await Promise.all([getCategories(), getMainCategories()]);

  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (fabric) {
    query = query.eq("fabric", fabric);
  } else if (category) {
    query = query.eq("category_id", category);
  } else if (mainCategoryId) {
    const categoryIds = categories
      .filter((cat) => cat.main_category_id === mainCategoryId)
      .map((cat) => cat.id);
    query = query.in("category_id", categoryIds.length > 0 ? categoryIds : [mainCategoryId]);
  } else if (filter && FILTER_LABELS[filter]) {
    query = query.eq("badge", filter);
  }

  const [{ data: products, error }, heroImages, activePromo, featureItems, featureRowSettings] =
    await Promise.all([
      query.returns<Product[]>(),
      getHeroBanners(),
      getActivePromoBanner(),
      getFeatureItems(),
      getFeatureRowSettings(),
    ]);

  if (error) {
    return (
      <div className="mx-auto max-w-[480px] px-4 py-10">
        <p className="text-red-600">Failed to load sarees: {error.message}</p>
      </div>
    );
  }

  const subcategory = fabric
    ? categories
        .flatMap((cat) => cat.subcategories)
        .find((sub) => sub.fabric === fabric)
    : undefined;
  const matchedCategory = category
    ? categories.find((cat) => cat.id === category)
    : undefined;
  const matchedMainCategory = mainCategoryId
    ? mainCategories.find((mc) => mc.id === mainCategoryId)
    : undefined;

  const heading = subcategory
    ? subcategory.name
    : matchedCategory
      ? matchedCategory.name
      : matchedMainCategory
        ? matchedMainCategory.name
        : filter && FILTER_LABELS[filter]
          ? FILTER_LABELS[filter]
          : "All Sarees";

  const heroSlides = heroImages.map((banner) => {
    let href = "/";
    if (banner.subcategory_id) {
      const sub = categories
        .flatMap((cat) => cat.subcategories)
        .find((s) => s.id === banner.subcategory_id);
      if (sub) href = `/?fabric=${encodeURIComponent(sub.fabric)}`;
    } else if (banner.category_id) {
      href = `/?category=${banner.category_id}`;
    }
    return { image_url: banner.image_url, href };
  });

  return (
    <div>
      <Hero slides={heroSlides} />
      {(featureRowSettings?.show_on_home ?? true) && <IconFeatureRow items={featureItems} />}
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
