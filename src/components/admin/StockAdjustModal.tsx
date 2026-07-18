"use client";

import { useState } from "react";
import { adjustStockAction } from "@/lib/stock-actions";
import { EditModal } from "@/components/admin/EditModal";
import { AdjustIcon } from "@/components/icons";

const inputClasses =
  "w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent";

export function StockAdjustModal({
  productId,
  productName,
  currentStock,
  priceCents,
}: {
  productId: string;
  productName: string;
  currentStock: number;
  priceCents: number;
}) {
  const [recordSale, setRecordSale] = useState(false);

  return (
    <EditModal
      label={`Adjust stock for ${productName}`}
      title={`Adjust stock — ${productName}`}
      icon={AdjustIcon}
    >
      {(close) => (
        <form
          action={async (formData) => {
            await adjustStockAction(formData);
            close();
          }}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="product_id" value={productId} />
          <p className="text-sm text-ink-muted">
            Current stock: <span className="font-medium text-ink">{currentStock}</span>
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Change (+ to add, − to subtract)
            </label>
            <input
              type="number"
              name="delta"
              step="1"
              placeholder="e.g. -2 for a sale made outside the site"
              required
              autoFocus
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Reason (optional)</label>
            <input
              type="text"
              name="reason"
              placeholder="e.g. Sold at exhibition"
              className={inputClasses}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={recordSale}
              onChange={(e) => setRecordSale(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-accent"
            />
            This was a sale — count it toward revenue &amp; profit
          </label>
          <input type="hidden" name="record_sale" value={recordSale.toString()} />

          {recordSale && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Sale price per unit (₹)
              </label>
              <input
                type="number"
                name="sale_price"
                step="0.01"
                min="0"
                defaultValue={priceCents / 100}
                required={recordSale}
                className={inputClasses}
              />
              <p className="mt-1.5 text-xs text-ink-muted">
                Only counted when the change above is negative — adding stock
                back in is never logged as a sale.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Save
          </button>
        </form>
      )}
    </EditModal>
  );
}
