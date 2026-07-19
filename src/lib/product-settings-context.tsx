"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getProductSettings, ProductSettings } from "@/lib/product-settings-data";

const ProductSettingsContext = createContext<ProductSettings | null>(null);

export function ProductSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ProductSettings | null>(null);

  useEffect(() => {
    getProductSettings().then(setSettings);
  }, []);

  return (
    <ProductSettingsContext.Provider value={settings}>
      {children}
    </ProductSettingsContext.Provider>
  );
}

// Defaults to true while settings are still loading, so ratings don't flash
// away and back for the common case where the setting is on.
export function useShowRatings(): boolean {
  const settings = useContext(ProductSettingsContext);
  return settings?.show_ratings ?? true;
}
