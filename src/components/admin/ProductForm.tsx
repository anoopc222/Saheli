"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Product } from "@/types/product";
import { CategoryRow } from "@/lib/categories-data";

const MAX_IMAGES = 4;
const MAX_DIMENSION = 1200;
const IMAGE_QUALITY = 0.88;

async function compressImageFile(file: File): Promise<File> {
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Prefer WebP (smaller at equal quality); some browsers silently fall
    // back to PNG for unsupported types, which would bloat the upload, so
    // verify the result and re-encode as JPEG if that happened.
    let blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY)
    );
    let type = "image/webp";
    let ext = "webp";
    if (!blob || blob.type !== "image/webp") {
      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", IMAGE_QUALITY)
      );
      type = "image/jpeg";
      ext = "jpg";
    }
    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
    return new File([blob], name, { type });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}

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
    <section className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
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
}: {
  action: (formData: FormData) => void;
  product?: Product;
  categories: CategoryRow[];
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
  const subcategoryOptions =
    categories.find((c) => c.id === categoryId)?.subcategories ?? [];

  const [priceError, setPriceError] = useState<string | null>(null);

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
            <FieldLabel>Category</FieldLabel>
            <select
              name="category_id"
              required
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId("");
              }}
              className={inputClasses}
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Subcategory</FieldLabel>
            <select
              name="subcategory_id"
              required={subcategoryOptions.length > 0}
              disabled={subcategoryOptions.length === 0}
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              className={`${inputClasses} disabled:opacity-50`}
            >
              <option value="" disabled>
                {subcategoryOptions.length === 0 ? "None available" : "Select subcategory"}
              </option>
              {subcategoryOptions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Pricing & stock">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Selling price (₹)</FieldLabel>
            <input
              type="number"
              step="0.01"
              min="0"
              name="price"
              defaultValue={product ? product.price_cents / 100 : undefined}
              required
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel>Strike price (₹)</FieldLabel>
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
              className={inputClasses}
            />
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
