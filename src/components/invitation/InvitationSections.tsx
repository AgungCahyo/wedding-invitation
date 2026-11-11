"use client";

import { Couple } from "@/src/components/Couple";
import { Quote } from "@/src/components/Quote";
import { EventDetails } from "@/src/components/EventDetails";
import { Countdown } from "@/src/components/Countdown";
import { ImageBreak } from "@/src/components/ImageBreak";
import { Story } from "@/src/components/Story";
import { Gallery } from "@/src/components/Gallery";
import { RSVP } from "@/src/components/RSVP";
import { Wishes } from "@/src/components/Wishes";
import { CatchTheLove } from "@/src/components/CatchTheLove";
import { DigitalGift } from "@/src/components/DigitalGift";
import { Closing } from "@/src/components/Closing";

interface InvitationSectionsProps {
  /** Guest name for personalized sections (RSVP, Wishes, CatchTheLove) */
  guestName?: string;
  /** Optional welcome/personal section for guest page */
  welcomeSection?: React.ReactNode;
}

/**
 * Shared invitation section order used by both public and guest pages.
 * Section order:
 * 1. Couple
 * 2. Quote
 * 3. EventDetails
 * 4. Countdown
 * 5. ImageBreak
 * 6. Story
 * 7. Gallery
 * 8. RSVP
 * 9. Wishes
 * 10. CatchTheLove
 * 11. DigitalGift
 * 12. Closing
 */
export function InvitationSections({
  guestName,
  welcomeSection,
}: InvitationSectionsProps) {
  // Only pass guestName to CatchTheLove if it's a real name (not the "Tamu" fallback)
  const catchTheLoveGuestName = guestName && guestName !== "Tamu" ? guestName : undefined;

  return (
    <>
      {welcomeSection}
      <Couple />
      <Quote />
      <EventDetails />
      <Countdown />
      <ImageBreak />
      <Story />
      <Gallery />
      <RSVP guestName={guestName} />
      <Wishes guestName={guestName} />
      <CatchTheLove guestName={catchTheLoveGuestName} />
      <DigitalGift />
      <Closing />
    </>
  );
}