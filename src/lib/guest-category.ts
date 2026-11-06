/**
 * Guest categories — the single list the whole app uses to decide which
 * events a guest may see. Safe to import from client code (it carries no
 * event details); the event data itself lives in src/server/events.ts.
 *
 * To add a category: add it here AND to the CHECK constraint in
 * supabase/migrations/009_guest_event_visibility.sql.
 */
export const GUEST_CATEGORIES = ["kudus", "wonogiri"] as const;
export type GuestCategory = (typeof GUEST_CATEGORIES)[number];

/** Least-privilege default: unknown / unlisted guests only see the main event. */
export const DEFAULT_GUEST_CATEGORY: GuestCategory = "kudus";

export const GUEST_CATEGORY_LABELS: Record<GuestCategory, string> = {
  kudus: "Kudus",
  wonogiri: "Wonogiri",
};

export function isGuestCategory(value: unknown): value is GuestCategory {
  return (
    typeof value === "string" &&
    (GUEST_CATEGORIES as readonly string[]).includes(value)
  );
}

/** Normalises whatever the DB returns (null, unknown string) to a valid category. */
export function toGuestCategory(value: unknown): GuestCategory {
  return isGuestCategory(value) ? value : DEFAULT_GUEST_CATEGORY;
}
