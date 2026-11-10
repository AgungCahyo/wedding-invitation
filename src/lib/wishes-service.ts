import { supabase, isSupabaseConfigured } from "./supabase";
import { adminFetch } from "./admin-fetch";
import type { WishStatus } from "@/src/types/moderation";

// Keep the admin moderation tools available, but let new wishes appear
// immediately while approval is disabled.
export const WISH_APPROVAL_REQUIRED = false;

export interface WishRecord {
  id: number;
  name: string;
  message: string;
  created_at: string;
  status: WishStatus;
  is_pinned: boolean;
}

const NOT_CONFIGURED_MESSAGE =
  "Fitur ucapan belum aktif. Silakan hubungi pengelola undangan.";

/**
 * Save wish to Supabase. Approval can be re-enabled through the flag above;
 * the admin moderation tools remain available in either mode.
 */
export async function saveWish(name: string, message: string) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }

  try {
    const { data, error } = await supabase
      .from("wishes")
      .insert({
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
 * Fetch only approved wishes — this is what guests see on the public
 * invitation page. Pinned wishes (usually from parents/close family) sort
 * first so they surface above the general wall regardless of when they
 * were submitted.
 */
export async function fetchWishes() {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, data: [], notConfigured: true as const };
  }

  try {
    const { data, error } = await supabase
      .from("wishes")
      .select("*")
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

/* ------------------------------ admin (server) ----------------------------- */
// Moderation goes through /api/admin/wishes (service-role key, PIN-checked).
// Doing it with the anon key from the browser meant RLS could silently turn
// update/delete into "0 rows affected" while the UI still reported success.

/** Fetch every wish regardless of status, for the admin moderation panel. */
export async function fetchAllWishesForModeration(): Promise<WishRecord[]> {
  const { wishes } = await adminFetch<{ wishes: WishRecord[] }>("/api/admin/wishes", "GET");
  return wishes;
}

/** Approve, hide, or reset a wish's moderation status from the admin panel. */
export async function updateWishStatus(id: number, status: WishStatus) {
  await adminFetch("/api/admin/wishes", "PATCH", { id, status });
  return { success: true };
}

/**
 * Pin or unpin a wish so it surfaces above the general Wishes wall — meant
 * for admin-curated highlights (e.g. a message from the parents). Only
 * matters for wishes that are already "approved".
 */
export async function togglePinWish(id: number, isPinned: boolean) {
  await adminFetch("/api/admin/wishes", "PATCH", { id, is_pinned: isPinned });
  return { success: true };
}

/** Permanently delete a wish (e.g. clear spam instead of just hiding it). */
export async function deleteWish(id: number) {
  await adminFetch("/api/admin/wishes", "DELETE", { id });
  return { success: true };
}

/**
 * Get total wishes count
 */
export async function getWishesCount() {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, count: 0 };
  }

  try {
    const { count, error } = await supabase
      .from("wishes")
      .select("*", { count: "exact", head: true });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error("Failed to get wishes count:", error);
    throw error;
  }
}