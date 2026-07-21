import Link from "next/link";
import { SparkleIcon } from "@/components/icons";

export default function ShopNotFound() {
  return (
    <div className="mx-auto flex max-w-[480px] flex-col items-center px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-accent">
        <SparkleIcon className="h-9 w-9" />
      </div>
      <h1 className="mt-5 font-heading text-2xl font-semibold text-ink">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist, or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
      >
        Back to shop
      </Link>
    </div>
  );
}
