"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useMusic } from "@/src/context/MusicContext";

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `[${pad(mins)}:${pad(secs)}.${ms}]`;
}

export function LyricsTester() {
  const { audioRef, isPlaying, toggleMusic } = useMusic();
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [copied, setCopied] = useState(false);

  // Sync current playback time continuously when open
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    updateProgress();

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [audioRef, isOpen]);

  const seekBy = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
    audio.currentTime = target;
    setCurrentTime(target);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleCopyTag = () => {
    const tag = formatTimestamp(currentTime);
    navigator.clipboard.writeText(tag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-5 left-18 sm:left-20 md:bottom-8 md:left-24 z-40 font-body">
      {/* Toggle Button */}
      {!isOpen && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="h-11 md:h-12 px-3.5 border border-[var(--border)] bg-[var(--bg-primary)]/95 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors duration-300 flex items-center gap-2 text-xs font-mono tracking-wider"
          title="Buka Panel Sync Lirik / Rewinder"
        >
          <SlidersHorizontal size={16} strokeWidth={1.5} />
          <span className="hidden sm:inline">Sync Helper</span>
        </motion.button>
      )}

      {/* Sync Testing Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-72 sm:w-80 bg-[var(--bg-primary)]/98 border border-[var(--border)] p-4 shadow-xl backdrop-blur-md space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <span className="font-medium text-[10px] text-[var(--accent)] uppercase tracking-widest">
                LRC Sync Helper / Rewinder
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1"
                title="Tutup Panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Current Timestamp Display */}
            <div className="flex items-center justify-between bg-[var(--bg-secondary)] border border-[var(--border)] p-2.5">
              <span className="font-mono text-base font-medium tracking-wider text-[var(--text-primary)]">
                {formatTimestamp(currentTime)}
              </span>

              <button
                type="button"
                onClick={handleCopyTag}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                title="Copy LRC Timestamp"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-600" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Tag</span>
                  </>
                )}
              </button>
            </div>

            {/* Scrubber Range Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-[var(--border)] appearance-none cursor-pointer accent-[var(--accent)]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--text-tertiary)]">
                <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")}</span>
                <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}</span>
              </div>
            </div>

            {/* Controls: Rewind & Fast Forward */}
            <div className="grid grid-cols-5 gap-1 pt-1">
              <button
                type="button"
                onClick={() => seekBy(-5)}
                className="py-1.5 text-[11px] font-mono border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center gap-0.5"
                title="Mundur 5 Detik"
              >
                <RotateCcw size={12} />
                <span>-5s</span>
              </button>

              <button
                type="button"
                onClick={() => seekBy(-1)}
                className="py-1.5 text-[11px] font-mono border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center gap-0.5"
                title="Mundur 1 Detik"
              >
                <RotateCcw size={12} />
                <span>-1s</span>
              </button>

              <button
                type="button"
                onClick={toggleMusic}
                className="py-1.5 text-[11px] font-mono bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity flex items-center justify-center"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>

              <button
                type="button"
                onClick={() => seekBy(1)}
                className="py-1.5 text-[11px] font-mono border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center gap-0.5"
                title="Maju 1 Detik"
              >
                <span>+1s</span>
                <RotateCw size={12} />
              </button>

              <button
                type="button"
                onClick={() => seekBy(5)}
                className="py-1.5 text-[11px] font-mono border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center gap-0.5"
                title="Maju 5 Detik"
              >
                <span>+5s</span>
                <RotateCw size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}