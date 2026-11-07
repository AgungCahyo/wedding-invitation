"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { invitation } from "@/src/data/invitation";
import { calculateTimeRemaining, type TimeRemaining } from "@/src/lib/countdown";
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
      className="flex flex-col items-center min-w-[72px] sm:min-w-[88px] md:min-w-[100px]"
    >
      <span className="font-display text-[clamp(2.75rem,7vw,5rem)] text-[var(--text-primary)] tabular-nums leading-none tracking-tight">
        {String(value).padStart(2, "0")}
      </span>
      <span className="eyebrow mt-4 md:mt-5">{label}</span>
    </motion.div>
  );
}

function Divider() {
  return (
    <span
      className="hidden sm:block w-px h-14 md:h-20 bg-[var(--border)] self-center shrink-0"
      aria-hidden="true"
    />
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
        {time === null ? (
          <div className="h-28" aria-hidden="true" />
        ) : time.isPast ? (
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={easeOut}
            className="text-center font-display text-2xl md:text-3xl text-[var(--text-primary)] italic"
          >
            Hari ini hari kami.
          </motion.p>
        ) : (
          <>
            <div
              className="flex flex-wrap justify-center items-start gap-x-8 sm:gap-x-0 sm:justify-between sm:max-w-xl md:max-w-2xl mx-auto"
              role="timer"
              aria-label="Hitung mundur menuju hari pernikahan"
            >
              <TimeUnit value={time.days} label="Hari" delay={0} />
              <Divider />
              <TimeUnit value={time.hours} label="Jam" delay={0.08} />
              <Divider />
              <TimeUnit value={time.minutes} label="Menit" delay={0.16} />
            </div>
            <p className="eyebrow text-center mt-12 md:mt-16">
              {invitation.wedding.displayDate}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
