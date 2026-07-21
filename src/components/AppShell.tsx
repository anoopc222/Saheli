import { Suspense } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { NavDrawer } from "@/components/NavDrawer";
import { PageTransition } from "@/components/PageTransition";
import { NavDrawerProvider } from "@/lib/nav-drawer-context";
import { getMenuTree } from "@/lib/categories-data";
import { getActivePromoBanner } from "@/lib/homepage-data";
import { getMenuItems } from "@/lib/menu-items-data";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [menuTree, activePromo, menuItems] = await Promise.all([
    getMenuTree(),
    getActivePromoBanner(),
    getMenuItems(),
  ]);

  return (
    <NavDrawerProvider>
      <Header />
      <main className="flex-1 pb-20">
        <Suspense fallback={children}>
          <PageTransition>{children}</PageTransition>
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
      <Suspense fallback={null}>
        <NavDrawer
          menuTree={menuTree}
          onamHref={activePromo?.button_link || "/"}
          menuItems={menuItems}
        />
      </Suspense>
    </NavDrawerProvider>
  );
}
