import { NextResponse } from "next/server";
import { fail } from "@/src/server/http";
import { serviceClient } from "@/src/server/db";
import { PHOTO_AUTO_APPROVE_KEY, readBoolSetting } from "@/src/server/app-settings";

/**
 * Guest photo registration. Storage upload stays on the client (anon key);
 * the row is inserted here with the service-role key so RLS cannot reject
 * `pending` the way a browser insert would.
 */
export const dynamic = "force-dynamic";

const COLUMNS = "id, created_at, guest_name, storage_path, status";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const db = serviceClient();
  if (!db) return fail("SUPABASE_SERVICE_ROLE_KEY belum diset di server.", 500);

  const body = (await req.json().catch(() => ({}))) as {
    id?: unknown;
    guest_name?: unknown;
    storage_path?: unknown;
  };

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const storage_path = typeof body.storage_path === "string" ? body.storage_path.trim() : "";
  const guest_name =
    typeof body.guest_name === "string" ? body.guest_name.trim().slice(0, 60) || "Tamu" : "Tamu";

  if (!UUID_RE.test(id) || storage_path !== `${id}.jpg`) {
    return fail("Permintaan tidak valid.", 400);
  }

  // Admin can switch on auto-approve; any read problem falls back to manual review.
  const autoApprove = (await readBoolSetting(db, PHOTO_AUTO_APPROVE_KEY)).value;

  const { data, error } = await db
    .from("photobooth_photos")
    .insert({
      id,
      guest_name,
      storage_path,
      consent: true,
      status: autoApprove ? "approved" : "pending",
    })
    .select(COLUMNS);

  if (error) return fail("Foto gagal dicatat. Silakan coba lagi.", 500);
  if (!data?.length) return fail("Foto gagal dicatat. Silakan coba lagi.", 500);
  return NextResponse.json({ photo: data[0] });
}
