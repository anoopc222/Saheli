"use client";

import {
  createShippingZoneAction,
  updateShippingZoneAction,
  deleteShippingZoneAction,
} from "@/lib/shipping-zones-actions";
import { EditModal } from "@/components/admin/EditModal";
import { InlineAddForm } from "@/components/admin/InlineAddForm";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { TrashIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import { ShippingZone } from "@/lib/shipping-zones";

const fieldClasses =
  "rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent";

export function ShippingZoneManager({ zones }: { zones: ShippingZone[] }) {
  const sorted = [...zones].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="flex flex-col gap-2">
      {sorted.length === 0 ? (
        <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm text-ink-muted">
          No shipping zones yet — every order ships free until you add one.
        </p>
      ) : (
        sorted.map((zone) => (
          <div
            key={zone.id}
            className="flex items-center gap-2 rounded-xl border border-line bg-paper-raised px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{zone.name}</p>
              <p className="text-xs text-ink-muted">
                PIN starts with{" "}
                {zone.pin_prefixes.map((p) => (p === "" ? "anything" : p)).join(", ") ||
                  "anything"}{" "}
                &middot; {formatPrice(zone.rate_cents)} &middot; priority {zone.sort_order}
              </p>
            </div>
            <EditModal label={`Edit ${zone.name}`} title={zone.name}>
              {(close) => (
                <>
                  <form
                    action={async (formData) => {
                      await updateShippingZoneAction(formData);
                      close();
                    }}
                    className="flex flex-col gap-2"
                  >
                    <input type="hidden" name="id" value={zone.id} />
                    <input
                      name="name"
                      defaultValue={zone.name}
                      required
                      autoFocus
                      placeholder="Zone name"
                      className={fieldClasses}
                    />
                    <input
                      name="pin_prefixes"
                      defaultValue={zone.pin_prefixes.join(", ")}
                      placeholder="PIN prefixes, comma separated (blank = matches any)"
                      className={fieldClasses}
                    />
                    <div className="flex gap-2">
                      <div className="flex flex-1 items-center gap-1.5">
                        <span className="text-sm text-ink-muted">&#8377;</span>
                        <input
                          type="number"
                          name="rate"
                          min={0}
                          step="0.01"
                          defaultValue={zone.rate_cents / 100}
                          required
                          className={`${fieldClasses} w-full`}
                        />
                      </div>
                      <input
                        type="number"
                        name="sort_order"
                        defaultValue={zone.sort_order}
                        required
                        title="Priority — lower numbers are checked first"
                        className={`${fieldClasses} w-20`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
                    >
                      Save
                    </button>
                  </form>
                  <form action={deleteShippingZoneAction}>
                    <input type="hidden" name="id" value={zone.id} />
                    <ConfirmSubmitButton
                      confirmMessage={`Delete shipping zone "${zone.name}"?`}
                      ariaLabel={`Delete ${zone.name}`}
                      className="flex w-full items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete zone
                    </ConfirmSubmitButton>
                  </form>
                </>
              )}
            </EditModal>
          </div>
        ))
      )}

      <InlineAddForm label="Add shipping zone">
        <form action={createShippingZoneAction} className="flex flex-col gap-2">
          <input name="name" required placeholder="Zone name" className={fieldClasses} />
          <input
            name="pin_prefixes"
            placeholder="PIN prefixes, comma separated (blank = matches any)"
            className={fieldClasses}
          />
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-1.5">
              <span className="text-sm text-ink-muted">&#8377;</span>
              <input
                type="number"
                name="rate"
                min={0}
                step="0.01"
                required
                placeholder="Rate"
                className={`${fieldClasses} w-full`}
              />
            </div>
            <input
              type="number"
              name="sort_order"
              defaultValue={sorted.length}
              required
              title="Priority — lower numbers are checked first"
              className={`${fieldClasses} w-20`}
            />
          </div>
          <button
            type="submit"
            className="self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Add
          </button>
        </form>
      </InlineAddForm>
    </div>
  );
}
