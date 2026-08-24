"use client";

import { invitation } from '@/src/data/invitation';
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MusicProvider } from "@/src/context/MusicContext";
import { activeTemplateImplementation } from "@/src/templates/active-template";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { LyricsRail } from "@/src/components/LyricsRail";
import { Footer } from "@/src/components/Footer";
import { AutoScroll } from "@/src/components/AutoScroll";

const LEGACY_INVITATION_ID = "ce1776ad-79ca-4578-80d0-b708aeb1aa21";

export default function Home() {
  const [showOpening, setShowOpening] = useState(true);
  const { Opening, sectionOrder, sections } = activeTemplateImplementation;

  return (
    <MusicProvider invitation={invitation}>
      <AnimatePresence mode="wait">
        {showOpening && (
          <Opening key="opening" onEnter={() => setShowOpening(false)} invitation={invitation} />
        )}
      </AnimatePresence>

      {!showOpening && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {sectionOrder.map((key) => {
            const Section = sections[key];
            return (
              <Section
                key={key}
                invitation={invitation}
                invitationId={LEGACY_INVITATION_ID}
              />
            );
          })}
          <Footer invitation={invitation} />
          <MusicPlayer />
          <LyricsRail invitation={invitation} />
          {/* <LyricsTester /> */}
          <AutoScroll enabled={!showOpening} />
        </motion.main>
      )}
    </MusicProvider>
  );
}