import { supabase, isSupabaseConfigured } from "./supabase";
import type { Invitation } from "@/src/types/invitation";

/**
 * Step 11C: Supabase-backed invitation lookup.
 *
 * Replaces the temporary static mapping from Step 11B. Queries the
 * `invitations` table (supabase/migrations/005_invitations_multitenancy.sql)
 * by slug and maps the row 1:1 onto the canonical `Invitation` type —
 * the JSONB columns already match the shape components expect, so no
 * reshaping is needed beyond assembling the row into one object.
 *
 * Contract (unchanged from the caller's perspective):
 * - returns `Invitation` for a known slug
 * - returns `null` for an unknown slug or when Supabase is unreachable
 *   — callers already treat `null` as "call notFound()"; this function
 *   must NEVER fall back to the static `src/data/invitation.ts` object,
 *   since that would silently render one wedding's content under a
 *   different invitation's slug.
 */

interface InvitationRow {
  id: string;
  slug: string;
  template: string;
  meta: Invitation["meta"];
  cover: Invitation["cover"];
  couple: Invitation["couple"];
  wedding: Invitation["wedding"];
  breather: Invitation["breather"];
  events: Invitation["events"];
  quote: Invitation["quote"];
  story: Invitation["story"];
  gallery: Invitation["gallery"];
  rsvp: Invitation["rsvp"];
  gift: Invitation["gift"];
  closing: Invitation["closing"];
  maker: Invitation["maker"];
  audio: Invitation["audio"];
}

function mapRowToInvitation(row: InvitationRow): Invitation {
  return {
    id: row.id,
    slug: row.slug,
    // `template` is a free-text column in the DB; narrowing to
    // TemplateKey happens downstream in getTemplateImplementation()
    // via resolveTemplate(), which already falls back safely on an
    // unrecognized value — so no unsafe cast is needed here.
    template: row.template as Invitation["template"],
    meta: row.meta,
    cover: row.cover,
    couple: row.couple,
    wedding: row.wedding,
    breather: row.breather,
    events: row.events,
    quote: row.quote,
    story: row.story,
    gallery: row.gallery,
    rsvp: row.rsvp,
    gift: row.gift,
    closing: row.closing,
    maker: row.maker,
    audio: row.audio,
  };
}

export async function getInvitationBySlug(slug: string): Promise<Invitation | null> {
  if (!slug) return null;

  if (!supabase || !isSupabaseConfigured) {
    console.error("Supabase is not configured — cannot look up invitation by slug.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching invitation by slug:", error);
      return null;
    }

    if (!data) {
      // Unknown slug — never fall back to static content.
      return null;
    }

    return mapRowToInvitation(data as InvitationRow);
  } catch (error) {
    console.error("Failed to fetch invitation by slug:", error);
    return null;
  }
}