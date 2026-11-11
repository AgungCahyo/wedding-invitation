import { NextResponse } from "next/server";
import { guard } from "@/src/server/admin-guard";
import { fail, readJson, requireAffected } from "@/src/server/http";
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

/**
 * Upsert guest links (bulk create from generator).
 * Uses service-role key to bypass RLS.
 */
export async function POST(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;

  const body = await readJson<{
    guests?: unknown;
  }>(req);
  const { guests } = body;

  if (
    !Array.isArray(guests) ||
    guests.length === 0 ||
    guests.length > 500 ||
    !guests.every(
      (g) =>
        typeof g === "object" &&
        g !== null &&
        typeof (g as Record<string, unknown>).slug === "string" &&
        typeof (g as Record<string, unknown>).name === "string"
    )
  ) {
    return fail("Permintaan tidak valid.", 400);
  }

  const typedGuests = guests as { slug: string; name: string }[];

  const { error } = await g.db
    .from("guest_links")
    .upsert(
      typedGuests.map((g) => ({ slug: g.slug, name: g.name })),
      { onConflict: "slug", ignoreDuplicates: true }
    );

  if (error) return fail(error.message, 500);

  return NextResponse.json({ ok: true, count: typedGuests.length });
}

export async function DELETE(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;

  const { slug } = await readJson<{ slug?: unknown }>(req);
  if (typeof slug !== "string" || slug.trim().length === 0) {
    return fail("Permintaan tidak valid.", 400);
  }

  const { data, error } = await g.db
    .from("guest_links")
    .delete()
    .eq("slug", slug)
    .select("id");
  if (error) return fail(error.message, 500);
  const notFound = requireAffected(data, "Link tamu tidak ditemukan.");
  if (notFound) return notFound;

  return NextResponse.json({ ok: true });
}

/**
 * Update category (event visibility) and/or side (pria/wanita, null = unset)
 * for one or more guests. Send only the fields to change.
 */
export async function PUT(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;

  const body = await readJson<{
    slugs?: unknown;
    category?: unknown;
    side?: unknown;
  }>(req);
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
  const notFound = requireAffected(data, "Link tamu tidak ditemukan.");
  if (notFound) return notFound;

  return NextResponse.json({ ok: true, updated: data.length });
}

/**
 * Update personalization fields (relation, personal_note, is_featured) for a single guest.
 */
export async function PATCH(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;

  const body = await readJson<{
    slug?: unknown;
    relation?: unknown;
    personal_note?: unknown;
    is_featured?: unknown;
  }>(req);

  const { slug } = body;
  if (typeof slug !== "string" || slug.trim().length === 0) {
    return fail("Permintaan tidak valid.", 400);
  }

  const patch: Record<string, unknown> = {};
  if ("relation" in body) patch.relation = body.relation ?? null;
  if ("personal_note" in body) patch.personal_note = body.personal_note ?? null;
  if ("is_featured" in body) {
    if (typeof body.is_featured !== "boolean") return fail("Nilai featured tidak valid.", 400);
    patch.is_featured = body.is_featured;
  }

  if (Object.keys(patch).length === 0) {
    return fail("Tidak ada field yang diubah.", 400);
  }

  const { data, error } = await g.db
    .from("guest_links")
    .update(patch)
    .eq("slug", slug)
    .select("id");
  if (error) return fail(error.message, 500);
  const notFound = requireAffected(data, "Link tamu tidak ditemukan.");
  if (notFound) return notFound;

  return NextResponse.json({ ok: true });
}