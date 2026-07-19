"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function createPurchaseOrderAction(formData: FormData) {
  const productId = String(formData.get("product_id") || "");
  const quantity = Math.round(Number(formData.get("quantity")) || 0);
  const costPriceCents = Math.max(0, Math.round(Number(formData.get("cost_price")) * 100 || 0));
  const supplier = String(formData.get("supplier") || "").trim();
  const expectedDate = String(formData.get("expected_date") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  if (!productId || quantity <= 0) return;

  const supabase = createServiceRoleSupabaseClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", productId)
    .maybeSingle<{ id: string; name: string }>();
  if (!product) return;

  const { error } = await supabase.from("purchase_orders").insert({
    product_id: productId,
    product_name: product.name,
    quantity,
    cost_price_cents: costPriceCents,
    supplier,
    expected_date: expectedDate || null,
    notes,
    status: "pending",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/stock");
}

// Receiving a PO both restocks the product and rolls its cost_price_cents
// forward to this purchase's cost, since that's the most recent landed
// cost — the same figure the Stock page's profit math should use going
// forward. Logged as an ordinary stock_adjustments row too, so it shows
// up in the product's stock history alongside sales and manual edits.
export async function receivePurchaseOrderAction(formData: FormData) {
  const poId = String(formData.get("po_id") || "");
  if (!poId) return;

  const supabase = createServiceRoleSupabaseClient();
  const { data: po } = await supabase
    .from("purchase_orders")
    .select("id, product_id, product_name, quantity, cost_price_cents, supplier, status")
    .eq("id", poId)
    .maybeSingle<{
      id: string;
      product_id: string | null;
      product_name: string;
      quantity: number;
      cost_price_cents: number;
      supplier: string;
      status: string;
    }>();
  if (!po || po.status !== "pending" || !po.product_id) return;

  const { data: product } = await supabase
    .from("products")
    .select("id, stock")
    .eq("id", po.product_id)
    .maybeSingle<{ id: string; stock: number }>();
  if (!product) return;

  const { error } = await supabase
    .from("products")
    .update({ stock: product.stock + po.quantity, cost_price_cents: po.cost_price_cents })
    .eq("id", po.product_id);
  if (error) throw new Error(error.message);

  await supabase.from("stock_adjustments").insert({
    product_id: po.product_id,
    product_name: po.product_name,
    delta: po.quantity,
    reason: po.supplier ? `Purchase order received (${po.supplier})` : "Purchase order received",
    counted_as_sale: false,
  });

  await supabase
    .from("purchase_orders")
    .update({ status: "received", received_at: new Date().toISOString() })
    .eq("id", poId);

  revalidatePath("/admin/stock");
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function cancelPurchaseOrderAction(formData: FormData) {
  const poId = String(formData.get("po_id") || "");
  if (!poId) return;

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("purchase_orders")
    .update({ status: "cancelled" })
    .eq("id", poId)
    .eq("status", "pending");
  if (error) throw new Error(error.message);

  revalidatePath("/admin/stock");
}
