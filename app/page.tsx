"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MusicProvider } from "@/src/context/MusicContext";
import { Opening } from "@/src/designs/romantic/components/Opening";
import { Couple } from "@/src/designs/romantic/components/Couple";
import { Quote } from "@/src/designs/romantic/components/Quote";
import { EventDetails } from "@/src/designs/romantic/components/EventDetails";
import { Countdown } from "@/src/designs/romantic/components/Countdown";
import { Story } from "@/src/designs/romantic/components/Story";
import { Gallery } from "@/src/designs/romantic/components/Gallery";
import { RSVP } from "@/src/designs/romantic/components/RSVP";
import { Wishes } from "@/src/designs/romantic/components/Wishes";
import { DigitalGift } from "@/src/designs/romantic/components/DigitalGift";
import { Closing } from "@/src/designs/romantic/components/Closing";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { LyricsRail } from "@/src/components/LyricsRail";
import { AutoScroll } from "@/src/components/AutoScroll";
import { ImageBreak } from "@/src/designs/romantic/components/ImageBreak";
import { Footer } from "@/src/components/Footer";

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
