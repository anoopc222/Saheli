import { Suspense } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { NavDrawer } from "@/components/NavDrawer";
import { NavDrawerProvider } from "@/lib/nav-drawer-context";
import { getMenuTree } from "@/lib/categories-data";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const menuTree = await getMenuTree();

  return (
    <NavDrawerProvider>
      <Header />
      <main className="flex-1 pb-20">{children}</main>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
      <NavDrawer menuTree={menuTree} />
    </NavDrawerProvider>
  );
}
