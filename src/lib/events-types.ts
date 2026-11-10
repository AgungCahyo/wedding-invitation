/**
 * Event shape sent to the browser by GET /api/events. Contains ONLY events
 * the requesting guest is allowed to see — never the full registry.
 * @deprecated Use types/event.ts instead. This file re-exports for backwards compatibility.
 */
export type {
  PublicEvent,
  EventAttendance,
} from "@/src/types/event";
