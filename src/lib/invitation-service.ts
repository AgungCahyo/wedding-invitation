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

/**
 * Resolve an asset path to a public Supabase Storage URL.
 * Checks if there's a corresponding asset record in invitation_assets.
 * If found, returns the Storage URL; otherwise returns the original path
 * for backward compatibility.
 */
async function resolveAssetPath(
  assetPath: string | null | undefined,
  invitationId: string
): Promise<string> {
  // If no path, return empty string
  if (!assetPath) return '';

  // If not using Supabase, return the path as-is
  if (!supabase || !isSupabaseConfigured) {
    return assetPath;
  }

  try {
    // Look for an asset record matching this path for the given invitation
    const { data, error } = await supabase
      .from('invitation_assets')
      .select('storage_path')
      .eq('invitation_id', invitationId)
      .eq('storage_path', assetPath)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error looking up asset record:', error);
      return assetPath; // Fallback to original path
    }

    // If we found a matching asset record, use its storage_path to construct the URL
    if (data && data.storage_path) {
      // Construct the public URL for the asset
      // Format: {supabaseUrl}/storage/v1/object/public/{storage_path}
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.storage_path}`;
    }

    // No matching asset record found - return original path for backward compatibility
    return assetPath;
  } catch (error) {
    console.error('Failed to resolve asset path:', error);
    return assetPath; // Fallback to original path
  }
}

/**
 * Recursively resolve all asset references in an invitation object.
 * This function walks through known asset fields and converts
 * paths to public Supabase Storage URLs when possible.
 */
async function resolveInvitationAssets(invitation: any): Promise<any> {
  if (!invitation) return invitation;

  const invitationId = invitation.id;

  // Create a deep copy to avoid mutating the original
  const resolved = JSON.parse(JSON.stringify(invitation));

  // Define the asset fields that need resolution
  const assetFields = [
    'meta.ogImage',
    'cover.image',
    'couple.groom.photo',
    'couple.bride.photo',
    'breather.image',
    'gallery[*].src', // Special handling for arrays
    'events.akad.mapsUrl', // This is already a URL, but let's keep the pattern
    'events.reception.mapsUrl',
    'audio.src',
    'audio.lyricsSrc',
  ];

  // Process each asset field
  for (const fieldPath of assetFields) {
    if (fieldPath.includes('[*]')) {
      // Handle array fields like gallery[*].src
      const [arrayPath, fieldName] = fieldPath.split('[*].');
      const arrayValue = resolved[arrayPath as keyof typeof resolved];

      if (Array.isArray(arrayValue)) {
        for (let i = 0; i < arrayValue.length; i++) {
          const originalSrc = arrayValue[i][fieldName];
          if (originalSrc && typeof originalSrc === 'string') {
            const resolvedSrc = await resolveAssetPath(originalSrc, invitationId);
            arrayValue[i][fieldName] = resolvedSrc;
          }
        }
      }
    } else {
      // Handle regular object fields
      const pathParts = fieldPath.split('.');
      let obj = resolved;

      // Navigate to the parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (obj[pathParts[i]] !== undefined && obj[pathParts[i]] !== null) {
          obj = obj[pathParts[i]];
        } else {
          obj = undefined;
          break;
        }
      }

      // If we found the parent object and the field exists, resolve it
      if (obj && typeof obj === 'object' && obj[pathParts[pathParts.length - 1]] !== undefined) {
        const fieldName = pathParts[pathParts.length - 1] as keyof typeof obj;
        const originalValue = obj[fieldName];
        if (typeof originalValue === 'string' && originalValue) {
          const resolvedValue = await resolveAssetPath(originalValue, invitationId);
          obj[fieldName] = resolvedValue;
        }
      }
    }
  }

  return resolved;
}

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

    const invitation = mapRowToInvitation(data as InvitationRow);
    // Resolve asset paths to Storage URLs
    return await resolveInvitationAssets(invitation);
  } catch (error) {
    console.error("Failed to fetch invitation by slug:", error);
    return null;
  }
}

/**
 * Same as getInvitationBySlug, but by primary key — used by the admin
 * context, which resolves invitation_id from the authenticated user's
 * invitation_members row rather than from a slug.
 */
export async function getInvitationById(id: string): Promise<Invitation | null> {
  if (!id) return null;

  if (!supabase || !isSupabaseConfigured) {
    console.error("Supabase is not configured — cannot look up invitation by id.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching invitation by id:", error);
      return null;
    }

    if (!data) return null;

    const invitation = mapRowToInvitation(data as InvitationRow);
    // Resolve asset paths to Storage URLs
    return await resolveInvitationAssets(invitation);
  } catch (error) {
    console.error("Failed to fetch invitation by id:", error);
    return null;
  }
}