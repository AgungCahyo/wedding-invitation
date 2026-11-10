import { NextResponse } from "next/server";
import { fail } from "@/src/server/http";
import { serviceClient } from "@/src/server/db";
import { getRsvpEventIds } from "@/src/server/events";
import { readGuestSlug, resolveGuestCategory } from "@/src/server/guest-access";

/**
 * Guest RSVP. Same columns as before (name, attendance, guest_count, message);
 * per-event answers (e.g. Ngunduh Mantu) are accepted only for events the
 * guest's category may see, checked here against the server-side registry.
 * Without event answers the insert is identical to the old browser insert, so
 * RSVP keeps working even before migration 009 is applied.
 */
export const dynamic = "force-dynamic";

const ATTENDANCE = ["attending", "not-attending"] as const;
type Attendance = (typeof ATTENDANCE)[number];
const isAttendance = (v: unknown): v is Attendance =>
  typeof v === "string" && (ATTENDANCE as readonly string[]).includes(v);

export async function POST(req: Request) {
  const db = serviceClient();
  if (!db) return fail("Fitur RSVP belum aktif. Silakan hubungi pengelola undangan.", 500);

  const body = (await req.json().catch(() => ({}))) as {
    name?: unknown;
    attendance?: unknown;
    guestCount?: unknown;
    message?: unknown;
    eventResponses?: unknown;
  };

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 120) return fail("Nama tidak valid.", 400);
  if (!isAttendance(body.attendance)) return fail("Status kehadiran tidak valid.", 400);

  let guestCount: number | null = null;
  if (body.attendance === "attending") {
    guestCount = Number(body.guestCount);
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
      return fail("Jumlah tamu tidak valid.", 400);
    }
  }

  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 1000) || null : null;

  // Per-event answers: every key must be an event this guest may see.
  let eventResponses: Record<string, Attendance> | null = null;
  if (body.eventResponses !== undefined && body.eventResponses !== null) {
    if (typeof body.eventResponses !== "object" || Array.isArray(body.eventResponses)) {
      return fail("Permintaan tidak valid.", 400);
    }
    const entries = Object.entries(body.eventResponses as Record<string, unknown>);
    if (entries.length > 0) {
      const category = await resolveGuestCategory(readGuestSlug(req));
      const allowed = new Set(getRsvpEventIds(category));
      const clean: Record<string, Attendance> = {};
      for (const [eventId, value] of entries) {
        if (!allowed.has(eventId) || !isAttendance(value)) {
          return fail("Acara tidak tersedia untuk undangan ini.", 403);
        }
        clean[eventId] = value;
      }
      eventResponses = clean;
    }
  }

  const row: Record<string, unknown> = {
    name,
    attendance: body.attendance,
    guest_count: guestCount,
    message,
  };
  if (eventResponses) row.event_responses = eventResponses;

  const { data, error } = await db.from("rsvp_guests").insert(row).select();
  if (error) {
    console.error("Error saving RSVP:", error);
    return fail("Gagal menyimpan konfirmasi. Silakan coba lagi.", 500);
  }
  return NextResponse.json({ success: true, data });
}
