"use client";

import {
  updateSubcategoryAction,
  deleteSubcategoryAction,
} from "@/lib/category-actions";
import { EditModal } from "@/components/admin/EditModal";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { TrashIcon } from "@/components/icons";

export function SubcategoryChip({
  id,
  name,
  fabric,
}: {
  id: string;
  name: string;
  fabric: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-line py-1 pl-3 pr-1 text-xs text-ink">
      <span>
        {name} <span className="text-ink-muted">({fabric})</span>
      </span>
      <EditModal label={`Edit ${name}`} title={name}>
        {(close) => (
          <>
            <form
              action={async (formData) => {
                await updateSubcategoryAction(formData);
                close();
              }}
              className="flex flex-col gap-2"
            >
              <input type="hidden" name="id" value={id} />
              <input
                name="name"
                defaultValue={name}
                required
                autoFocus
                placeholder="Subcategory name"
                className="rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <input
                name="fabric"
                defaultValue={fabric}
                required
                placeholder="Fabric (matches product fabric)"
                className="rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
              >
                Save
              </button>
            </form>
            <form action={deleteSubcategoryAction}>
              <input type="hidden" name="id" value={id} />
              <ConfirmSubmitButton
                confirmMessage={`Delete subcategory "${name}"?`}
                ariaLabel={`Delete ${name}`}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                Delete subcategory
              </ConfirmSubmitButton>
            </form>
          </>
        )}
      </EditModal>
    </div>
  );
}
