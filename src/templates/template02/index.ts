import type { ComponentType } from "react";
import { Intro } from "./Intro";
import { Details } from "./Details";
import { Couple } from "./Couple";
import { Quote } from "./Quote";
import { EventDetails } from "./EventDetails";
import { Countdown } from "./Countdown";
import { ImageBreak } from "./ImageBreak";
import { Story } from "./Story";
import { Gallery } from "./Gallery";
import { Wishes } from "./Wishes";
import { DigitalGift } from "./DigitalGift";
import { Closing } from "./Closing";
import { Opening } from "./Opening";

/**
 * Local section contract for Template 02 (Step 10A).
 *
 * Deliberately not shared with Ayutika's SectionKey (src/templates/ayutika/index.ts)
 * and not hoisted into a global type — each template owns its own key
 * union, matching the "genuinely structurally independent" requirement.
 * As with Ayutika, Opening is not a SectionKey: it is rendered directly
 * by the page and drives the showOpening lifecycle.
 */
export type SectionKey = "intro" | "details" | "couple" | "quote" | "eventDetails" | "countdown" | "imageBreak" | "story" | "gallery" | "wishes" | "gift" | "closing";

type SectionProps = {
  guestName?: string;
  guestSlug?: string;
  invitation: any;
  invitationId?: string | undefined;
};

/** Render order for the Template 02 proof-of-concept flow. */
export const template02SectionOrder: readonly SectionKey[] = [
  "intro",
  "details",
  "couple",
  "quote",
  "eventDetails",
  "countdown",
  "imageBreak",
  "story",
  "gallery",
  "wishes",
  "gift",
  "closing"
];

/** Maps each Template 02 SectionKey to its component. */
export const template02Sections: Record<SectionKey, ComponentType<SectionProps>> = {
  intro: Intro,
  details: Details,
  couple: Couple,
  quote: Quote,
  eventDetails: EventDetails,
  countdown: Countdown,
  imageBreak: ImageBreak,
  story: Story,
  gallery: Gallery,
  wishes: Wishes,
  gift: DigitalGift,
  closing: Closing,
};

export { Opening };