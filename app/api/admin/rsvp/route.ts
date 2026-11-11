import { NextResponse } from "next/server";
import { guard } from "@/src/server/admin-guard";
import { fail } from "@/src/server/http";

/**
 * Admin RSVP read operations — PIN-protected, service-role key (bypasses RLS).
 */
export const dynamic = "force-dynamic";

const COLUMNS = "id, name, attendance, guest_count, message, event_responses, created_at";

export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.db) return g.res!;

  const { searchParams } = new URL(req.url);
  const statsOnly = searchParams.get("stats") === "true";

  if (statsOnly) {
    const { data, error } = await g.db
      .from("rsvp_guests")
      .select("attendance, guest_count");
    if (error) return fail(error.message, 500);

    const stats = {
      total: data.length,
      attending: 0,
      notAttending: 0,
      totalGuests: 0,
    };
    data.forEach((item: { attendance: string; guest_count: number | null }) => {
      if (item.attendance === "attending") {
        stats.attending++;
        stats.totalGuests += item.guest_count ?? 1;
      } else {
        stats.notAttending++;
      }
    });
    return NextResponse.json({ stats });
  }

  const { data, error } = await g.db
    .from("rsvp_guests")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) return fail(error.message, 500);
  return NextResponse.json({ responses: data ?? [] });
}