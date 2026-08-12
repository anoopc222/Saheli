"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { SIZES_SELECT, stockForSize } from "@/lib/product-sizes";
import { ProductSize } from "@/types/product";

type ProductRow = { id: string; name: string; stock: number; sizes: ProductSize[] };

export async function createOfflineOrderAction(formData: FormData) {
  const customerName = String(formData.get("customer_name") || "").trim();
  const customerPhone = String(formData.get("customer_phone") || "").trim();

  const rowIndexes = new Set<string>();
  for (const key of formData.keys()) {
    const match = key.match(/^product_id__(.+)$/);
    if (match) rowIndexes.add(match[1]);
  }

  const lines = Array.from(rowIndexes)
    .map((idx) => ({
      productId: String(formData.get(`product_id__${idx}`) || ""),
      quantity: Math.round(Number(formData.get(`quantity__${idx}`)) || 0),
      unitPriceCents: Math.round((Number(formData.get(`unit_price__${idx}`)) || 0) * 100),
      selectedSize: String(formData.get(`size__${idx}`) || "").trim() || null,
    }))
    .filter((l) => l.productId && l.quantity > 0);

  if (lines.length === 0) return;

  const supabase = createServiceRoleSupabaseClient();
  const { data: products } = await supabase
    .from("products")
    .select(`id, name, stock, ${SIZES_SELECT}`)
    .in(
      "id",
      lines.map((l) => l.productId)
    )
    .returns<ProductRow[]>();
  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  // A sized product must have a size picked, and that size must actually
  // have enough stock — same gate the online checkout applies.
  const validLines = lines.filter((l) => {
    const product = byId.get(l.productId);
    if (!product) return false;
    if (product.sizes.length === 0) return true;
    if (!l.selectedSize) return false;
    return stockForSize(product.sizes, l.selectedSize) >= l.quantity;
  });
  if (validLines.length === 0) return;

  const amountTotalCents = validLines.reduce(
    (sum, l) => sum + l.unitPriceCents * l.quantity,
    0
  );

  const { data: order } = await supabase
    .from("orders")
    .insert({
      source: "offline",
      status: "paid",
      amount_total_cents: amountTotalCents,
      shipping_name: customerName || null,
      shipping_phone: customerPhone || null,
    })
    .select("id")
    .single<{ id: string }>();
  if (!order) return;

  for (const line of validLines) {
    const product = byId.get(line.productId)!;
    const newStock = Math.max(0, product.stock - line.quantity);

    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: line.productId,
      product_name: product.name,
      unit_price_cents: line.unitPriceCents,
      quantity: line.quantity,
      selected_size: line.selectedSize,
    });

    await supabase.from("products").update({ stock: newStock }).eq("id", line.productId);

    if (line.selectedSize) {
      const sizeRow = product.sizes.find((s) => s.size === line.selectedSize);
      if (sizeRow) {
        await supabase
          .from("product_sizes")
          .update({ stock: Math.max(0, sizeRow.stock - line.quantity) })
          .eq("product_id", line.productId)
          .eq("size", line.selectedSize);
      }
    }

    await supabase.from("stock_adjustments").insert({
      product_id: line.productId,
      product_name: product.name,
      delta: -line.quantity,
      reason: "Offline sale",
      counted_as_sale: true,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/stock");
  revalidatePath("/admin/products");
  revalidatePath("/admin/customers");
  revalidatePath("/");
}
