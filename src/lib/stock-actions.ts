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
