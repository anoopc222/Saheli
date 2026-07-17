"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { compressImageFile } from "@/lib/client-image-compression";
import { PromoBanner } from "@/lib/homepage-data";

const PROMO_MAX_DIMENSION = 1600;

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
}: {
  action: (formData: FormData) => void;
  promo?: PromoBanner;
}) {
  const [preview, setPreview] = useState<string | null>(promo?.image_url || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            defaultValue={promo?.button_link || "/"}
            placeholder="/?filter=sale"
            className={inputClasses}
          />
        </div>
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
