import { getSupabaseAdmin } from "@/src/lib/server/supabase-admin";
import { getSupabaseServerClient } from "@/src/lib/server/supabase";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import { isSuperAdmin, isAuthorizedForInvitation, getInvitationById, updateInvitation, deleteInvitation } from "@/src/lib/server/admin";
import type { NextRequest } from "next/server";
import type { Invitation } from "@/src/types/invitation";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ invitationId: string; }> }
) {
  if (!isSupabaseConfigured) {
    return new Response("Supabase not configured", { status: 500 });
  }

  let supabaseClient;
  try {
    supabaseClient = await getSupabaseServerClient();
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return new Response("Failed to initialize Supabase client", { status: 500 });
  }

  const params = await context.params;
  const invitationId = params.invitationId;

  // Validate UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(invitationId)) {
    return new Response("Invalid invitation ID", { status: 400 });
  }

  // Check if the user is authorized for this invitation
  const isAuthorized = await isAuthorizedForInvitation(supabaseClient, invitationId);
  if (!isAuthorized) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const data = await request.json() as Partial<Omit<Invitation, "id" | "slug">>;

    // Update the invitation using the admin function
    const updatedInvitation = await updateInvitation(invitationId, data);

    return new Response(JSON.stringify(updatedInvitation), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in PUT handler:", err);
    if (err.message === "Invalid template" || err.message === "Title and template are required") {
      return new Response(err.message, { status: 400 });
    }
    return new Response("Failed to update invitation", { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ invitationId: string; }> }
) {
  if (!isSupabaseConfigured) {
    return new Response("Supabase not configured", { status: 500 });
  }

  let supabaseClient;
  try {
    supabaseClient = await getSupabaseServerClient();
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return new Response("Failed to initialize Supabase client", { status: 500 });
  }

  const params = await context.params;
  const invitationId = params.invitationId;

  // Validate UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(invitationId)) {
    return new Response("Invalid invitation ID", { status: 400 });
  }

  // Check if the user is authorized for this invitation
  const isAuthorized = await isAuthorizedForInvitation(supabaseClient, invitationId);
  if (!isAuthorized) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const invitation = await getInvitationById(invitationId);
    if (!invitation) {
      return new Response("Invitation not found", { status: 404 });
    }

    return new Response(JSON.stringify(invitation), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in GET handler:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ invitationId: string; }> }
) {
  if (!isSupabaseConfigured) {
    return new Response("Supabase not configured", { status: 500 });
  }

  let supabaseClient;
  try {
    supabaseClient = await getSupabaseServerClient();
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    return new Response("Failed to initialize Supabase client", { status: 500 });
  }

  const params = await context.params;
  const invitationId = params.invitationId;

  // Validate UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(invitationId)) {
    return new Response("Invalid invitation ID", { status: 400 });
  }

  // Check if the user is authorized for this invitation
  const isAuthorized = await isAuthorizedForInvitation(supabaseClient, invitationId);
  if (!isAuthorized) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await deleteInvitation(invitationId);
    return new Response(null, { status: 204 });
  } catch (err: any) {
    console.error("Error in DELETE handler:", err);
    if (err.message === "Invitation not found") {
      return new Response("Invitation not found", { status: 404 });
    }
    return new Response("Failed to delete invitation", { status: 500 });
  }
}