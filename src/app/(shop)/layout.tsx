import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Dancing_Script } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { RecentlyViewedProvider } from "@/lib/recently-viewed-context";
import { ProductSettingsProvider } from "@/lib/product-settings-context";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-script",
  weight: ["600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saheli Sarees",
  description: "Handloom and silk sarees, curated with care.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Saheli",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#5b003a",
};

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="shop-shell min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <ProductSettingsProvider>
                  <ToastProvider>
                    <AppShell>{children}</AppShell>
                  </ToastProvider>
                </ProductSettingsProvider>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
