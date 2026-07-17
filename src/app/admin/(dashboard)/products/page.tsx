import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { deleteProductAction } from "@/lib/product-actions";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = createBrowserSupabaseClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Product[]>();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold text-ink">
          Products ({products?.length ?? 0})
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Add product
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {(products ?? []).map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-3"
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url}
                alt=""
                className="h-14 w-11 rounded-lg object-cover bg-line"
              />
              <div>
                <p className="text-sm font-medium text-ink">{product.name}</p>
                <p className="text-xs text-ink-muted">
                  {product.fabric} &middot; {formatPrice(product.price_cents)}{" "}
                  &middot; stock {product.stock}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="text-sm text-accent hover:underline"
              >
                Edit
              </Link>
              <form action={deleteProductAction}>
                <input type="hidden" name="id" value={product.id} />
                {(product.image_urls?.length
                  ? product.image_urls
                  : [product.image_url]
                )
                  .filter(Boolean)
                  .map((url) => (
                    <input key={url} type="hidden" name="image_urls" value={url} />
                  ))}
                <button
                  type="submit"
                  className="text-sm text-ink-muted hover:text-accent"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
