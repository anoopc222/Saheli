import { PromoForm } from "@/components/admin/PromoForm";
import { createPromoAction } from "@/lib/promo-actions";

export default function NewPromoPage() {
  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Add promo card
      </h1>
      <PromoForm action={createPromoAction} />
    </div>
  );
}
