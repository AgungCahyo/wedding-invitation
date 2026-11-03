import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

/**
 * Admin photo moderation, PIN-protected on the SERVER.
 * Uses the service-role key (bypasses RLS), so it must only run here and the
 * key must never be exposed as NEXT_PUBLIC_*.
 *
 * Env (Vercel → Settings → Environment Variables):
 *   SUPABASE_SERVICE_ROLE_KEY   (required)
 *   ADMIN_PIN                   (recommended; falls back to NEXT_PUBLIC_ADMIN_PIN)
 */
export const dynamic = "force-dynamic";

const BUCKET = "photobooth";
const COLUMNS = "id, created_at, guest_name, storage_path, status";
const STATUSES = ["pending", "approved", "hidden"];

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

function client() {
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

async function guard(req: Request) {
  if (!process.env.ADMIN_PIN && !process.env.NEXT_PUBLIC_ADMIN_PIN) {
    return { res: fail("ADMIN_PIN belum diset di server.", 500) };
  }
  if (!(await authorized(req))) return { res: fail("PIN salah atau sesi habis. Login ulang.", 401) };
  const db = client();
  if (!db) return { res: fail("SUPABASE_SERVICE_ROLE_KEY belum diset di server.", 500) };
  return { db };
}

export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res;
  const { data, error } = await g.db
    .from("photobooth_photos")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) return fail(error.message, 500);
  return NextResponse.json({ photos: data ?? [] });
}

export async function PATCH(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res;
  const { id, status } = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!id || !status || !STATUSES.includes(status)) return fail("Permintaan tidak valid.", 400);
  const { data, error } = await g.db
    .from("photobooth_photos")
    .update({ status })
    .eq("id", id)
    .select("id");
  if (error) return fail(error.message, 500);
  if (!data?.length) return fail("Foto tidak ditemukan.", 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res;
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return fail("Permintaan tidak valid.", 400);

  const { data, error } = await g.db
    .from("photobooth_photos")
    .delete()
    .eq("id", id)
    .select("storage_path");
  if (error) return fail(error.message, 500);
  if (!data?.length) return fail("Foto tidak ditemukan.", 404);

  // Best effort: the row is what controls visibility; remove the file too.
  await g.db.storage.from(BUCKET).remove([data[0].storage_path]);
  return NextResponse.json({ ok: true });
}
