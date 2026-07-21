"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type ProductRow = { id: string; name: string; stock: number };

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
    }))
    .filter((l) => l.productId && l.quantity > 0);

  if (lines.length === 0) return;

  const supabase = createServiceRoleSupabaseClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, stock")
    .in(
      "id",
      lines.map((l) => l.productId)
    )
    .returns<ProductRow[]>();
  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  const validLines = lines.filter((l) => byId.has(l.productId));
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
    });

    await supabase.from("products").update({ stock: newStock }).eq("id", line.productId);

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
