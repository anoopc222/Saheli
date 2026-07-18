"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";

const SLIDE_INTERVAL_MS = 8000;

export type HeroSlide = { image_url: string; href: string };

// No marketing copy overlay here, ever — the admin's uploaded photo is the
// whole hero. Only a small "Shop Collection" button is overlaid, linking
// wherever the admin has configured that specific slide to go.
export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="relative mx-auto aspect-[343/231] max-w-[480px] overflow-hidden border-b border-line bg-line">
      {slides.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={slide.image_url}
          src={slide.image_url}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <Link
        href={slides[index].href}
        className="absolute bottom-3 left-3 flex h-6 items-center gap-1 rounded bg-brand/90 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark"
      >
        Shop Collection
        <ChevronRightIcon className="h-2.5 w-2.5" />
      </Link>

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2.5 rounded-full bg-ink/25 px-2.5 py-1.5 backdrop-blur-sm">
          {slides.map((_, i) => (
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
    </section>
  );
}
