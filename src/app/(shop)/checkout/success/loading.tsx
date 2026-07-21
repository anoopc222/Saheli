import { Spinner } from "@/components/Skeleton";

export default function CheckoutSuccessLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
      <Spinner className="h-8 w-8" />
      <p className="mt-4 text-sm text-ink-muted">Confirming your order...</p>
    </div>
  );
}
