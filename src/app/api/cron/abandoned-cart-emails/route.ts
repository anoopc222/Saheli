import { NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { getResend } from "@/lib/resend";
import { formatPrice } from "@/lib/format";
import { SITE_URL } from "@/lib/site-url";

const ABANDONED_AFTER_HOURS = 24;

type CartSnapshotItem = {
  product_id: string;
  name: string;
  quantity: number;
  price_cents: number;
  image_url: string;
};

type AbandonedCartRow = {
  user_id: string;
  cart_snapshot: CartSnapshotItem[];
  updated_at: string;
};

// Triggered by an external scheduler (Netlify Scheduled Function, cron-job.org,
// etc.) hitting this route with `Authorization: Bearer <CRON_SECRET>` — Next.js
// itself has no built-in cron, so something outside the app has to call this
// on a schedule. See README for the exact setup.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fromAddress = process.env.ORDER_EMAIL_FROM;
  if (!fromAddress) {
    return NextResponse.json({ sent: 0, skipped: "ORDER_EMAIL_FROM not configured" });
  }

  const supabase = createServiceRoleSupabaseClient();
  const cutoff = new Date(Date.now() - ABANDONED_AFTER_HOURS * 60 * 60 * 1000).toISOString();

  const { data: carts } = await supabase
    .from("abandoned_carts")
    .select("user_id, cart_snapshot, updated_at")
    .lt("updated_at", cutoff)
    .is("reminder_sent_at", null)
    .returns<AbandonedCartRow[]>();

  let sent = 0;
  for (const cart of carts ?? []) {
    if (!cart.cart_snapshot || cart.cart_snapshot.length === 0) continue;

    const { data: userData } = await supabase.auth.admin.getUserById(cart.user_id);
    const email = userData?.user?.email;
    if (!email) continue;

    const itemsHtml = cart.cart_snapshot
      .map(
        (item) => `
          <tr>
            <td style="padding:6px 0;">${item.name} &times; ${item.quantity}</td>
            <td style="padding:6px 0;text-align:right;">${formatPrice(item.price_cents * item.quantity)}</td>
          </tr>`
      )
      .join("");

    await getResend().emails.send({
      from: fromAddress,
      to: email,
      subject: "You left something in your cart",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#4b1232;">
          <h2 style="margin-bottom:8px;">Still thinking it over?</h2>
          <p>You've got items waiting in your cart at Saheli. Here's what's saved:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml}</table>
          <p style="margin-top:24px;">
            <a href="${SITE_URL}/cart" style="background:#4b1232;color:#fff;padding:10px 22px;border-radius:999px;text-decoration:none;display:inline-block;">
              Complete your order
            </a>
          </p>
        </div>
      `,
    });

    await supabase
      .from("abandoned_carts")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("user_id", cart.user_id);

    sent++;
  }

  return NextResponse.json({ sent });
}
