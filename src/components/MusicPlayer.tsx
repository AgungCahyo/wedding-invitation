"use client";

import { motion } from "motion/react";
import { Music, VolumeX } from "lucide-react";
import { useMusic } from "@/src/context/MusicContext";

export function MusicPlayer() {
  const { isPlaying, toggleMusic } = useMusic();

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1 }}
      onClick={toggleMusic}
      className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40 w-11 h-11 md:w-12 md:h-12 border border-[var(--border)] bg-[var(--bg-primary)]/95 text-[var(--text-primary)] flex items-center justify-center hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-300"
      aria-label={isPlaying ? "Mute music" : "Play music"}
      aria-pressed={isPlaying}
    >
      {isPlaying ? (
        <Music size={18} strokeWidth={1.5} />
      ) : (
        <VolumeX size={18} strokeWidth={1.5} />
      )}
    </motion.button>
  );
}
