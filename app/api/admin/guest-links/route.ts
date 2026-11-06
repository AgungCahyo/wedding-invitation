import { NextResponse } from "next/server";
import { fail, guard } from "@/src/lib/admin-server";
import { isGuestCategory } from "@/src/lib/guest-category";

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

/** Set the guest category (event visibility) for one or more guests. */
export async function PUT(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;

  const { slugs, category } = (await req.json().catch(() => ({}))) as {
    slugs?: unknown;
    category?: unknown;
  };
  if (
    !Array.isArray(slugs) ||
    slugs.length === 0 ||
    slugs.length > 500 ||
    !slugs.every((s) => typeof s === "string" && s.length > 0 && s.length <= 200) ||
    !isGuestCategory(category)
  ) {
    return fail("Permintaan tidak valid.", 400);
  }

  const { data, error } = await g.db
    .from("guest_links")
    .update({ category })
    .in("slug", slugs as string[])
    .select("id");
  if (error) {
    return fail(
      `${error.message} — pastikan migration 009_guest_event_visibility.sql sudah dijalankan.`,
      500
    );
  }
  if (!data?.length) return fail("Link tamu tidak ditemukan.", 404);

  return NextResponse.json({ ok: true, updated: data.length });
}
