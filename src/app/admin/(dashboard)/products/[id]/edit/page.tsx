import { notFound } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProductAction } from "@/lib/product-actions";
import { Product } from "@/types/product";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createBrowserSupabaseClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle<Product>();

  if (!product) notFound();

  const existingImageUrls = product.image_urls?.length
    ? product.image_urls
    : [product.image_url].filter(Boolean);

  const boundUpdate = updateProductAction.bind(
    null,
    product.id,
    existingImageUrls
  );

  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Edit product
      </h1>
      <ProductForm action={boundUpdate} product={product} />
    </div>
  );
}
