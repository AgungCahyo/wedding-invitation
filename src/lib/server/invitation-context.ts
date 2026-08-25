import { getSupabaseAdmin } from "./supabase-admin";

export interface ResolvedInvitation {
  id: string;
  slug: string;
}

export async function resolveInvitationBySlug(
  slug: string
): Promise<ResolvedInvitation | null> {
  if (!slug) return null;

  const { data, error } = await getSupabaseAdmin()
    .from("invitations")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to resolve invitation context:", error.message);
    throw new Error("Unable to resolve invitation.");
  }

  return data as ResolvedInvitation | null;
}