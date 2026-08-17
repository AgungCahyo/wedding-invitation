"use client";

import { motion } from "motion/react";
import { Music, VolumeX } from "lucide-react";
import { useMusic } from "@/src/context/MusicContext";

export function MusicPlayer() {
  const { isPlaying, toggleMusic } = useMusic();

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      onClick={toggleMusic}
      className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full border border-[var(--border)] bg-[var(--bg-primary)]/90 backdrop-blur-sm text-[var(--text-primary)] flex items-center justify-center shadow-sm hover:border-[var(--accent)] transition-colors duration-300"
      aria-label={isPlaying ? "Mute music" : "Play music"}
      aria-pressed={isPlaying}
    >
      {isPlaying ? (
        <Music size={20} strokeWidth={1.5} />
      ) : (
        <VolumeX size={20} strokeWidth={1.5} />
      )}

      {isPlaying && (
        <span className="absolute inset-0 rounded-full border border-[var(--accent)]/40 animate-ping opacity-30" aria-hidden="true" />
      )}
    </motion.button>
  );
}
