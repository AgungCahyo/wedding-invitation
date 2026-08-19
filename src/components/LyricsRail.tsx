"use client";

import { AnimatePresence, motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { useSyncedLyrics } from "../hooks/useSyncedLyrics";

export function LyricsRail() {
  const { activeLine, isReady, isPlaying } = useSyncedLyrics(invitation.audio.lyricsSrc);

  if (!isReady || !isPlaying || !activeLine) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 pointer-events-none max-h-[85vh] flex items-center justify-center"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={`${activeLine.time}-${activeLine.text}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ writingMode: "vertical-rl" }}
          className="font-display italic text-[11px] sm:text-[12px] md:text-[13px] text-[var(--text-secondary)]/70 tracking-[0.1em] whitespace-nowrap max-h-[80vh]"
        >
          {activeLine.text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
