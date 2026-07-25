import { Skeleton } from "@/components/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-[480px] px-4 py-6 lg:max-w-2xl">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-3.5 w-full" />
      <Skeleton className="mt-1 h-3.5 w-2/3" />
      <div className="mt-6 flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
      <div className="mt-6 flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
