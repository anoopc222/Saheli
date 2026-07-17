"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { HomeIcon, GridIcon, TagIcon, BagIcon } from "@/components/icons";

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { totalItems } = useCart();

  const fabric = searchParams.get("fabric");
  const filter = searchParams.get("filter");
  const isHome = pathname === "/" && !fabric && !filter;
  const isCategories = pathname === "/categories" || (pathname === "/" && !!fabric);
  const isSale = pathname === "/" && filter === "sale";
  const isCart = pathname === "/cart";

  const tabClass = (active: boolean) =>
    `flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors ${
      active ? "bg-accent-soft text-accent" : "text-ink-muted"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper-raised pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-[480px] grid-cols-4 gap-1 px-2 py-2">
        <Link href="/" className={tabClass(isHome)}>
          <HomeIcon className="h-5 w-5" />
          Home
        </Link>
        <Link href="/categories" className={tabClass(isCategories)}>
          <GridIcon className="h-5 w-5" />
          Categories
        </Link>
        <Link href="/?filter=sale" className={tabClass(isSale)}>
          <TagIcon className="h-5 w-5" />
          Sale
        </Link>
        <Link href="/cart" className={tabClass(isCart)}>
          <span className="relative">
            <BagIcon className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </span>
          Cart
        </Link>
      </div>
    </nav>
  );
}
