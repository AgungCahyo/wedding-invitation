import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/src/lib/supabase";

/**
 * Creates a Supabase client for reading session data in server components.
 * The cookie store only allows reading cookies; setting or removing cookies
 * is no-op to avoid "Cookies can only be modified in a Server Action or Route Handler" errors.
 */
export async function getSupabaseSessionClient(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          // In a server component, we cannot modify cookies.
          // This is a no-op; session refresh will not occur.
          // If you need to modify cookies, use getSupabaseServerClient in a route handler or server action.
          console.warn(
            "Attempted to set cookie via Supabase session client. This is not allowed in server components."
          );
        },
        remove(name, options) {
          // In a server component, we cannot modify cookies.
          console.warn(
            "Attempted to remove cookie via Supabase session client. This is not allowed in server components."
          );
        },
      },
    }
  );
}

/**
 * Creates a Supabase client for route handlers and server actions where cookie modifications are allowed.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
}