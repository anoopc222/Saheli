"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useNavDrawer } from "@/lib/nav-drawer-context";
import { HomeIcon, GridIcon, SparkleIcon, HeartIcon, BagIcon } from "@/components/icons";

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isOpen, open } = useNavDrawer();

  const fabric = searchParams.get("fabric");
  const filter = searchParams.get("filter");
  const isHome = pathname === "/" && !fabric && !filter;
  const isCollections = isOpen || (pathname === "/" && !!fabric);
  const isNewArrivals = pathname === "/" && filter === "new";
  const isWishlist = pathname === "/wishlist";
  const isCart = pathname === "/cart";

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-1 rounded-2xl py-1.5 text-xs font-medium transition-colors ${
      active ? "bg-accent-soft text-accent" : "text-ink-muted"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 min-h-[5.25rem] rounded-t-[1.25rem] border-t border-line bg-paper-raised pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-[480px] grid-cols-5 gap-1 px-2 py-2.5">
        <Link href="/" className={tabClass(isHome)}>
          <HomeIcon className="h-6 w-6" />
          Home
        </Link>
        <button type="button" onClick={open} className={tabClass(isCollections)}>
          <GridIcon className="h-6 w-6" />
          Collections
        </button>
        <Link href="/?filter=new" className={tabClass(isNewArrivals)}>
          <SparkleIcon className="h-6 w-6" />
          New
        </Link>
        <Link href="/wishlist" className={tabClass(isWishlist)}>
          <span className="relative">
            <HeartIcon className="h-6 w-6" />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
                {wishlistCount}
              </span>
            )}
          </span>
          Wishlist
        </Link>
        <Link href="/cart" className={tabClass(isCart)}>
          <span className="relative">
            <BagIcon className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
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
