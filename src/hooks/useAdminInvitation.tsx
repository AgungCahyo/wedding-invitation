import { useEffect, useState } from "react";
import { getInvitationBySlug } from "@/src/lib/invitation-service";
import type { Invitation } from "@/src/types/invitation";

/**
 * Step 11C: Resolve invitation by slug for admin context.
 * The hook now accepts a slug parameter to scope the admin to a specific invitation.
 * It returns the invitation data, invitationId, and loading state.
 * If the slug is not provided or the invitation is not found, invitation and invitationId are null.
 */
export function useAdminInvitation(slug: string) {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!slug) {
      setLoading(false);
      return;
    }

    getInvitationBySlug(slug).then((data) => {
      if (!cancelled) {
        setInvitation(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { invitation, invitationId: invitation?.id ?? null, loading };
}