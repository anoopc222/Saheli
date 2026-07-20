import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// A singleton, not a fresh client per call — supabase-js's auth session
// handling uses a shared lock over the same persisted session in
// localStorage, and multiple independent client instances contending for
// it (now that real sign-in sessions are in play, not just anon-key
// table reads) can cause auth-dependent queries to hang indefinitely.
export function createBrowserSupabaseClient() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }
  return client;
}
