"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

function parsePrefixes(raw: string): string[] {
  return raw
    .split(",")
    .map((p) => p.trim())
    .filter((p, index, arr) => arr.indexOf(p) === index);
}

function parseZoneFields(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Zone name is required");

  const pinPrefixes = parsePrefixes(String(formData.get("pin_prefixes") || ""));
  const rateCents = Math.max(0, Math.round(Number(formData.get("rate")) * 100 || 0));
  const sortOrder = Math.round(Number(formData.get("sort_order")) || 0);

  return { name, pin_prefixes: pinPrefixes, rate_cents: rateCents, sort_order: sortOrder };
}

function revalidateShippingPaths() {
  revalidatePath("/admin");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function createShippingZoneAction(formData: FormData) {
  const fields = parseZoneFields(formData);
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("shipping_zones").insert(fields);
  if (error) throw new Error(error.message);
  revalidateShippingPaths();
}

export async function updateShippingZoneAction(formData: FormData) {
  const id = String(formData.get("id"));
  const fields = parseZoneFields(formData);
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("shipping_zones").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateShippingPaths();
}

export async function deleteShippingZoneAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("shipping_zones").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateShippingPaths();
}
