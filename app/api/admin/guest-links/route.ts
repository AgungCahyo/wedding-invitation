import { NextResponse } from "next/server";
import { fail, guard } from "@/src/lib/admin-server";
import { isGuestCategory } from "@/src/lib/guest-category";
import { isGuestSide } from "@/src/lib/guest-side";

/**
 * Admin guest-link management, PIN-protected on the SERVER (service-role key
 * bypasses RLS). Deleting checks that a row was really removed, so a silent
 * "0 rows" is never reported to the UI as success.
 */
export const dynamic = "force-dynamic";

/** All guest links incl. each guest's secret access_token (admin only). */
export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const { data, error } = await g.db
    .from("guest_links")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return fail(error.message, 500);
  return NextResponse.json({ links: data ?? [] });
}

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

/**
 * Update category (event visibility) and/or side (pria/wanita, null = unset)
 * for one or more guests. Send only the fields to change.
 */
export async function PUT(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;

  const body = (await req.json().catch(() => ({}))) as {
    slugs?: unknown;
    category?: unknown;
    side?: unknown;
  };
  const { slugs } = body;
  const hasCategory = "category" in body;
  const hasSide = "side" in body;
  if (
    !Array.isArray(slugs) ||
    slugs.length === 0 ||
    slugs.length > 500 ||
    !slugs.every((s) => typeof s === "string" && s.length > 0 && s.length <= 200) ||
    (!hasCategory && !hasSide) ||
    (hasCategory && !isGuestCategory(body.category)) ||
    (hasSide && body.side !== null && !isGuestSide(body.side))
  ) {
    return fail("Permintaan tidak valid.", 400);
  }

  const patch: Record<string, unknown> = {};
  if (hasCategory) patch.category = body.category;
  if (hasSide) patch.side = body.side;

  const { data, error } = await g.db
    .from("guest_links")
    .update(patch)
    .in("slug", slugs as string[])
    .select("id");
  if (error) {
    return fail(
      `${error.message} — pastikan migration 009 dan 013 sudah dijalankan.`,
      500
    );
  }
  if (!data?.length) return fail("Link tamu tidak ditemukan.", 404);

  return NextResponse.json({ ok: true, updated: data.length });
}
