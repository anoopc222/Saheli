"use client";

import {
  updateMainCategoryAction,
  deleteMainCategoryAction,
  setMainCategoryMenuVisibilityAction,
} from "@/lib/main-category-actions";
import { MainCategoryReorderButtons } from "@/components/admin/MainCategoryReorderButtons";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { EditModal } from "@/components/admin/EditModal";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { TrashIcon } from "@/components/icons";

const inputClasses =
  "min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent";

export function MainCategoryRow({
  id,
  name,
  showOnMenu,
  disableUp,
  disableDown,
}: {
  id: string;
  name: string;
  showOnMenu: boolean;
  disableUp: boolean;
  disableDown: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-paper-raised px-3 py-2.5">
      <MainCategoryReorderButtons id={id} disableUp={disableUp} disableDown={disableDown} />
      <p className="min-w-0 flex-1 truncate font-heading text-sm font-semibold text-ink">{name}</p>
      <EditModal label={`Edit ${name}`} title={name}>
        {(close) => (
          <>
            <form
              action={async (formData) => {
                await updateMainCategoryAction(formData);
                close();
              }}
              className="flex items-center gap-2"
            >
              <input type="hidden" name="id" value={id} />
              <input name="name" defaultValue={name} required className={inputClasses} />
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
                id={id}
                checked={showOnMenu}
                action={setMainCategoryMenuVisibilityAction}
                label={`Show ${name} on menu`}
              />
            </div>
            <form action={deleteMainCategoryAction}>
              <input type="hidden" name="id" value={id} />
              <ConfirmSubmitButton
                confirmMessage={`Delete "${name}"? It must have no categories under it.`}
                ariaLabel={`Delete ${name}`}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                Delete main category
              </ConfirmSubmitButton>
            </form>
          </>
        )}
      </EditModal>
    </div>
  );
}
