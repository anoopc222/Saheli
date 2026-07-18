"use client";

import { moveMainCategoryAction } from "@/lib/main-category-actions";

export function MainCategoryReorderButtons({
  id,
  disableUp,
  disableDown,
}: {
  id: string;
  disableUp: boolean;
  disableDown: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <form action={moveMainCategoryAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="up" />
        <button
          type="submit"
          disabled={disableUp}
          aria-label="Move up"
          className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent disabled:opacity-30"
        >
          &uarr;
        </button>
      </form>
      <form action={moveMainCategoryAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="down" />
        <button
          type="submit"
          disabled={disableDown}
          aria-label="Move down"
          className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent disabled:opacity-30"
        >
          &darr;
        </button>
      </form>
    </div>
  );
}
