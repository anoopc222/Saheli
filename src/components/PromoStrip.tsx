import Link from "next/link";
import { PromoBanner } from "@/lib/homepage-data";

export function PromoStrip({ promo }: { promo: PromoBanner | null }) {
  if (!promo) return null;

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-4">
      <div className="relative aspect-[343/116] w-full overflow-hidden rounded-md bg-line">
        {promo.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={promo.image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-accent-soft" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-paper/90 via-paper/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
          {promo.title && (
            <p className="font-heading text-base font-semibold uppercase tracking-wide text-ink">
              {promo.title}
            </p>
          )}
          {promo.subtitle && (
            <p className="text-xs text-ink-muted">{promo.subtitle}</p>
          )}
          <Link
            href={promo.button_link || "/"}
            className="mt-1.5 flex h-[2.625rem] w-[8.75rem] items-center justify-center gap-1.5 rounded-md bg-brand/85 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark hover:opacity-100"
          >
            {promo.button_text || "Shop Now"}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
