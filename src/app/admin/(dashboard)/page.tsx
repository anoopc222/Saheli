import Link from "next/link";
import { getProductSettings } from "@/lib/product-settings-data";
import { updateProductSettingsAction } from "@/lib/product-settings-actions";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const settings = await getProductSettings();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/products"
          className="rounded-2xl border border-line bg-paper-raised p-6 transition-colors hover:border-accent"
        >
          <p className="font-heading text-lg font-semibold text-ink">Products</p>
          <p className="mt-1 text-sm text-ink-muted">
            Add, edit, and manage saree listings
          </p>
        </Link>
        <Link
          href="/admin/categories"
          className="rounded-2xl border border-line bg-paper-raised p-6 transition-colors hover:border-accent"
        >
          <p className="font-heading text-lg font-semibold text-ink">Categories</p>
          <p className="mt-1 text-sm text-ink-muted">
            Manage the category and subcategory menu
          </p>
        </Link>
        <Link
          href="/admin/homepage"
          className="rounded-2xl border border-line bg-paper-raised p-6 transition-colors hover:border-accent"
        >
          <p className="font-heading text-lg font-semibold text-ink">Homepage</p>
          <p className="mt-1 text-sm text-ink-muted">
            Hero carousel images and the seasonal promo card
          </p>
        </Link>
      </div>

      <section className="rounded-2xl border border-line bg-paper-raised p-4">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          New arrival badge
        </h2>
        <p className="mb-3 text-sm text-ink-muted">
          A product tagged &quot;New&quot; automatically switches to a &quot;Sale&quot; badge
          this many days after it was added.
        </p>
        <form action={updateProductSettingsAction} className="flex items-center gap-2">
          <input
            type="number"
            name="new_badge_days"
            min={1}
            step={1}
            defaultValue={settings.new_badge_days}
            required
            className="w-24 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <span className="text-sm text-ink-muted">days</span>
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Save
          </button>
        </form>
      </section>
    </div>
  );
}
