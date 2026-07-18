"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, BoxIcon, GridIcon, ImageIcon, ChartIcon } from "@/components/icons";

const TABS = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon, exact: true },
  { href: "/admin/products", label: "Products", icon: BoxIcon, exact: false },
  { href: "/admin/categories", label: "Categories", icon: GridIcon, exact: false },
  { href: "/admin/stock", label: "Stock", icon: ChartIcon, exact: false },
  { href: "/admin/homepage", label: "Homepage", icon: ImageIcon, exact: false },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  const tabClass = (active: boolean) =>
    `flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors ${
      active ? "bg-accent-soft text-accent" : "text-ink-muted"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper-raised pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-4xl grid-cols-5 gap-1 px-2 py-2">
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={tabClass(active)}>
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
