import { TruckIcon } from "@/components/icons";

export function AnnouncementBar() {
  return (
    <div className="bg-ink px-4 py-2.5 text-center">
      <p className="mx-auto flex max-w-[480px] items-center justify-center gap-2 text-xs font-medium text-white">
        <TruckIcon className="h-4 w-4 shrink-0" />
        FREE SHIPPING on orders above ₹1,999
      </p>
    </div>
  );
}
