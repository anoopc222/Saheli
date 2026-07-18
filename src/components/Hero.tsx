"use client";

import { useEffect, useState } from "react";
import { ChevronRightIcon } from "@/components/icons";

const SLIDE_INTERVAL_MS = 8000;

function HeroContent() {
  return (
    <>
      <p className="text-sm font-medium uppercase leading-tight tracking-[0.125rem] text-accent">
        Handloom &amp; silk,
        <br />
        made with care
      </p>
      <h1 className="mt-2 font-heading text-[2.125rem] font-medium leading-[2.625rem] text-ink">
        Handpicked
        <br />
        Elegance
      </h1>
      <p className="font-script text-sm text-accent">for every occasion</p>
      <p className="mt-2 max-w-[13.75rem] text-[0.9375rem] leading-6 text-ink-muted">
        Premium handpicked sarees curated with love. Every drape tells a
        beautiful story.
      </p>
      <a
        href="#shop"
        className="mt-4 flex h-[3.125rem] w-[10.625rem] items-center justify-center gap-1.5 rounded-full bg-brand text-[0.9375rem] font-medium text-white transition-colors hover:bg-brand-dark"
      >
        Shop Collection
        <ChevronRightIcon className="h-[1.125rem] w-[1.125rem]" />
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
      <section className="mx-auto max-w-[480px] px-4 pb-6 pt-[1.625rem]">
        <HeroContent />
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-[480px] px-4 pt-3">
      <div className="relative aspect-[343/330] w-full overflow-hidden rounded-[1.375rem] bg-line">
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
          {/* Left-side scrim keeps the overlaid text legible regardless of
              what the uploaded photo looks like on that side. */}
          <div className="absolute inset-0 bg-gradient-to-r from-paper/95 via-paper/60 to-transparent" />
        </div>

        <div className="absolute inset-y-0 left-0 flex max-w-[65%] flex-col justify-center px-6">
          <HeroContent />
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-3 right-4 flex gap-2.5 rounded-full bg-ink/25 px-2.5 py-1.5 backdrop-blur-sm">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show slide ${i + 1}`}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
