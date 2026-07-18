import { notFound } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { PromoForm } from "@/components/admin/PromoForm";
import { updatePromoAction } from "@/lib/promo-actions";
import { PromoBanner } from "@/lib/homepage-data";
import { getCategories } from "@/lib/categories-data";

export const dynamic = "force-dynamic";

export default async function EditPromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createBrowserSupabaseClient();
  const [{ data: promo }, categories] = await Promise.all([
    supabase.from("promo_banners").select("*").eq("id", id).maybeSingle<PromoBanner>(),
    getCategories(),
  ]);

  if (!promo) notFound();

  const boundUpdate = updatePromoAction.bind(null, promo.id, promo.image_url);

  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Edit promo card
      </h1>
      <PromoForm action={boundUpdate} promo={promo} categories={categories} />
    </div>
  );
}
