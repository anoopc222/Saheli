"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  addHeroImagesAction,
  deleteHeroImageAction,
  reorderHeroImagesAction,
  type AddHeroImagesState,
} from "@/lib/hero-actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { compressImageFile } from "@/lib/client-image-compression";
import { HeroBanner } from "@/lib/homepage-data";

const MAX_HERO_IMAGES = 6;
const HERO_MAX_DIMENSION = 1600;

type PendingImage = { key: string; file: File; previewUrl: string };

function UploadButton({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
    >
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {pending ? "Uploading…" : `Upload ${count} image${count === 1 ? "" : "s"}`}
    </button>
  );
}

const initialAddState: AddHeroImagesState = { error: null };

export function HeroImagesManager({ images }: { images: HeroBanner[] }) {
  const [order, setOrder] = useState(images);
  const [prevImages, setPrevImages] = useState(images);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [addState, formAction] = useActionState(addHeroImagesAction, initialAddState);
  const isFirstAddState = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);
  const pendingDragIndex = useRef<number | null>(null);

  // Re-sync local (draggable) order whenever the server-fetched list changes,
  // e.g. after an upload/delete revalidates the page.
  if (images !== prevImages) {
    setPrevImages(images);
    setOrder(images);
  }

  useEffect(() => {
    return () => {
      pending.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once a submitted batch finishes without error, clear the pending
  // previews — the server-revalidated `images` prop now includes them.
  useEffect(() => {
    if (isFirstAddState.current) {
      isFirstAddState.current = false;
      return;
    }
    if (!addState.error) {
      pending.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setPending([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addState]);

  const remainingSlots = Math.max(0, MAX_HERO_IMAGES - order.length - pending.length);

  function syncFileInput(images: PendingImage[]) {
    const dataTransfer = new DataTransfer();
    images.forEach((img) => dataTransfer.items.add(img.file));
    if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;
  }

  async function handleFilesSelected(selected: FileList | null) {
    if (!selected || selected.length === 0) return;
    const picked = Array.from(selected).slice(0, remainingSlots);

    setIsCompressing(true);
    try {
      const compressed: PendingImage[] = [];
      for (const file of picked) {
        const compressedFile = await compressImageFile(file, HERO_MAX_DIMENSION);
        compressed.push({
          key: crypto.randomUUID(),
          file: compressedFile,
          previewUrl: URL.createObjectURL(compressedFile),
        });
      }
      const combined = [...pending, ...compressed].slice(0, MAX_HERO_IMAGES - order.length);
      setPending(combined);
      syncFileInput(combined);
    } finally {
      setIsCompressing(false);
    }
  }

  function removePending(index: number) {
    URL.revokeObjectURL(pending[index].previewUrl);
    const next = pending.filter((_, i) => i !== index);
    setPending(next);
    syncFileInput(next);
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

  function handlePendingDrop(dropIndex: number) {
    if (pendingDragIndex.current === null || pendingDragIndex.current === dropIndex) return;
    const next = [...pending];
    const [moved] = next.splice(pendingDragIndex.current, 1);
    next.splice(dropIndex, 0, moved);
    pendingDragIndex.current = null;
    setPending(next);
    syncFileInput(next);
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

        {remainingSlots > 0 && (
          <label
            className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-ink-muted transition-colors ${
              isCompressing ? "opacity-50" : "cursor-pointer hover:border-accent hover:text-accent"
            }`}
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-[11px] font-medium">Add</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isCompressing}
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
          </label>
        )}
      </div>
      <p className="mt-2 text-xs text-ink-muted">
        {isCompressing
          ? "Compressing images…"
          : `${order.length}/${MAX_HERO_IMAGES} images · drag to reorder · rotates every 8s on the homepage.`}
      </p>

      {addState.error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {addState.error}
        </div>
      )}

      {pending.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            New images &middot; drag to arrange
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {pending.map((image, index) => (
              <div
                key={image.key}
                draggable
                onDragStart={() => (pendingDragIndex.current = index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handlePendingDrop(index)}
                className="relative aspect-square cursor-grab active:cursor-grabbing"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt=""
                  className="h-full w-full rounded-xl border border-accent object-cover"
                />
                <span className="absolute left-1 top-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {order.length + index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePending(index)}
                  aria-label="Remove image"
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white shadow-sm"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <form action={formAction} className="mt-3">
            <input ref={fileInputRef} type="file" name="images" multiple className="hidden" />
            <UploadButton count={pending.length} />
          </form>
        </div>
      )}
    </div>
  );
}
