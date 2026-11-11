/**
 * Guest link domain types — shared between admin components and services.
 */
import type { GuestCategory } from "@/src/lib/guest-category";
import type { GuestSide } from "@/src/lib/guest-side";

export interface GuestLinkRecord {
  id: number;
  slug: string;
  name: string;
  created_at: string;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  view_count: number;
  relation: string | null;
  personal_note: string | null;
  is_featured: boolean;
  /** Absent until migration 009. */
  category?: GuestCategory | null;
  /** Absent until migration 013. */
  side?: GuestSide | null;
  /** Only returned by the PIN-protected admin API. */
  access_token?: string | null;
}

export interface GeneratedLink {
  id: string;
  slug: string;
  name: string;
  url: string;
  waLink: string;
}

export interface ParsedGuest {
  name: string;
  phone: string;
  relation: string;
  personal_note: string;
}

export interface WaGuestRow {
  slug: string;
  phone: string;
  wa_message: string;
  status: "pending" | "sending" | "sent" | "failed";
  error: string | null;
  message: string;
}
