import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type OrderItemDetail = {
  product_name: string;
  unit_price_cents: number;
  quantity: number;
};

export type ShippingDetail = {
  name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
};

export type OrderDetail = {
  id: string;
  status: string;
  amount_total_cents: number;
  created_at: string;
  items: OrderItemDetail[];
  shipping: ShippingDetail | null;
};

type ServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;

const SHIPPING_COLUMNS =
  "shipping_name, shipping_phone, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country";

type ShippingRow = {
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
};

function toShippingDetail(row: ShippingRow): ShippingDetail | null {
  if (!row.shipping_address_line1 && !row.shipping_name) return null;
  return {
    name: row.shipping_name,
    phone: row.shipping_phone,
    address_line1: row.shipping_address_line1,
    address_line2: row.shipping_address_line2,
    city: row.shipping_city,
    state: row.shipping_state,
    postal_code: row.shipping_postal_code,
    country: row.shipping_country,
  };
}

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
    .select(`id, status, amount_total_cents, created_at, customer_email, ${SHIPPING_COLUMNS}`)
    .eq("id", orderId)
    .maybeSingle<
      {
        id: string;
        status: string;
        amount_total_cents: number;
        created_at: string;
        customer_email: string | null;
      } & ShippingRow
    >();

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
    shipping: toShippingDetail(order),
  };
}

export async function getOrderBySessionId(sessionId: string): Promise<OrderDetail | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data: order } = await supabase
    .from("orders")
    .select(`id, status, amount_total_cents, created_at, ${SHIPPING_COLUMNS}`)
    .eq("stripe_session_id", sessionId)
    .maybeSingle<
      { id: string; status: string; amount_total_cents: number; created_at: string } & ShippingRow
    >();

  if (!order) return null;

  return {
    id: order.id,
    status: order.status,
    amount_total_cents: order.amount_total_cents,
    created_at: order.created_at,
    items: await loadItems(supabase, order.id),
    shipping: toShippingDetail(order),
  };
}
