"use client";

import Link from "next/link";
import { useNavDrawer } from "@/lib/nav-drawer-context";
import { MenuMainCategory } from "@/lib/categories-data";
import { XIcon } from "@/components/icons";

export function NavDrawer({ menuTree }: { menuTree: MenuMainCategory[] }) {
  const { isOpen, close } = useNavDrawer();

  return (
    <div
      className={`fixed inset-0 z-40 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-ink/40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-paper shadow-xl transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <span className="font-heading text-base font-semibold text-ink">
            Browse
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-accent-soft hover:text-accent"
          >
            <XIcon className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <Link
            href="/"
            onClick={close}
            className="mb-5 flex items-center justify-between rounded-xl bg-ink px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            All Sarees
            <span aria-hidden>&rarr;</span>
          </Link>

          {menuTree.map((mainCategory) => (
            <div key={mainCategory.id} className="mb-6 last:mb-0">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {mainCategory.name}
              </p>
              {mainCategory.categories.length === 0 ? (
                <p className="text-xs text-ink-muted">Nothing here yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {mainCategory.categories.map((category) => (
                    <div key={category.id}>
                      <p className="mb-1.5 font-heading text-sm font-semibold text-ink">
                        {category.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/?fabric=${encodeURIComponent(sub.fabric)}`}
                            onClick={close}
                            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
