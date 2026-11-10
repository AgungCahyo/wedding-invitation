import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { serviceClient } from "./db";

/**
 * Admin PIN verification — ONLY for server-side use.
 * Reads ADMIN_PIN (preferred) or falls back to NEXT_PUBLIC_ADMIN_PIN.
 */
async function authorized(req: Request): Promise<boolean> {
  // Use ADMIN_PIN; fallback to NEXT_PUBLIC_ADMIN_PIN for backwards compatibility
  const expected = process.env.ADMIN_PIN || process.env.NEXT_PUBLIC_ADMIN_PIN;
  if (!expected) return false; // no default PIN on the server
  const given = Buffer.from(req.headers.get("x-admin-pin") ?? "");
  const want = Buffer.from(expected);
  const ok = given.length === want.length && timingSafeEqual(given, want);
  if (!ok) await new Promise((r) => setTimeout(r, 600)); // slow down guessing
  return ok;
}

/** Checks the PIN; with `needsDb` (default) also returns a service-role client. */
export async function guard(req: Request, needsDb = true): Promise<{
  db: ReturnType<typeof serviceClient> | null;
  res: NextResponse | null;
}> {
  if (!process.env.ADMIN_PIN && !process.env.NEXT_PUBLIC_ADMIN_PIN) {
    return { db: null, res: NextResponse.json({ error: "ADMIN_PIN belum diset di server." }, { status: 500 }) };
  }
  if (!(await authorized(req))) {
    return { db: null, res: NextResponse.json({ error: "PIN salah atau sesi habis. Login ulang." }, { status: 401 }) };
  }
  if (!needsDb) return { db: null, res: null };
  const db = serviceClient();
  if (!db) {
    return { db: null, res: NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY belum diset di server." }, { status: 500 }) };
  }
  return { db, res: null };
}