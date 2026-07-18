import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "@/lib/product-actions";
import { getCategories, getMainCategories } from "@/lib/categories-data";
import { getAllTags } from "@/lib/tags-data";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, mainCategories, tagSuggestions] = await Promise.all([
    getCategories(),
    getMainCategories(),
    getAllTags(),
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
        tagSuggestions={tagSuggestions}
      />
    </div>
  );
}
