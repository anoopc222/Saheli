import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link
        href="/admin/products"
        className="rounded-2xl border border-line bg-paper-raised p-6 transition-colors hover:border-accent"
      >
        <p className="font-heading text-lg font-semibold text-ink">Products</p>
        <p className="mt-1 text-sm text-ink-muted">
          Add, edit, and manage saree listings
        </p>
      </Link>
      <Link
        href="/admin/categories"
        className="rounded-2xl border border-line bg-paper-raised p-6 transition-colors hover:border-accent"
      >
        <p className="font-heading text-lg font-semibold text-ink">Categories</p>
        <p className="mt-1 text-sm text-ink-muted">
          Manage the category and subcategory menu
        </p>
      </Link>
      <Link
        href="/admin/homepage"
        className="rounded-2xl border border-line bg-paper-raised p-6 transition-colors hover:border-accent"
      >
        <p className="font-heading text-lg font-semibold text-ink">Homepage</p>
        <p className="mt-1 text-sm text-ink-muted">
          Hero carousel images and the seasonal promo card
        </p>
      </Link>
    </div>
  );
}
