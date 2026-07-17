import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/lib/cart-context";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saheli Sarees",
  description: "Handloom and silk sarees, curated with care.",
};

export const viewport: Viewport = {
  colorScheme: "light",
};

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}
