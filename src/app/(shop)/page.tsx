import { Suspense } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";
import { IconFeatureRow } from "@/components/IconFeatureRow";
import { PromoStrip } from "@/components/PromoStrip";
import { SortSelect } from "@/components/SortSelect";
import { ChevronRightIcon } from "@/components/icons";
import { getCategories, getMainCategories } from "@/lib/categories-data";
import { getHeroBanners, getActivePromoBanner } from "@/lib/homepage-data";
import { getFeatureItems, getFeatureRowSettings } from "@/lib/feature-items-data";
import { getMenuItems } from "@/lib/menu-items-data";
import { scheduleBadgeSweep } from "@/lib/badge-sweep";
import { RecentlyViewedRail } from "@/components/RecentlyViewedRail";

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
    tag?: string;
    sort?: string;
  }>;
}) {
  const { filter, fabric, category, main_category: mainCategoryId, tag, sort } = await searchParams;
  scheduleBadgeSweep();
  const supabase = createBrowserSupabaseClient();

  const hasFilter = Boolean(
    fabric || category || mainCategoryId || tag || (filter && FILTER_LABELS[filter])
  );

  const [categories, mainCategories, menuItems] = await Promise.all([
    getCategories(),
    getMainCategories(),
    getMenuItems(),
  ]);

  let query = supabase.from("products").select("*").eq("show_on_store", true);

  if (fabric) {
    query = query.eq("fabric", fabric);
  } else if (category) {
    query = query.eq("category_id", category);
  } else if (mainCategoryId) {
    const categoryIds = categories
      .filter((cat) => cat.main_category_id === mainCategoryId)
      .map((cat) => cat.id);
    query = query.in("category_id", categoryIds.length > 0 ? categoryIds : [mainCategoryId]);
  } else if (tag) {
    query = query.contains("tags", [tag]);
  } else if (filter && FILTER_LABELS[filter]) {
    query = query.eq("badge", filter);
  }

  if (sort === "price_asc") {
    query = query.order("price_cents", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price_cents", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const [{ data: products, error }, heroImages, activePromo, featureItems, featureRowSettings] =
    await Promise.all([
      query.returns<Product[]>(),
      hasFilter ? Promise.resolve([]) : getHeroBanners(),
      hasFilter ? Promise.resolve(null) : getActivePromoBanner(),
      hasFilter ? Promise.resolve([]) : getFeatureItems(),
      hasFilter ? Promise.resolve(null) : getFeatureRowSettings(),
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
  const matchedTagItem = tag ? menuItems.find((item) => item.tag === tag) : undefined;

  const heading = subcategory
    ? subcategory.name
    : matchedCategory
      ? matchedCategory.name
      : matchedMainCategory
        ? matchedMainCategory.name
        : matchedTagItem
          ? matchedTagItem.label || tag
          : tag
            ? tag
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
      {!hasFilter && (
        <>
          <Hero slides={heroSlides} />
          {(featureRowSettings?.show_on_home ?? true) && <IconFeatureRow items={featureItems} />}
          <PromoStrip promo={activePromo} />
        </>
      )}
      <div id="shop" className="mx-auto max-w-[480px] scroll-mt-16 px-4 pb-8 pt-[1.125rem]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-ink">{heading}</h2>
          <Link
            href="/categories"
            className="flex items-center gap-0.5 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
          >
            View all collections
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="mb-4 flex justify-end">
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
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
        {!hasFilter && (
          <div className="mt-6">
            <RecentlyViewedRail />
          </div>
        )}
      </div>
    </div>
  );
}
