import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "@/lib/product-actions";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Add product
      </h1>
      <ProductForm action={createProductAction} />
    </div>
  );
}
