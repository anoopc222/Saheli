"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon } from "@/components/icons";

const SLIDE_INTERVAL_MS = 3000;
const SWIPE_THRESHOLD_PX = 40;

export type HeroSlide = { image_url: string; href: string };

// No marketing copy overlay here, ever — the admin's uploaded photo is the
// whole hero. Only a small "Shop Collection" button is overlaid, linking
// wherever the admin has configured that specific slide to go.
export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Depends on `index` too, so any manual change (swipe or dot tap) resets
  // the countdown instead of auto-advancing again a moment later.
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [slides.length, index]);

  if (slides.length === 0) return null;

  function goTo(next: number) {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    goTo(deltaX < 0 ? index + 1 : index - 1);
  }

  return (
    <section
      className="relative mx-auto aspect-[343/231] max-w-[480px] touch-pan-y overflow-hidden border-b border-line bg-line lg:aspect-[21/9] lg:max-w-6xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, i) => (
        <Image
          key={slide.image_url}
          src={slide.image_url}
          alt=""
          fill
          sizes="480px"
          priority={i === 0}
          {...(i === 0 ? {} : { loading: "lazy" as const })}
          className={`object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <Link
        href={slides[index].href}
        className="absolute bottom-3 right-3 flex h-7 items-center gap-1 rounded-full border border-white/30 bg-ink/60 px-3 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md transition-colors hover:bg-ink/80"
      >
        Shop Collection
        <ChevronRightIcon className="h-2.5 w-2.5" />
      </Link>

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink/25 px-2.5 py-1.5 backdrop-blur-sm">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
