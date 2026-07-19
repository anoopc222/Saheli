import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type PurchaseOrderStatus = "pending" | "received" | "cancelled";

export type PurchaseOrderRow = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  cost_price_cents: number;
  supplier: string;
  expected_date: string | null;
  notes: string;
  status: PurchaseOrderStatus;
  received_at: string | null;
  created_at: string;
};

// purchase_orders has no public RLS read policy (supplier cost data),
// so this must run through the service-role client.
export async function getPurchaseOrders(): Promise<PurchaseOrderRow[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data } = await supabase
    .from("purchase_orders")
    .select(
      "id, product_id, product_name, quantity, cost_price_cents, supplier, expected_date, notes, status, received_at, created_at"
    )
    .order("created_at", { ascending: false })
    .returns<PurchaseOrderRow[]>();
  return data ?? [];
}
