"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MusicProvider } from "@/src/context/MusicContext";
import { Opening } from "@/src/components/Opening";
import { Couple } from "@/src/components/Couple";
import { Quote } from "@/src/components/Quote";
import { EventDetails } from "@/src/components/EventDetails";
import { Countdown } from "@/src/components/Countdown";
import { Story } from "@/src/components/Story";
import { Gallery } from "@/src/components/Gallery";
import { RSVP } from "@/src/components/RSVP";
import { Wishes } from "@/src/components/Wishes";
import { PhotoBooth } from "@/src/components/PhotoBooth";
import { DigitalGift } from "@/src/components/DigitalGift";
import { Closing } from "@/src/components/Closing";
import { LyricsRail } from "@/src/components/LyricsRail";
import { FloatingBar } from "@/src/components/FloatingBar";
import { ImageBreak } from "@/src/components/ImageBreak";
import { Footer } from "@/src/components/Footer";

export default function Home() {
  const [showOpening, setShowOpening] = useState(true);
  const [autoOpenCamera, setAutoOpenCamera] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get("camera") === "open") {
      setShowOpening(false);
      setAutoOpenCamera(true);

      url.searchParams.delete("camera");

      window.history.replaceState(
        {},
        "",
        `${url.pathname}${url.search}${url.hash}`
      );
    }
  }, []);
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
          <PhotoBooth autoOpen={autoOpenCamera} />
          <DigitalGift />
          <Closing />
          <Footer />
          <LyricsRail />
          {/* <LyricsTester /> */}
          <FloatingBar />
        </motion.main>
      )}
    </MusicProvider>
  );
}
