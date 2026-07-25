export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-line ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-line bg-paper-raised">
      <Skeleton className="aspect-[164/180] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="mt-1 h-4 w-1/2" />
        <div className="mt-auto pt-2">
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SectionCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-4">
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-2/3" />
      <Skeleton className="mt-4 h-9 w-28 rounded-full" />
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-paper-raised p-3">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-line border-t-accent ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
