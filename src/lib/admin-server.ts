import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

/**
 * Shared server-side helpers for /api/admin/* routes.
 * Env (Vercel → Settings → Environment Variables):
 *   SUPABASE_SERVICE_ROLE_KEY   (required, never NEXT_PUBLIC_*)
 *   ADMIN_PIN                   (recommended; falls back to NEXT_PUBLIC_ADMIN_PIN)
 */
export const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function authorized(req: Request): Promise<boolean> {
  const expected = process.env.ADMIN_PIN || process.env.NEXT_PUBLIC_ADMIN_PIN;
  if (!expected) return false; // no default PIN on the server
  const given = Buffer.from(req.headers.get("x-admin-pin") ?? "");
  const want = Buffer.from(expected);
  const ok = given.length === want.length && timingSafeEqual(given, want);
  if (!ok) await new Promise((r) => setTimeout(r, 600)); // slow down guessing
  return ok;
}

/** Checks the PIN; with `needsDb` (default) also returns a service-role client. */
export async function guard(req: Request, needsDb = true) {
  if (!process.env.ADMIN_PIN && !process.env.NEXT_PUBLIC_ADMIN_PIN) {
    return { res: fail("ADMIN_PIN belum diset di server.", 500) };
  }
  if (!(await authorized(req))) return { res: fail("PIN salah atau sesi habis. Login ulang.", 401) };
  if (!needsDb) return { db: null, res: null };
  const db = serviceClient();
  if (!db) return { res: fail("SUPABASE_SERVICE_ROLE_KEY belum diset di server.", 500) };
  return { db, res: null };
}
