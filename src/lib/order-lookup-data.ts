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

export type BillingDetail = {
  name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
};

export type OrderDetail = {
  id: string;
  status: string;
  source: string;
  amount_total_cents: number;
  shipping_fee_cents: number;
  shipping_zone_name: string | null;
  gst_amount_cents: number;
  customer_gstin: string | null;
  created_at: string;
  items: OrderItemDetail[];
  shipping: ShippingDetail | null;
  billingSameAsShipping: boolean;
  billing: BillingDetail | null;
};

type ServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;

const SHIPPING_COLUMNS =
  "shipping_name, shipping_phone, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country";

const BILLING_COLUMNS =
  "billing_same_as_shipping, billing_name, billing_address_line1, billing_address_line2, billing_city, billing_state, billing_postal_code";

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

type BillingRow = {
  billing_same_as_shipping: boolean;
  billing_name: string | null;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_postal_code: string | null;
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

function toBillingDetail(row: BillingRow): BillingDetail | null {
  if (row.billing_same_as_shipping || !row.billing_address_line1) return null;
  return {
    name: row.billing_name,
    address_line1: row.billing_address_line1,
    address_line2: row.billing_address_line2,
    city: row.billing_city,
    state: row.billing_state,
    postal_code: row.billing_postal_code,
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

type Contact = { kind: "email"; value: string } | { kind: "phone"; value: string };

function normalizeContact(raw: string): Contact {
  const trimmed = raw.trim();
  if (trimmed.includes("@")) return { kind: "email", value: trimmed.toLowerCase() };
  return { kind: "phone", value: trimmed.replace(/\D/g, "").slice(-10) };
}

function normalizePhone(raw: string | null): string {
  return (raw ?? "").replace(/\D/g, "").slice(-10);
}

function contactMatches(
  contact: Contact,
  customerEmail: string | null,
  shippingPhone: string | null
): boolean {
  if (contact.kind === "email") {
    return (customerEmail ?? "").toLowerCase().trim() === contact.value;
  }
  return normalizePhone(shippingPhone) === contact.value && contact.value.length === 10;
}

export type OrderSummary = {
  id: string;
  status: string;
  amount_total_cents: number;
  created_at: string;
  item_count: number;
};

// Orders have no public RLS read policy for guests (they hold customer
// emails), so — like the admin Stock page — this goes through the
// service-role client rather than the anon client the rest of the
// storefront reads with. A logged-in customer instead reads their own
// orders directly via RLS (see the account pages) — this path is only
// for guests who checked out without an account.
export async function getOrdersByContact(rawContact: string): Promise<OrderSummary[]> {
  const contact = normalizeContact(rawContact);
  if (contact.kind === "phone" && contact.value.length !== 10) return [];

  const supabase = createServiceRoleSupabaseClient();
  let query = supabase
    .from("orders")
    .select("id, status, amount_total_cents, created_at, customer_email, shipping_phone")
    .order("created_at", { ascending: false });
  query =
    contact.kind === "email"
      ? query.ilike("customer_email", contact.value)
      : query.ilike("shipping_phone", `%${contact.value}`);

  const { data } = await query.returns<
    {
      id: string;
      status: string;
      amount_total_cents: number;
      created_at: string;
      customer_email: string | null;
      shipping_phone: string | null;
    }[]
  >();

  const matches = (data ?? []).filter((o) =>
    contactMatches(contact, o.customer_email, o.shipping_phone)
  );

  const { data: items } =
    matches.length > 0
      ? await supabase
          .from("order_items")
          .select("order_id")
          .in(
            "order_id",
            matches.map((o) => o.id)
          )
          .returns<{ order_id: string }[]>()
      : { data: [] as { order_id: string }[] };

  const countByOrder = new Map<string, number>();
  for (const item of items ?? []) {
    countByOrder.set(item.order_id, (countByOrder.get(item.order_id) ?? 0) + 1);
  }

  return matches.map((o) => ({
    id: o.id,
    status: o.status,
    amount_total_cents: o.amount_total_cents,
    created_at: o.created_at,
    item_count: countByOrder.get(o.id) ?? 0,
  }));
}

type RawOrderRow = {
  id: string;
  status: string;
  source: string;
  amount_total_cents: number;
  shipping_fee_cents: number;
  shipping_zone_name: string | null;
  gst_amount_cents: number;
  customer_gstin: string | null;
  created_at: string;
  customer_email: string | null;
  user_id: string | null;
} & ShippingRow &
  BillingRow;

async function fetchOrderRow(
  supabase: ServiceClient,
  orderId: string
): Promise<RawOrderRow | null> {
  const { data } = await supabase
    .from("orders")
    .select(
      `id, status, source, amount_total_cents, shipping_fee_cents, shipping_zone_name, gst_amount_cents, customer_gstin, created_at, customer_email, user_id, ${SHIPPING_COLUMNS}, ${BILLING_COLUMNS}`
    )
    .eq("id", orderId)
    .maybeSingle<RawOrderRow>();
  return data ?? null;
}

async function shapeOrderDetail(
  supabase: ServiceClient,
  order: RawOrderRow
): Promise<OrderDetail> {
  return {
    id: order.id,
    status: order.status,
    source: order.source,
    amount_total_cents: order.amount_total_cents,
    shipping_fee_cents: order.shipping_fee_cents,
    shipping_zone_name: order.shipping_zone_name,
    gst_amount_cents: order.gst_amount_cents,
    customer_gstin: order.customer_gstin,
    created_at: order.created_at,
    items: await loadItems(supabase, order.id),
    shipping: toShippingDetail(order),
    billingSameAsShipping: order.billing_same_as_shipping,
    billing: toBillingDetail(order),
  };
}

// Requiring the order id AND a matching email/phone keeps a single-order
// lookup from being guessable off the id alone.
export async function getOrderDetailByContact(
  orderId: string,
  rawContact: string
): Promise<OrderDetail | null> {
  const contact = normalizeContact(rawContact);
  const supabase = createServiceRoleSupabaseClient();
  const order = await fetchOrderRow(supabase, orderId);

  if (!order) return null;
  if (!contactMatches(contact, order.customer_email, order.shipping_phone)) return null;

  return shapeOrderDetail(supabase, order);
}

// Used by the account pages' order-detail view, once the caller has
// already verified the requester's auth token server-side (see
// /api/orders/lookup) — this only checks the order actually belongs to
// that verified user id, same guardrail as the contact-based lookup.
export async function getOrderDetailForUser(
  orderId: string,
  userId: string
): Promise<OrderDetail | null> {
  const supabase = createServiceRoleSupabaseClient();
  const order = await fetchOrderRow(supabase, orderId);

  if (!order || order.user_id !== userId) return null;

  return shapeOrderDetail(supabase, order);
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const supabase = createServiceRoleSupabaseClient();
  const order = await fetchOrderRow(supabase, id);
  if (!order) return null;
  return shapeOrderDetail(supabase, order);
}
