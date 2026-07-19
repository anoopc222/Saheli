"use client";

import { useState } from "react";
import {
  createPurchaseOrderAction,
  receivePurchaseOrderAction,
  cancelPurchaseOrderAction,
} from "@/lib/purchase-orders-actions";
import { PurchaseOrderRow } from "@/lib/purchase-orders-data";
import { formatPrice } from "@/lib/format";

const inputClasses =
  "w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent";

export function PurchaseOrderManager({
  products,
  purchaseOrders,
}: {
  products: { id: string; name: string }[];
  purchaseOrders: PurchaseOrderRow[];
}) {
  const [showForm, setShowForm] = useState(false);

  const pending = purchaseOrders.filter((po) => po.status === "pending");
  const settled = purchaseOrders.filter((po) => po.status !== "pending").slice(0, 10);

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Purchase orders
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Track incoming stock from suppliers. Marking one received adds the quantity to
            stock and updates the product&apos;s cost price.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          {showForm ? "Cancel" : "New order"}
        </button>
      </div>

      {showForm && (
        <form
          action={async (formData) => {
            await createPurchaseOrderAction(formData);
            setShowForm(false);
          }}
          className="flex flex-col gap-2 rounded-xl border border-line bg-paper-raised p-3"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Product</label>
            <select name="product_id" required defaultValue="" className={inputClasses}>
              <option value="" disabled>
                Select a product
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Quantity</label>
              <input
                type="number"
                name="quantity"
                min={1}
                step={1}
                required
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Cost per unit (&#8377;)
              </label>
              <input
                type="number"
                name="cost_price"
                min={0}
                step="0.01"
                required
                className={inputClasses}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Supplier (optional)
            </label>
            <input type="text" name="supplier" className={inputClasses} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Expected date (optional)
            </label>
            <input type="date" name="expected_date" className={inputClasses} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Notes (optional)</label>
            <input type="text" name="notes" className={inputClasses} />
          </div>
          <button
            type="submit"
            className="mt-1 self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Create order
          </button>
        </form>
      )}

      {pending.length === 0 && settled.length === 0 ? (
        <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm text-ink-muted">
          No purchase orders yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {pending.map((po) => (
            <div key={po.id} className="rounded-xl border border-line bg-paper-raised p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-ink">{po.product_name}</p>
                <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                  Pending
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {po.quantity} units &middot; {formatPrice(po.cost_price_cents)} each
                {po.supplier && <> &middot; {po.supplier}</>}
              </p>
              {po.expected_date && (
                <p className="text-xs text-ink-muted">
                  Expected{" "}
                  {new Date(po.expected_date).toLocaleDateString("en-IN", {
                    dateStyle: "medium",
                  })}
                </p>
              )}
              {po.notes && <p className="mt-1 text-xs text-ink-muted">{po.notes}</p>}
              <div className="mt-2 flex gap-2">
                <form action={receivePurchaseOrderAction}>
                  <input type="hidden" name="po_id" value={po.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent"
                  >
                    Mark received
                  </button>
                </form>
                <form action={cancelPurchaseOrderAction}>
                  <input type="hidden" name="po_id" value={po.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-red-300 hover:text-red-600"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          ))}
          {settled.map((po) => (
            <div
              key={po.id}
              className="rounded-xl border border-line bg-paper-raised p-3 opacity-70"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-ink">{po.product_name}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    po.status === "received"
                      ? "bg-green-100 text-green-700"
                      : "bg-line text-ink-muted"
                  }`}
                >
                  {po.status === "received" ? "Received" : "Cancelled"}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {po.quantity} units &middot; {formatPrice(po.cost_price_cents)} each
                {po.supplier && <> &middot; {po.supplier}</>}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
