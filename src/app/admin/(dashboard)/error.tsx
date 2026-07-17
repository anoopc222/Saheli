"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-6">
      <p className="font-heading text-lg font-semibold text-ink">
        Something went wrong
      </p>
      <p className="mt-2 text-sm text-ink-muted">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
      >
        Try again
      </button>
    </div>
  );
}
