import { SectionCardSkeleton } from "@/components/Skeleton";

export default function AdminHomepageLoading() {
  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <SectionCardSkeleton key={i} />
      ))}
    </div>
  );
}
