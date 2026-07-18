import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type OrderItemDetail = {
  product_name: string;
  unit_price_cents: number;
  quantity: number;
};

export type OrderDetail = {
  id: string;
  status: string;
  amount_total_cents: number;
  created_at: string;
  items: OrderItemDetail[];
};

type ServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;

async function loadItems(supabase: ServiceClient, orderId: string) {
  const { data } = await supabase
    .from("order_items")
    .select("product_name, unit_price_cents, quantity")
    .eq("order_id", orderId)
    .returns<OrderItemDetail[]>();
  return data ?? [];
}

// Orders have no public RLS read policy (they hold customer emails),
// so — like the admin Stock page — this goes through the service-role
// client rather than the anon client the rest of the storefront reads
// with. Requiring the order id AND a matching email keeps a lookup
// from being guessable off the id alone.
export async function getOrderByReference(
  orderId: string,
  email: string
): Promise<OrderDetail | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, amount_total_cents, created_at, customer_email")
    .eq("id", orderId)
    .maybeSingle<{
      id: string;
      status: string;
      amount_total_cents: number;
      created_at: string;
      customer_email: string | null;
    }>();

  if (!order || !order.customer_email) return null;
  if (order.customer_email.toLowerCase().trim() !== email.toLowerCase().trim()) {
    return null;
  }

  return {
    id: order.id,
    status: order.status,
    amount_total_cents: order.amount_total_cents,
    created_at: order.created_at,
    items: await loadItems(supabase, order.id),
  };
}

export async function getOrderBySessionId(sessionId: string): Promise<OrderDetail | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, amount_total_cents, created_at")
    .eq("stripe_session_id", sessionId)
    .maybeSingle<{ id: string; status: string; amount_total_cents: number; created_at: string }>();

  if (!order) return null;

  return {
    id: order.id,
    status: order.status,
    amount_total_cents: order.amount_total_cents,
    created_at: order.created_at,
    items: await loadItems(supabase, order.id),
  };
}
