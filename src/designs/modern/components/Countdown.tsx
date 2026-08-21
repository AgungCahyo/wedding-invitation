"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { calculateTimeRemaining, type TimeRemaining } from "@/src/lib/countdown";
import { ModernSection } from "@/src/designs/modern/layout/ModernSection";
import { fadeUpModern, viewportOnce } from "@/src/designs/modern/motion";

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 min-w-0 py-5 px-3 md:px-5 border-l border-[var(--border)] first:border-l-0">
      <span className="block font-body font-medium text-[1.75rem] md:text-4xl tabular-nums leading-none tracking-tight">
        {String(value).padStart(2, "0")}
      </span>
      <span className="block text-[10px] font-body tracking-[0.2em] uppercase mt-2 text-[var(--text-tertiary)]">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  const [time, setTime] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    const update = () => setTime(calculateTimeRemaining());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ModernSection id="countdown" tone="muted" className="!py-10 md:!py-12">
      {time === null ? (
        <div className="h-16" aria-hidden="true" />
      ) : time.isPast ? (
        <p className="font-body text-sm">Hari ini hari kami.</p>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUpModern}
          className="flex border border-[var(--border)] bg-[var(--bg-primary)]"
          role="timer"
          aria-label="Hitung mundur menuju hari pernikahan"
        >
          <Unit value={time.days} label="Hari" />
          <Unit value={time.hours} label="Jam" />
          <Unit value={time.minutes} label="Menit" />
          <Unit value={time.seconds} label="Detik" />
        </motion.div>
      )}
    </ModernSection>
  );
}
