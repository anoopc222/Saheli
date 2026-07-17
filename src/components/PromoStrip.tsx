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
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-4">
          {promo.title && (
            <p className="font-heading text-lg font-semibold text-white">
              {promo.title}
            </p>
          )}
          {promo.subtitle && (
            <p className="text-xs text-white/85">{promo.subtitle}</p>
          )}
          <Link
            href={promo.button_link || "/"}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent"
          >
            {promo.button_text || "Shop Now"}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
