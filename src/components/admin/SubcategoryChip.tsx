"use client";

import { useState } from "react";
import {
  updateSubcategoryAction,
  deleteSubcategoryAction,
} from "@/lib/category-actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export function SubcategoryChip({
  id,
  name,
  fabric,
}: {
  id: string;
  name: string;
  fabric: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateSubcategoryAction(formData);
          setEditing(false);
        }}
        className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-2 py-1"
      >
        <input type="hidden" name="id" value={id} />
        <input
          name="name"
          defaultValue={name}
          required
          autoFocus
          className="w-24 rounded-lg border border-line bg-paper-raised px-2 py-1 text-xs outline-none focus:border-accent"
        />
        <input
          name="fabric"
          defaultValue={fabric}
          required
          className="w-32 rounded-lg border border-line bg-paper-raised px-2 py-1 text-xs outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="text-xs font-medium text-accent hover:underline"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs text-ink-muted hover:text-accent"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink">
      <button type="button" onClick={() => setEditing(true)}>
        {name} <span className="text-ink-muted">({fabric})</span>
      </button>
      <form action={deleteSubcategoryAction}>
        <input type="hidden" name="id" value={id} />
        <ConfirmSubmitButton
          confirmMessage={`Delete subcategory "${name}"?`}
          ariaLabel={`Delete ${name}`}
          className="text-ink-muted hover:text-accent"
        >
          &times;
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
