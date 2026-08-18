"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { easeOutSlow, scaleIn, viewportOnce } from "@/src/lib/motion";

/**
 * Full-bleed editorial image break.
 * Used as a visual "breather" between text-heavy sections —
 * magazine-style full-page photo spread, not a content section.
 */
export function ImageBreak() {
  const { breather } = invitation;
  if (!breather) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={scaleIn}
      transition={easeOutSlow}
      className="relative w-full h-[52vh] md:h-[68vh] overflow-hidden"
      aria-hidden={!breather.caption}
    >
      <Image
        src={breather.image}
        alt={breather.caption ?? ""}
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/55 via-transparent to-transparent" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 md:inset-8"
      >
        <span className="absolute top-0 left-0 w-9 h-9 md:w-12 md:h-12 border-t border-l border-[var(--background)]/35" />
        <span className="absolute bottom-0 right-0 w-9 h-9 md:w-12 md:h-12 border-b border-r border-[var(--background)]/35" />
      </div>

      {breather.caption && (
        <p className="absolute bottom-6 md:bottom-10 left-0 right-0 text-center font-display italic text-base md:text-xl text-[var(--background)]/90 px-6">
          {breather.caption}
        </p>
      )}
    </motion.section>
  );
}