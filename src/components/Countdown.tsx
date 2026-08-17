"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { invitation } from "@/src/data/invitation";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown() {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeRemaining = () => {
      // Parse the wedding date (format: YYYY-MM-DD)
      const weddingDate = new Date(invitation.wedding.date);
      // Set to 00:00:00 in Jakarta timezone
      weddingDate.setHours(0, 0, 0, 0);

      // Get current time in Jakarta timezone
      const jakartaTime = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
      );

      const difference = weddingDate.getTime() - jakartaTime.getTime();

      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference / (1000 * 60 * 60)) % 24
          ),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
      }
    };

    // Calculate immediately
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  const TimeUnit = ({
    value,
    label,
    index,
  }: {
    value: number;
    label: string;
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex flex-col items-center"
    >
      <div className="text-3xl md:text-5xl lg:text-6xl font-display text-[#2b2520] mb-2 md:mb-4 min-w-20 text-center">
        {String(value).padStart(2, "0")}
      </div>
      <p className="text-xs md:text-sm text-[#8b7f76] tracking-widest font-body">
        {label}
      </p>
    </motion.div>
  );

  return (
    <section className="section bg-white">
      <div className="section-inner">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#e8e3dd]" />
            <p className="text-[#8b7f76] text-xs tracking-widest font-body">
              MENGHITUNG HARI
            </p>
            <div className="flex-1 h-px bg-[#e8e3dd]" />
          </div>
        </motion.div>

        {/* Countdown grid */}
        <div className="flex justify-center items-center gap-4 md:gap-8 lg:gap-12">
          <TimeUnit value={timeRemaining.days} label="Days" index={0} />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl text-[#c9a876] font-display"
          >
            :
          </motion.div>
          <TimeUnit value={timeRemaining.hours} label="Hours" index={1} />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl text-[#c9a876] font-display"
          >
            :
          </motion.div>
          <TimeUnit value={timeRemaining.minutes} label="Minutes" index={2} />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl text-[#c9a876] font-display"
          >
            :
          </motion.div>
          <TimeUnit value={timeRemaining.seconds} label="Seconds" index={3} />
        </div>
      </div>
    </section>
  );
}
