"use client";

import { useState } from "react";
import { updateCategoryAction } from "@/lib/category-actions";

export function CategoryNameEditor({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-left font-heading text-base font-semibold text-ink hover:text-accent"
      >
        {name}
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await updateCategoryAction(formData);
        setEditing(false);
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <input
        name="name"
        defaultValue={name}
        required
        autoFocus
        className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-2 py-1.5 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        className="shrink-0 text-xs font-medium text-accent hover:underline"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="shrink-0 text-xs text-ink-muted hover:text-accent"
      >
        Cancel
      </button>
    </form>
  );
}
