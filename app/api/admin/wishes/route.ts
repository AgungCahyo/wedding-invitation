import { NextResponse } from "next/server";
import { guard } from "@/src/server/admin-guard";
import { fail, requireAffected, readJson } from "@/src/server/http";
import { isModerationStatus } from "@/src/types/moderation";

const validId = (id: unknown): id is number | string =>
  (typeof id === "number" && Number.isFinite(id)) || (typeof id === "string" && id.length > 0);

/**
 * Admin wishes moderation, PIN-protected on the SERVER (service-role key
 * bypasses RLS). Every write checks that a row was really affected, so a
 * silent "0 rows" can never be reported to the UI as success.
 */
export const dynamic = "force-dynamic";

const COLUMNS = "id, name, message, created_at, status, is_pinned";

export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const { data, error } = await g.db
    .from("wishes")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) return fail(error.message, 500);
  return NextResponse.json({ wishes: data ?? [] });
}

export async function PATCH(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const body = await readJson<{
    id?: unknown;
    status?: unknown;
    is_pinned?: unknown;
  }>(req);

  const update: { status?: string; is_pinned?: boolean } = {};
  if (body.status !== undefined) {
    if (!isModerationStatus(body.status)) {
      return fail("Status tidak valid.", 400);
    }
    update.status = body.status;
  }
  if (body.is_pinned !== undefined) {
    if (typeof body.is_pinned !== "boolean") return fail("Nilai pin tidak valid.", 400);
    update.is_pinned = body.is_pinned;
  }
  if (!validId(body.id) || Object.keys(update).length === 0) {
    return fail("Permintaan tidak valid.", 400);
  }

  const { data, error } = await g.db.from("wishes").update(update).eq("id", body.id).select("id");
  if (error) return fail(error.message, 500);
  const notFound = requireAffected(data, "Ucapan tidak ditemukan.");
  if (notFound) return notFound;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const { id } = await readJson<{ id?: unknown }>(req);
  if (!validId(id)) return fail("Permintaan tidak valid.", 400);

  const { data, error } = await g.db.from("wishes").delete().eq("id", id).select("id");
  if (error) return fail(error.message, 500);
  const notFound = requireAffected(data, "Ucapan tidak ditemukan.");
  if (notFound) return notFound;
  return NextResponse.json({ ok: true });
}
