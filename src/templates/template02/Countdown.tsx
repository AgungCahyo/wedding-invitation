"use client";

import { motion } from "motion/react";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";
import React from "react";

export function Countdown({ guestName = "", guestSlug = "", invitation, invitationId }: {
  guestName?: string;
  guestSlug?: string;
  invitation: any;
  invitationId?: string | undefined;
}) {
  const { wedding } = invitation;

  // Calculate time difference for countdown
  const getTimeRemaining = () => {
    const weddingDate = new Date(wedding.date);
    const now = new Date();
    const diffTime = weddingDate.getTime() - now.getTime();

    if (diffTime <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const seconds = Math.floor((diffTime / 1000) % 60);
    const minutes = Math.floor((diffTime / 1000 / 60) % 60);
    const hours = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      days,
      hours,
      minutes,
      seconds,
      total: diffTime
    };
  };

  // For SSR safety, we'll calculate on client only
  const [timeData, setTimeData] = React.useState(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      return getTimeRemaining();
    }
    // Return placeholder for SSR
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateCountdown = () => {
      setTimeData(getTimeRemaining());
    };

    // Update every second
    const timer = setInterval(updateCountdown, 1000);
    // Initial update
    updateCountdown();

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="countdown" className="section bg-[var(--bg-secondary)]">
      <div className="section-inner max-w-2xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.1 }}
          className="mb-12 text-center"
        >
          <h1 className="font-display text-[clamp(2.25rem,5vw,3rem)] tracking-tight leading-none text-[var(--text-primary)] mb-4">
            Hari Besar Kita
          </h1>
          <p className="font-body text-lg md:text-xl leading-relaxed text-[var(--text-secondary)]">
            Hitung mundur hingga momen bahagia tiba
          </p>
        </motion.div>

        {timeData.total > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.3 }}
            className="grid gap-6 md:grid-cols-4 text-center"
          >
            <div className="space-y-3">
              <div className="font-display text-[clamp(3rem,8vw,4.5rem)] font-bold text-[var(--text-primary)]">
                {timeData.days}
              </div>
              <p className="font-body text-sm text-[var(--text-tertiary)] uppercase tracking-widest">
                Hari
              </p>
            </div>
            <div className="space-y-3">
              <div className="font-display text-[clamp(3rem,8vw,4.5rem)] font-bold text-[var(--text-primary)]">
                {timeData.hours}
              </div>
              <p className="font-body text-sm text-[var(--text-tertiary)] uppercase tracking-widest">
                Jam
              </p>
            </div>
            <div className="space-y-3">
              <div className="font-display text-[clamp(3rem,8vw,4.5rem)] font-bold text-[var(--text-primary)]">
                {timeData.minutes}
              </div>
              <p className="font-body text-sm text-[var(--text-tertiary)] uppercase tracking-widest">
                Menit
              </p>
            </div>
            <div className="space-y-3">
              <div className="font-display text-[clamp(3rem,8vw,4.5rem)] font-bold text-[var(--text-primary)]">
                {timeData.seconds}
              </div>
              <p className="font-body text-sm text-[var(--text-tertiary)] uppercase tracking-widest">
                Detik
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.3 }}
            className="text-center py-12"
          >
            <p className="font-display text-[clamp(2rem,5vw,2.75rem)] text-[var(--text-primary)]">
              Hari besar telah tiba!
            </p>
            <p className="font-body text-base text-[var(--text-tertiary)] mt-4">
              Selamat menjalani hidup baru bersama.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}