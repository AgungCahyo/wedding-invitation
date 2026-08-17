"use client";

import { motion } from "motion/react";
import { useState, useRef } from "react";
import { Music, Pause } from "lucide-react";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.log(
            "Audio playback not allowed or audio file not found:",
            error
          );
          // Don't show error to user - just silently fail
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/audio/wedding.mp3"
        loop
        onEnded={() => {
          // Loop is handled by the loop attribute
        }}
        onError={() => {
          // Silently handle missing audio file
          console.log("Audio file not found or cannot be loaded");
        }}
      />

      {/* Floating music button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMusic}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 bg-[#2b2520] text-[#faf8f3] rounded-full flex items-center justify-center shadow-lg hover:bg-[#5a524a] transition-colors"
        title={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? <Pause size={24} /> : <Music size={24} />}
      </motion.button>

      {/* Playing indicator */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-8 right-24 md:bottom-10 md:right-28 z-40 text-[#2b2520] text-xs font-body tracking-widest"
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <motion.div
                animate={{ scaleY: [0.5, 1, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-0.5 h-2 bg-[#2b2520]"
              />
              <motion.div
                animate={{ scaleY: [0.5, 1, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                className="w-0.5 h-2 bg-[#2b2520]"
              />
              <motion.div
                animate={{ scaleY: [0.5, 1, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                className="w-0.5 h-2 bg-[#2b2520]"
              />
            </div>
            <span>Music Playing</span>
          </div>
        </motion.div>
      )}
    </>
  );
}
