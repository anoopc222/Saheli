import { Skeleton, SectionCardSkeleton } from "@/components/Skeleton";

export default function AdminAnalyticsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-6 w-28" />
      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
      <SectionCardSkeleton />
      <SectionCardSkeleton />
    </div>
  );
}
