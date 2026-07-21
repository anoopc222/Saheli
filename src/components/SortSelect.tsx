"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDownIcon, CheckIcon } from "@/components/icons";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "featured";
  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.value === currentSort)?.label ?? "Featured";

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-line bg-paper-raised px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent"
      >
        {currentLabel}
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-20 mt-2 min-w-[10rem] overflow-hidden rounded-2xl border border-line bg-paper-raised py-1.5 shadow-md"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === currentSort}
              onClick={() => handleSelect(opt.value)}
              className="flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-xs font-medium text-ink transition-colors hover:bg-accent-soft hover:text-accent"
            >
              {opt.label}
              {opt.value === currentSort && <CheckIcon className="h-3.5 w-3.5 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
