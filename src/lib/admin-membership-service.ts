import { supabase, isSupabaseConfigured } from "./supabase";

export type MembershipRole = "owner" | "admin" | "editor";

export interface AdminMembership {
  invitationId: string;
  role: MembershipRole;
}

/**
 * Resolve which invitation(s) the currently authenticated Supabase user is
 * a member of, via `invitation_members` — the real authorization source.
 * Never falls back to a static/hardcoded invitation: no session or no
 * membership row both resolve to `null`, and callers must treat that as
 * "deny admin access", not as "show an empty ayutika dashboard".
 *
 * A user can have multiple memberships (multiple invitations, or multiple
 * roles across invitations). For now — single-invitation admin UI, no
 * selector — we deterministically pick the earliest-created membership.
 * Supporting a real invitation switcher for multi-invitation users is a
 * separate future feature, not implemented here.
 */
export async function getCurrentUserMembership(): Promise<AdminMembership | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const { data, error } = await supabase
    .from("invitation_members")
    .select("invitation_id, role")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to resolve invitation membership:", error);
    return null;
  }

  if (!data) return null;

  return { invitationId: data.invitation_id as string, role: data.role as MembershipRole };
}