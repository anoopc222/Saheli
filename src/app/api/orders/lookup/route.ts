import { NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { getOrderDetailByContact, getOrderDetailForUser } from "@/lib/order-lookup-data";

export async function POST(request: Request) {
  const { orderId, contact } = (await request.json()) as {
    orderId?: string;
    contact?: string;
  };

  if (!orderId?.trim()) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  if (contact?.trim()) {
    const order = await getOrderDetailByContact(orderId.trim(), contact.trim());
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Missing contact or auth token" }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const order = await getOrderDetailForUser(orderId.trim(), userData.user.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
