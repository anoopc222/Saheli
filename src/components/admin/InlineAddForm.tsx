"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "@/components/icons";

export function InlineAddForm({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-accent hover:text-accent"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        {label}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-paper-raised p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-ink">{label}</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cancel"
          className="text-ink-muted transition-colors hover:text-accent"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      {children}
    </div>
  );
}
