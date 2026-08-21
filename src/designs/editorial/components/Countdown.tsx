"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { invitation } from "@/src/data/invitation";
import { calculateTimeRemaining, type TimeRemaining } from "@/src/lib/countdown";
import { EditorialRule } from "@/src/designs/editorial/ornaments/EditorialRule";
import { editorialEasing, fadeUpEditorial, viewportOnce } from "@/src/designs/editorial/motion";

function TimeUnit({ value, label, delay }: { value: number; label: string; delay: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUpEditorial}
      transition={{ delay, duration: 0.8, ease: editorialEasing }}
      className="flex flex-col items-start min-w-[64px] sm:min-w-[84px] md:min-w-[96px]"
    >
      <span className="font-display text-[clamp(2.75rem,7vw,5rem)] text-[var(--text-primary)] tabular-nums leading-none tracking-tight">
        {String(value).padStart(2, "0")}
      </span>
      <span
        className="mt-3 md:mt-4 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
        style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
      >
        {label}
      </span>
    </motion.div>
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
    <section id="countdown" className="section bg-[var(--bg-secondary)]">
      <div className="section-inner max-w-xl">
        {time === null ? (
          <div className="h-28" aria-hidden="true" />
        ) : time.isPast ? (
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUpEditorial}
            transition={{ duration: 0.8, ease: editorialEasing }}
            className="font-display text-2xl md:text-3xl text-[var(--text-primary)] italic"
          >
            Hari ini hari kami.
          </motion.p>
        ) : (
          <>
            <div className="flex flex-wrap items-start gap-x-10 gap-y-8 mb-10 md:mb-12">
              <TimeUnit value={time.days} label="Hari" delay={0} />
              <TimeUnit value={time.hours} label="Jam" delay={0.08} />
              <TimeUnit value={time.minutes} label="Menit" delay={0.16} />
            </div>
            <EditorialRule align="left" className="mb-6" />
            <p
              className="text-[0.6875rem] font-medium uppercase tracking-[0.25em]"
              style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
            >
              {invitation.wedding.displayDate}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
