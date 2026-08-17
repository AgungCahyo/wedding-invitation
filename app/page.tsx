"use client";

import { useState } from "react";
import { Opening } from "@/src/components/Opening";
import { Couple } from "@/src/components/Couple";
import { Quote } from "@/src/components/Quote";
import { EventDetails } from "@/src/components/EventDetails";
import { Countdown } from "@/src/components/Countdown";
import { Story } from "@/src/components/Story";
import { Gallery } from "@/src/components/Gallery";
import { RSVP } from "@/src/components/RSVP";
import { Wishes } from "@/src/components/Wishes";
import { DigitalGift } from "@/src/components/DigitalGift";
import { Closing } from "@/src/components/Closing";
import { MusicPlayer } from "@/src/components/MusicPlayer";

export default function Home() {
  const [showOpening, setShowOpening] = useState(true);

  const handleEnterInvitation = () => {
    setShowOpening(false);
  };

  return (
    <>
      {/* Opening screen */}
      {showOpening && <Opening onEnter={handleEnterInvitation} />}

      {/* Main content */}
      {!showOpening && (
        <>
          {/* Couple section */}
          <Couple />

          {/* Quote section */}
          <Quote />

          {/* Event details section */}
          <EventDetails />

          {/* Countdown section */}
          <Countdown />

          {/* Story section */}
          <Story />

          {/* Gallery section */}
          <Gallery />

          {/* RSVP section */}
          <RSVP />

          {/* Wishes section */}
          <Wishes />

          {/* Digital gift section */}
          <DigitalGift />

          {/* Closing section */}
          <Closing />

          {/* Music player */}
          <MusicPlayer />
        </>
      )}
    </>
  );
}
