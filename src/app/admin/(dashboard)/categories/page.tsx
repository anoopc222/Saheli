import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  createCategoryAction,
  deleteCategoryAction,
  createSubcategoryAction,
  deleteSubcategoryAction,
} from "@/lib/category-actions";

type SubcategoryRow = { id: string; name: string; fabric: string };
type CategoryRow = {
  id: string;
  name: string;
  subcategories: SubcategoryRow[];
};

export default async function AdminCategoriesPage() {
  const supabase = createBrowserSupabaseClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, subcategories(id, name, fabric)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "subcategories" })
    .returns<CategoryRow[]>();

  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Categories
      </h1>

      <form action={createCategoryAction} className="mb-6 flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-ink">
            New category
          </label>
          <input
            name="name"
            required
            placeholder="e.g. Kalamkari Sarees"
            className="w-full rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Add
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {(categories ?? []).map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-line bg-paper-raised p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-heading text-base font-semibold text-ink">
                {category.name}
              </p>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <button
                  type="submit"
                  className="text-xs text-ink-muted hover:text-accent"
                >
                  Delete category
                </button>
              </form>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {category.subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink"
                >
                  <span>
                    {sub.name}{" "}
                    <span className="text-ink-muted">({sub.fabric})</span>
                  </span>
                  <form action={deleteSubcategoryAction}>
                    <input type="hidden" name="id" value={sub.id} />
                    <button
                      type="submit"
                      aria-label={`Delete ${sub.name}`}
                      className="text-ink-muted hover:text-accent"
                    >
                      &times;
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <form
              action={createSubcategoryAction}
              className="flex flex-wrap items-end gap-2"
            >
              <input type="hidden" name="category_id" value={category.id} />
              <input
                name="name"
                required
                placeholder="Subcategory name"
                className="w-40 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs outline-none focus:border-accent"
              />
              <input
                name="fabric"
                required
                placeholder="Fabric (matches product fabric)"
                className="w-52 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
              >
                Add subcategory
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
