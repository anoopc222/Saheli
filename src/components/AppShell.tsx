import { Suspense } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { NavDrawer } from "@/components/NavDrawer";
import { NavDrawerProvider } from "@/lib/nav-drawer-context";
import { getMainCategories } from "@/lib/categories-data";
import { getActivePromoBanner } from "@/lib/homepage-data";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [mainCategories, activePromo] = await Promise.all([
    getMainCategories(),
    getActivePromoBanner(),
  ]);

  return (
    <NavDrawerProvider>
      <Header />
      <main className="flex-1 pb-20">{children}</main>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
      <NavDrawer
        mainCategories={mainCategories}
        onamHref={activePromo?.button_link || "/"}
      />
    </NavDrawerProvider>
  );
}
