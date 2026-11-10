/**
 * Event types shared between server and client.
 * Re-exports PublicEvent from events-types for backwards compatibility.
 */
export type EventAttendance = "attending" | "not-attending";

export interface PublicEvent {
  id: string;
  /** The main event (Akad & Resepsi) is rendered from invitation.ts by EventDetails. */
  isMain: boolean;
  /** Short label, e.g. "Ngunduh Mantu". */
  title: string;
  dateISO: string;
  dayName: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
  /** Whether guests can answer RSVP for this event separately from the main one. */
  rsvp: boolean;
}