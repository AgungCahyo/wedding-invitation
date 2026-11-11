import { adminFetch } from "./admin-fetch";
import { getErrorMessage } from "./errors";
import type { RSVPFormData, GuestResponse } from "@/src/types/rsvp";

export type { GuestResponse } from "@/src/types/rsvp";

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
 * Fetch all RSVP responses via admin API (PIN-protected, service-role key)
 */
export async function fetchRSVPResponses(): Promise<{ success: true; data: GuestResponse[] } | { success: false; error: string }> {
  try {
    const { responses } = await adminFetch<{ responses: GuestResponse[] }>(
      "/api/admin/rsvp",
      "GET"
    );
    return { success: true, data: responses ?? [] };
  } catch (error) {
    console.error("Failed to fetch RSVP responses:", error);
    return { success: false, error: getErrorMessage(error, "Unknown error") };
  }
}

/**
 * Get RSVP statistics via admin API
 */
export async function getRSVPStats(): Promise<
  { success: true; data: { total: number; attending: number; notAttending: number; totalGuests: number } } |
  { success: false; error: string }
> {
  try {
    const { stats } = await adminFetch<{
      stats: { total: number; attending: number; notAttending: number; totalGuests: number };
    }>("/api/admin/rsvp?stats=true", "GET");
    return { success: true, data: stats };
  } catch (error) {
    console.error("Failed to get RSVP stats:", error);
    return { success: false, error: getErrorMessage(error, "Unknown error") };
  }
}