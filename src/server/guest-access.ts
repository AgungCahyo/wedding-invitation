/**
 * SERVER-ONLY: resolves a guest's category from their invitation link.
 *
 * The identity is the guest slug that the project already uses as the
 * invitation token (the URL segment of /[guest]). The category is ALWAYS read
 * from guest_links on the server — it is never accepted from the client, so a
 * query parameter like ?category=wonogiri has no effect.
 *
 * Fails closed: no slug, unknown slug, DB error, or the category column not
 * migrated yet → DEFAULT_GUEST_CATEGORY (main event only).
 */
import { serviceClient } from "@/src/lib/admin-server";
import {
  DEFAULT_GUEST_CATEGORY,
  toGuestCategory,
  type GuestCategory,
} from "@/src/lib/guest-category";

const MAX_SLUG_LENGTH = 200;

export function readGuestSlug(req: Request): string {
  const raw = new URL(req.url).searchParams.get("guest") ?? "";
  return raw.length > 0 && raw.length <= MAX_SLUG_LENGTH ? raw : "";
}

export async function resolveGuestCategory(slug: string): Promise<GuestCategory> {
  if (!slug) return DEFAULT_GUEST_CATEGORY;
  const db = serviceClient();
  if (!db) return DEFAULT_GUEST_CATEGORY;

  const { data, error } = await db
    .from("guest_links")
    .select("category")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return DEFAULT_GUEST_CATEGORY;
  return toGuestCategory((data as { category?: unknown }).category);
}
