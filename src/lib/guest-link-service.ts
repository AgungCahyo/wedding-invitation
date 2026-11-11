import { supabase, isSupabaseConfigured } from "./supabase";
import { adminFetch } from "./admin-fetch";
import { getErrorMessage } from "./errors";
import type { GuestCategory } from "./guest-category";
import type { GuestSide } from "./guest-side";
import type { GuestLinkRecord } from "@/src/types/guest";

export type { GuestLinkRecord } from "@/src/types/guest";

/** Columns a guest's browser may read (access_token and category stay server-side). */
const PUBLIC_COLUMNS =
  "id, slug, name, created_at, first_viewed_at, last_viewed_at, view_count, relation, personal_note, is_featured";

/**
 * Persist a batch of generated guest links so the admin dashboard can later
 * show who has opened their invitation. Uses upsert on `slug` so
 * regenerating the same name list doesn't create duplicates or reset an
 * already-viewed link's stats. Personalization fields (relation,
 * personal_note, is_featured) are deliberately NOT touched here — they're
 * edited separately per-guest via updateGuestLinkDetails, so regenerating
 * the whole list never wipes out personal touches an admin already wrote.
 * Goes through admin API (PIN-protected, service-role key).
 */
export async function upsertGuestLinks(guests: { slug: string; name: string }[]) {
  if (guests.length === 0) return { success: true as const };
  try {
    await adminFetch("/api/admin/guest-links", "POST", { guests });
    return { success: true as const };
  } catch (error) {
    console.error("Error saving guest links:", error);
    return { success: false as const, error: getErrorMessage(error, "Unknown error") };
  }
}

/**
 * Fetch every generated guest link with its view stats, newest first.
 * Goes through the PIN-protected admin API because it includes each guest's
 * secret access_token (not readable with the public anon key).
 */
export async function fetchGuestLinks() {
  const { links } = await adminFetch<{ links: GuestLinkRecord[] }>(
    "/api/admin/guest-links",
    "GET"
  );
  return { success: true as const, data: links ?? [] };
}

/**
 * Fetch a single guest link by slug — used on the guest-facing page to
 * check whether this guest has a personalized touch (relation note,
 * featured status) to render in the Opening section.
 */
export async function fetchGuestLinkBySlug(slug: string) {
  if (!supabase || !isSupabaseConfigured || !slug) {
    return { success: false as const, data: null };
  }

  try {
    const { data, error } = await supabase
      .from("guest_links")
      .select(PUBLIC_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return { success: true as const, data: data as GuestLinkRecord | null };
  } catch (error) {
    // Non-critical for the guest experience — the page just renders
    // without the personal touch if this fails.
    console.warn("Failed to fetch guest link by slug:", error);
    return { success: false as const, data: null };
  }
}

/**
 * Update the personalization fields (relation, personal note, featured
 * flag) for a single guest — edited individually from the admin dashboard,
 * separate from the bulk link-generation flow.
 * Goes through admin API (PIN-protected, service-role key).
 */
export async function updateGuestLinkDetails(
  slug: string,
  details: { relation?: string | null; personal_note?: string | null; is_featured?: boolean }
) {
  try {
    await adminFetch("/api/admin/guest-links", "PATCH", { slug, ...details });
    return { success: true as const };
  } catch (error) {
    console.error("Error updating guest link details:", error);
    throw error;
  }
}

/**
 * Change the category of one or more guests. Goes through the PIN-protected
 * admin API on purpose: the category controls which events a guest can see,
 * so it must not be writable with the public anon key.
 */
export async function setGuestCategory(slugs: string[], category: GuestCategory) {
  if (slugs.length === 0) return { success: true as const };
  await adminFetch("/api/admin/guest-links", "PUT", { slugs, category });
  return { success: true as const };
}

/** Set pihak (pria/wanita, atau null = belum diatur) untuk satu atau lebih tamu. */
export async function setGuestSide(slugs: string[], side: GuestSide | null) {
  if (slugs.length === 0) return { success: true as const };
  await adminFetch("/api/admin/guest-links", "PUT", { slugs, side });
  return { success: true as const };
}

/**
 * Permanently delete a guest link (its tracking stats and personalization).
 * Goes through the PIN-protected admin API so it works regardless of RLS.
 * Throws with a readable message on failure (including "not found").
 */
export async function deleteGuestLink(slug: string) {
  await adminFetch("/api/admin/guest-links", "DELETE", { slug });
  return { success: true as const };
}

/**
 * Record that a guest opened their invitation link. Fire-and-forget from
 * the guest-facing page — failures here should never block the guest from
 * seeing their invitation, so callers should not await this critically.
 * Uses an RPC (`record_guest_view`) so the increment is atomic even if the
 * same guest opens the link from multiple devices concurrently.
 */
export async function recordGuestView(slug: string) {
  if (!supabase || !isSupabaseConfigured || !slug) return;

  try {
    await supabase.rpc("record_guest_view", { guest_slug: slug });
  } catch (error) {
    // Non-critical — just log, never surface to the guest.
    console.warn("Failed to record guest view:", error);
  }
}
