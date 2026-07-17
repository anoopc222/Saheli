"use client";

import { useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 8000;

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

  return (
    <section className="relative mx-auto max-w-[480px] overflow-hidden">
      {hasImages && (
        <div className="relative aspect-[4/5] w-full bg-line">
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
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        </div>
      )}

      <div
        className={
          hasImages
            ? "absolute inset-x-0 bottom-8 px-6 text-center text-white"
            : "mx-auto max-w-[480px] px-4 pb-6 pt-8 text-center"
        }
      >
        <p
          className={`text-xs font-medium uppercase tracking-[0.2em] ${
            hasImages ? "text-white/90" : "text-accent"
          }`}
        >
          Handloom &amp; silk, made with care
        </p>
        <h1 className="mt-3 font-heading text-[2.75rem] font-semibold leading-[1.05]">
          Sarees for
          <br />
          <span
            className={`font-script text-[3.25rem] font-normal leading-none ${
              hasImages ? "text-white" : "text-accent"
            }`}
          >
            every occasion
          </span>
        </h1>
        <p
          className={`mx-auto mt-4 max-w-[300px] text-sm leading-relaxed ${
            hasImages ? "text-white/85" : "text-ink-muted"
          }`}
        >
          Cotton, silk, linen and georgette — curated for everyday wear and
          special occasions alike.
        </p>
        <a
          href="#shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Shop the collection
        </a>
      </div>

      {hasImages && images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
