// Temporary mapping of slugs to invitation data
// In the future, this will be replaced with Supabase lookup
import { invitation } from "@/src/data/invitation";

// Extract slug from invitation meta URL
// Current URL: "https://ayutika.agungcahyo.my.id"
// We'll use the subdomain as the slug: "ayutika"
// This is a temporary solution until we have proper slug field
const CURRENT_INVITATION_SLUG = "ayutika";

export async function getInvitationBySlug(slug: string) {
  // For now, we only support the existing invitation
  // In the future, this will query Supabase
  if (slug === CURRENT_INVITATION_SLUG) {
    return invitation;
  }

  // Return null for unknown slugs (will trigger notFound() in pages)
  return null;
}

// Helper function to get all supported slugs (for validation)
export function getSupportedSlugs(): string[] {
  return [CURRENT_INVITATION_SLUG];
}