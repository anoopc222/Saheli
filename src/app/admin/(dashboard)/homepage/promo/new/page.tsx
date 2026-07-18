import { PromoForm } from "@/components/admin/PromoForm";
import { createPromoAction } from "@/lib/promo-actions";
import { getCategories } from "@/lib/categories-data";

export const dynamic = "force-dynamic";

export default async function NewPromoPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Add promo card
      </h1>
      <PromoForm action={createPromoAction} categories={categories} />
    </div>
  );
}
