"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRecentlyViewed } from "@/lib/recently-viewed-context";
import { ProductRail } from "@/components/ProductRail";
import { Product } from "@/types/product";

export function RecentlyViewedRail({ excludeId }: { excludeId?: string }) {
  const { ids } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);

  const relevantIds = ids.filter((id) => id !== excludeId);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (relevantIds.length === 0) {
        setProducts([]);
        return;
      }
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("show_on_store", true)
        .in("id", relevantIds)
        .returns<Product[]>();
      if (cancelled) return;
      const byId = new Map((data ?? []).map((p) => [p.id, p]));
      setProducts(relevantIds.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p)));
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relevantIds.join(",")]);

  return <ProductRail title="Recently viewed" products={products} />;
}
