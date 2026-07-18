"use client";

import { useState } from "react";
import { CategoryRow } from "@/lib/categories-data";
import {
  deleteCategoryAction,
  createSubcategoryAction,
  setCategoryMenuVisibilityAction,
} from "@/lib/category-actions";
import { CategoryNameEditor } from "@/components/admin/CategoryNameEditor";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { SubcategoryChip } from "@/components/admin/SubcategoryChip";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { ChevronDownIcon, PlusIcon, TrashIcon } from "@/components/icons";

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
              <div key={category.id} className="rounded-lg border border-line bg-paper p-2.5">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <CategoryNameEditor id={category.id} name={category.name} />
                  </div>
                  <VisibilityToggle
                    id={category.id}
                    checked={category.show_on_menu}
                    action={setCategoryMenuVisibilityAction}
                    label={`Show ${category.name} on menu`}
                  />
                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <ConfirmSubmitButton
                      confirmMessage={`Delete "${category.name}" and all its subcategories? This can't be undone.`}
                      ariaLabel={`Delete ${category.name}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </ConfirmSubmitButton>
                  </form>
                </div>

                {category.subcategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {category.subcategories.map((sub) => (
                      <SubcategoryChip key={sub.id} id={sub.id} name={sub.name} fabric={sub.fabric} />
                    ))}
                  </div>
                )}

                <form
                  action={createSubcategoryAction}
                  className="mt-2 flex flex-wrap items-center gap-1.5"
                >
                  <input type="hidden" name="category_id" value={category.id} />
                  <input
                    name="name"
                    required
                    placeholder="Subcategory"
                    className="w-28 min-w-0 flex-1 rounded-lg border border-line bg-paper-raised px-2 py-1.5 text-xs outline-none focus:border-accent"
                  />
                  <input
                    name="fabric"
                    required
                    placeholder="Fabric"
                    className="w-24 min-w-0 flex-1 rounded-lg border border-line bg-paper-raised px-2 py-1.5 text-xs outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    aria-label="Add subcategory"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-accent"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
