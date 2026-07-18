import {
  createCategoryAction,
  deleteCategoryAction,
  createSubcategoryAction,
} from "@/lib/category-actions";
import {
  createMainCategoryAction,
  deleteMainCategoryAction,
} from "@/lib/main-category-actions";
import { getCategories, getMainCategories } from "@/lib/categories-data";
import { CategoryNameEditor } from "@/components/admin/CategoryNameEditor";
import { CategoryMenuToggle } from "@/components/admin/CategoryMenuToggle";
import { SubcategoryChip } from "@/components/admin/SubcategoryChip";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { MainCategoryNameEditor } from "@/components/admin/MainCategoryNameEditor";
import { MainCategoryReorderButtons } from "@/components/admin/MainCategoryReorderButtons";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, mainCategories] = await Promise.all([
    getCategories(),
    getMainCategories(),
  ]);

  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Categories
      </h1>

      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Main categories (Shop menu)
        </h2>
        <div className="mb-3 flex flex-col gap-2">
          {mainCategories.map((mainCategory, index) => (
            <div
              key={mainCategory.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-3"
            >
              <div className="flex items-center gap-2">
                <MainCategoryReorderButtons
                  id={mainCategory.id}
                  disableUp={index === 0}
                  disableDown={index === mainCategories.length - 1}
                />
                <MainCategoryNameEditor id={mainCategory.id} name={mainCategory.name} />
              </div>
              <form action={deleteMainCategoryAction}>
                <input type="hidden" name="id" value={mainCategory.id} />
                <ConfirmSubmitButton
                  confirmMessage={`Delete "${mainCategory.name}"? It must have no categories under it.`}
                  className="text-xs text-ink-muted hover:text-accent"
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          ))}
        </div>
        <form action={createMainCategoryAction} className="flex items-end gap-2">
          <input
            name="name"
            required
            placeholder="e.g. Footwear"
            className="w-52 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Add main category
          </button>
        </form>
      </section>

      <form action={createCategoryAction} className="mb-8 flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-4">
        <p className="text-sm font-medium text-ink">New category</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            name="name"
            required
            placeholder="e.g. Kalamkari Sarees"
            className="rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <select
            name="main_category_id"
            required
            defaultValue=""
            className="rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="" disabled>
              Select main category
            </option>
            {mainCategories.map((mc) => (
              <option key={mc.id} value={mc.id}>
                {mc.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Add
        </button>
      </form>

      <div className="flex flex-col gap-8">
        {mainCategories.map((mainCategory) => {
          const categoriesInGroup = categories.filter(
            (c) => c.main_category_id === mainCategory.id
          );
          return (
            <div key={mainCategory.id}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {mainCategory.name}
              </h2>
              {categoriesInGroup.length === 0 ? (
                <p className="text-sm text-ink-muted">No categories yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {categoriesInGroup.map((category) => (
                    <div
                      key={category.id}
                      className="rounded-2xl border border-line bg-paper-raised p-4"
                    >
                      <div className="mb-3 flex flex-col gap-2">
                        <CategoryNameEditor id={category.id} name={category.name} />
                        <div className="flex items-center justify-between">
                          <CategoryMenuToggle
                            id={category.id}
                            showOnMenu={category.show_on_menu}
                          />
                          <form action={deleteCategoryAction}>
                            <input type="hidden" name="id" value={category.id} />
                            <ConfirmSubmitButton
                              confirmMessage={`Delete "${category.name}" and all its subcategories? This can't be undone.`}
                              className="text-xs text-ink-muted hover:text-accent"
                            >
                              Delete category
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {category.subcategories.map((sub) => (
                          <SubcategoryChip
                            key={sub.id}
                            id={sub.id}
                            name={sub.name}
                            fabric={sub.fabric}
                          />
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
