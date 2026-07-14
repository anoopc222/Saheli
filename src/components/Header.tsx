"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          Shopping Cart App
        </Link>
        <Link href="/cart" className="flex items-center gap-2 text-sm font-medium">
          Cart
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs text-white dark:bg-white dark:text-black">
            {totalItems}
          </span>
        </Link>
      </div>
    </header>
  );
}
