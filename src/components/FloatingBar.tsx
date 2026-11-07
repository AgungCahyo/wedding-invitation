"use client";

import { motion } from "motion/react";
import { Camera, Gamepad2 } from "lucide-react";
import { AutoScroll } from "@/src/components/AutoScroll";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { ThemeMenuButton } from "@/src/components/ThemeSwitcher";
import { OPEN_PHOTOBOOTH_EVENT } from "@/src/lib/floating-bar";

function Divider() {
  return <span aria-hidden className="w-px h-5 bg-[var(--border)]" />;
}

/**
 * One floating bar for the guest's controls: auto-scroll · music · photo booth.
 * Rendered only once the invitation is open.
 */
export function FloatingBar() {
  return (
    <div className="fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] md:bottom-8 z-40 flex justify-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1, ease: [0.25, 0.1, 0.25, 1] }}
        role="toolbar"
        aria-label="Kontrol undangan"
        className="pointer-events-auto flex items-center border border-[var(--border)] bg-[var(--bg-primary)]/90 backdrop-blur-md shadow-[0_12px_30px_-14px_rgba(0,0,0,0.35)]"
      >
        <AutoScroll enabled />
        <Divider />
        <MusicPlayer />
        <Divider />
        <ThemeMenuButton />
        <Divider />
        <button
          type="button"
          onClick={() => document.getElementById("game")?.scrollIntoView({ behavior: "smooth", block: "center" })}
          aria-label="Ke permainan Catch the Love"
          className="w-12 h-11 md:w-14 md:h-12 flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors duration-300"
        >
          <Gamepad2 size={18} strokeWidth={1.5} />
        </button>
        <Divider />
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_PHOTOBOOTH_EVENT))}
          aria-label="Buka Photo Booth"
          className="w-12 h-11 md:w-14 md:h-12 flex items-center justify-center bg-[var(--accent)] text-[var(--bg-primary)] hover:brightness-110 transition duration-300"
        >
          <Camera size={18} strokeWidth={1.5} />
        </button>
      </motion.div>
    </div>
  );
}
