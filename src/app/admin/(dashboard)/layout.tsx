import Link from "next/link";
import { logoutAction } from "@/lib/admin-actions";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-24">
      <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
        <Link href="/admin" className="font-heading text-lg font-semibold text-ink">
          Admin
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-accent hover:underline">
            Log out
          </button>
        </form>
      </div>
      {children}
      <AdminBottomNav />
    </div>
  );
}
