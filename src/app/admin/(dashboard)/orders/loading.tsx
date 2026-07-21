import { Skeleton, ListRowSkeleton } from "@/components/Skeleton";

export default function AdminOrdersLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-11 w-full rounded-full" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
