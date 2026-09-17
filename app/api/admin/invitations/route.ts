import { getSupabaseAdmin } from "@/src/lib/server/supabase-admin";
import { getSupabaseServerClient } from "@/src/lib/server/supabase";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import { isSuperAdmin, getAllInvitations, createInvitation } from "@/src/lib/server/admin";
import type { NextRequest } from "next/server";
import type { Invitation } from "@/src/types/invitation";

export async function GET(request: NextRequest) {
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

  // Check if the user is a super admin
  const isAdmin = await isSuperAdmin(supabaseClient);
  if (!isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  try {
    const { invitations, count } = await getAllInvitations({ search });
    return new Response(JSON.stringify({ invitations, count }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in GET handler:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

  // Check if the user is a super admin
  const isAdmin = await isSuperAdmin(supabaseClient);
  if (!isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const data = await request.json() as Partial<Omit<Invitation, "id">>;

    // We expect the data to contain at least title (inside meta) and template.
    const { meta, template } = data;
    if (!meta?.title || !template) {
      return new Response("Title and template are required", { status: 400 });
    }

    // Validate template (also validated in createInvitation, but we keep for early feedback)
    if (!["ayutika", "template02"].includes(template)) {
      return new Response("Invalid template", { status: 400 });
    }

    // Use the admin function to create the invitation
    const insertedInvitation = await createInvitation(data);

    return new Response(JSON.stringify(insertedInvitation), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in POST handler:", err);
    if (err.message === "Invalid template" || err.message === "Title and template are required") {
      return new Response(err.message, { status: 400 });
    }
    return new Response("Failed to create invitation", { status: 500 });
  }
}