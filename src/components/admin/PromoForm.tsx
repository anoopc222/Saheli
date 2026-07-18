"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { compressImageFile } from "@/lib/client-image-compression";
import { PromoBanner } from "@/lib/homepage-data";
import { CategoryRow } from "@/lib/categories-data";

const PROMO_MAX_DIMENSION = 1600;

function linkFromCategory(
  categories: CategoryRow[],
  categoryId: string,
  subcategoryId: string
): string {
  const category = categories.find((cat) => cat.id === categoryId);
  const sub = category?.subcategories.find((s) => s.id === subcategoryId);
  if (sub) return `/?fabric=${encodeURIComponent(sub.fabric)}`;
  if (category) return `/?category=${category.id}`;
  return "/";
}

// Best-effort reverse lookup so editing an existing promo shows its current
// category/subcategory pre-selected, when its link matches that scheme.
function categoryFromLink(buttonLink: string | undefined, categories: CategoryRow[]) {
  if (!buttonLink) return { categoryId: "", subcategoryId: "" };
  const fabricMatch = buttonLink.match(/^\/\?fabric=([^&]+)$/);
  if (fabricMatch) {
    const fabric = decodeURIComponent(fabricMatch[1]);
    for (const category of categories) {
      const sub = category.subcategories.find((s) => s.fabric === fabric);
      if (sub) return { categoryId: category.id, subcategoryId: sub.id };
    }
  }
  const categoryMatch = buttonLink.match(/^\/\?category=([^&]+)$/);
  if (categoryMatch) {
    const id = decodeURIComponent(categoryMatch[1]);
    if (categories.some((cat) => cat.id === id)) return { categoryId: id, subcategoryId: "" };
  }
  return { categoryId: "", subcategoryId: "" };
}

function CategoryLinkPicker({
  categories,
  categoryId,
  subcategoryId,
  onChange,
}: {
  categories: CategoryRow[];
  categoryId: string;
  subcategoryId: string;
  onChange: (categoryId: string, subcategoryId: string) => void;
}) {
  const subcategoryOptions = categories.find((cat) => cat.id === categoryId)?.subcategories ?? [];

  return (
    <div className="grid grid-cols-2 gap-3">
      <select
        value={categoryId}
        onChange={(e) => onChange(e.target.value, "")}
        className={inputClasses}
      >
        <option value="">Custom link (edit below)</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <select
        value={subcategoryId}
        disabled={subcategoryOptions.length === 0}
        onChange={(e) => onChange(categoryId, e.target.value)}
        className={`${inputClasses} disabled:opacity-50`}
      >
        <option value="">All in category</option>
        {subcategoryOptions.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {sub.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {pending ? "Saving…" : label}
    </button>
  );
}

const inputClasses =
  "w-full rounded-xl border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";

export function PromoForm({
  action,
  promo,
  categories,
}: {
  action: (formData: FormData) => void;
  promo?: PromoBanner;
  categories: CategoryRow[];
}) {
  const [preview, setPreview] = useState<string | null>(promo?.image_url || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [buttonLink, setButtonLink] = useState(promo?.button_link || "/");
  const [{ categoryId, subcategoryId }, setPickerSelection] = useState(() =>
    categoryFromLink(promo?.button_link, categories)
  );

  function handlePickerChange(newCategoryId: string, newSubcategoryId: string) {
    setPickerSelection({ categoryId: newCategoryId, subcategoryId: newSubcategoryId });
    if (newCategoryId) {
      setButtonLink(linkFromCategory(categories, newCategoryId, newSubcategoryId));
    }
  }

  function handleManualLinkChange(value: string) {
    setButtonLink(value);
    setPickerSelection({ categoryId: "", subcategoryId: "" });
  }

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;
    setIsProcessing(true);
    try {
      const compressed = await compressImageFile(file, PROMO_MAX_DIMENSION);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(compressed);
      if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;
      setPreview(URL.createObjectURL(compressed));
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Title</label>
        <input
          name="title"
          defaultValue={promo?.title}
          placeholder="e.g. Onam Collection 2026"
          className={inputClasses}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Subtitle</label>
        <input
          name="subtitle"
          defaultValue={promo?.subtitle}
          placeholder="e.g. Celebrate tradition in timeless elegance"
          className={inputClasses}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Button text</label>
          <input
            name="button_text"
            defaultValue={promo?.button_text || "Shop Now"}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Button link</label>
          <input
            name="button_link"
            value={buttonLink}
            onChange={(e) => handleManualLinkChange(e.target.value)}
            placeholder="/?filter=sale"
            className={inputClasses}
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Link to a category
        </label>
        <CategoryLinkPicker
          categories={categories}
          categoryId={categoryId}
          subcategoryId={subcategoryId}
          onChange={handlePickerChange}
        />
        <p className="mt-1 text-xs text-ink-muted">
          Picking a category fills in the button link above — or leave it on
          &ldquo;Custom link&rdquo; to type any path yourself (e.g. /?filter=sale).
        </p>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Image</label>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="mb-2 h-32 w-full rounded-xl border border-line object-cover"
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/*"
          disabled={isProcessing}
          onChange={(e) => handleFileSelected(e.target.files?.[0])}
          className="block w-full text-sm disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-ink-muted">
          {isProcessing
            ? "Compressing…"
            : promo
              ? "Leave empty to keep the current image."
              : "Resized and compressed in your browser before upload."}
        </p>
      </div>
      <SubmitButton label={promo ? "Save changes" : "Create promo"} />
    </form>
  );
}
