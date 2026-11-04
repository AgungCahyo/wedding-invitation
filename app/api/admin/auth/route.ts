import { NextResponse } from "next/server";
import { guard } from "@/src/lib/admin-server";

export const dynamic = "force-dynamic";

/** Login check: the PIN is verified on the server, never bundled into client JS. */
export async function POST(req: Request) {
  const g = await guard(req, false);
  if (g.res) return g.res;
  return NextResponse.json({ ok: true });
}
