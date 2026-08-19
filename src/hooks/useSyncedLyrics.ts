"use client";

import { useEffect, useState, startTransition } from "react";
import { parseLRC, type LyricLine } from "../lib/lrc-parser";
import { useMusic } from "@/src/context/MusicContext";

interface UseSyncedLyricsResult {
  activeLine: LyricLine | null;
  /** True once the .lrc file has been fetched and parsed into at least one line */
  isReady: boolean;
  isPlaying: boolean;
}

export function useSyncedLyrics(
  lrcPath: string | undefined,
  offsetSeconds: number = 0
): UseSyncedLyricsResult {
  const { audioRef, isPlaying } = useMusic();
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Load & parse the .lrc file once per path.
  useEffect(() => {
    if (!lrcPath) {
      startTransition(() => {
        setLines(null);
      });
      return;
    }

    let cancelled = false;

    fetch(lrcPath)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error("lyrics file not found"))))
      .then((text) => {
        if (cancelled) return;
        const parsed = parseLRC(text);
        const adjusted = parsed
          .map((line) => ({ ...line, time: Math.max(0, line.time + offsetSeconds) }))
          .sort((a, b) => a.time - b.time);
        startTransition(() => {
          setLines(adjusted.length > 0 ? adjusted : null);
        });
      })
      .catch(() => {
        // Missing/empty lyrics file — fail silently, the rail just won't render.
        if (!cancelled) {
          startTransition(() => {
            setLines(null);
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lrcPath, offsetSeconds]);

  // Track playback position directly on the <audio> element (bypasses React
  // state for currentTime itself, so this doesn't re-render on every tick
  // except when the active line actually changes).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !lines || lines.length === 0) {
      startTransition(() => {
        setActiveIndex(-1);
      });
      return;
    }

    const handleTimeUpdate = () => {
      const t = audio.currentTime;
      let idx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i]!.time <= t) idx = i;
        else break;
      }
      setActiveIndex((prev) => (prev === idx ? prev : idx));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    handleTimeUpdate();

    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [audioRef, lines]);

  return {
    activeLine: lines && activeIndex >= 0 ? lines[activeIndex]! : null,
    isReady: Boolean(lines),
    isPlaying,
  };
}
