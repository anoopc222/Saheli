import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function getAllTags(): Promise<string[]> {
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select("tags")
    .returns<{ tags: string[] }[]>();
  const tags = new Set<string>();
  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) tags.add(tag);
  }
  return Array.from(tags).sort();
}
