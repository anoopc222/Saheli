import { Skeleton, ListRowSkeleton } from "@/components/Skeleton";

export default function AdminCategoriesLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
