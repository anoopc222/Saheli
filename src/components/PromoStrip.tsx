import Link from "next/link";
import Image from "next/image";
import { PromoBanner } from "@/lib/homepage-data";

export function PromoStrip({ promo }: { promo: PromoBanner | null }) {
  if (!promo) return null;

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-4 lg:max-w-6xl">
      <div className="relative aspect-[343/90] w-full overflow-hidden rounded-md bg-line">
        {promo.image_url ? (
          <Image
            src={promo.image_url}
            alt=""
            fill
            sizes="480px"
            className="object-cover"
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
            className="mt-1 flex h-7 items-center justify-center gap-1 rounded-full border border-white/30 bg-ink/60 px-3 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md transition-colors hover:bg-ink/80"
          >
            {promo.button_text || "Shop Now"}
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
