import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "@/lib/product-actions";
import { getCategories } from "@/lib/categories-data";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Add product
      </h1>
      <ProductForm action={createProductAction} categories={categories} />
    </div>
  );
}
