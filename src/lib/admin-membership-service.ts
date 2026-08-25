import { supabase, isSupabaseConfigured } from "./supabase";

export type MembershipRole = "owner" | "admin" | "editor";

export interface AdminMembership {
  invitationId: string;
  role: MembershipRole;
}

/**
 * Resolve which invitation(s) the currently authenticated Supabase user is
 * a member of, via `invitation_members` — the real authorization source.
 *
 * If `invitationId` is provided, checks membership for that specific invitation.
 * Returns the membership for that invitation (if any) or null.
 *
 * If `invitationId` is not provided, returns the earliest-created membership
 * across all invitations (preserving legacy behavior for single-tenant admin).
 *
 * Never falls back to a static/hardcoded invitation: no session or no
 * membership row both resolve to `null`, and callers must treat that as
 * "deny admin access".
 *
 * A user can have multiple memberships (multiple invitations, or multiple
 * roles across invitations). When `invitationId` is undefined, we deterministically
 * pick the earliest-created membership. Supporting a real invitation switcher
 * for multi-invitation users is a separate future feature.
 */
export async function getCurrentUserMembership(
  invitationId?: string
): Promise<AdminMembership | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  let query = supabase
    .from("invitation_members")
    .select("invitation_id, role")
    .eq("user_id", userData.user.id);

  if (invitationId) {
    // Check for specific invitation
    query = query.eq("invitation_id", invitationId);
  } else {
    // Legacy behavior: pick earliest-created membership across all invitations
    query = query.order("created_at", { ascending: true }).limit(1);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Failed to resolve invitation membership:", error);
    return null;
  }

  if (!data) return null;

  return {
    invitationId: data.invitation_id as string,
    role: data.role as MembershipRole,
  };
}