"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { BagIcon } from "@/components/icons";

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-[480px] items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="Saheli"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="font-heading text-lg font-semibold text-ink">
            Saheli
          </span>
        </Link>
        <Link
          href="/cart"
          aria-label="Cart"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:bg-accent-soft"
        >
          <BagIcon className="h-4.5 w-4.5" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
