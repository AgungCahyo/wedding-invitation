import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/server/supabase-admin";
import { resolveInvitationBySlug } from "@/src/lib/server/invitation-context";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; guestSlug: string }> }
) {
  try {
    const { slug, guestSlug } = await params;
    const invitation = await resolveInvitationBySlug(slug);
    if (!invitation) {
      return NextResponse.json({ error: "Invitation tidak ditemukan." }, { status: 404 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("guest_links")
      .select("relation, personal_note, is_featured")
      .eq("invitation_id", invitation.id)
      .eq("slug", guestSlug)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Guest tidak ditemukan." }, { status: 404 });
    }

    const { error: viewError } = await getSupabaseAdmin().rpc("record_guest_view", {
      guest_invitation_id: invitation.id,
      guest_slug: guestSlug,
    });
    if (viewError) {
      console.warn("Public guest view tracking failed:", viewError.message);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Public guest lookup failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Data guest belum tersedia." }, { status: 500 });
  }
}