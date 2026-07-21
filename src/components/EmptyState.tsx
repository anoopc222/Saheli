import Link from "next/link";

export function EmptyState({
  icon,
  title,
  actionHref,
  actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-paper-raised p-10 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft text-accent">
        {icon}
      </div>
      <p className="text-sm text-ink-muted">{title}</p>
      <Link
        href={actionHref}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
