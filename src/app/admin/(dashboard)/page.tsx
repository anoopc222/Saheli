import Link from "next/link";
import { getProductSettings } from "@/lib/product-settings-data";
import { updateProductSettingsAction } from "@/lib/product-settings-actions";
import { getDiscountCodes } from "@/lib/discount-data";
import { getCustomerCount } from "@/lib/customers-data";
import {
  createDiscountCodeAction,
  setDiscountCodeActiveAction,
  deleteDiscountCodeAction,
} from "@/lib/discount-actions";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { InlineAddForm } from "@/components/admin/InlineAddForm";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { TrashIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [settings, discountCodes, customerCount] = await Promise.all([
    getProductSettings(),
    getDiscountCodes(),
    getCustomerCount(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/customers"
        className="flex items-center justify-between rounded-2xl border border-line bg-paper-raised p-4 transition-colors hover:border-accent"
      >
        <div>
          <p className="font-heading text-lg font-semibold text-ink">Customers</p>
          <p className="mt-1 text-sm text-ink-muted">
            See who bought what, tracked by phone number
          </p>
        </div>
        <p className="font-heading text-2xl font-semibold text-accent">{customerCount}</p>
      </Link>

      <section className="rounded-2xl border border-line bg-paper-raised p-4">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          New arrival badge
        </h2>
        <p className="mb-3 text-sm text-ink-muted">
          A product tagged &quot;New&quot; automatically switches to a &quot;Sale&quot; badge
          this many days after it was added.
        </p>
        <form action={updateProductSettingsAction} className="flex items-center gap-2">
          <input
            type="number"
            name="new_badge_days"
            min={1}
            step={1}
            defaultValue={settings.new_badge_days}
            required
            className="w-24 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <span className="text-sm text-ink-muted">days</span>
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Save
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Discount codes
        </h2>
        <div className="flex flex-col gap-2">
          {discountCodes.length === 0 ? (
            <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm text-ink-muted">
              No discount codes yet.
            </p>
          ) : (
            discountCodes.map((dc) => (
              <div
                key={dc.id}
                className={`flex items-center gap-2 rounded-xl border border-line bg-paper-raised px-3 py-2.5 transition-opacity ${
                  dc.active ? "" : "opacity-50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-semibold text-ink">
                    {dc.code}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {dc.percent_off ? `${dc.percent_off}% off` : formatPrice(dc.amount_off_cents ?? 0) + " off"}
                    {dc.expires_at && (
                      <>
                        {" "}
                        &middot; expires{" "}
                        {new Date(dc.expires_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </>
                    )}
                  </p>
                </div>
                <VisibilityToggle
                  id={dc.id}
                  checked={dc.active}
                  action={setDiscountCodeActiveAction}
                  label={`${dc.active ? "Deactivate" : "Activate"} ${dc.code}`}
                  field="active"
                />
                <form action={deleteDiscountCodeAction}>
                  <input type="hidden" name="id" value={dc.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Delete discount code "${dc.code}"?`}
                    ariaLabel={`Delete ${dc.code}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))
          )}
        </div>
        <InlineAddForm label="Add discount code">
          <form action={createDiscountCodeAction} className="flex flex-col gap-2">
            <input
              name="code"
              required
              placeholder="e.g. WELCOME10"
              className="rounded-xl border border-line bg-paper px-3 py-2 text-sm uppercase outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <select
                name="type"
                defaultValue="percent"
                className="rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="percent">% off</option>
                <option value="amount">₹ off</option>
              </select>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0"
                required
                placeholder="e.g. 10"
                className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
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
      </section>
    </div>
  );
}
