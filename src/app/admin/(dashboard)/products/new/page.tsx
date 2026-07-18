import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "@/lib/product-actions";
import { getCategories, getMainCategories } from "@/lib/categories-data";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, mainCategories] = await Promise.all([
    getCategories(),
    getMainCategories(),
  ]);
  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Add product
      </h1>
      <ProductForm
        action={createProductAction}
        categories={categories}
        mainCategories={mainCategories}
      />
    </div>
  );
}
