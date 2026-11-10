import { NextResponse } from "next/server";
import { guard } from "@/src/server/admin-guard";
import { fail, requireAffected, readJson } from "@/src/server/http";
import { MODERATION_STATUSES } from "@/src/types/moderation";

/**
 * Admin photo moderation, PIN-protected on the SERVER (see admin-server.ts).
 */
export const dynamic = "force-dynamic";

const BUCKET = "photobooth";
const COLUMNS = "id, created_at, guest_name, storage_path, status";

export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const { data, error } = await g.db
    .from("photobooth_photos")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) return fail(error.message, 500);
  return NextResponse.json({ photos: data ?? [] });
}

export async function PATCH(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const { id, status } = await readJson<{ id?: string; status?: string }>(req);
  if (!id || !status || !MODERATION_STATUSES.includes(status as "pending" | "approved" | "hidden")) return fail("Permintaan tidak valid.", 400);
  const { data, error } = await g.db
    .from("photobooth_photos")
    .update({ status })
    .eq("id", id)
    .select("id");
  if (error) return fail(error.message, 500);
  const notFound = requireAffected(data, "Foto tidak ditemukan.");
  if (notFound) return notFound;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const { id } = await readJson<{ id?: string }>(req);
  if (!id) return fail("Permintaan tidak valid.", 400);

  const { data, error } = await g.db
    .from("photobooth_photos")
    .delete()
    .eq("id", id)
    .select("storage_path");
  if (error) return fail(error.message, 500);
  const notFound = requireAffected(data, "Foto tidak ditemukan.");
  if (notFound) return notFound;

  // Best effort: the row is what controls visibility; remove the file too.
  await g.db.storage.from(BUCKET).remove([data[0].storage_path]);
  return NextResponse.json({ ok: true });
}
