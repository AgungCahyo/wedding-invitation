import { supabase, isSupabaseConfigured } from "./supabase";

export interface GuestLinkRecord {
  id: number;
  invitation_id: string;
  slug: string;
  name: string;
  created_at: string;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  view_count: number;
  relation: string | null;
  personal_note: string | null;
  is_featured: boolean;
}

/**
 * Persist a batch of generated guest links so the admin dashboard can later
 * show who has opened their invitation. Uses upsert on `(invitation_id,
 * slug)` — Step 11C's uniqueness constraint — so regenerating the same name
 * list doesn't create duplicates or reset an already-viewed link's stats,
 * and so the same guest slug can be reused safely across two different
 * invitations. Personalization fields (relation, personal_note,
 * is_featured) are deliberately NOT touched here — they're edited
 * separately per-guest via updateGuestLinkDetails, so regenerating the
 * whole list never wipes out personal touches an admin already wrote.
 */
export async function upsertGuestLinks(
  invitationId: string,
  guests: { slug: string; name: string }[]
) {
  if (!supabase || !isSupabaseConfigured || guests.length === 0 || !invitationId) {
    return { success: false as const };
  }

  const { error } = await supabase
    .from("guest_links")
    .upsert(
      guests.map((g) => ({ invitation_id: invitationId, slug: g.slug, name: g.name })),
      { onConflict: "invitation_id,slug", ignoreDuplicates: true }
    );

  if (error) {
    console.error("Error saving guest links:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
}

/** Fetch every generated guest link for one invitation, newest first. */
export async function fetchGuestLinks(invitationId: string) {
  if (!supabase || !isSupabaseConfigured || !invitationId) {
    return { success: false as const, data: [] as GuestLinkRecord[], notConfigured: true as const };
  }

  try {
    const { data, error } = await supabase
      .from("guest_links")
      .select("*")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return { success: true as const, data: (data ?? []) as GuestLinkRecord[] };
  } catch (error) {
    console.error("Failed to fetch guest links:", error);
    throw error;
  }
}

/**
 * Fetch a single guest link by (invitation, slug) — used on the
 * guest-facing page to check whether this guest has a personalized touch
 * (relation note, featured status) to render in the Opening component.
 * Both parts of the key are required so a guest slug that happens to
 * match a different invitation's guest can never be returned here.
 */
export async function fetchGuestLinkBySlug(invitationId: string, slug: string) {
  if (!supabase || !isSupabaseConfigured || !invitationId || !slug) {
    return { success: false as const, data: null };
  }

  try {
    const { data, error } = await supabase
      .from("guest_links")
      .select("*")
      .eq("invitation_id", invitationId)
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
 */
export async function updateGuestLinkDetails(
  invitationId: string,
  slug: string,
  details: { relation?: string | null; personal_note?: string | null; is_featured?: boolean }
) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error("Fitur ini belum aktif. Periksa konfigurasi Supabase.");
  }

  const { error } = await supabase
    .from("guest_links")
    .update(details)
    .eq("invitation_id", invitationId)
    .eq("slug", slug);

  if (error) {
    console.error("Error updating guest link details:", error);
    throw new Error(error.message);
  }

  return { success: true as const };
}

/**
 * Record that a guest opened their invitation link. Fire-and-forget from
 * the guest-facing page — failures here should never block the guest from
 * seeing their invitation, so callers should not await this critically.
 * Uses an RPC (`record_guest_view`) so the increment is atomic even if the
 * same guest opens the link from multiple devices concurrently. The RPC
 * takes both invitation_id and slug (Step 11C) so it can never increment
 * a same-named guest under the wrong invitation.
 */
export async function recordGuestView(invitationId: string, slug: string) {
  if (!supabase || !isSupabaseConfigured || !invitationId || !slug) return;

  try {
    await supabase.rpc("record_guest_view", {
      guest_invitation_id: invitationId,
      guest_slug: slug,
    });
  } catch (error) {
    // Non-critical — just log, never surface to the guest.
    console.warn("Failed to record guest view:", error);
  }
}