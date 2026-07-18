import { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";

export function ProductRail({ title, products }: { title: string; products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 font-heading text-lg font-semibold text-ink">{title}</h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {products.map((product) => (
          <div key={product.id} className="w-36 shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
