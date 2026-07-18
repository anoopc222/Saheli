import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type OrderRow = {
  id: string;
  shipping_phone: string | null;
  shipping_name: string | null;
  customer_email: string | null;
  amount_total_cents: number;
  status: string;
  created_at: string;
};

type OrderItemRow = {
  order_id: string;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
};

export type CustomerSummary = {
  phone: string;
  name: string | null;
  email: string | null;
  orderCount: number;
  totalSpentCents: number;
  lastOrderAt: string;
};

export type CustomerOrder = {
  id: string;
  created_at: string;
  amount_total_cents: number;
  items: { product_name: string; unit_price_cents: number; quantity: number }[];
};

export type CustomerDetail = {
  phone: string;
  name: string | null;
  email: string | null;
  orderCount: number;
  totalSpentCents: number;
  orders: CustomerOrder[];
};

// Customers are tracked by the phone number collected at checkout —
// offline sales (recorded from the Stock page) have no customer_email or
// shipping_phone, so they never show up here; this is customer history,
// not a general sales ledger (that's what the Stock page is for).
async function getPaidOrdersWithPhone(supabase: ReturnType<typeof createServiceRoleSupabaseClient>) {
  const { data } = await supabase
    .from("orders")
    .select("id, shipping_phone, shipping_name, customer_email, amount_total_cents, status, created_at")
    .eq("status", "paid")
    .not("shipping_phone", "is", null)
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();
  return data ?? [];
}

export async function getCustomers(): Promise<CustomerSummary[]> {
  const supabase = createServiceRoleSupabaseClient();
  const orders = await getPaidOrdersWithPhone(supabase);

  const byPhone = new Map<string, CustomerSummary>();
  for (const order of orders) {
    const phone = order.shipping_phone!;
    const existing = byPhone.get(phone);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpentCents += order.amount_total_cents;
    } else {
      byPhone.set(phone, {
        phone,
        name: order.shipping_name,
        email: order.customer_email,
        orderCount: 1,
        totalSpentCents: order.amount_total_cents,
        lastOrderAt: order.created_at,
      });
    }
  }

  return Array.from(byPhone.values()).sort(
    (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
  );
}

export async function getCustomerCount(): Promise<number> {
  const customers = await getCustomers();
  return customers.length;
}

export async function getCustomerByPhone(phone: string): Promise<CustomerDetail | null> {
  const supabase = createServiceRoleSupabaseClient();
  const orders = (await getPaidOrdersWithPhone(supabase)).filter(
    (o) => o.shipping_phone === phone
  );
  if (orders.length === 0) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, product_name, unit_price_cents, quantity")
    .in("order_id", orders.map((o) => o.id))
    .returns<OrderItemRow[]>();

  const itemsByOrder = new Map<string, CustomerOrder["items"]>();
  for (const item of items ?? []) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push({
      product_name: item.product_name,
      unit_price_cents: item.unit_price_cents,
      quantity: item.quantity,
    });
    itemsByOrder.set(item.order_id, list);
  }

  return {
    phone,
    name: orders[0].shipping_name,
    email: orders[0].customer_email,
    orderCount: orders.length,
    totalSpentCents: orders.reduce((sum, o) => sum + o.amount_total_cents, 0),
    orders: orders.map((o) => ({
      id: o.id,
      created_at: o.created_at,
      amount_total_cents: o.amount_total_cents,
      items: itemsByOrder.get(o.id) ?? [],
    })),
  };
}
