import { getInvitationBySlug } from "@/src/lib/invitation-service";
import { buildICSContent, getWeddingCalendarEvent } from "@/src/lib/calendar";

export async function GET() {
  const invitation = await getInvitationBySlug("ayutika");
  if (!invitation) {
    return new Response("Invitation not found", { status: 404 });
  }
  const ics = buildICSContent(getWeddingCalendarEvent(invitation));

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="pernikahan-agung-ayu.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}