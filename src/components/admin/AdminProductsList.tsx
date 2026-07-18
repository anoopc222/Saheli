"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { deleteProductAction, setProductVisibilityAction } from "@/lib/product-actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { Product } from "@/types/product";
import { CategoryRow } from "@/lib/categories-data";
import { PencilIcon, TrashIcon } from "@/components/icons";

const selectClasses =
  "rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none transition-colors focus:border-accent disabled:opacity-50";

export function AdminProductsList({
  products,
  categories,
}: {
  products: Product[];
  categories: CategoryRow[];
}) {
  const [categoryId, setCategoryId] = useState("all");
  const [subcategoryId, setSubcategoryId] = useState("all");

  const subcategoryOptions =
    categoryId === "all"
      ? []
      : categories.find((c) => c.id === categoryId)?.subcategories ?? [];

  const filtered = products.filter((product) => {
    if (categoryId !== "all" && product.category_id !== categoryId) return false;
    if (subcategoryId !== "all" && product.subcategory_id !== subcategoryId) {
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSubcategoryId("all");
          }}
          className={selectClasses}
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={subcategoryId}
          onChange={(e) => setSubcategoryId(e.target.value)}
          disabled={subcategoryOptions.length === 0}
          className={selectClasses}
        >
          <option value="all">All subcategories</option>
          {subcategoryOptions.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm text-ink-muted">
          No products match this filter.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className={`flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-3 transition-opacity ${
                product.show_on_store ? "" : "opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url}
                  alt=""
                  className="h-14 w-11 rounded-lg object-cover bg-line"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ink">{product.name}</p>
                    {!product.show_on_store && (
                      <span className="shrink-0 rounded-full bg-line px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                        Hidden
                      </span>
                    )}
                  </div>
                  {product.product_code && (
                    <p className="text-xs text-ink-muted">{product.product_code}</p>
                  )}
                  <p className="text-xs text-ink-muted">
                    {product.fabric} &middot;{" "}
                    <span className="text-ink">
                      {formatPrice(product.price_cents)}
                    </span>
                    {product.compare_at_price_cents && (
                      <span className="ml-1 line-through">
                        {formatPrice(product.compare_at_price_cents)}
                      </span>
                    )}{" "}
                    &middot; stock {product.stock}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <VisibilityToggle
                  id={product.id}
                  checked={product.show_on_store}
                  action={setProductVisibilityAction}
                  label={`Show ${product.name} on store`}
                  field="show_on_store"
                />
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  aria-label={`Edit ${product.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
                <form action={deleteProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  {(product.image_urls?.length
                    ? product.image_urls
                    : [product.image_url]
                  )
                    .filter(Boolean)
                    .map((url) => (
                      <input key={url} type="hidden" name="image_urls" value={url} />
                    ))}
                  <ConfirmSubmitButton
                    confirmMessage={`Delete "${product.name}"? This can't be undone.`}
                    ariaLabel={`Delete ${product.name}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
