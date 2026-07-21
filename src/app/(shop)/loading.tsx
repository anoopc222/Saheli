import { Skeleton, ProductGridSkeleton } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-[480px] px-4 py-6">
      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      <div className="mt-5 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-5 w-32" />
      <div className="mt-3">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
