import { Spinner } from "@/components/Skeleton";

export default function AdminOrderDetailLoading() {
  return (
    <div className="flex justify-center py-16">
      <Spinner className="h-7 w-7" />
    </div>
  );
}
