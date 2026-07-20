import { getResend } from "@/lib/resend";
import { formatPrice } from "@/lib/format";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type ServiceClient = ReturnType<typeof createServiceRoleSupabaseClient>;

type OrderRow = {
  id: string;
  amount_total_cents: number;
  shipping_fee_cents: number;
  gst_amount_cents: number;
  customer_email: string | null;
  customer_gstin: string | null;
  shipping_name: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  billing_same_as_shipping: boolean;
  billing_name: string | null;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_postal_code: string | null;
};

type OrderItemRow = {
  product_name: string;
  unit_price_cents: number;
  quantity: number;
};

const ORDER_COLUMNS =
  "id, amount_total_cents, shipping_fee_cents, gst_amount_cents, customer_email, customer_gstin, shipping_name, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, billing_same_as_shipping, billing_name, billing_address_line1, billing_address_line2, billing_city, billing_state, billing_postal_code";

function addressBlock(
  name: string | null,
  line1: string | null,
  line2: string | null,
  city: string | null,
  state: string | null,
  postalCode: string | null
): string {
  return [name, line1, line2, [city, postalCode].filter(Boolean).join(" "), state]
    .filter(Boolean)
    .join("<br>");
}

function buildEmailHtml(order: OrderRow, items: OrderItemRow[]): string {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;">${item.product_name} &times;${item.quantity}</td>
        <td style="padding:8px 0;text-align:right;">${formatPrice(item.unit_price_cents * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const shippingHtml = addressBlock(
    order.shipping_name,
    order.shipping_address_line1,
    order.shipping_address_line2,
    order.shipping_city,
    order.shipping_state,
    order.shipping_postal_code
  );

  const billingHtml = order.billing_same_as_shipping
    ? shippingHtml
    : addressBlock(
        order.billing_name,
        order.billing_address_line1,
        order.billing_address_line2,
        order.billing_city,
        order.billing_state,
        order.billing_postal_code
      );

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a;">
      <h2>Order confirmed &mdash; #${order.id.slice(0, 8)}</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${itemRows}
        <tr><td style="padding:8px 0;border-top:1px solid #ddd;">Shipping</td><td style="padding:8px 0;border-top:1px solid #ddd;text-align:right;">${formatPrice(order.shipping_fee_cents)}</td></tr>
        ${
          order.gst_amount_cents > 0
            ? `<tr><td style="padding:8px 0;">GST</td><td style="padding:8px 0;text-align:right;">${formatPrice(order.gst_amount_cents)}</td></tr>`
            : ""
        }
        <tr><td style="padding:8px 0;font-weight:600;">Total</td><td style="padding:8px 0;text-align:right;font-weight:600;">${formatPrice(order.amount_total_cents)}</td></tr>
      </table>
      ${order.customer_gstin ? `<p>GSTIN: ${order.customer_gstin}</p>` : ""}
      <table style="width:100%;margin-top:16px;">
        <tr>
          <td style="vertical-align:top;width:50%;">
            <strong>Billing address</strong><br>${billingHtml}
          </td>
          <td style="vertical-align:top;width:50%;">
            <strong>Shipping address</strong><br>${shippingHtml}
          </td>
        </tr>
      </table>
    </div>
  `;
}

// Sent once, right when an order first transitions to "paid" (see
// order-fulfillment.ts) — one email to the customer with the store's
// own notification address CC'd, rather than two separate sends, so a
// single order only ever counts once against the email provider's quota.
export async function sendOrderConfirmationEmail(supabase: ServiceClient, orderId: string) {
  const fromAddress = process.env.ORDER_EMAIL_FROM;
  if (!fromAddress) return;

  const { data: order } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", orderId)
    .maybeSingle<OrderRow>();
  if (!order || !order.customer_email) return;

  const { data: items } = await supabase
    .from("order_items")
    .select("product_name, unit_price_cents, quantity")
    .eq("order_id", orderId)
    .returns<OrderItemRow[]>();

  const storeEmail = process.env.STORE_NOTIFICATION_EMAIL;

  await getResend().emails.send({
    from: fromAddress,
    to: order.customer_email,
    ...(storeEmail ? { cc: storeEmail } : {}),
    subject: `Order confirmed — #${order.id.slice(0, 8)}`,
    html: buildEmailHtml(order, items ?? []),
  });
}
