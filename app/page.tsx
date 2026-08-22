"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MusicProvider } from "@/src/context/MusicContext";
import { Opening } from "@/src/templates/ayutika/Opening";
import { ayutikaSectionOrder, ayutikaSections } from "@/src/templates/ayutika";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { LyricsRail } from "@/src/components/LyricsRail";
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
          {ayutikaSectionOrder.map((key) => {
            const Section = ayutikaSections[key];
            return <Section key={key} />;
          })}
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