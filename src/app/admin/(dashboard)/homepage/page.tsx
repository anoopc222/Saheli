import Link from "next/link";
import { getHeroBanners, getAllPromoBanners } from "@/lib/homepage-data";
import { getCategories } from "@/lib/categories-data";
import { getFeatureItems, getFeatureRowSettings } from "@/lib/feature-items-data";
import { HeroImagesManager } from "@/components/admin/HeroImagesManager";
import { FeatureRowManager } from "@/components/admin/FeatureRowManager";
import { deletePromoAction, setActivePromoAction } from "@/lib/promo-actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [heroImages, promos, categories, featureItems, featureRowSettings] = await Promise.all([
    getHeroBanners(),
    getAllPromoBanners(),
    getCategories(),
    getFeatureItems(),
    getFeatureRowSettings(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-xl font-semibold text-ink">Homepage</h1>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Hero images
        </h2>
        <HeroImagesManager images={heroImages} categories={categories} />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Trust badges strip
        </h2>
        <FeatureRowManager items={featureItems} settings={featureRowSettings} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Seasonal promo card
          </h2>
          <Link
            href="/admin/homepage/promo/new"
            className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent"
          >
            Add promo
          </Link>
        </div>
        {promos.length === 0 ? (
          <p className="text-sm text-ink-muted">No promo cards yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-3"
              >
                <div className="flex items-center gap-3">
                  {promo.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={promo.image_url}
                      alt=""
                      className="h-12 w-16 rounded-lg object-cover bg-line"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {promo.title || "(untitled)"}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {promo.is_active ? "Active on homepage" : "Not active"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!promo.is_active && (
                    <form action={setActivePromoAction}>
                      <input type="hidden" name="id" value={promo.id} />
                      <button
                        type="submit"
                        className="text-sm text-accent hover:underline"
                      >
                        Set active
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/admin/homepage/promo/${promo.id}/edit`}
                    className="text-sm text-accent hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={deletePromoAction}>
                    <input type="hidden" name="id" value={promo.id} />
                    <input type="hidden" name="image_url" value={promo.image_url} />
                    <ConfirmSubmitButton
                      confirmMessage={`Delete "${promo.title || "this promo"}"?`}
                      className="text-sm text-ink-muted hover:text-accent"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
