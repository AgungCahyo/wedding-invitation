"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { calculateTimeRemaining, type TimeRemaining } from "@/src/lib/countdown";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

function TimeUnit({
  value,
  label,
  delay,
}: {
  value: number;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      transition={{ ...easeOut, delay }}
      className="flex flex-col items-center min-w-[64px] md:min-w-[88px]"
    >
      <span className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[var(--text-primary)] tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] md:text-xs text-[var(--text-tertiary)] tracking-[0.25em] uppercase font-body mt-3 md:mt-4">
        {label}
      </span>
    </motion.div>
  );
}

function Separator() {
  return (
    <span className="font-display text-2xl md:text-4xl text-[var(--accent-muted)] self-start mt-2 md:mt-3 select-none">
      :
    </span>
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
      <div className="section-inner">
        <SectionHeader label="Save The Date" />

        {time === null ? (
          <div className="h-24" aria-hidden="true" />
        ) : time.isPast ? (
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={easeOut}
            className="text-center font-display text-2xl md:text-3xl text-[var(--text-primary)] italic"
          >
            Today is the day!
          </motion.p>
        ) : (
          <div
            className="flex flex-wrap justify-center items-start gap-x-3 sm:gap-x-5 md:gap-x-8 lg:gap-x-12"
            role="timer"
            aria-label="Countdown to wedding day"
          >
            <TimeUnit value={time.days} label="Days" delay={0} />
            <Separator />
            <TimeUnit value={time.hours} label="Hours" delay={0.1} />
            <Separator />
            <TimeUnit value={time.minutes} label="Minutes" delay={0.2} />
            <Separator />
            <TimeUnit value={time.seconds} label="Seconds" delay={0.3} />
          </div>
        )}
      </div>
    </section>
  );
}
