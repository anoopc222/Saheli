"use client";

import { setMainCategoryMenuVisibilityAction } from "@/lib/main-category-actions";

export function MainCategoryMenuToggle({
  id,
  showOnMenu,
}: {
  id: string;
  showOnMenu: boolean;
}) {
  return (
    <form action={setMainCategoryMenuVisibilityAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="show_on_menu" value={(!showOnMenu).toString()} />
      <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
        Show on menu
        <button
          type="submit"
          role="switch"
          aria-checked={showOnMenu}
          className={`relative inline-block h-5 w-9 shrink-0 rounded-full p-0 transition-colors ${
            showOnMenu ? "bg-accent" : "bg-line"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              showOnMenu ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </label>
    </form>
  );
}
