/**
 * Guest link domain types — shared between admin components and services.
 */
export interface GuestLinkRecord {
  slug: string;
  name: string;
  category: string;
  side: string | null;
  relation: string | null;
  personal_note: string | null;
  is_featured: boolean;
  access_token: string;
  view_count: number;
  created_at: string;
  last_viewed_at: string | null;
  wa_message: string | null;
  wa_status: "pending" | "sending" | "sent" | "failed" | null;
  wa_error: string | null;
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