import { NextResponse } from "next/server";
import { fail, guard } from "@/src/lib/admin-server";
import { MODERATION_STATUSES } from "@/src/types/moderation";

/**
 * Admin wishes moderation, PIN-protected on the SERVER (service-role key
 * bypasses RLS). Every write checks that a row was really affected, so a
 * silent "0 rows" can never be reported to the UI as success.
 */
export const dynamic = "force-dynamic";

const COLUMNS = "id, name, message, created_at, status, is_pinned";

const validId = (id: unknown): id is number | string =>
  (typeof id === "number" && Number.isFinite(id)) || (typeof id === "string" && id.length > 0);

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
  const body = (await req.json().catch(() => ({}))) as {
    id?: unknown;
    status?: unknown;
    is_pinned?: unknown;
  };

  const update: { status?: string; is_pinned?: boolean } = {};
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !MODERATION_STATUSES.includes(body.status as "pending" | "approved" | "hidden")) {
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
  if (!data?.length) return fail("Ucapan tidak ditemukan.", 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const { id } = (await req.json().catch(() => ({}))) as { id?: unknown };
  if (!validId(id)) return fail("Permintaan tidak valid.", 400);

  const { data, error } = await g.db.from("wishes").delete().eq("id", id).select("id");
  if (error) return fail(error.message, 500);
  if (!data?.length) return fail("Ucapan tidak ditemukan.", 404);
  return NextResponse.json({ ok: true });
}
