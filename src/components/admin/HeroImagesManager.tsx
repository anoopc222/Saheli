"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  addHeroImageAction,
  deleteHeroImageAction,
  reorderHeroImagesAction,
} from "@/lib/hero-actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { compressImageFile } from "@/lib/client-image-compression";
import { HeroBanner } from "@/lib/homepage-data";

const MAX_HERO_IMAGES = 6;
const HERO_MAX_DIMENSION = 1600;

function UploadStatus() {
  const { pending } = useFormStatus();
  return pending ? (
    <span className="text-[11px] font-medium text-ink-muted">Uploading…</span>
  ) : (
    <span className="text-2xl leading-none">+</span>
  );
}

export function HeroImagesManager({ images }: { images: HeroBanner[] }) {
  const [order, setOrder] = useState(images);
  const [prevImages, setPrevImages] = useState(images);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dragIndex = useRef<number | null>(null);

  // Re-sync local (draggable) order whenever the server-fetched list changes,
  // e.g. after an upload/delete revalidates the page.
  if (images !== prevImages) {
    setPrevImages(images);
    setOrder(images);
  }

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;
    setIsProcessing(true);
    try {
      const compressed = await compressImageFile(file, HERO_MAX_DIMENSION);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(compressed);
      if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;
      formRef.current?.requestSubmit();
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex.current === null || dragIndex.current === dropIndex) return;
    const previousOrder = order;
    const next = [...order];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(dropIndex, 0, moved);
    dragIndex.current = null;
    setOrder(next);
    setReorderError(null);
    reorderHeroImagesAction(next.map((img) => img.id)).catch(() => {
      setOrder(previousOrder);
      setReorderError("Couldn't save the new order. Please try again.");
    });
  }

  return (
    <div>
      {reorderError && (
        <div className="mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {reorderError}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {order.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={() => (dragIndex.current = index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="relative aspect-square cursor-grab active:cursor-grabbing"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.image_url}
              alt=""
              className="h-full w-full rounded-xl border border-line object-cover"
            />
            <span className="absolute left-1 top-1 rounded-full bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {index + 1}
            </span>
            <form action={deleteHeroImageAction}>
              <input type="hidden" name="id" value={image.id} />
              <input type="hidden" name="image_url" value={image.image_url} />
              <ConfirmSubmitButton
                confirmMessage="Remove this hero image?"
                ariaLabel="Remove image"
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white shadow-sm"
              >
                &times;
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}

        {order.length < MAX_HERO_IMAGES && (
          <form ref={formRef} action={addHeroImageAction}>
            <label
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-ink-muted transition-colors ${
                isProcessing ? "opacity-50" : "cursor-pointer hover:border-accent hover:text-accent"
              }`}
            >
              <UploadStatus />
              <span className="text-[11px] font-medium">Add</span>
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                disabled={isProcessing}
                onChange={(e) => handleFileSelected(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          </form>
        )}
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        {order.length}/{MAX_HERO_IMAGES} images · drag to reorder · rotates every 8s on the homepage.
      </p>
    </div>
  );
}
