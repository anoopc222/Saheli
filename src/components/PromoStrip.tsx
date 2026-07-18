import Link from "next/link";
import { PromoBanner } from "@/lib/homepage-data";

export function PromoStrip({ promo }: { promo: PromoBanner | null }) {
  if (!promo) return null;

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-4">
      <div className="relative aspect-[343/90] w-full overflow-hidden rounded-md bg-line">
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
        {/* Bottom-anchored, lighter fade so most of the photo stays clearly
            visible — only enough scrim behind the text/button to read. */}
        <div className="absolute inset-0 bg-gradient-to-t from-paper/85 via-paper/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-0.5 px-3 pb-1.5 text-center">
          {promo.title && (
            <p className="font-heading text-xs font-semibold uppercase tracking-wide text-ink">
              {promo.title}
            </p>
          )}
          {promo.subtitle && (
            <p className="text-[10px] text-ink-muted">{promo.subtitle}</p>
          )}
          <Link
            href={promo.button_link || "/"}
            className="mt-1 flex h-6 w-20 items-center justify-center gap-1 rounded bg-brand/85 text-[10px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark hover:opacity-100"
          >
            {promo.button_text || "Shop Now"}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
