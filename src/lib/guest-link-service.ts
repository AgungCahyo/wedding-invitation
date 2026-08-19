import { supabase, isSupabaseConfigured } from "./supabase";

export interface GuestLinkRecord {
  id: number;
  slug: string;
  name: string;
  created_at: string;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  view_count: number;
}

/**
 * Persist a batch of generated guest links so the admin dashboard can later
 * show who has opened their invitation. Uses upsert on `slug` so
 * regenerating the same name list doesn't create duplicates or reset an
 * already-viewed link's stats.
 */
export async function upsertGuestLinks(guests: { slug: string; name: string }[]) {
  if (!supabase || !isSupabaseConfigured || guests.length === 0) {
    return { success: false as const };
  }

  const { error } = await supabase
    .from("guest_links")
    .upsert(
      guests.map((g) => ({ slug: g.slug, name: g.name })),
      { onConflict: "slug", ignoreDuplicates: true }
    );

  if (error) {
    console.error("Error saving guest links:", error);
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
}

/** Fetch every generated guest link with its view stats, newest first. */
export async function fetchGuestLinks() {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false as const, data: [] as GuestLinkRecord[], notConfigured: true as const };
  }

  try {
    const { data, error } = await supabase
      .from("guest_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return { success: true as const, data: (data ?? []) as GuestLinkRecord[] };
  } catch (error) {
    console.error("Failed to fetch guest links:", error);
    throw error;
  }
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
