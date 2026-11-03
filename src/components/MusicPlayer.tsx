"use client";

import { Music, VolumeX } from "lucide-react";
import { useMusic } from "@/src/context/MusicContext";
import { BAR_BUTTON } from "@/src/lib/floating-bar";

export function MusicPlayer() {
  const { isPlaying, toggleMusic } = useMusic();

  return (
    <button
      type="button"
      onClick={toggleMusic}
      className={BAR_BUTTON}
      aria-label={isPlaying ? "Mute music" : "Play music"}
      aria-pressed={isPlaying}
    >
      {isPlaying ? (
        <Music size={18} strokeWidth={1.5} />
      ) : (
        <VolumeX size={18} strokeWidth={1.5} />
      )}
    </button>
  );
}
