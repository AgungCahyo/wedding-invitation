/**
 * SERVER-ONLY: builds the personalised WhatsApp text for each guest.
 * Uses the same event registry as the invitation page, so a guest's message
 * only ever mentions the events their category may see.
 *
 * Placeholders (usable in a per-guest override too):
 *   {nama} {link} {acara} {relasi} {catatan} {pengantin}
 * A line that only contained an empty placeholder is dropped.
 */
import { invitation } from "@/src/data/invitation";
import { getVisibleEvents } from "@/src/server/events";
import { buildGuestSegment } from "@/src/lib/guest-token";
import { toGuestCategory } from "@/src/lib/guest-category";

export interface WaGuest {
  slug: string;
  name: string;
  category?: string | null;
  access_token?: string | null;
  relation?: string | null;
  personal_note?: string | null;
  wa_message?: string | null;
}

const { groom, bride } = invitation.couple;
const coupleShort = `${groom.name.split(" ")[0]} & ${bride.name.split(" ")[0]}`;

export const DEFAULT_TEMPLATE = [
  "Assalamu'alaikum Wr. Wb.",
  "",
  "Dengan penuh kebahagiaan, kami ingin mengundang Bapak/Ibu/Saudara/i *{nama}* untuk hadir dan turut memberikan doa restu pada hari pernikahan kami.",
  "{catatan}",
  "",
  "Adapun acara kami:",
  "{acara}",
  "",
  "Berikut tautan undangan pernikahan kami:",
  "🔗 {link}",
  "",
  "Besar harapan kami Bapak/Ibu/Saudara/i dapat berkenan hadir dan berbagi kebahagiaan bersama kami.",
  "",
  "Terima kasih atas perhatian dan doa yang diberikan.",
  "",
  "Wassalamu'alaikum Wr. Wb.",
  "*{pengantin}*",
].join("\n");

function longDate(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d))
  );
}

export function guestLink(g: WaGuest, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${buildGuestSegment(g.slug, g.access_token)}`;
}

function eventsText(g: WaGuest): string {
  return getVisibleEvents(toGuestCategory(g.category))
    .map((e) => `📅 *${e.title}*\n${e.dayName}, ${longDate(e.dateISO)}\n${e.time}\n📍 ${e.venue}`)
    .join("\n\n");
}

export function composeGuestMessage(g: WaGuest, baseUrl: string): string {
  const template = g.wa_message?.trim() ? g.wa_message : DEFAULT_TEMPLATE;
  const vars: Record<string, string> = {
    nama: g.name,
    link: guestLink(g, baseUrl),
    acara: eventsText(g),
    relasi: g.relation?.trim() ?? "",
    catatan: g.personal_note?.trim() ?? "",
    pengantin: coupleShort,
  };
  const out = template
    .split("\n")
    .filter((line) => {
      const onlyPlaceholders = line.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? "\u0000" : _));
      // drop the line if it is nothing but placeholders that are empty
      const stripped = onlyPlaceholders.replace(/\u0000/g, "").trim();
      const usedEmpty = [...line.matchAll(/\{(\w+)\}/g)].some(([, k]) => k in vars && vars[k] === "");
      return !(usedEmpty && stripped === "");
    })
    .join("\n")
    .replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

/** Single-line version (Meta template variables may not contain newlines/tabs). */
export function toSingleLine(text: string): string {
  return text.replace(/[\r\n\t]+/g, " | ").replace(/ {2,}/g, " ").trim();
}

/** Per-guest variable {{3}} for the template: the guest's own (rendered) override, else a one-line events summary. */
export function templateSummary(g: WaGuest, baseUrl: string): string {
  if (g.wa_message?.trim()) return toSingleLine(composeGuestMessage(g, baseUrl)).slice(0, 1000);
  return toSingleLine(
    getVisibleEvents(toGuestCategory(g.category))
      .map((e) => `${e.title}: ${e.dayName}, ${longDate(e.dateISO)} di ${e.venue}`)
      .join(" ; ")
  );
}
