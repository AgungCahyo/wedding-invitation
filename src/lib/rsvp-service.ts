import { supabase, isSupabaseConfigured } from "./supabase";
import type { RSVPFormData, Attendance } from "@/src/types/rsvp";

export interface GuestResponse {
  id?: number;
  name: string;
  attendance: Attendance;
  guest_count: number | null;
  message: string | null;
  /** Per-event answers, e.g. { "ngunduh-mantu": "attending" }. Null for older rows. */
  event_responses?: Record<string, Attendance> | null;
  created_at?: string;
}

const NOT_CONFIGURED_MESSAGE =
  "Fitur RSVP belum aktif. Silakan hubungi pengelola undangan.";

/**
 * Save RSVP response via POST /api/rsvp. The server validates the input and
 * checks that any per-event answers belong to events this guest may see
 * (resolved from the invitation slug).
 */
export async function saveRSVPResponse(data: RSVPFormData, guestSlug = "") {
  const url = guestSlug
    ? `/api/rsvp?guest=${encodeURIComponent(guestSlug)}`
    : "/api/rsvp";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        attendance: data.attendance,
        guestCount: data.attendance === "attending" ? data.guestCount : null,
        message: data.message,
        eventResponses: data.eventResponses,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string; data?: unknown };
    if (!res.ok) throw new Error(json.error ?? NOT_CONFIGURED_MESSAGE);
    return { success: true, data: json.data };
  } catch (error) {
    console.error("Failed to save RSVP response:", error);
    throw error;
  }
}

/**
 * Fetch all RSVP responses
 */
export async function fetchRSVPResponses() {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from("rsvp_guests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching RSVP responses:", error);
      throw new Error(error.message);
    }

    return { success: true, data: data as GuestResponse[] };
  } catch (error) {
    console.error("Failed to fetch RSVP responses:", error);
    throw error;
  }
}

/**
 * Get RSVP statistics
 */
export async function getRSVPStats() {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      data: { total: 0, attending: 0, notAttending: 0, totalGuests: 0 },
    };
  }

  try {
    const { data, error } = await supabase
      .from("rsvp_guests")
      .select("attendance, guest_count");

    if (error) {
      throw new Error(error.message);
    }

    const stats = {
      total: data.length,
      attending: 0,
      notAttending: 0,
      totalGuests: 0,
    };

    data.forEach((item: Pick<GuestResponse, "attendance" | "guest_count">) => {
      if (item.attendance === "attending") {
        stats.attending++;
        stats.totalGuests += item.guest_count || 1;
      } else {
        stats.notAttending++;
      }
    });

    return { success: true, data: stats };
  } catch (error) {
    console.error("Failed to get RSVP stats:", error);
    throw error;
  }
}