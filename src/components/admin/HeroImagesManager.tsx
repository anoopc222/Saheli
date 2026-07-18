"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
// Vercel hard-caps serverless request bodies at ~4.5MB regardless of Next.js's
// own bodySizeLimit config, and it rejects oversized requests before our code
// even runs (no error surfaces). Uploading one photo per request — well under
// that ceiling — avoids the multi-file bundle ever getting close to it.
const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;

type PendingImage = { key: string; file: File; previewUrl: string };

const initialAddState: AddHeroImagesState = { error: null };

export function HeroImagesManager({ images }: { images: HeroBanner[] }) {
  const [order, setOrder] = useState(images);
  const [prevImages, setPrevImages] = useState(images);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [addState, formAction] = useActionState(addHeroImagesAction, initialAddState);
  const isFirstAddState = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uploadQueueRef = useRef<PendingImage[]>([]);
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

  function syncFileInput(files: PendingImage[]) {
    const dataTransfer = new DataTransfer();
    files.forEach((img) => dataTransfer.items.add(img.file));
    if (fileInputRef.current) fileInputRef.current.files = dataTransfer.files;
  }

  function submitNextInQueue() {
    const next = uploadQueueRef.current[0];
    if (!next) {
      setUploading(false);
      return;
    }
    syncFileInput([next]);
    formRef.current?.requestSubmit();
  }

  // Each submission uploads exactly one queued file. When it resolves, drop
  // that file (success or not) and either advance the queue or stop on error.
  useEffect(() => {
    if (isFirstAddState.current) {
      isFirstAddState.current = false;
      return;
    }
    if (addState.error) {
      setUploading(false);
      return;
    }
    const finished = uploadQueueRef.current.shift();
    if (finished) {
      URL.revokeObjectURL(finished.previewUrl);
      setPending((prev) => prev.filter((img) => img.key !== finished.key));
    }
    if (uploadQueueRef.current.length > 0) {
      submitNextInQueue();
    } else {
      setUploading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addState]);

  // Not reduced by order.length: once at MAX_HERO_IMAGES, new uploads bump
  // the oldest existing hero image instead of being blocked, so the admin can
  // always queue up to a full batch of new photos regardless of how many
  // already exist.
  const remainingSlots = Math.max(0, MAX_HERO_IMAGES - pending.length);
  const willEvict = Math.max(0, order.length + pending.length - MAX_HERO_IMAGES);

  async function handleFilesSelected(selected: FileList | null) {
    if (!selected || selected.length === 0) return;
    const picked = Array.from(selected).slice(0, remainingSlots);

    setIsCompressing(true);
    setSizeWarning(null);
    try {
      const compressed: PendingImage[] = [];
      let skipped = 0;
      for (const file of picked) {
        const compressedFile = await compressImageFile(file, HERO_MAX_DIMENSION);
        if (compressedFile.size > MAX_UPLOAD_BYTES) {
          skipped++;
          continue;
        }
        compressed.push({
          key: crypto.randomUUID(),
          file: compressedFile,
          previewUrl: URL.createObjectURL(compressedFile),
        });
      }
      if (skipped > 0) {
        setSizeWarning(
          `${skipped} photo${skipped === 1 ? "" : "s"} couldn't be added — still too large after compression. Try a smaller or less detailed photo.`
        );
      }
      setPending((prev) => [...prev, ...compressed].slice(0, MAX_HERO_IMAGES));
    } finally {
      setIsCompressing(false);
    }
  }

  function removePending(index: number) {
    if (uploading) return;
    URL.revokeObjectURL(pending[index].previewUrl);
    setPending((prev) => prev.filter((_, i) => i !== index));
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
    if (uploading) return;
    if (pendingDragIndex.current === null || pendingDragIndex.current === dropIndex) return;
    const next = [...pending];
    const [moved] = next.splice(pendingDragIndex.current, 1);
    next.splice(dropIndex, 0, moved);
    pendingDragIndex.current = null;
    setPending(next);
  }

  function startUpload() {
    if (uploading || pending.length === 0) return;
    uploadQueueRef.current = [...pending];
    setUploading(true);
    submitNextInQueue();
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
              isCompressing || uploading ? "opacity-50" : "cursor-pointer hover:border-accent hover:text-accent"
            }`}
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-[11px] font-medium">Add</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isCompressing || uploading}
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

      {sizeWarning && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {sizeWarning}
        </div>
      )}

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
                draggable={!uploading}
                onDragStart={() => (pendingDragIndex.current = index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handlePendingDrop(index)}
                className={`relative aspect-square ${uploading ? "" : "cursor-grab active:cursor-grabbing"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt=""
                  className="h-full w-full rounded-xl border border-accent object-cover"
                />
                <span className="absolute left-1 top-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {index + 1}
                </span>
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => removePending(index)}
                    aria-label="Remove image"
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs text-white shadow-sm"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          {willEvict > 0 && (
            <p className="mt-3 text-xs text-ink-muted">
              You&apos;re at the {MAX_HERO_IMAGES}-image limit — uploading these will remove
              your oldest {willEvict} hero image{willEvict === 1 ? "" : "s"} to make room.
            </p>
          )}

          {/* Hidden form submitted once per queued file — never all at once,
              to stay well under Vercel's per-request body-size ceiling. */}
          <form ref={formRef} action={formAction} className="mt-3">
            <input ref={fileInputRef} type="file" name="images" className="hidden" />
            <button
              type="button"
              disabled={uploading}
              onClick={startUpload}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
            >
              {uploading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {uploading
                ? `Uploading… ${pending.length} left`
                : `Upload ${pending.length} image${pending.length === 1 ? "" : "s"}`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
