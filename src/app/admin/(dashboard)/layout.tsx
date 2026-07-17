import Link from "next/link";
import { logoutAction } from "@/lib/admin-actions";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-heading text-lg font-semibold text-ink">
            Admin
          </Link>
          <Link href="/admin/products" className="text-sm text-ink-muted hover:text-accent">
            Products
          </Link>
          <Link href="/admin/categories" className="text-sm text-ink-muted hover:text-accent">
            Categories
          </Link>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-accent hover:underline">
            Log out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
