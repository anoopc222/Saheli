import { Skeleton, SectionCardSkeleton } from "@/components/Skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-16 w-full rounded-2xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <SectionCardSkeleton key={i} />
      ))}
    </div>
  );
}
