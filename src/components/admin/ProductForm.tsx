"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Product } from "@/types/product";
import { CategoryRow, MainCategoryRow } from "@/lib/categories-data";
import { compressImageFile } from "@/lib/client-image-compression";
import { TagChipInput } from "@/components/admin/TagChipInput";

const MAX_IMAGES = 4;

function SubmitButton({
  label,
  disabledExtra,
}: {
  label: string;
  disabledExtra: boolean;
}) {
  const { pending } = useFormStatus();
  const disabled = pending || disabledExtra;
  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {pending ? "Saving…" : label}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-ink">
      {children}
    </label>
  );
}

const inputClasses =
  "w-full rounded-xl border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-paper-raised p-4">
      <h2 className="mb-4 border-b border-line pb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

type NewImage = { file: File; previewUrl: string };

export function ProductForm({
  action,
  product,
  categories,
  mainCategories,
  tagSuggestions,
}: {
  action: (formData: FormData) => void;
  product?: Product;
  categories: CategoryRow[];
  mainCategories: MainCategoryRow[];
  tagSuggestions: string[];
}) {
  const [keptUrls, setKeptUrls] = useState<string[]>(
    product?.image_urls?.length
      ? product.image_urls
      : product?.image_url
        ? [product.image_url]
        : []
  );
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [subcategoryId, setSubcategoryId] = useState(
    product?.subcategory_id ?? ""
  );
  const [mainCategoryId, setMainCategoryId] = useState(() => {
    if (!product?.category_id) return "";
    return categories.find((c) => c.id === product.category_id)?.main_category_id ?? "";
  });
  const categoryOptions = mainCategoryId
    ? categories.filter((c) => c.main_category_id === mainCategoryId)
    : [];
  const subcategoryOptions =
    categories.find((c) => c.id === categoryId)?.subcategories ?? [];

  const [priceError, setPriceError] = useState<string | null>(null);
  const [showOnStore, setShowOnStore] = useState(product?.show_on_store ?? true);

  const [costPrice, setCostPrice] = useState(
    product?.cost_price_cents ? product.cost_price_cents / 100 : 0
  );
  // Strike price is a dummy "was" price meant only to catch the
  // customer's eye, entered as a percentage above the selling price
  // rather than an absolute amount. Back-derive that percentage from
  // whatever was last saved so editing a product shows the same %.
  const [strikePercent, setStrikePercent] = useState(() => {
    if (product?.compare_at_price_cents && product.price_cents > 0) {
      return Math.round(
        ((product.compare_at_price_cents - product.price_cents) / product.price_cents) * 100
      );
    }
    return 0;
  });

  // Selling price is always cost + 40% margin. A product saved before
  // cost tracking existed has no cost price on file — keep showing its
  // existing selling price as-is until a cost is entered, instead of
  // silently zeroing it out.
  const sellingPrice =
    costPrice > 0 ? Math.round(costPrice * 1.4) : product ? product.price_cents / 100 : 0;
  const marginAmount = sellingPrice - costPrice;
  const marginPct = costPrice > 0 ? (marginAmount / costPrice) * 100 : 0;
  const strikePrice = strikePercent > 0 ? Math.round(sellingPrice * (1 + strikePercent / 100)) : 0;

  // Revoke every preview blob URL on unmount so selected-but-unsaved images
  // don't linger in memory after leaving the page.
  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remainingSlots = Math.max(0, MAX_IMAGES - keptUrls.length - newImages.length);

  function syncFileInput(images: NewImage[]) {
    const dataTransfer = new DataTransfer();
    images.forEach((img) => dataTransfer.items.add(img.file));
    if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;
  }

  async function handleFilesSelected(selected: FileList | null) {
    if (!selected || selected.length === 0) return;
    const picked = Array.from(selected).slice(0, MAX_IMAGES - keptUrls.length - newImages.length);

    setIsProcessing(true);
    try {
      // Compress one at a time (not in parallel) to keep peak memory low —
      // only one decoded bitmap/canvas is alive at any moment.
      const compressed: NewImage[] = [];
      for (const file of picked) {
        const compressedFile = await compressImageFile(file);
        compressed.push({ file: compressedFile, previewUrl: URL.createObjectURL(compressedFile) });
      }
      const combined = [...newImages, ...compressed].slice(0, MAX_IMAGES - keptUrls.length);
      setNewImages(combined);
      syncFileInput(combined);
    } finally {
      setIsProcessing(false);
    }
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(newImages[index].previewUrl);
    const next = newImages.filter((_, i) => i !== index);
    setNewImages(next);
    syncFileInput(next);
  }

  function removeKeptUrl(url: string) {
    setKeptUrls(keptUrls.filter((u) => u !== url));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const price = Number(new FormData(form).get("price") || 0);
    const comparePriceRaw = new FormData(form).get("compare_price");
    const comparePrice = comparePriceRaw ? Number(comparePriceRaw) : null;

    if (comparePrice !== null && comparePrice <= price) {
      e.preventDefault();
      setPriceError("Strike price must be higher than the selling price.");
      return;
    }
    setPriceError(null);
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="flex flex-col gap-5">
      {priceError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {priceError}
        </div>
      )}

      <Section title="Details">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Name</FieldLabel>
            <input
              name="name"
              defaultValue={product?.name}
              required
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel>Product code</FieldLabel>
            <input
              name="product_code"
              defaultValue={product?.product_code ?? ""}
              placeholder="e.g. SKU-1042"
              required
              className={inputClasses}
            />
          </div>
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            name="description"
            defaultValue={product?.description}
            rows={3}
            required
            className={inputClasses}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Fabric</FieldLabel>
            <input
              name="fabric"
              defaultValue={product?.fabric}
              required
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel>Badge</FieldLabel>
            <select
              name="badge"
              defaultValue={product?.badge ?? ""}
              className={inputClasses}
            >
              <option value="">None</option>
              <option value="new">New</option>
              <option value="bestseller">Bestseller</option>
              <option value="sale">Sale</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Main Category</FieldLabel>
            <select
              value={mainCategoryId}
              onChange={(e) => {
                setMainCategoryId(e.target.value);
                setCategoryId("");
                setSubcategoryId("");
              }}
              className={inputClasses}
            >
              <option value="">None</option>
              {mainCategories.map((mc) => (
                <option key={mc.id} value={mc.id}>
                  {mc.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Category</FieldLabel>
            <select
              name="category_id"
              disabled={!mainCategoryId}
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId("");
              }}
              className={`${inputClasses} disabled:opacity-50`}
            >
              <option value="">{mainCategoryId ? "None" : "Select main category first"}</option>
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <FieldLabel>Subcategory</FieldLabel>
          <select
            name="subcategory_id"
            disabled={subcategoryOptions.length === 0}
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            className={`${inputClasses} disabled:opacity-50`}
          >
            <option value="">{subcategoryOptions.length === 0 ? "None available" : "None"}</option>
            {subcategoryOptions.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Tags">
        <div>
          <FieldLabel>Tags</FieldLabel>
          <TagChipInput initialTags={product?.tags ?? []} suggestions={tagSuggestions} />
        </div>
      </Section>

      <Section title="Pricing & stock">
        <div>
          <FieldLabel>Actual price / cost (₹)</FieldLabel>
          <input
            type="number"
            step="0.01"
            min="0"
            name="cost_price"
            value={costPrice || ""}
            onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
            placeholder="What this product costs you"
            className={inputClasses}
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            Selling price is always cost + 40% margin.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Selling price (₹)</FieldLabel>
            <input
              type="number"
              name="price"
              value={sellingPrice || ""}
              readOnly
              required
              className={`${inputClasses} bg-paper text-ink-muted`}
            />
            {costPrice > 0 && (
              <p className="mt-1.5 text-xs text-ink-muted">
                Margin: <span className="font-medium text-ink">₹{marginAmount.toFixed(2)}</span>{" "}
                ({marginPct.toFixed(1)}%)
              </p>
            )}
          </div>
          <div>
            <FieldLabel>Strike price (% above selling)</FieldLabel>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                min="0"
                name="strike_percent"
                value={strikePercent || ""}
                onChange={(e) => setStrikePercent(Number(e.target.value) || 0)}
                placeholder="e.g. 10"
                className={inputClasses}
              />
              <span className="shrink-0 text-sm text-ink-muted">%</span>
            </div>
            <input type="hidden" name="compare_price" value={strikePrice || ""} />
            <p className="mt-1.5 text-xs text-ink-muted">
              {strikePrice > 0
                ? <>Shown as <span className="font-medium text-ink">₹{strikePrice.toFixed(2)}</span> — a dummy price to attract customers, not a real discount.</>
                : "Optional — a crossed-out price shown above the selling price to attract customers."}
            </p>
          </div>
        </div>
        <div>
          <FieldLabel>Stock</FieldLabel>
          <input
            type="number"
            min="0"
            name="stock"
            defaultValue={product?.stock ?? 0}
            required
            className={inputClasses}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-ink">Show on store</p>
            <p className="text-xs text-ink-muted">
              Turn off to hide this product from customers without deleting it.
            </p>
          </div>
          <input type="hidden" name="show_on_store" value={showOnStore.toString()} />
          <button
            type="button"
            role="switch"
            aria-checked={showOnStore}
            onClick={() => setShowOnStore((prev) => !prev)}
            className={`relative inline-block h-6 w-11 shrink-0 rounded-full p-0 transition-colors ${
              showOnStore ? "bg-accent" : "bg-line"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                showOnStore ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </Section>

      <Section title={`Images (${keptUrls.length + newImages.length}/${MAX_IMAGES})`}>
        <div className="grid grid-cols-4 gap-2">
          {keptUrls.map((url) => (
            <div key={url} className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full rounded-xl border border-line object-cover"
              />
              <input type="hidden" name="keep_images" value={url} />
              <button
                type="button"
                onClick={() => removeKeptUrl(url)}
                aria-label="Remove image"
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white shadow-sm"
              >
                &times;
              </button>
            </div>
          ))}
          {newImages.map((img, index) => (
            <div key={img.previewUrl} className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.previewUrl}
                alt=""
                className="h-full w-full rounded-xl border border-line object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewImage(index)}
                aria-label="Remove image"
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white shadow-sm"
              >
                &times;
              </button>
            </div>
          ))}
          {remainingSlots > 0 && (
            <label
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-ink-muted transition-colors ${
                isProcessing ? "opacity-50" : "cursor-pointer hover:border-accent hover:text-accent"
              }`}
            >
              <span className="text-2xl leading-none">+</span>
              <span className="text-[11px] font-medium">Add</span>
              <input
                ref={fileInputRef}
                type="file"
                name="images"
                accept="image/*"
                multiple
                disabled={isProcessing}
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="text-xs text-ink-muted">
          {isProcessing
            ? "Compressing images…"
            : `Up to ${MAX_IMAGES} photos · resized and compressed in your browser before upload.`}
        </p>
      </Section>

      <div className="border-t border-line pt-5">
        <SubmitButton
          label={product ? "Save changes" : "Create product"}
          disabledExtra={isProcessing}
        />
      </div>
    </form>
  );
}
