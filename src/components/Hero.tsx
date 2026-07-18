"use client";

import { useEffect, useState } from "react";
import { ChevronRightIcon } from "@/components/icons";

const SLIDE_INTERVAL_MS = 8000;

function HeroContent() {
  return (
    <>
      <p className="text-[11px] font-medium uppercase leading-tight tracking-[0.2em] text-accent">
        Handloom &amp; silk,
        <br />
        made with care
      </p>
      <h1 className="mt-3 font-heading text-4xl font-bold leading-[1.1] text-ink">
        Handpicked
        <br />
        Elegance
      </h1>
      <p className="mt-1 font-script text-3xl leading-none text-accent">
        for every occasion
      </p>
      <div className="mt-3 h-px w-14 bg-accent/50" />
      <p className="mt-4 max-w-[230px] text-sm leading-relaxed text-ink-muted">
        Premium handpicked sarees curated with love. Every drape tells a
        beautiful story.
      </p>
      <a
        href="#shop"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent"
      >
        Shop Collection
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </a>
    </>
  );
}

export function Hero({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const hasImages = images.length > 0;

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [images.length]);

  if (!hasImages) {
    return (
      <section className="mx-auto max-w-[480px] px-5 pb-8 pt-8">
        <HeroContent />
      </section>
    );
  }

  return (
    <section className="relative mx-auto min-h-[420px] max-w-[480px] overflow-hidden bg-line">
      <div className="absolute inset-0">
        {images.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* Left-side scrim keeps the overlaid text legible regardless of what
            the uploaded photo looks like on that side. */}
        <div className="absolute inset-0 bg-gradient-to-r from-paper/95 via-paper/60 to-transparent" />
      </div>

      {/* Normal-flow content (not absolutely positioned) so the section's
          height grows to fit the text instead of clipping it. */}
      <div className="relative max-w-[65%] px-5 pb-10 pt-8">
        <HeroContent />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-5 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-ink" : "w-1.5 bg-ink/25"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
