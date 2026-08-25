import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/server/supabase-admin";
import { resolveInvitationBySlug } from "@/src/lib/server/invitation-context";

const NAME_MAX = 100;
const MESSAGE_MAX = 300;

interface RSVPRequest {
  name?: unknown;
  attendance?: unknown;
  guestCount?: unknown;
  message?: unknown;
}

function invalidPayload(body: RSVPRequest) {
  const guestCount = typeof body.guestCount === "string" ? Number(body.guestCount) : NaN;
  return (
    typeof body.name !== "string" ||
    body.name.trim().length === 0 ||
    body.name.trim().length > NAME_MAX ||
    (body.attendance !== "attending" && body.attendance !== "not-attending") ||
    typeof body.guestCount !== "string" ||
    (body.attendance === "attending" && (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20)) ||
    typeof body.message !== "string" ||
    body.message.trim().length > MESSAGE_MAX
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const invitation = await resolveInvitationBySlug(slug);
    if (!invitation) {
      return NextResponse.json({ error: "Invitation tidak ditemukan." }, { status: 404 });
    }

    const body = (await request.json()) as RSVPRequest;
    if (invalidPayload(body)) {
      return NextResponse.json({ error: "Data RSVP tidak valid." }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const { error } = await getSupabaseAdmin().from("rsvp_guests").insert({
      invitation_id: invitation.id,
      name,
      attendance: body.attendance,
      guest_count: body.attendance === "attending" ? Number(body.guestCount) : null,
      message: message || null,
    });

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 });
    }
    console.error("Public RSVP submission failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "RSVP gagal disimpan." }, { status: 500 });
  }
}