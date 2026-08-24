import { useEffect, useState } from "react";
import { invitation as staticInvitation } from "@/src/data/invitation";
import { getInvitationBySlug } from "@/src/lib/invitation-service";
import type { Invitation } from "@/src/types/invitation";

/**
 * Step 11C: /admin remains intentionally single-tenant/static per the
 * migration scope — it manages exactly one wedding's RSVPs, wishes, and
 * guest links. But those three tables are now scoped by `invitation_id`
 * (a real Supabase UUID), so admin needs the actual DB row — not the
 * static placeholder id in src/data/invitation.ts — to query them.
 *
 * This hook resolves that once, using the static file's `slug` as the
 * lookup key (the static file remains the admin's declaration of *which*
 * invitation it administers).
 */
export function useAdminInvitation() {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getInvitationBySlug(staticInvitation.slug).then((data) => {
      if (!cancelled) {
        setInvitation(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { invitation, invitationId: invitation?.id ?? null, loading };
}