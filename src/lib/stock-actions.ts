"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function adjustStockAction(formData: FormData) {
  const productId = String(formData.get("product_id"));
  const delta = Math.round(Number(formData.get("delta")) || 0);
  const reason = String(formData.get("reason") || "").trim();
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

  await supabase.from("stock_adjustments").insert({
    product_id: productId,
    product_name: product.name,
    delta,
    reason,
  });

  revalidatePath("/admin/stock");
  revalidatePath("/admin/products");
  revalidatePath("/");
}
