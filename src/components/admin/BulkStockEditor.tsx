"use client";

import { useState } from "react";
import { bulkAdjustStockAction } from "@/lib/stock-actions";
import { StockAdjustModal } from "@/components/admin/StockAdjustModal";
import { ProductStockRow } from "@/lib/stock-data";

export function BulkStockEditor({ products }: { products: ProductStockRow[] }) {
  const [bulkMode, setBulkMode] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Stock by product
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            {bulkMode
              ? "Edit stock counts directly, then save all changes at once."
              : "Use the adjust icon to add or subtract stock for a sale made outside the site."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBulkMode((v) => !v)}
          className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          {bulkMode ? "Cancel" : "Bulk edit"}
        </button>
      </div>

      {bulkMode ? (
        <form
          action={async (formData) => {
            setSaving(true);
            await bulkAdjustStockAction(formData);
            setSaving(false);
            setBulkMode(false);
          }}
          className="flex flex-col gap-2"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-paper-raised p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                <p className="text-xs text-ink-muted">{product.sold_qty} sold</p>
              </div>
              <input
                type="number"
                name={`stock__${product.id}`}
                min={0}
                step={1}
                defaultValue={product.stock}
                className="w-20 shrink-0 rounded-xl border border-line bg-paper px-3 py-2 text-right text-sm outline-none focus:border-accent"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="mt-1 self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-paper-raised p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                <p className="text-xs text-ink-muted">
                  {product.stock} in stock &middot; {product.sold_qty} sold
                  {product.stock <= 0 && (
                    <span className="ml-1.5 font-medium text-red-600">Sold out</span>
                  )}
                </p>
              </div>
              <StockAdjustModal
                productId={product.id}
                productName={product.name}
                currentStock={product.stock}
                priceCents={product.price_cents}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
