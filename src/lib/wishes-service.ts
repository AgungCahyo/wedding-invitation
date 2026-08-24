import { supabase, isSupabaseConfigured } from "./supabase";

export type WishStatus = "pending" | "approved" | "hidden";

// Keep the admin moderation tools available, but let new wishes appear
// immediately while approval is disabled.
export const WISH_APPROVAL_REQUIRED = false;

export interface WishRecord {
  id: number;
  invitation_id: string;
  name: string;
  message: string;
  created_at: string;
  status: WishStatus;
  is_pinned: boolean;
}

const NOT_CONFIGURED_MESSAGE =
  "Fitur ucapan belum aktif. Silakan hubungi pengelola undangan.";

/**
 * Save wish to Supabase, scoped to one invitation (Step 11C). Approval can
 * be re-enabled through the flag above; the admin moderation tools remain
 * available in either mode.
 */
export async function saveWish(invitationId: string, name: string, message: string) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }

  try {
    const { data, error } = await supabase
      .from("wishes")
      .insert({
        invitation_id: invitationId,
        name: name.trim(),
        message: message.trim(),
        status: (WISH_APPROVAL_REQUIRED ? "pending" : "approved") satisfies WishStatus,
      })
      .select();

    if (error) {
      console.error("Error saving wish:", error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Ucapan tersimpan tapi tidak bisa dimuat kembali.");
    }

    return { success: true, data: data[0] as WishRecord };
  } catch (error) {
    console.error("Failed to save wish:", error);
    throw error;
  }
}

/**
 * Fetch only approved wishes for one invitation — this is what guests see
 * on the public invitation page. Pinned wishes (usually from
 * parents/close family) sort first so they surface above the general wall
 * regardless of when they were submitted.
 */
export async function fetchWishes(invitationId: string) {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, data: [], notConfigured: true as const };
  }

  try {
    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .eq("invitation_id", invitationId)
      .eq("status", "approved")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishes:", error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: ((data ?? []) as WishRecord[]).map((wish) => ({
        id: wish.id,
        name: wish.name,
        message: wish.message,
        date: wish.created_at.split("T")[0],
        isPinned: wish.is_pinned,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch wishes:", error);
    throw error;
  }
}

/**
 * Fetch every wish for one invitation regardless of status — used by the
 * admin moderation panel so pending/hidden entries can be reviewed.
 */
export async function fetchAllWishesForModeration(invitationId: string) {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, data: [] as WishRecord[], notConfigured: true as const };
  }

  try {
    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching wishes for moderation:", error);
      throw new Error(error.message);
    }

    return { success: true, data: (data ?? []) as WishRecord[] };
  } catch (error) {
    console.error("Failed to fetch wishes for moderation:", error);
    throw error;
  }
}

/**
 * Approve, hide, or reset a wish's moderation status from the admin panel.
 * Scoped by invitation_id in addition to id so an admin session cannot
 * touch a wish belonging to a different invitation.
 */
export async function updateWishStatus(invitationId: string, id: number, status: WishStatus) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }

  const { error } = await supabase
    .from("wishes")
    .update({ status })
    .eq("id", id)
    .eq("invitation_id", invitationId);

  if (error) {
    console.error("Error updating wish status:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Pin or unpin a wish so it surfaces above the general Wishes wall — meant
 * for admin-curated highlights (e.g. a message from the parents). Only
 * matters for wishes that are already "approved"; pinning a hidden/pending
 * wish has no visible effect until it's approved too.
 */
export async function togglePinWish(invitationId: string, id: number, isPinned: boolean) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }

  const { error } = await supabase
    .from("wishes")
    .update({ is_pinned: isPinned })
    .eq("id", id)
    .eq("invitation_id", invitationId);

  if (error) {
    console.error("Error toggling wish pin:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

/** Permanently delete a wish (e.g. clear spam instead of just hiding it). */
export async function deleteWish(invitationId: string, id: number) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }

  const { error } = await supabase
    .from("wishes")
    .delete()
    .eq("id", id)
    .eq("invitation_id", invitationId);

  if (error) {
    console.error("Error deleting wish:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Get total wishes count for one invitation
 */
export async function getWishesCount(invitationId: string) {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, count: 0 };
  }

  try {
    const { count, error } = await supabase
      .from("wishes")
      .select("*", { count: "exact", head: true })
      .eq("invitation_id", invitationId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Failed to get wishes count:", error);
    throw error;
  }
}