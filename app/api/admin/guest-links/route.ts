import { NextResponse } from "next/server";
import { fail, guard } from "@/src/lib/admin-server";

/**
 * Admin guest-link management, PIN-protected on the SERVER (service-role key
 * bypasses RLS). Deleting checks that a row was really removed, so a silent
 * "0 rows" is never reported to the UI as success.
 */
export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;

  const { slug } = (await req.json().catch(() => ({}))) as { slug?: unknown };
  if (typeof slug !== "string" || slug.trim().length === 0) {
    return fail("Permintaan tidak valid.", 400);
  }

  const { data, error } = await g.db
    .from("guest_links")
    .delete()
    .eq("slug", slug)
    .select("id");
  if (error) return fail(error.message, 500);
  if (!data?.length) return fail("Link tamu tidak ditemukan.", 404);

  return NextResponse.json({ ok: true });
}
