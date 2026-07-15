"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="border-b border-brand-line bg-brand-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-wide text-brand-maroon">
          Saheli Sarees
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-maroon-dark/80 sm:flex">
          <Link href="/" className="hover:text-brand-maroon">
            All Sarees
          </Link>
          <Link href="/?filter=new" className="hover:text-brand-maroon">
            New Arrivals
          </Link>
          <Link href="/?filter=sale" className="hover:text-brand-maroon">
            Sale
          </Link>
        </nav>
        <Link
          href="/cart"
          className="flex items-center gap-2 rounded-full border border-brand-line px-3 py-1.5 text-sm font-medium text-brand-maroon-dark"
        >
          Cart
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-maroon px-1.5 text-xs text-brand-cream">
            {totalItems}
          </span>
        </Link>
      </div>
    </header>
  );
}
