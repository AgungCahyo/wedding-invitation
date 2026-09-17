import { supabase } from "@/src/lib/supabase";
import { getSupabaseAdmin } from "./supabase-admin";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import { getCurrentUserMembership } from "@/src/lib/admin-membership-service";
import type { Invitation, TemplateKey } from "@/src/types/invitation";
import { createDefaultInvitation, NEUTRAL_IMAGE } from "@/src/lib/default-invitation";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Check if the current user (from the anon client session) is a super admin.
 * We compare the user's email to a list of admin emails from the environment.
 * @param supabaseClient - Optional SupabaseClient to use. If not provided, the anon client is used.
 */
export async function isSuperAdmin(supabaseClient?: SupabaseClient): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.log("[ADMIN DEBUG] Supabase not configured");
    return false;
  }

  const sb = supabaseClient ?? supabase!; // supabase is the anon client from "@/src/lib/supabase"
  const { data: { user } } = await sb.auth.getUser();

  // Debug logging (avoid exposing secrets)
  console.log("[ADMIN DEBUG] Checking super admin status:");
  console.log("[ADMIN DEBUG]   User exists:", !!user);
  if (user) {
    console.log("[ADMIN DEBUG]   User email:", user.email);
  }

  if (!user) {
    console.log("[ADMIN DEBUG]   No user logged in");
    return false;
  }

  const adminEmailsEnv = process.env.SUPABASE_ADMIN_EMAILS;
  console.log("[ADMIN DEBUG]   SUPABASE_ADMIN_EMAILS set:", !!adminEmailsEnv);
  if (adminEmailsEnv) {
    console.log("[ADMIN DEBUG]   SUPABASE_ADMIN_EMAILS value:", adminEmailsEnv);
  }

  if (!adminEmailsEnv) {
    console.log("[ADMIN DEBUG]   No admin emails configured");
    // Fallback: if no env var, we can treat the first user as admin? Not safe.
    // We'll return false by default.
    return false;
  }

  const adminEmails = adminEmailsEnv
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email): email is string => email.length > 0);

  console.log("[ADMIN DEBUG]   Parsed admin emails:", adminEmails);
  console.log("[ADMIN DEBUG]   User email (lowercase):", user.email?.toLowerCase() ?? "");

  const isAdmin = adminEmails.includes(user.email?.toLowerCase() ?? "");
  console.log("[ADMIN DEBUG]   isSuperAdmin result:", isAdmin);

  return isAdmin;
}

/**
 * Get all invitations with optional search and pagination.
 * Uses service role client to bypass RLS, but we assume the caller has
 * already checked that they are a super admin.
 */
export async function getAllInvitations({
  search = "",
  limit = 50,
  offset = 0,
}: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ invitations: any[]; count: number }> {
  if (!isSupabaseConfigured) {
    return { invitations: [], count: 0 };
  }

  const supabaseAdmin = getSupabaseAdmin();

  let query = supabaseAdmin
    .from("invitations")
    .select("id, slug, template, meta, created_at, updated_at", { count: "exact" });

  if (search) {
    // Search in meta.title and slug
    query = query.or(`meta.title.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Failed to fetch invitations:", error);
    throw error;
  }

  return { invitations: data ?? [], count: count ?? 0 };
}

/**
 * Create a new invitation.
 * We accept a partial invitation object (without id) and merge it with default values.
 * The slug is generated from the title if not provided.
 */
export async function createInvitation(
  data: Partial<Omit<Invitation, "id">>
) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase not configured");
  }

  // Extract title from meta.title or use default
  const title = data.meta?.title?.trim() || "Undangan Pernikahan";
  // Generate a slug from the title (lowercase, replace spaces with hyphens, remove non-alphanumeric)
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug;
  let counter = 0;
  // Ensure slug is unique
  const supabaseAdmin = getSupabaseAdmin();
  while (true) {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("invitations")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      // PGRST116 means no rows found, which is good
      console.error("Error checking slug uniqueness:", existingError);
      throw existingError;
    }
    if (!existing) {
      break;
    }
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  // Use provided template or default to ayutika
  const template = data.template ?? "ayutika";
  // Use provided description or default (from meta.description)
  const description = data.meta?.description?.trim() || "Detail undangan pernikahan akan segera diperbarui.";
  // Use provided url or empty string (from meta.url)
  const url = data.meta?.url?.trim() || "";
  // Use provided ogImage or default neutral image (from meta.ogImage)
  const ogImage = data.meta?.ogImage?.trim() || NEUTRAL_IMAGE;

  // Create a default invitation with the slug, template, title, description, url, ogImage
  const defaultInvitation = createDefaultInvitation({
    slug,
    template,
    title,
    description,
    url,
    ogImage,
  });

  // Merge the provided data with the default invitation (shallow merge for top-level fields)
  // We will not merge nested objects; we replace the whole field if provided.
  // Remove undefined keys from data
  const cleanData = Object.keys(data).reduce((acc, key) => {
    const value = data[key as keyof typeof data];
    if (value !== undefined) {
      return { ...acc, [key]: value };
    }
    return acc;
  }, {} as Partial<Omit<Invitation, "id">>);

  const newInvitation = {
    ...defaultInvitation,
    ...cleanData,
  };

  // We don't need to remove id because newInvitation lacks id (from DefaultInvitationInsert)
  const insertData = newInvitation;

  const { data: inserted, error } = await supabaseAdmin
    .from("invitations")
    .insert(insertData)
    .select()
    .single<Invitation>();

  if (error) {
    console.error("Failed to create invitation:", error);
    throw error;
  }

  if (!inserted) {
    throw new Error("Created invitation not found");
  }

  return inserted;
}

/**
 * Update an invitation by ID.
 */
export async function updateInvitation(
  id: string,
  data: Partial<Omit<Invitation, "id" | "slug">>
) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase not configured");
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Fetch the existing invitation
  const existing = await getInvitationById(id);
  if (!existing) {
    throw new Error("Invitation not found");
  }

  // Remove undefined keys from data to avoid overwriting with undefined
  const cleanData = Object.keys(data).reduce((acc, key) => {
    const value = data[key as keyof typeof data];
    if (value !== undefined) {
      return { ...acc, [key]: value };
    }
    return acc;
  }, {} as Partial<Omit<Invitation, "id" | "slug">>);

  // Build new invitation by merging existing with cleanData
  // Note: We do not merge nested objects; we replace the whole field if provided.
  // This is safe because the form will provide complete values for each top-level field.
  const newInvitation = {
    ...existing,
    ...cleanData,
    updated_at: new Date().toISOString(),
  };

  // Remove id and slug from newInvitation (should not be updated)
  const { id: _, slug: __, ...updateData } = newInvitation;

  const { data: updated, error } = await supabaseAdmin
    .from("invitations")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update invitation:", error);
    throw error;
  }

  if (!updated) {
    throw new Error("Updated invitation not found");
  }

  return updated;
}

/**
 * Delete an invitation by ID.
 */
export async function deleteInvitation(id: string) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase not configured");
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("invitations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete invitation:", error);
    throw error;
  }
}

/**
 * Get an invitation by ID.
 * Uses service role client to bypass RLS.
 */
export async function getInvitationById(id: string): Promise<Invitation | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("invitations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Failed to fetch invitation by ID:", error);
    return null;
  }

  return data as Invitation;
}

/**
 * Check if the current user is authorized to administer a specific invitation.
 * The user is authorized if they are a super admin (via SUPABASE_ADMIN_EMAILS)
 * OR if they have a membership row (any role) in the invitation_members table
 * for the given invitation.
 * @param supabaseClient - Optional SupabaseClient to use. If not provided, the anon client is used.
 * @param invitationId - The invitation to check authorization for.
 */
export async function isAuthorizedForInvitation(
  supabaseClient?: SupabaseClient,
  invitationId?: string
): Promise<boolean> {
  // First, check if the user is a super admin
  const isAdmin = await isSuperAdmin(supabaseClient);
  if (isAdmin) {
    return true;
  }

  // If not a super admin, check membership for the specific invitation
  if (!invitationId) {
    // If no invitationId is provided, we cannot check membership.
    // In this case, we fall back to super admin only (false).
    return false;
  }

  const sb = supabaseClient ?? supabase!; // supabase is the anon client from "@/src/lib/supabase"
  const membership = await getCurrentUserMembership(invitationId, sb);
  return !!membership;
}