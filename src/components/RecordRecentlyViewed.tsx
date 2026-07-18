"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/lib/recently-viewed-context";

export function RecordRecentlyViewed({ productId }: { productId: string }) {
  const { record } = useRecentlyViewed();

  useEffect(() => {
    record(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return null;
}
