import Link from "next/link";
import { PromoBanner } from "@/lib/homepage-data";

export function PromoStrip({ promo }: { promo: PromoBanner | null }) {
  if (!promo) return null;

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-5">
      <div className="relative overflow-hidden rounded-2xl">
        {promo.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={promo.image_url}
            alt=""
            className="h-44 w-full object-cover"
          />
        ) : (
          <div className="h-44 w-full bg-accent-soft" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-paper/90 via-paper/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 p-4 text-center">
          {promo.title && (
            <p className="font-heading text-lg font-semibold uppercase tracking-wide text-ink">
              {promo.title}
            </p>
          )}
          {promo.subtitle && (
            <p className="text-xs text-ink-muted">{promo.subtitle}</p>
          )}
          <Link
            href={promo.button_link || "/"}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent"
          >
            {promo.button_text || "Shop Now"}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
