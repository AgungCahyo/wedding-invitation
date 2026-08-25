import { createClient, type SupabaseClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("The server Supabase client cannot be imported by browser code.");
}

// Read env vars inside the function (not at module top-level). Next.js
// dev can (re)load .env.local after a route's module graph has already
// been evaluated — a top-level `const x = process.env.X` bakes in
// whatever was present at that moment and never sees a later value,
// which is why one route could throw "credentials not configured"
// while another route using this exact same client worked fine. Reading
// process.env on every call keeps this in sync regardless of module
// load order.
export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Server Supabase credentials are not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}