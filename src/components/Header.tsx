"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useNavDrawer } from "@/lib/nav-drawer-context";
import { useBumpOnIncrease } from "@/lib/use-bump";
import { BagIcon, MenuIcon, SearchIcon, HeartIcon } from "@/components/icons";

export function Header() {
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { open } = useNavDrawer();
  const cartBumping = useBumpOnIncrease(totalItems);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex min-h-[3.5875rem] max-w-[480px] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={open}
            aria-label="Open menu"
            className="flex h-6 w-6 items-center justify-center text-ink transition-colors hover:text-accent"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Saheli"
              width={44}
              height={44}
              priority
              className="h-11 w-11 rounded-full object-cover"
            />
            <span className="font-heading text-lg font-semibold text-ink">
              Saheli
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-6 w-6 items-center justify-center text-ink transition-colors hover:text-accent"
          >
            <SearchIcon className="h-6 w-6" />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative flex h-6 w-6 items-center justify-center text-ink transition-colors hover:text-accent"
          >
            <HeartIcon className="h-6 w-6" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:bg-accent-soft ${
              cartBumping ? "animate-bump" : ""
            }`}
          >
            <BagIcon className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
