"use client";

import { useRef } from "react";
import { setCategoryMenuVisibilityAction } from "@/lib/category-actions";

export function CategoryMenuToggle({
  id,
  showOnMenu,
}: {
  id: string;
  showOnMenu: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={setCategoryMenuVisibilityAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="show_on_menu" value={(!showOnMenu).toString()} />
      <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
        Show on menu
        <button
          type="submit"
          role="switch"
          aria-checked={showOnMenu}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            showOnMenu ? "bg-accent" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              showOnMenu ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </label>
    </form>
  );
}
