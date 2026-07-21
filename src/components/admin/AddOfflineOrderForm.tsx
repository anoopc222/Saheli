"use client";

import { useState } from "react";
import { createOfflineOrderAction } from "@/lib/admin-orders-actions";
import { formatPrice } from "@/lib/format";

const inputClasses =
  "w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent";

type Product = { id: string; name: string; price_cents: number };

type Line = { key: number; productId: string; quantity: number; unitPrice: number };

let nextKey = 1;

function emptyLine(): Line {
  return { key: nextKey++, productId: "", quantity: 1, unitPrice: 0 };
}

export function AddOfflineOrderForm({ products }: { products: Product[] }) {
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [lines, setLines] = useState<Line[]>([emptyLine()]);

  const total = lines.reduce((sum, l) => sum + Math.round(l.unitPrice * 100) * l.quantity, 0);

  function updateLine(key: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function reset() {
    setCustomerName("");
    setCustomerPhone("");
    setLines([emptyLine()]);
  }

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Record an offline sale
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Add one or more products sold in person — stock updates automatically, same as an
            online order.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          {showForm ? "Cancel" : "New offline order"}
        </button>
      </div>

      {showForm && (
        <form
          action={async (formData) => {
            await createOfflineOrderAction(formData);
            reset();
            setShowForm(false);
          }}
          className="flex flex-col gap-3 rounded-xl border border-line bg-paper-raised p-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Customer name (optional)
              </label>
              <input
                type="text"
                name="customer_name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Phone (optional)
              </label>
              <input
                type="tel"
                name="customer_phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {lines.map((line) => (
              <div key={line.key} className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-ink">Product</label>
                  <select
                    name={`product_id__${line.key}`}
                    required
                    value={line.productId}
                    onChange={(e) => {
                      const product = products.find((p) => p.id === e.target.value);
                      updateLine(line.key, {
                        productId: e.target.value,
                        unitPrice: product ? product.price_cents / 100 : line.unitPrice,
                      });
                    }}
                    className={inputClasses}
                  >
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
                <div className="w-20 shrink-0">
                  <label className="mb-1.5 block text-sm font-medium text-ink">Qty</label>
                  <input
                    type="number"
                    name={`quantity__${line.key}`}
                    min={1}
                    step={1}
                    required
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(line.key, { quantity: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className={inputClasses}
                  />
                </div>
                <div className="w-24 shrink-0">
                  <label className="mb-1.5 block text-sm font-medium text-ink">
                    Price (&#8377;)
                  </label>
                  <input
                    type="number"
                    name={`unit_price__${line.key}`}
                    min={0}
                    step="0.01"
                    required
                    value={line.unitPrice}
                    onChange={(e) => updateLine(line.key, { unitPrice: Number(e.target.value) || 0 })}
                    className={inputClasses}
                  />
                </div>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                    aria-label="Remove product"
                    className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setLines((prev) => [...prev, emptyLine()])}
            className="self-start rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            + Add another product
          </button>

          <div className="flex items-center justify-between border-t border-line pt-2 text-sm">
            <p className="text-ink-muted">Total</p>
            <p className="font-semibold tabular-nums text-ink">{formatPrice(total)}</p>
          </div>

          <button
            type="submit"
            className="mt-1 self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Record offline order
          </button>
        </form>
      )}
    </section>
  );
}
