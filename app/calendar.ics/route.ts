import { buildICSContent, getWeddingCalendarEvent } from "@/src/lib/calendar";

export function GET() {
  const ics = buildICSContent(getWeddingCalendarEvent());

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="pernikahan-agung-ayu.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
