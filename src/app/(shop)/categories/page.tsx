import Link from "next/link";
import { getCategories } from "@/lib/categories-data";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-[480px] px-4 py-6">
      <h1 className="mb-1 font-heading text-2xl font-semibold text-ink">
        Categories
      </h1>
      <p className="mb-5 text-xs text-ink-muted">
        {categories.length} collections
      </p>
      <Link
        href="/"
        className="mb-6 flex items-center justify-between rounded-2xl bg-ink px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent"
      >
        All Sarees
        <span aria-hidden>&rarr;</span>
      </Link>
      <div className="flex flex-col gap-5">
        {categories.map((category) => (
          <div key={category.id}>
            <p className="mb-2.5 font-heading text-base font-semibold text-ink">
              {category.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/?fabric=${encodeURIComponent(sub.fabric)}`}
                  className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
