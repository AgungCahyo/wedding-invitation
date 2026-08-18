import { supabase, isSupabaseConfigured } from "./supabase";
import { RSVPFormData } from "@/src/components/RSVP";

export interface GuestResponse {
  id?: number;
  name: string;
  attendance: "attending" | "not-attending";
  guest_count: number | null;
  message: string | null;
  created_at?: string;
}

const NOT_CONFIGURED_MESSAGE =
  "Fitur RSVP belum aktif. Silakan hubungi pengelola undangan.";

/**
 * Save RSVP response to Supabase
 */
export async function saveRSVPResponse(data: RSVPFormData) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }

  try {
    const { data: response, error } = await supabase
      .from("rsvp_guests")
      .insert({
        name: data.name.trim(),
        attendance: data.attendance,
        guest_count:
          data.attendance === "attending" ? parseInt(data.guestCount, 10) : null,
        message: data.message.trim() || null,
      })
      .select();

    if (error) {
      console.error("Error saving RSVP:", error);
      throw new Error(error.message);
    }

    return { success: true, data: response };
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