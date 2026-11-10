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
import { Footer } from "@/src/components/Footer";

interface InvitationSectionsProps {
  /** Guest name for personalized sections (RSVP, Wishes, CatchTheLove) */
  guestName?: string;
  /** Whether to include Footer inside main (guest page) or outside (public page) */
  footerInsideMain?: boolean;
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
 * 13. Footer (conditionally inside or outside main)
 */
export function InvitationSections({
  guestName,
  footerInsideMain = false,
  welcomeSection,
}: InvitationSectionsProps) {
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
      <CatchTheLove guestName={guestName} />
      <DigitalGift />
      <Closing />
      {footerInsideMain && <Footer />}
    </>
  );
}