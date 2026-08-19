/**
 * Calendar & navigation link helpers.
 *
 * All event times in `invitation.ts` are given in Asia/Jakarta (WIB),
 * which is a fixed UTC+7 offset with no daylight saving. We can safely
 * build ISO datetimes with a literal "+07:00" offset instead of pulling
 * in a timezone library.
 */

import { invitation } from "@/src/data/invitation";

export interface CalendarEventInput {
  /** Event title, e.g. "Akad Nikah — Agung & Ayu" */
  title: string;
  /** Free-text description shown in the calendar entry */
  description: string;
  /** Venue + address combined, shown as the calendar location */
  location: string;
  /** ISO date, e.g. "2026-12-04" */
  dateISO: string;
  /** Display time range as stored in invitation data, e.g. "09:00 – 11:00 WIB" */
  timeRange: string;
}

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}

/** Extracts the first two HH:MM occurrences from a time-range string. */
function parseTimeRange(timeRange: string): [string, string] {
  const matches = timeRange.match(/(\d{1,2}):(\d{2})/g) ?? [];
  if (matches.length >= 2) {
    return [matches[0]!, matches[1]!];
  }
  if (matches.length === 1) {
    return [matches[0]!, matches[0]!];
  }
  // Sensible fallback so a malformed string never throws.
  return ["09:00", "10:00"];
}

export function buildCalendarEvent(input: CalendarEventInput): CalendarEvent {
  const [startTime, endTime] = parseTimeRange(input.timeRange);
  const start = new Date(`${input.dateISO}T${startTime}:00+07:00`);
  let end = new Date(`${input.dateISO}T${endTime}:00+07:00`);

  // Guard against an end time that rolls past midnight or is otherwise
  // not after start — default to a 2-hour block instead.
  if (Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  }

  return {
    title: input.title,
    description: input.description,
    location: input.location,
    start,
    end,
  };
}

/** Formats a Date as the compact UTC form calendars expect: YYYYMMDDTHHMMSSZ */
function toUtcCompact(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toUtcCompact(event.start)}/${toUtcCompact(event.end)}`,
    details: event.description,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function getWeddingCalendarEvent(): CalendarEvent {
  const { akad, reception } = invitation.events;
  const { groom, bride } = invitation.couple;
  const fullLocation = `${akad.venue}, ${akad.address}`;
  const startTime = (akad.time.match(/\d{1,2}:\d{2}/) ?? ["09:00"])[0];
  const receptionTimes = reception.time.match(/\d{1,2}:\d{2}/g) ?? ["23:00"];
  const endTime = receptionTimes[receptionTimes.length - 1];

  return buildCalendarEvent({
    title: `Pernikahan ${groom.name.split(" ")[0]} & ${bride.name.split(" ")[0]}`,
    description: `Pernikahan ${groom.name} & ${bride.name}.\nAkad: ${akad.time}\nResepsi: ${reception.time}\nLokasi: ${fullLocation}`,
    location: fullLocation,
    dateISO: invitation.wedding.date,
    timeRange: `${startTime} – ${endTime}`,
  });
}

export function buildICSContent(event: CalendarEvent): string {
  const uid = `pernikahan-${toUtcCompact(event.start)}@undangan`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Undangan Pernikahan Digital//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toUtcCompact(new Date())}`,
    `DTSTART:${toUtcCompact(event.start)}`,
    `DTEND:${toUtcCompact(event.end)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description)}`,
    `LOCATION:${escapeICSText(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

/** Triggers a browser download of the event as an .ics file. Client-side only. */
export function downloadICSFile(event: CalendarEvent, filename: string): void {
  if (typeof window === "undefined") return;

  const content = buildICSContent(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildWazeUrl(address: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
}

export function buildAppleMapsUrl(address: string): string {
  return `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
}
