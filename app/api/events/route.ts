import { NextResponse } from "next/server";
import { getVisibleEvents } from "@/src/server/events";
import { readGuestSlug, resolveGuestCategory } from "@/src/server/guest-access";

/**
 * Events visible to the guest identified by ?guest=<slug>. The category is
 * looked up on the server; the response never includes it, nor any event the
 * guest is not allowed to see.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const category = await resolveGuestCategory(readGuestSlug(req));
  return NextResponse.json(
    { events: getVisibleEvents(category) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
