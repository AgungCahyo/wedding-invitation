import { NextResponse } from "next/server";
import { fail, guard } from "@/src/lib/admin-server";
import {
  PHOTO_AUTO_APPROVE_KEY,
  readBoolSetting,
  writeBoolSetting,
} from "@/src/lib/app-settings";

/**
 * Photo-booth settings, PIN-protected on the SERVER (service-role key).
 * Currently one switch: auto-approve new guest photos.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;
  const setting = await readBoolSetting(g.db, PHOTO_AUTO_APPROVE_KEY);
  return NextResponse.json({ autoApprove: setting.value, ready: setting.ready });
}

export async function PATCH(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;

  const { autoApprove } = (await req.json().catch(() => ({}))) as { autoApprove?: unknown };
  if (typeof autoApprove !== "boolean") return fail("Nilai tidak valid.", 400);

  const result = await writeBoolSetting(g.db, PHOTO_AUTO_APPROVE_KEY, autoApprove);
  if (!result.ok) return fail(result.error, result.status);
  return NextResponse.json({ ok: true, autoApprove });
}
