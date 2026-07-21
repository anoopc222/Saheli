"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { deleteProductAction } from "@/lib/product-actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
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
  const [tab, setTab] = useState<"active" | "hidden">("active");
  const [categoryId, setCategoryId] = useState("all");
  const [subcategoryId, setSubcategoryId] = useState("all");
  const [search, setSearch] = useState("");

  const subcategoryOptions =
    categoryId === "all"
      ? []
      : categories.find((c) => c.id === categoryId)?.subcategories ?? [];

  const activeCount = products.filter((p) => p.show_on_store).length;
  const hiddenCount = products.length - activeCount;

  const filtered = products.filter((product) => {
    if (tab === "active" && !product.show_on_store) return false;
    if (tab === "hidden" && product.show_on_store) return false;
    if (categoryId !== "all" && product.category_id !== categoryId) return false;
    if (subcategoryId !== "all" && product.subcategory_id !== subcategoryId) {
      return false;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchesCode = product.product_code?.toLowerCase().includes(q);
      const matchesName = product.name.toLowerCase().includes(q);
      if (!matchesCode && !matchesName) return false;
    }
    return true;
  });

  return (
    <>
      <div className="mb-3 flex gap-1 rounded-xl border border-line bg-paper-raised p-1">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
            tab === "active" ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
          }`}
        >
          Products ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setTab("hidden")}
          className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
            tab === "hidden" ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
          }`}
        >
          Hidden ({hiddenCount})
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by code or name"
        className="mb-2 w-full rounded-xl border border-line bg-paper-raised px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
      />

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
          {tab === "hidden" ? "No hidden products." : "No products match this filter."}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-3"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url}
                  alt=""
                  className="h-14 w-11 rounded-lg object-cover bg-line"
                />
                <div>
                  <p className="text-sm font-medium text-ink">{product.name}</p>
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
