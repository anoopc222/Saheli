"use client";

import { useState } from "react";
import { MenuItemRow } from "@/lib/menu-items-data";
import {
  createMenuItemAction,
  updateMenuItemLabelAction,
  updateMenuItemTagAction,
  deleteMenuItemAction,
  moveMenuItemAction,
} from "@/lib/menu-item-actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { MenuItemVisibilityToggle } from "@/components/admin/MenuItemVisibilityToggle";
import { TrashIcon } from "@/components/icons";

const FALLBACK_LABEL: Record<string, string> = {
  onam: "Onam Collection 2026",
  new_arrivals: "New Arrivals",
  bestsellers: "Best Sellers",
};

const inputClasses =
  "rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs outline-none focus:border-accent";

function ItemRow({
  item,
  disableUp,
  disableDown,
  tagSuggestions,
}: {
  item: MenuItemRow;
  disableUp: boolean;
  disableDown: boolean;
  tagSuggestions: string[];
}) {
  const [editing, setEditing] = useState(false);
  const isCustom = item.key === null;
  const fallbackLabel = item.key ? FALLBACK_LABEL[item.key] : "";

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateMenuItemLabelAction(formData);
          if (isCustom) await updateMenuItemTagAction(formData);
          setEditing(false);
        }}
        className="flex flex-col gap-2 rounded-xl border border-accent bg-paper-raised p-3"
      >
        <input type="hidden" name="id" value={item.id} />
        <input
          name="label"
          defaultValue={item.label || fallbackLabel}
          required
          placeholder="Label"
          className={inputClasses}
        />
        {isCustom && (
          <>
            <input
              name="tag"
              list="menu-item-tag-suggestions"
              defaultValue={item.tag ?? ""}
              required
              placeholder="Tag to match (e.g. diwali-2026)"
              className={inputClasses}
            />
            <datalist id="menu-item-tag-suggestions">
              {tagSuggestions.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
          </>
        )}
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
          <form action={moveMenuItemAction}>
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
          <form action={moveMenuItemAction}>
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
        <button
          type="button"
          onClick={() => (item.protected ? undefined : setEditing(true))}
          disabled={item.protected}
          className="text-left"
        >
          <p className="font-heading text-sm font-semibold text-ink hover:text-accent">
            {item.label || fallbackLabel}
          </p>
          {isCustom && item.tag && <p className="text-xs text-ink-muted">Tag: {item.tag}</p>}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <MenuItemVisibilityToggle id={item.id} showOnMenu={item.show_on_menu} />
        {!item.protected && (
          <form action={deleteMenuItemAction}>
            <input type="hidden" name="id" value={item.id} />
            <ConfirmSubmitButton
              confirmMessage={`Delete "${item.label || fallbackLabel}"?`}
              ariaLabel={`Delete ${item.label || fallbackLabel}`}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent"
            >
              <TrashIcon className="h-4 w-4" />
            </ConfirmSubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}

export function MenuItemManager({
  items,
  tagSuggestions,
}: {
  items: MenuItemRow[];
  tagSuggestions: string[];
}) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <ItemRow
            key={item.id}
            item={item}
            disableUp={index === 0}
            disableDown={index === items.length - 1}
            tagSuggestions={tagSuggestions}
          />
        ))}
      </div>
      <form
        action={createMenuItemAction}
        className="mt-3 flex flex-col gap-2 rounded-xl border border-dashed border-line p-3"
      >
        <p className="text-xs font-medium text-ink">Add promotional item</p>
        <div className="grid grid-cols-2 gap-2">
          <input name="label" required placeholder="Label" className={inputClasses} />
          <input
            name="tag"
            list="menu-item-tag-suggestions-new"
            required
            placeholder="Tag to match"
            className={inputClasses}
          />
          <datalist id="menu-item-tag-suggestions-new">
            {tagSuggestions.map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </div>
        <p className="text-xs text-ink-muted">
          Shows every product tagged with this tag when tapped in the menu.
        </p>
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
