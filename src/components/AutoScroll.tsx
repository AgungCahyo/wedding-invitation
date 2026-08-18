"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { PauseCircle, PlayCircle } from "lucide-react";

// Slow, readable pace — roughly 33px/sec at 60fps.
const SCROLL_SPEED = 0.55;

interface AutoScrollProps {
  /** Auto-scroll only runs once the invitation itself is open. */
  enabled: boolean;
}

/**
 * Auto-scrolls the page once the invitation is opened, with a floating
 * toggle so the guest can pause/resume at any time. Any manual scroll
 * (wheel or touch) pauses it automatically, the same way a guest
 * would expect — it never fights the reader's own input.
 */
export function AutoScroll({ enabled }: AutoScrollProps) {
  const [isOn, setIsOn] = useState(true);
  const rafRef = useRef<number | null>(null);

  // The scroll loop itself
  useEffect(() => {
    if (!enabled || !isOn) return;

    const tick = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      if (window.scrollY >= maxScroll - 2) {
        setIsOn(false);
        return;
      }

      window.scrollBy(0, SCROLL_SPEED);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, isOn]);

  // Hand control back to the guest the moment they scroll themselves
  useEffect(() => {
    if (!enabled || !isOn) return;

    const pause = () => setIsOn(false);

    window.addEventListener("wheel", pause, { passive: true });
    window.addEventListener("touchmove", pause, { passive: true });
    return () => {
      window.removeEventListener("wheel", pause);
      window.removeEventListener("touchmove", pause);
    };
  }, [enabled, isOn]);

  if (!enabled) return null;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1 }}
      onClick={() => setIsOn((prev) => !prev)}
      className="fixed bottom-5 left-5 md:bottom-8 md:left-8 z-40 w-11 h-11 md:w-12 md:h-12 border border-[var(--border)] bg-[var(--bg-primary)]/95 text-[var(--text-primary)] flex items-center justify-center hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-300"
      aria-label={isOn ? "Pause auto scroll" : "Resume auto scroll"}
      aria-pressed={isOn}
    >
      {isOn ? (
        <PauseCircle size={18} strokeWidth={1.5} />
      ) : (
        <PlayCircle size={18} strokeWidth={1.5} />
      )}
    </motion.button>
  );
}