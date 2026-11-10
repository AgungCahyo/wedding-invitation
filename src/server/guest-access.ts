/**
 * SERVER-ONLY: resolves a guest's category from their invitation link.
 *
 * The identity is the secret token in the invitation link (/[guest] segment
 * "<name>~<token>", see src/lib/guest-token.ts). The category is ALWAYS read
 * from guest_links on the server — it is never accepted from the client, so a
 * query parameter like ?category=wonogiri has no effect.
 *
 * Fails closed: no slug, unknown slug, DB error, or the category column not
 * migrated yet → DEFAULT_GUEST_CATEGORY (main event only).
 */
import "server-only";

import { serviceClient } from "./db";
import { splitGuestSegment } from "@/src/lib/guest-token";
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

export async function resolveGuestCategory(segment: string): Promise<GuestCategory> {
  // Identity = secret token in the link. A bare name slug (guessable) never
  // unlocks anything beyond the main event.
  const { slug, token } = splitGuestSegment(segment);
  if (!token) return DEFAULT_GUEST_CATEGORY;
  const db = serviceClient();
  if (!db) return DEFAULT_GUEST_CATEGORY;

  const { data, error } = await db
    .from("guest_links")
    .select("category, slug")
    .eq("access_token", token)
    .maybeSingle();

  if (error || !data) return DEFAULT_GUEST_CATEGORY;
  const row = data as { category?: unknown; slug?: unknown };
  if (row.slug !== slug) return DEFAULT_GUEST_CATEGORY;
  return toGuestCategory(row.category);
}
