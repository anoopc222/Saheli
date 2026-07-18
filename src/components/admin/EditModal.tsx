"use client";

import { useState } from "react";
import { PencilIcon, XIcon } from "@/components/icons";

export function EditModal({
  label,
  title,
  icon: Icon = PencilIcon,
  children,
}: {
  label: string;
  title: string;
  icon?: (props: { className?: string }) => React.ReactElement;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent"
      >
        <Icon className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={close}
        >
          <div
            className="flex h-[32rem] max-h-[85vh] w-full max-w-sm flex-col rounded-2xl bg-paper p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <p className="font-heading text-sm font-semibold text-ink">{title}</p>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto">{children(close)}</div>
          </div>
        </div>
      )}
    </>
  );
}
