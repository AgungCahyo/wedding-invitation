import type { ComponentType } from "react";
import { Couple } from "./Couple";
import { Quote } from "./Quote";
import { EventDetails } from "./EventDetails";
import { Countdown } from "./Countdown";
import { ImageBreak } from "./ImageBreak";
import { Story } from "./Story";
import { Gallery } from "./Gallery";
import { RSVP } from "./RSVP";
import { Wishes } from "./Wishes";
import { DigitalGift } from "./DigitalGift";
import { Closing } from "./Closing";

/**
 * Keys for the Ayutika template's linear content flow.
 *
 * Opening is intentionally NOT a SectionKey. It isn't a linear section — it
 * is rendered directly by the page, lives inside AnimatePresence, and drives
 * the showOpening lifecycle. See app/page.tsx and app/[guest]/page.tsx.
 */
export type SectionKey =
  | "couple"
  | "quote"
  | "eventDetails"
  | "countdown"
  | "imageBreak"
  | "story"
  | "gallery"
  | "rsvp"
  | "wishes"
  | "digitalGift"
  | "closing";

/**
 * Props a section may accept. Only RSVP and Wishes read guestName; every
 * other section ignores it. Keeping it optional lets the registry hold a
 * single component type without a generic prop-injection system.
 */
type SectionProps = {
  guestName?: string;
};

/** Render order for the Ayutika template flow. */
export const ayutikaSectionOrder: SectionKey[] = [
  "couple",
  "quote",
  "eventDetails",
  "countdown",
  "imageBreak",
  "story",
  "gallery",
  "rsvp",
  "wishes",
  "digitalGift",
  "closing",
];

/** Maps each SectionKey to its Ayutika component. */
export const ayutikaSections: Record<SectionKey, ComponentType<SectionProps>> = {
  couple: Couple,
  quote: Quote,
  eventDetails: EventDetails,
  countdown: Countdown,
  imageBreak: ImageBreak,
  story: Story,
  gallery: Gallery,
  rsvp: RSVP,
  wishes: Wishes,
  digitalGift: DigitalGift,
  closing: Closing,
};