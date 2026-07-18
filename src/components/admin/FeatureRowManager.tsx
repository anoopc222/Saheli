"use client";

import { useState } from "react";
import { FeatureItemRow, FeatureRowSettings } from "@/lib/feature-items-data";
import {
  createFeatureItemAction,
  updateFeatureItemAction,
  deleteFeatureItemAction,
  moveFeatureItemAction,
  setFeatureRowVisibilityAction,
} from "@/lib/feature-item-actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { FEATURE_ICONS } from "@/components/IconFeatureRow";

const ICON_OPTIONS = Object.keys(FEATURE_ICONS);

const selectClasses =
  "rounded-lg border border-line bg-paper px-2 py-1.5 text-xs capitalize outline-none focus:border-accent";
const inputClasses =
  "rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs outline-none focus:border-accent";

function VisibilityToggle({ id, showOnHome }: { id: string; showOnHome: boolean }) {
  return (
    <form action={setFeatureRowVisibilityAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="show_on_home" value={(!showOnHome).toString()} />
      <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
        Show on homepage
        <button
          type="submit"
          role="switch"
          aria-checked={showOnHome}
          className={`relative inline-block h-5 w-9 shrink-0 rounded-full p-0 transition-colors ${
            showOnHome ? "bg-accent" : "bg-line"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              showOnHome ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </label>
    </form>
  );
}

function ItemRow({
  item,
  disableUp,
  disableDown,
}: {
  item: FeatureItemRow;
  disableUp: boolean;
  disableDown: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const Icon = FEATURE_ICONS[item.icon] ?? FEATURE_ICONS.truck;

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateFeatureItemAction(formData);
          setEditing(false);
        }}
        className="flex flex-col gap-2 rounded-xl border border-accent bg-paper-raised p-3"
      >
        <input type="hidden" name="id" value={item.id} />
        <div className="grid grid-cols-3 gap-2">
          <select name="icon" defaultValue={item.icon} className={selectClasses}>
            {ICON_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          <input name="label" defaultValue={item.label} required placeholder="Label" className={inputClasses} />
          <input name="sub" defaultValue={item.sub} placeholder="Subtext (optional)" className={inputClasses} />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent"
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
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <form action={moveFeatureItemAction}>
            <input type="hidden" name="id" value={item.id} />
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
          <form action={moveFeatureItemAction}>
            <input type="hidden" name="id" value={item.id} />
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
        <Icon className="h-4 w-4 shrink-0 text-accent" />
        <button type="button" onClick={() => setEditing(true)} className="text-left">
          <p className="text-sm font-medium text-ink hover:text-accent">{item.label}</p>
          {item.sub && <p className="text-xs text-ink-muted">{item.sub}</p>}
        </button>
      </div>
      <form action={deleteFeatureItemAction}>
        <input type="hidden" name="id" value={item.id} />
        <ConfirmSubmitButton
          confirmMessage={`Delete "${item.label}"?`}
          className="shrink-0 text-xs text-ink-muted hover:text-accent"
        >
          Delete
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}

export function FeatureRowManager({
  items,
  settings,
}: {
  items: FeatureItemRow[];
  settings: FeatureRowSettings | null;
}) {
  return (
    <div>
      {settings && (
        <div className="mb-3 flex justify-end">
          <VisibilityToggle id={settings.id} showOnHome={settings.show_on_home} />
        </div>
      )}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <ItemRow
            key={item.id}
            item={item}
            disableUp={index === 0}
            disableDown={index === items.length - 1}
          />
        ))}
      </div>
      <form
        action={createFeatureItemAction}
        className="mt-3 flex flex-col gap-2 rounded-xl border border-dashed border-line p-3"
      >
        <p className="text-xs font-medium text-ink">Add item</p>
        <div className="grid grid-cols-3 gap-2">
          <select name="icon" defaultValue="truck" className={selectClasses}>
            {ICON_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          <input name="label" required placeholder="Label" className={inputClasses} />
          <input name="sub" placeholder="Subtext (optional)" className={inputClasses} />
        </div>
        <button
          type="submit"
          className="self-start rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent"
        >
          Add
        </button>
      </form>
    </div>
  );
}
