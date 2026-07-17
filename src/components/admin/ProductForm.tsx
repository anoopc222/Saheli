"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Product } from "@/types/product";

const MAX_IMAGES = 4;
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.82;

async function compressImageFile(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
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
      className="mt-2 flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ProductForm({
  action,
  product,
}: {
  action: (formData: FormData) => void;
  product?: Product;
}) {
  const [keptUrls, setKeptUrls] = useState<string[]>(
    product?.image_urls?.length
      ? product.image_urls
      : product?.image_url
        ? [product.image_url]
        : []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = Math.max(0, MAX_IMAGES - keptUrls.length - newFiles.length);

  function syncFileInput(files: File[]) {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;
  }

  async function handleFilesSelected(selected: FileList | null) {
    if (!selected || selected.length === 0) return;
    const picked = Array.from(selected).slice(0, MAX_IMAGES - keptUrls.length - newFiles.length);

    setIsProcessing(true);
    try {
      const compressed = await Promise.all(picked.map(compressImageFile));
      const combined = [...newFiles, ...compressed].slice(0, MAX_IMAGES - keptUrls.length);
      setNewFiles(combined);
      syncFileInput(combined);
    } finally {
      setIsProcessing(false);
    }
  }

  function removeNewFile(index: number) {
    const next = newFiles.filter((_, i) => i !== index);
    setNewFiles(next);
    syncFileInput(next);
  }

  function removeKeptUrl(url: string) {
    setKeptUrls(keptUrls.filter((u) => u !== url));
  }

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
          Images ({keptUrls.length + newFiles.length}/{MAX_IMAGES})
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
          {keptUrls.map((url) => (
            <div key={url} className="relative h-28 w-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full rounded-xl object-cover"
              />
              <input type="hidden" name="keep_images" value={url} />
              <button
                type="button"
                onClick={() => removeKeptUrl(url)}
                aria-label="Remove image"
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white"
              >
                &times;
              </button>
            </div>
          ))}
          {newFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative h-28 w-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-full w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewFile(index)}
                aria-label="Remove image"
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="images"
          accept="image/*"
          multiple
          disabled={remainingSlots === 0 || isProcessing}
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="block w-full text-sm disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-ink-muted">
          {isProcessing
            ? "Compressing images…"
            : `Max ${MAX_IMAGES} images · resized and compressed in your browser before upload.`}
          {!isProcessing && remainingSlots === 0 && " Remove an image to add a different one."}
        </p>
      </div>
      <SubmitButton
        label={product ? "Save changes" : "Create product"}
        disabledExtra={isProcessing}
      />
    </form>
  );
}
