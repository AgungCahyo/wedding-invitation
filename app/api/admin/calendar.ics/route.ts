import { buildICSContent } from "@/src/lib/calendar";
import { getVisibleCalendarEvents } from "@/src/server/events";
import { readGuestSlug, resolveGuestCategory } from "@/src/server/guest-access";

/**
 * The .ics contains only the events the guest's category may see — resolved
 * server-side from the invitation slug (?guest=), never from a client-sent
 * category. No/unknown slug → main event only.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const category = await resolveGuestCategory(readGuestSlug(req));
  const ics = buildICSContent(getVisibleCalendarEvents(category));

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="pernikahan-agung-ayu.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
