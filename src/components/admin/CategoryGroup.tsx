"use client";

import { useState } from "react";
import { CategoryRow } from "@/lib/categories-data";
import {
  updateCategoryAction,
  deleteCategoryAction,
  createSubcategoryAction,
  setCategoryMenuVisibilityAction,
} from "@/lib/category-actions";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { EditModal } from "@/components/admin/EditModal";
import { SubcategoryChip } from "@/components/admin/SubcategoryChip";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { ChevronDownIcon, PlusIcon, TrashIcon } from "@/components/icons";

const inputClasses =
  "min-w-0 flex-1 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs outline-none focus:border-accent";

function CategoryRowItem({ category }: { category: CategoryRow }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-line bg-paper px-2.5 py-2 transition-opacity ${
        category.show_on_menu ? "" : "opacity-50"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <p className="min-w-0 truncate text-sm font-semibold text-ink">{category.name}</p>
        {!category.show_on_menu && (
          <span className="shrink-0 rounded-full bg-line px-2 py-0.5 text-[11px] font-medium text-ink-muted">
            Hidden
          </span>
        )}
      </div>
      <EditModal label={`Edit ${category.name}`} title={category.name}>
        {(close) => (
          <>
            <form
              action={async (formData) => {
                await updateCategoryAction(formData);
                close();
              }}
              className="flex items-center gap-2"
            >
              <input type="hidden" name="id" value={category.id} />
              <input
                name="name"
                defaultValue={category.name}
                required
                className="min-w-0 flex-1 rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
              >
                Save
              </button>
            </form>

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink">Show on menu</span>
              <VisibilityToggle
                id={category.id}
                checked={category.show_on_menu}
                action={setCategoryMenuVisibilityAction}
                label={`Show ${category.name} on menu`}
              />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
                Subcategories
              </p>
              {category.subcategories.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {category.subcategories.map((sub) => (
                    <SubcategoryChip key={sub.id} id={sub.id} name={sub.name} fabric={sub.fabric} />
                  ))}
                </div>
              )}
              <form action={createSubcategoryAction} className="flex flex-wrap items-center gap-1.5">
                <input type="hidden" name="category_id" value={category.id} />
                <input name="name" required placeholder="Subcategory" className={inputClasses} />
                <input name="fabric" required placeholder="Fabric" className={inputClasses} />
                <button
                  type="submit"
                  aria-label="Add subcategory"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-accent"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </form>
            </div>

            <form action={deleteCategoryAction}>
              <input type="hidden" name="id" value={category.id} />
              <ConfirmSubmitButton
                confirmMessage={`Delete "${category.name}" and all its subcategories? This can't be undone.`}
                ariaLabel={`Delete ${category.name}`}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                Delete category
              </ConfirmSubmitButton>
            </form>
          </>
        )}
      </EditModal>
    </div>
  );
}

export function CategoryGroup({
  name,
  categories,
}: {
  name: string;
  categories: CategoryRow[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-line bg-paper-raised">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left"
      >
        <span className="font-heading text-sm font-semibold text-ink">{name}</span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-muted">
            {categories.length}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-line p-2.5">
          {categories.length === 0 ? (
            <p className="px-1 py-1 text-xs text-ink-muted">No categories yet.</p>
          ) : (
            categories.map((category) => (
              <CategoryRowItem key={category.id} category={category} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
