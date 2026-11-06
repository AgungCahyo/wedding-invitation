/**
 * Invitation link format: /<encoded-name>~<token>
 *
 *   slug  = the encoded guest name — kept as the display name and as the
 *           stats/personalisation key in guest_links (unchanged, so existing
 *           data and tracking keep working);
 *   token = 16 random hex chars (guest_links.access_token), the secret that
 *           actually identifies the guest for event visibility.
 *
 * A bare /<encoded-name> link (legacy, guessable) still opens the invitation
 * but is never treated as an identity for restricted events.
 * Client-safe: pure string handling.
 */
const SEGMENT_RE = /^(.+)~([0-9a-f]{16})$/i;

export function splitGuestSegment(raw: string): { slug: string; token: string | null } {
  const m = SEGMENT_RE.exec(raw);
  return m ? { slug: m[1], token: m[2].toLowerCase() } : { slug: raw, token: null };
}

export function buildGuestSegment(slug: string, token?: string | null): string {
  return token ? `${slug}~${token}` : slug;
}
