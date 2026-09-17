import { getInvitationBySlug } from "@/src/lib/invitation-service";
import { isSupabaseConfigured } from "@/src/lib/supabase";
import { fetchWishes, saveWish } from "@/src/lib/wishes-service";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string; }> }
) {
  if (!isSupabaseConfigured) {
    return new Response("Supabase not configured", { status: 500 });
  }

  try {
    const params = await context.params;
    const slug = params.slug;

    // Get invitation by slug to get the ID
    const invitation = await getInvitationBySlug(slug);
    if (!invitation) {
      return new Response("Invitation not found", { status: 404 });
    }

    // Fetch wishes for this invitation
    const result = await fetchWishes(invitation.id);

    // Transform to match the expected format from public-invitation-service.ts
    // which expects: { success: true; data: PublicWish[] }
    if (result.success) {
      const publicWishes = result.data.map(wish => ({
        id: wish.id,
        name: wish.name,
        message: wish.message,
        date: wish.date, // Already in YYYY-MM-DD format from wishes-service
        isPinned: wish.isPinned
      }));

      return new Response(JSON.stringify({ success: true, data: publicWishes }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      throw new Error("Failed to fetch wishes");
    }
  } catch (err) {
    console.error("Error in GET wishes handler:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string; }> }
) {
  if (!isSupabaseConfigured) {
    return new Response("Supabase not configured", { status: 500 });
  }

  try {
    const params = await context.params;
    const slug = params.slug;

    // Get invitation by slug to get the ID
    const invitation = await getInvitationBySlug(slug);
    if (!invitation) {
      return new Response("Invitation not found", { status: 404 });
    }

    // Parse request body
    const data = await request.json();
    const { name, message } = data;

    if (!name || !message) {
      return new Response("Name and message are required", { status: 400 });
    }

    // Save the wish
    const result = await saveWish(invitation.id, name.trim(), message.trim());

    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      throw new Error("Failed to save wish");
    }
  } catch (err) {
    console.error("Error in POST wishes handler:", err);
    return new Response("Internal server error", { status: 500 });
  }
}