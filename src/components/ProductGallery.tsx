"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon } from "@/components/icons";
import { FadeImage } from "@/components/FadeImage";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lightboxTrackRef = useRef<HTMLDivElement>(null);
  const zoomContainerRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setZoomedIndex(null);
      }
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    const track = lightboxTrackRef.current;
    if (track) track.scrollLeft = activeIndex * track.clientWidth;

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  if (images.length === 0) return null;

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(index);
  }

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  function handleLightboxScroll() {
    const track = lightboxTrackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(index);
  }

  function toggleZoom(index: number) {
    if (zoomedIndex === index) {
      setZoomedIndex(null);
      return;
    }
    setZoomedIndex(index);
    requestAnimationFrame(() => {
      const container = zoomContainerRefs.current[index];
      if (container) {
        container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
        container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
      }
    });
  }

  return (
    <>
      <div className="h-full w-full">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onClick={() => setLightboxOpen(true)}
          className="flex h-full w-full cursor-zoom-in snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((url, index) => (
            <div key={url} className="relative h-full w-full shrink-0 snap-center">
              <FadeImage
                src={url}
                alt={`${alt} ${index + 1}`}
                lazy={index !== 0}
                sizes="480px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((url, index) => (
              <button
                key={url}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Show image ${index + 1}`}
                className={`pointer-events-auto h-1.5 w-1.5 rounded-full transition-colors ${
                  index === activeIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} — full screen gallery`}
          className="fixed inset-0 z-50 bg-black/95"
        >
          <button
            type="button"
            onClick={() => {
              setLightboxOpen(false);
              setZoomedIndex(null);
            }}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <XIcon className="h-5 w-5" />
          </button>

          <div
            ref={lightboxTrackRef}
            onScroll={handleLightboxScroll}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((url, index) => (
              <div
                key={url}
                ref={(el) => {
                  zoomContainerRefs.current[index] = el;
                }}
                className={`h-full w-full shrink-0 snap-center ${
                  zoomedIndex === index ? "overflow-auto" : "overflow-hidden"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${alt} ${index + 1}`}
                  onClick={() => toggleZoom(index)}
                  className={
                    zoomedIndex === index
                      ? "h-auto max-w-none cursor-zoom-out object-contain"
                      : "h-full w-full cursor-zoom-in object-contain"
                  }
                  style={zoomedIndex === index ? { width: "200%" } : undefined}
                />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center gap-1.5">
              {images.map((url, index) => (
                <span
                  key={url}
                  className={`h-1.5 w-1.5 rounded-full ${
                    index === activeIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
