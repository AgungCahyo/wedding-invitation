/**
 * RSVP domain types — shared between client components and services.
 * Breaks the circular dependency: RSVP.tsx ↔ rsvp-service.ts
 */
export type Attendance = "attending" | "not-attending";

export interface EventResponses {
  [eventId: string]: Attendance;
}

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

/** Form data for the RSVP component — includes empty string for unselected attendance. */
export interface RSVPFormData {
  name: string;
  attendance: Attendance | "";
  guestCount: string;
  message: string;
  /** Per-event answers keyed by event id (only events visible to this guest). */
  eventResponses: EventResponses;
}

export const initialRSVPForm: RSVPFormData = {
  name: "",
  attendance: "",
  guestCount: "1",
  message: "",
  eventResponses: {},
};

export const ATTENDANCE_OPTIONS = [
  { value: "attending", label: "Hadir" },
  { value: "not-attending", label: "Berhalangan" },
] as const;