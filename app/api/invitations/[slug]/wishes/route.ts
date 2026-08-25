import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/src/lib/server/supabase-admin";
import { resolveInvitationBySlug } from "@/src/lib/server/invitation-context";

const NAME_MAX = 60;
const MESSAGE_MAX = 300;

interface WishRequest {
  name?: unknown;
  message?: unknown;
}

function invalidPayload(body: WishRequest) {
  return (
    typeof body.name !== "string" ||
    typeof body.message !== "string" ||
    body.name.trim().length === 0 ||
    body.name.trim().length > NAME_MAX ||
    body.message.trim().length === 0 ||
    body.message.trim().length > MESSAGE_MAX
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const invitation = await resolveInvitationBySlug(slug);
    if (!invitation) {
      return NextResponse.json({ error: "Invitation tidak ditemukan." }, { status: 404 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("wishes")
      .select("id, name, message, created_at, is_pinned")
      .eq("invitation_id", invitation.id)
      .eq("status", "approved")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: (data ?? []).map((wish) => ({
        id: wish.id,
        name: wish.name,
        message: wish.message,
        date: wish.created_at.split("T")[0],
        isPinned: wish.is_pinned,
      })),
    });
  } catch (error) {
    console.error("Public wishes request failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Ucapan belum tersedia." }, { status: 500 });
  }
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

    const body = (await request.json()) as WishRequest;
    if (invalidPayload(body)) {
      return NextResponse.json({ error: "Data ucapan tidak valid." }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const { error } = await getSupabaseAdmin().from("wishes").insert({
      invitation_id: invitation.id,
      name,
      message,
      status: "approved",
    });

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    const isJsonError = error instanceof SyntaxError;
    if (isJsonError) {
      return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 });
    }
    console.error("Public wish submission failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Ucapan gagal disimpan." }, { status: 500 });
  }
}