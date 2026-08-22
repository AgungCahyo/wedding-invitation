"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MusicProvider } from "@/src/context/MusicContext";
import { Opening } from "@/src/templates/ayutika/Opening";
import { Couple } from "@/src/templates/ayutika/Couple";
import { Quote } from "@/src/templates/ayutika/Quote";
import { EventDetails } from "@/src/templates/ayutika/EventDetails";
import { Countdown } from "@/src/templates/ayutika/Countdown";
import { Story } from "@/src/templates/ayutika/Story";
import { Gallery } from "@/src/templates/ayutika/Gallery";
import { RSVP } from "@/src/templates/ayutika/RSVP";
import { Wishes } from "@/src/templates/ayutika/Wishes";
import { DigitalGift } from "@/src/templates/ayutika/DigitalGift";
import { Closing } from "@/src/templates/ayutika/Closing";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { LyricsRail } from "@/src/components/LyricsRail";
import { ImageBreak } from "@/src/templates/ayutika/ImageBreak";
import { Footer } from "@/src/components/Footer";
import { AutoScroll } from "@/src/components/AutoScroll";

export default function Home() {
  const [showOpening, setShowOpening] = useState(true);

  return (
    <MusicProvider>
      <AnimatePresence mode="wait">
        {showOpening && (
          <Opening key="opening" onEnter={() => setShowOpening(false)} />
        )}
      </AnimatePresence>

      {!showOpening && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Couple />
          <Quote />
          <EventDetails />
          <Countdown />
          <ImageBreak />
          <Story />
          <Gallery />
          <RSVP />
          <Wishes />
          <DigitalGift />
          <Closing />
          <Footer />
          <MusicPlayer />
          <LyricsRail />
          {/* <LyricsTester /> */}
          <AutoScroll enabled={!showOpening} />
        </motion.main>
      )}
    </MusicProvider>
  );
}
