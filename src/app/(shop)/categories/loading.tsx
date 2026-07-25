import { Skeleton, ProductGridSkeleton } from "@/components/Skeleton";

export default function CategoriesLoading() {
  return (
    <div className="mx-auto max-w-[480px] px-4 py-6 lg:max-w-6xl">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="mb-4 flex justify-end">
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
