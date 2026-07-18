"use client";

import Link from "next/link";
import { useState } from "react";
import { useNavDrawer } from "@/lib/nav-drawer-context";
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
  const [shopOpen, setShopOpen] = useState(true);
  const [expandedMainId, setExpandedMainId] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const onamItem = menuItems.find((item) => item.key === "onam");
  const newArrivalsItem = menuItems.find((item) => item.key === "new_arrivals");
  const bestsellersItem = menuItems.find((item) => item.key === "bestsellers");
  const showOnam = onamItem?.show_on_menu ?? true;
  const showNewArrivals = newArrivalsItem?.show_on_menu ?? true;
  const showBestsellers = bestsellersItem?.show_on_menu ?? true;

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
          <NavLink href="/" icon={<HomeIcon className="h-5 w-5" />} label="Home" onClick={close} />

          <div className="border-b border-line">
            {(() => {
              const shopIsActive = shopOpen && expandedMainId === null;
              return (
                <button
                  type="button"
                  onClick={() => setShopOpen((v) => !v)}
                  className={`flex w-full items-center justify-between gap-3 py-3.5 text-sm font-medium transition-colors ${
                    shopIsActive ? "text-accent" : "text-ink"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <BagIcon className={`h-5 w-5 ${shopIsActive ? "text-accent" : "text-ink-muted"}`} /> Shop
                  </span>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${
                      shopOpen ? "rotate-180" : ""
                    } ${shopIsActive ? "text-accent" : "text-ink-muted"}`}
                  />
                </button>
              );
            })()}
            {shopOpen && (
              <div className="flex flex-col gap-0.5 pb-2 pl-6">
                {menuTree.length === 0 ? (
                  <p className="py-1.5 text-xs text-ink-muted">Nothing here yet.</p>
                ) : (
                  menuTree.map((mainCategory) => {
                    const Icon = SHOP_ICONS[mainCategory.slug] ?? TagIcon;
                    const isExpanded = expandedMainId === mainCategory.id;
                    const isActive = isExpanded && expandedCategoryId === null;
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
                            <Link
                              href={`/?main_category=${mainCategory.id}`}
                              onClick={close}
                              className="text-xs font-medium text-accent hover:underline"
                            >
                              View all {mainCategory.name}
                            </Link>
                            {mainCategory.categories.length === 0 ? (
                              <p className="text-xs text-ink-muted">Nothing here yet.</p>
                            ) : (
                              mainCategory.categories.map((category) => {
                                const isCatExpanded = expandedCategoryId === category.id;
                                return (
                                  <div key={category.id}>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedCategoryId(isCatExpanded ? null : category.id)
                                      }
                                      className={`flex w-full items-center justify-between gap-3 py-1 text-sm font-medium transition-colors hover:text-accent ${
                                        isCatExpanded ? "text-accent" : "text-ink"
                                      }`}
                                    >
                                      <span>{category.name}</span>
                                      <ChevronDownIcon
                                        className={`h-3 w-3 transition-transform ${
                                          isCatExpanded ? "rotate-180 text-accent" : "text-ink-muted"
                                        }`}
                                      />
                                    </button>
                                    {isCatExpanded && (
                                      <div className="flex flex-col gap-2 py-1.5 pl-3">
                                        <Link
                                          href={`/?category=${category.id}`}
                                          onClick={close}
                                          className="text-xs font-medium text-accent hover:underline"
                                        >
                                          View all {category.name}
                                        </Link>
                                        {category.subcategories.length > 0 && (
                                          <div className="flex flex-col gap-2">
                                            {category.subcategories.map((sub) => (
                                              <Link
                                                key={sub.id}
                                                href={`/?fabric=${encodeURIComponent(sub.fabric)}`}
                                                onClick={close}
                                                className="text-xs text-ink transition-colors hover:text-accent"
                                              >
                                                {sub.name}
                                              </Link>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
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
            label="Collections"
            onClick={close}
            chevron
          />
          {showOnam && (
            <NavLink
              href={onamHref}
              icon={<SparkleIcon className="h-5 w-5" />}
              label={onamItem?.label || "Onam Collection 2026"}
              onClick={close}
            />
          )}
          {showNewArrivals && (
            <NavLink
              href="/?filter=new"
              icon={<TagIcon className="h-5 w-5" />}
              label="New Arrivals"
              onClick={close}
            />
          )}
          {showBestsellers && (
            <NavLink
              href="/?filter=bestseller"
              icon={<StarIcon className="h-5 w-5" />}
              label="Best Sellers"
              onClick={close}
            />
          )}
          <NavLink href="/wishlist" icon={<HeartIcon className="h-5 w-5" />} label="Wishlist" onClick={close} />
          <NavLink href="/about" icon={<UserIcon className="h-5 w-5" />} label="About Us" onClick={close} />
          <NavLink
            href="/contact"
            icon={<PhoneIcon className="h-5 w-5" />}
            label="Contact Us"
            onClick={close}
            last
          />
        </div>

        <div className="flex items-center justify-center gap-8 bg-brand py-3.5">
          <SocialButton icon={<InstagramIcon className="h-5 w-5" />} label="Instagram" />
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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  chevron?: boolean;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between gap-3 py-3.5 text-sm font-medium text-ink transition-colors hover:text-accent ${
        last ? "" : "border-b border-line"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      {chevron && <ChevronRightIcon className="h-4 w-4 text-ink-muted" />}
    </Link>
  );
}

function SocialButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      title={`${label} — coming soon`}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 text-white/90 transition-colors hover:bg-white/10"
    >
      {icon}
    </button>
  );
}
