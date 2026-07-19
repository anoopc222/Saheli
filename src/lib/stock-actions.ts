"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function adjustStockAction(formData: FormData) {
  const productId = String(formData.get("product_id"));
  const delta = Math.round(Number(formData.get("delta")) || 0);
  const reason = String(formData.get("reason") || "").trim();
  const recordSale = formData.get("record_sale") === "true";
  const salePriceRaw = formData.get("sale_price");
  if (!productId || !delta) return;

  const supabase = createServiceRoleSupabaseClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, name, stock")
    .eq("id", productId)
    .maybeSingle<{ id: string; name: string; stock: number }>();
  if (!product) return;

  const newStock = Math.max(0, product.stock + delta);

  const { error } = await supabase
    .from("products")
    .update({ stock: newStock })
    .eq("id", productId);
  if (error) throw new Error(error.message);

  // Only a stock reduction can be a sale — adding stock back in never is,
  // regardless of whether the checkbox was left ticked.
  const countedAsSale = recordSale && delta < 0;

  await supabase.from("stock_adjustments").insert({
    product_id: productId,
    product_name: product.name,
    delta,
    reason,
    counted_as_sale: countedAsSale,
  });

  if (countedAsSale) {
    const quantity = Math.abs(delta);
    const unitPriceCents = Math.round((Number(salePriceRaw) || 0) * 100);

    const { data: order } = await supabase
      .from("orders")
      .insert({
        source: "offline",
        status: "paid",
        amount_total_cents: unitPriceCents * quantity,
      })
      .select("id")
      .single<{ id: string }>();

    if (order) {
      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: productId,
        product_name: product.name,
        unit_price_cents: unitPriceCents,
        quantity,
      });
    }
  }

  revalidatePath("/admin/stock");
  revalidatePath("/admin/products");
  revalidatePath("/");
}

// Bulk edit sets each product's stock to an absolute value in one submit
// (a recount/correction pass), unlike the single-product modal's delta
// input. Still logged as ordinary stock_adjustments rows so the audit
// trail covers both paths — just never as a sale, since a recount isn't one.
export async function bulkAdjustStockAction(formData: FormData) {
  const entries: { productId: string; newStock: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("stock__")) continue;
    const productId = key.slice("stock__".length);
    const newStock = Math.round(Number(value));
    if (!productId || !Number.isFinite(newStock)) continue;
    entries.push({ productId, newStock: Math.max(0, newStock) });
  }
  if (entries.length === 0) return;

  const supabase = createServiceRoleSupabaseClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, stock")
    .in(
      "id",
      entries.map((e) => e.productId)
    )
    .returns<{ id: string; name: string; stock: number }[]>();
  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  const changed = entries
    .map((e) => ({ ...e, product: byId.get(e.productId) }))
    .filter((e) => e.product && e.product.stock !== e.newStock);

  for (const { productId, newStock, product } of changed) {
    if (!product) continue;
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", productId);
    if (error) throw new Error(error.message);

    await supabase.from("stock_adjustments").insert({
      product_id: productId,
      product_name: product.name,
      delta: newStock - product.stock,
      reason: "Bulk edit",
      counted_as_sale: false,
    });
  }

  revalidatePath("/admin/stock");
  revalidatePath("/admin/products");
  revalidatePath("/");
}
