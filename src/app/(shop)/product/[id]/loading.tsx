import { Skeleton } from "@/components/Skeleton";

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-[480px] px-4 py-6 lg:max-w-5xl">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-7 w-4/5" />
          <Skeleton className="mt-3 h-4 w-28" />
          <Skeleton className="mt-4 h-6 w-24" />
          <div className="mt-4 flex flex-col gap-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
          <Skeleton className="mt-6 h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
