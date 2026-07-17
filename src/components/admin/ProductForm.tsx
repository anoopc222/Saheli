"use client";

import { useState } from "react";
import { Product } from "@/types/product";

export function ProductForm({
  action,
  product,
}: {
  action: (formData: FormData) => void;
  product?: Product;
}) {
  const [preview, setPreview] = useState<string | null>(
    product?.image_url || null
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Name</label>
        <input
          name="name"
          defaultValue={product?.name}
          required
          className="w-full rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={product?.description}
          rows={3}
          className="w-full rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Fabric
          </label>
          <input
            name="fabric"
            defaultValue={product?.fabric}
            required
            className="w-full rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Badge
          </label>
          <select
            name="badge"
            defaultValue={product?.badge ?? ""}
            className="w-full rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">None</option>
            <option value="new">New</option>
            <option value="bestseller">Bestseller</option>
            <option value="sale">Sale</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Price (₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
            defaultValue={product ? product.price_cents / 100 : undefined}
            required
            className="w-full rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Compare price (₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="compare_price"
            defaultValue={
              product?.compare_at_price_cents
                ? product.compare_at_price_cents / 100
                : undefined
            }
            className="w-full rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Stock
          </label>
          <input
            type="number"
            min="0"
            name="stock"
            defaultValue={product?.stock ?? 0}
            required
            className="w-full rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">
          Image
        </label>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="mb-2 h-40 w-32 rounded-xl object-cover"
          />
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
          className="block w-full text-sm"
        />
        <p className="mt-1 text-xs text-ink-muted">
          Max 20MB &middot; auto-resized and compressed to WebP on upload.
          Leave empty to keep the current image.
        </p>
      </div>
      <button
        type="submit"
        className="mt-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent"
      >
        {product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
