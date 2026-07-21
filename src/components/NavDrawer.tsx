"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useNavDrawer } from "@/lib/nav-drawer-context";
import { useAuth } from "@/lib/auth-context";
import { INSTAGRAM_URL } from "@/lib/social-links";
import { MenuMainCategory } from "@/lib/categories-data";
import { MenuItemRow } from "@/lib/menu-items-data";
import {
  XIcon,
  HomeIcon,
  BagIcon,
  TagIcon,
  StarIcon,
  HeartIcon,
  UserIcon,
  PhoneIcon,
  DressIcon,
  ShirtIcon,
  DiamondIcon,
  PouchIcon,
  KidsIcon,
  PetalsIcon,
  SparkleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InstagramIcon,
  WhatsAppIcon,
  FacebookIcon,
} from "@/components/icons";

type IconComponent = (props: { className?: string }) => React.JSX.Element;

const SHOP_ICONS: Record<string, IconComponent> = {
  sarees: DressIcon,
  "mens-wear": ShirtIcon,
  jewellery: DiamondIcon,
  accessories: PouchIcon,
  "kids-wear": KidsIcon,
};

type ActivePath = { mainId: string | null; categoryId: string | null; subId: string | null };

// The one item that matches the page currently being viewed, so the drawer
// can highlight exactly that and auto-reveal it, rather than relying on
// whatever the user last happened to tap open.
function resolveActivePath(
  menuTree: MenuMainCategory[],
  fabric: string | null,
  categoryParam: string | null,
  mainCategoryParam: string | null
): ActivePath {
  if (fabric) {
    for (const mainCategory of menuTree) {
      for (const category of mainCategory.categories) {
        const sub = category.subcategories.find((s) => s.fabric === fabric);
        if (sub) return { mainId: mainCategory.id, categoryId: category.id, subId: sub.id };
      }
    }
  }
  if (categoryParam) {
    for (const mainCategory of menuTree) {
      const category = mainCategory.categories.find((c) => c.id === categoryParam);
      if (category) return { mainId: mainCategory.id, categoryId: category.id, subId: null };
    }
  }
  if (mainCategoryParam) {
    const mainCategory = menuTree.find((mc) => mc.id === mainCategoryParam);
    if (mainCategory) return { mainId: mainCategory.id, categoryId: null, subId: null };
  }
  return { mainId: null, categoryId: null, subId: null };
}

const PROMO_ITEM_FALLBACK_LABEL: Record<string, string> = {
  onam: "Onam Collection 2026",
  new_arrivals: "New Arrivals",
  bestsellers: "Best Sellers",
};

function promoItemHref(item: MenuItemRow, onamHref: string): string {
  if (item.key === "onam") return onamHref;
  if (item.key === "new_arrivals") return "/?filter=new";
  if (item.key === "bestsellers") return "/?filter=bestseller";
  return item.tag ? `/?tag=${encodeURIComponent(item.tag)}` : "/";
}

function promoItemIcon(item: MenuItemRow): IconComponent {
  if (item.key === "onam") return SparkleIcon;
  if (item.key === "bestsellers") return StarIcon;
  return TagIcon;
}

export function NavDrawer({
  menuTree,
  onamHref,
  menuItems,
}: {
  menuTree: MenuMainCategory[];
  onamHref: string;
  menuItems: MenuItemRow[];
}) {
  const { isOpen, close } = useNavDrawer();
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [shopOpen, setShopOpen] = useState(true);
  const [expandedMainId, setExpandedMainId] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const activePath = resolveActivePath(
    menuTree,
    searchParams.get("fabric"),
    searchParams.get("category"),
    searchParams.get("main_category")
  );

  // Auto-reveal whichever section matches the page currently being viewed,
  // so opening the drawer doesn't require digging back down to it by hand.
  // Adjusted during render (not in an effect) so it takes effect on the same
  // paint instead of causing an extra one.
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const activeKey = activePath.mainId ? `${activePath.mainId}|${activePath.categoryId}` : null;
  if (activeKey && activeKey !== revealedKey) {
    setRevealedKey(activeKey);
    setShopOpen(true);
    setExpandedMainId(activePath.mainId);
    setExpandedCategoryId(activePath.categoryId);
  }

  const visiblePromoItems = menuItems.filter((item) => item.show_on_menu);

  const isHomeActive =
    pathname === "/" &&
    !searchParams.get("fabric") &&
    !searchParams.get("category") &&
    !searchParams.get("main_category") &&
    !searchParams.get("tag") &&
    !searchParams.get("filter");
  const isWishlistActive = pathname === "/wishlist";
  const isAccountActive = pathname.startsWith("/account");
  const isAboutActive = pathname === "/about";
  const isContactActive = pathname === "/contact";

  return (
    <div className={`fixed inset-0 z-40 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-ink/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-paper shadow-xl transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative flex flex-col items-center gap-1.5 bg-brand px-6 pb-5 pt-11 text-center text-white">
          <button
            onClick={close}
            aria-label="Close menu"
            className="absolute left-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10"
          >
            <XIcon className="h-4.5 w-4.5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="Saheli"
            className="h-16 w-16 rounded-full border-2 border-white/70 object-cover"
          />
          <p className="font-heading text-2xl font-semibold">Saheli</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/75">
            A dream shared by two friends
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <NavLink
            href="/"
            icon={<HomeIcon className="h-5 w-5" />}
            label="Home"
            onClick={close}
            active={isHomeActive}
          />

          <div className="border-b border-line">
            <button
              type="button"
              onClick={() => setShopOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 py-3.5 text-sm font-medium text-ink"
            >
              <span className="flex items-center gap-3">
                <BagIcon className="h-5 w-5 text-ink-muted" /> Shop
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 text-ink-muted transition-transform ${shopOpen ? "rotate-180" : ""}`}
              />
            </button>
            {shopOpen && (
              <div className="flex flex-col gap-0.5 pb-2 pl-6">
                {menuTree.length === 0 ? (
                  <p className="py-1.5 text-xs text-ink-muted">Nothing here yet.</p>
                ) : (
                  menuTree.map((mainCategory) => {
                    const Icon = SHOP_ICONS[mainCategory.slug] ?? TagIcon;
                    const isExpanded = expandedMainId === mainCategory.id;
                    const isActive =
                      activePath.mainId === mainCategory.id && activePath.categoryId === null;

                    // No categories to expand into — just a direct link,
                    // instead of a toggle that would reveal nothing.
                    if (mainCategory.categories.length === 0) {
                      return (
                        <Link
                          key={mainCategory.id}
                          href={`/?main_category=${mainCategory.id}`}
                          onClick={close}
                          className={`flex items-center gap-3 py-2 text-sm transition-colors hover:text-accent ${
                            isActive ? "text-accent" : "text-ink"
                          }`}
                        >
                          <Icon className={`h-4.5 w-4.5 ${isActive ? "text-accent" : "text-ink-muted"}`} />
                          {mainCategory.name}
                        </Link>
                      );
                    }

                    return (
                      <div key={mainCategory.id}>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedMainId(isExpanded ? null : mainCategory.id)
                          }
                          className={`flex w-full items-center justify-between gap-3 py-2 text-sm transition-colors hover:text-accent ${
                            isActive ? "text-accent" : "text-ink"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className={`h-4.5 w-4.5 ${isActive ? "text-accent" : "text-ink-muted"}`} />
                            {mainCategory.name}
                          </span>
                          <ChevronDownIcon
                            className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""} ${
                              isActive ? "text-accent" : "text-ink-muted"
                            }`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="flex flex-col gap-2.5 py-1 pl-7 pb-3">
                            {mainCategory.categories.length > 1 && (
                              <Link
                                href={`/?main_category=${mainCategory.id}`}
                                onClick={close}
                                className="text-xs font-medium text-accent hover:underline"
                              >
                                View all {mainCategory.name}
                              </Link>
                            )}
                            {mainCategory.categories.map((category) => {
                                const isCatExpanded = expandedCategoryId === category.id;
                                const isCatActive =
                                  activePath.categoryId === category.id && activePath.subId === null;

                                // No subcategories to expand into — just a direct link,
                                // instead of a toggle that would reveal nothing.
                                if (category.subcategories.length === 0) {
                                  return (
                                    <Link
                                      key={category.id}
                                      href={`/?category=${category.id}`}
                                      onClick={close}
                                      className={`py-1 text-sm font-medium transition-colors hover:text-accent ${
                                        isCatActive ? "text-accent" : "text-ink"
                                      }`}
                                    >
                                      {category.name}
                                    </Link>
                                  );
                                }

                                return (
                                  <div key={category.id}>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedCategoryId(isCatExpanded ? null : category.id)
                                      }
                                      className={`flex w-full items-center justify-between gap-3 py-1 text-sm font-medium transition-colors hover:text-accent ${
                                        isCatActive ? "text-accent" : "text-ink"
                                      }`}
                                    >
                                      <span>{category.name}</span>
                                      <ChevronDownIcon
                                        className={`h-3 w-3 transition-transform ${
                                          isCatExpanded ? "rotate-180" : ""
                                        } ${isCatActive ? "text-accent" : "text-ink-muted"}`}
                                      />
                                    </button>
                                    {isCatExpanded && (
                                      <div className="flex flex-col gap-2 py-1.5 pl-3">
                                        {category.subcategories.length > 1 && (
                                          <Link
                                            href={`/?category=${category.id}`}
                                            onClick={close}
                                            className="text-xs font-medium text-accent hover:underline"
                                          >
                                            View all {category.name}
                                          </Link>
                                        )}
                                        <div className="flex flex-col gap-2">
                                          {category.subcategories.map((sub) => {
                                            const isSubActive = activePath.subId === sub.id;
                                            return (
                                              <Link
                                                key={sub.id}
                                                href={`/?fabric=${encodeURIComponent(sub.fabric)}`}
                                                onClick={close}
                                                className={`text-xs transition-colors hover:text-accent ${
                                                  isSubActive ? "font-semibold text-accent" : "text-ink"
                                                }`}
                                              >
                                                {sub.name}
                                              </Link>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <NavLink
            href="/categories"
            icon={<PetalsIcon className="h-5 w-5" />}
            label="All Collections"
            onClick={close}
            chevron
          />
          {visiblePromoItems.map((item) => {
            const Icon = promoItemIcon(item);
            const label = item.label || (item.key ? PROMO_ITEM_FALLBACK_LABEL[item.key] : "");
            return (
              <NavLink
                key={item.id}
                href={promoItemHref(item, onamHref)}
                icon={<Icon className="h-5 w-5" />}
                label={label}
                onClick={close}
              />
            );
          })}
          <NavLink
            href="/wishlist"
            icon={<HeartIcon className="h-5 w-5" />}
            label="Wishlist"
            onClick={close}
            active={isWishlistActive}
          />
          {user ? (
            <NavLink
              href="/account"
              icon={<UserIcon className="h-5 w-5" />}
              label="My Account"
              onClick={close}
              active={isAccountActive}
            />
          ) : (
            <NavLink
              href="/account/login"
              icon={<UserIcon className="h-5 w-5" />}
              label="Sign in"
              onClick={close}
              active={isAccountActive}
            />
          )}
          <NavLink
            href="/about"
            icon={<UserIcon className="h-5 w-5" />}
            label="About Us"
            onClick={close}
            active={isAboutActive}
          />
          <NavLink
            href="/contact"
            icon={<PhoneIcon className="h-5 w-5" />}
            label="Contact Us"
            onClick={close}
            active={isContactActive}
            last
          />
        </div>

        <div className="flex items-center justify-center gap-8 bg-brand py-3.5">
          <SocialButton
            icon={<InstagramIcon className="h-5 w-5" />}
            label="Instagram"
            href={INSTAGRAM_URL}
          />
          <SocialButton icon={<WhatsAppIcon className="h-5 w-5" />} label="WhatsApp" />
          <SocialButton icon={<FacebookIcon className="h-5 w-5" />} label="Facebook" />
        </div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
  onClick,
  chevron,
  last,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  chevron?: boolean;
  last?: boolean;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between gap-3 py-3.5 text-sm font-medium transition-colors hover:text-accent ${
        active ? "text-accent" : "text-ink"
      } ${last ? "" : "border-b border-line"}`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      {chevron && <ChevronRightIcon className="h-4 w-4 text-ink-muted" />}
    </Link>
  );
}

function SocialButton({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
}) {
  const className =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/50 text-white/90 transition-colors hover:bg-white/10";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
        {icon}
      </a>
    );
  }

  return (
    <button type="button" title={`${label} — coming soon`} aria-label={label} className={className}>
      {icon}
    </button>
  );
}
