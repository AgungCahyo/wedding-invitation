"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { invitation } from "@/src/data/invitation";

interface MusicContextValue {
  isPlaying: boolean;
  toggleMusic: () => void;
  startMusic: () => void;
  /** Exposed so consumers (e.g. synced lyrics) can listen to playback
   * events directly, without routing currentTime through React state
   * and re-rendering the whole tree ~4x/sec. */
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Whether playback should resume once the tab becomes visible again.
  // Separate from `isPlaying`, which always mirrors the audio element's
  // real state (see the play/pause listeners below).
  const resumeOnVisibleRef = useRef(false);

  // Keep `isPlaying` in sync with the <audio> element itself instead of
  // setting it by hand in every call site — that way it stays correct no
  // matter what paused or resumed it (visibility change, browser media
  // keys, etc.), and toggleMusic/startMusic can't race a stale value.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  // Browsers don't pause <audio> automatically when a tab is hidden or
  // minimized — do it manually, and resume when the guest comes back if
  // it was them (not us) who was playing it.
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        if (!audio.paused) {
          resumeOnVisibleRef.current = true;
          audio.pause();
        }
      } else if (resumeOnVisibleRef.current) {
        resumeOnVisibleRef.current = false;
        audio.play().catch(() => {
          // Some browsers require a fresh user gesture to resume — fail silently.
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const startMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play().catch(() => {
      // Browser blocked autoplay or file missing — fail silently
    });
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, []);

  return (
    <MusicContext.Provider value={{ isPlaying, toggleMusic, startMusic, audioRef }}>
      <audio
        ref={audioRef}
        src={invitation.audio.src}
        loop
        preload="auto"
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