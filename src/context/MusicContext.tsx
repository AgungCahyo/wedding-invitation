"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { invitation } from "@/src/data/invitation";

interface MusicContextValue {
  isPlaying: boolean;
  toggleMusic: () => void;
  startMusic: () => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play().then(() => setIsPlaying(true)).catch(() => {
      // Browser blocked autoplay or file missing — fail silently
    });
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  return (
    <MusicContext.Provider value={{ isPlaying, toggleMusic, startMusic }}>
      <audio
        ref={audioRef}
        src={invitation.audio.src}
        loop
        preload="none"
        onError={() => {}}
      />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within MusicProvider");
  }
  return context;
}
