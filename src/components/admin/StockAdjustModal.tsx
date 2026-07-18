"use client";

import { adjustStockAction } from "@/lib/stock-actions";
import { EditModal } from "@/components/admin/EditModal";
import { AdjustIcon } from "@/components/icons";

const inputClasses =
  "w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent";

export function StockAdjustModal({
  productId,
  productName,
  currentStock,
}: {
  productId: string;
  productName: string;
  currentStock: number;
}) {
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
