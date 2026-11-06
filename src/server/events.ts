/**
 * SERVER-ONLY event registry + visibility rules.
 *
 * Why this lives outside src/data/invitation.ts: that file is imported by
 * client components, so anything in it ships to every guest's browser. Event
 * details that only some guests may see must stay here and be returned by
 * API routes after the guest's category has been resolved on the server.
 * Never import this file from a "use client" component.
 *
 * To add another event: append one entry to EVENTS with its `audience`.
 * Frontend (/api/events), calendar (/calendar.ics) and RSVP (/api/rsvp) all
 * read from this list, so no other file needs a category check.
 */
import { invitation } from "@/src/data/invitation";
import {
  buildCalendarEvent,
  getWeddingCalendarEvent,
  type CalendarEvent,
} from "@/src/lib/calendar";
import type { GuestCategory } from "@/src/lib/guest-category";
import type { PublicEvent } from "@/src/lib/events-types";

interface EventDefinition extends PublicEvent {
  /** Guest categories allowed to see (and RSVP to) this event. */
  audience: readonly GuestCategory[];
  toCalendarEvent: () => CalendarEvent;
}

const { akad } = invitation.events;
const { groom, bride } = invitation.couple;
const coupleShort = `${groom.name.split(" ")[0]} & ${bride.name.split(" ")[0]}`;

/** First HH:MM … last HH:MM of a time string, or null when no clock time is given yet. */
function timeRangeOf(time: string): string | null {
  const m = time.match(/\d{1,2}:\d{2}/g);
  return m && m.length > 0 ? `${m[0]} – ${m[m.length - 1]}` : null;
}

const ngunduh = {
  dateISO: "2026-12-27",
  dayName: "Minggu",
  // Ganti dengan jam pasti, mis. "10:00 – Selesai", bila sudah ditentukan.
  time: "Waktu menyusul",
  venue: "Rumah Mempelai Pria",
  address: "Klepu, Suberagung, Kec. Pracimantoro, Kabupaten Wonogiri, Jawa Tengah",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Klepu%2C+Suberagung%2C+Pracimantoro%2C+Wonogiri",
};

const EVENTS: readonly EventDefinition[] = [
  {
    id: "akad-resepsi",
    isMain: true,
    title: "Akad Nikah & Resepsi",
    dateISO: invitation.wedding.date,
    dayName: akad.dayName,
    time: akad.time,
    venue: akad.venue,
    address: akad.address,
    mapsUrl: akad.mapsUrl,
    rsvp: false, // answered by the main attendance question
    audience: ["kudus", "wonogiri"],
    toCalendarEvent: getWeddingCalendarEvent,
  },
  {
    id: "ngunduh-mantu",
    isMain: false,
    title: "Ngunduh Mantu",
    ...ngunduh,
    rsvp: true,
    audience: ["wonogiri"],
    toCalendarEvent: () => {
      const title = `Ngunduh Mantu ${coupleShort}`;
      const location = `${ngunduh.venue}, ${ngunduh.address}`;
      const description = `Ngunduh Mantu ${groom.name} & ${bride.name}.\nWaktu: ${ngunduh.time}\nLokasi: ${location}\nPeta: ${ngunduh.mapsUrl}`;
      const range = timeRangeOf(ngunduh.time);
      if (range) {
        return buildCalendarEvent({
          title,
          description,
          location,
          dateISO: ngunduh.dateISO,
          timeRange: range,
        });
      }
      // Jam belum pasti → acara sehari penuh.
      const start = new Date(`${ngunduh.dateISO}T00:00:00+07:00`);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      return { title, description, location, start, end, allDay: true };
    },
  },
];

function visible(category: GuestCategory): EventDefinition[] {
  return EVENTS.filter((e) => e.audience.includes(category));
}

/** Events the browser may receive for this category (audience/calendar internals stripped). */
export function getVisibleEvents(category: GuestCategory): PublicEvent[] {
  return visible(category).map((e) => ({
    id: e.id,
    isMain: e.isMain,
    title: e.title,
    dateISO: e.dateISO,
    dayName: e.dayName,
    time: e.time,
    venue: e.venue,
    address: e.address,
    mapsUrl: e.mapsUrl,
    rsvp: e.rsvp,
  }));
}

export function getVisibleCalendarEvents(category: GuestCategory): CalendarEvent[] {
  return visible(category).map((e) => e.toCalendarEvent());
}

/** Ids of events this category may answer a separate RSVP for. */
export function getRsvpEventIds(category: GuestCategory): string[] {
  return visible(category)
    .filter((e) => e.rsvp)
    .map((e) => e.id);
}
