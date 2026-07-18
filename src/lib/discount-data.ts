import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type DiscountCodeRow = {
  id: string;
  code: string;
  percent_off: number | null;
  amount_off_cents: number | null;
  active: boolean;
  expires_at: string | null;
  created_at: string;
};

// discount_codes has RLS enabled with no policies at all — reads must
// go through the service-role client, both here (admin listing) and
// in checkout validation, so codes are never publicly listable.
export async function getDiscountCodes(): Promise<DiscountCodeRow[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data } = await supabase
    .from("discount_codes")
    .select("id, code, percent_off, amount_off_cents, active, expires_at, created_at")
    .order("created_at", { ascending: false })
    .returns<DiscountCodeRow[]>();
  return data ?? [];
}

export type CouponValidation =
  | { valid: true; code: string; percentOff: number | null; amountOffCents: number | null }
  | { valid: false; message: string };

export async function validateDiscountCode(rawCode: string): Promise<CouponValidation> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, message: "Enter a code." };

  const supabase = createServiceRoleSupabaseClient();
  const { data: row } = await supabase
    .from("discount_codes")
    .select("code, percent_off, amount_off_cents, active, expires_at")
    .eq("code", code)
    .maybeSingle<{
      code: string;
      percent_off: number | null;
      amount_off_cents: number | null;
      active: boolean;
      expires_at: string | null;
    }>();

  if (!row || !row.active) {
    return { valid: false, message: "That code isn't valid." };
  }
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return { valid: false, message: "That code has expired." };
  }

  return {
    valid: true,
    code: row.code,
    percentOff: row.percent_off,
    amountOffCents: row.amount_off_cents,
  };
}
