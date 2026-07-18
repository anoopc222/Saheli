import {
  createCategoryAction,
} from "@/lib/category-actions";
import { createMainCategoryAction } from "@/lib/main-category-actions";
import { getCategories, getMainCategories } from "@/lib/categories-data";
import { getMenuItems } from "@/lib/menu-items-data";
import { getAllTags } from "@/lib/tags-data";
import { MainCategoryRow } from "@/components/admin/MainCategoryRow";
import { InlineAddForm } from "@/components/admin/InlineAddForm";
import { CategoryGroup } from "@/components/admin/CategoryGroup";
import { MenuItemManager } from "@/components/admin/MenuItemManager";
import { PlusIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, mainCategories, menuItems, tagSuggestions] = await Promise.all([
    getCategories(),
    getMainCategories(),
    getMenuItems(),
    getAllTags(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-xl font-semibold text-ink">Categories</h1>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Main categories (Shop menu)
        </h2>
        <div className="flex flex-col gap-2">
          {mainCategories.map((mainCategory, index) => (
            <MainCategoryRow
              key={mainCategory.id}
              id={mainCategory.id}
              name={mainCategory.name}
              showOnMenu={mainCategory.show_on_menu}
              disableUp={index === 0}
              disableDown={index === mainCategories.length - 1}
            />
          ))}
        </div>
        <InlineAddForm label="Add main category">
          <form action={createMainCategoryAction} className="flex items-center gap-2">
            <input
              name="name"
              required
              placeholder="e.g. Footwear"
              className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              aria-label="Add main category"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-accent"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </form>
        </InlineAddForm>
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Promotional menu items
        </h2>
        <MenuItemManager items={menuItems} tagSuggestions={tagSuggestions} />
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Categories &amp; subcategories
        </h2>
        <p className="text-xs text-ink-muted">
          Fabric must match a product&apos;s fabric field for a subcategory to filter correctly.
        </p>
        <InlineAddForm label="New category">
          <form action={createCategoryAction} className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <input
                name="name"
                required
                placeholder="e.g. Kalamkari Sarees"
                className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <select
                name="main_category_id"
                required
                defaultValue=""
                className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
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
        </InlineAddForm>
        <div className="flex flex-col gap-2">
          {mainCategories.map((mainCategory) => (
            <CategoryGroup
              key={mainCategory.id}
              name={mainCategory.name}
              categories={categories.filter(
                (c) => c.main_category_id === mainCategory.id
              )}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
