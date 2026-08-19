"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { easeOut, easeOutSlow, fadeUp, scaleIn, viewportOnce } from "@/src/lib/motion";

/**
 * Full-bleed editorial image break — a magazine-style breather between
 * text-heavy sections. The photo still bleeds edge-to-edge, but the
 * caption now sits below it on plain ground in the same italic-serif
 * voice as Quote/Story (instead of stacked over a dark gradient), and
 * sizing uses aspect-ratio + a max-height cap rather than raw vh units,
 * so it stays consistent across phones, tablets, and wide desktops.
 */
export function ImageBreak() {
  const { breather } = invitation;
  if (!breather) return null;

  return (
    <section className="bg-[var(--bg-primary)]">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={scaleIn}
        transition={easeOutSlow}
        className="relative w-full aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/9] max-h-[70vh] overflow-hidden"
      >
        <Image
          src={breather.image}
          alt={breather.caption ?? ""}
          fill
          className="object-cover"
          sizes="100vw"
          placeholder={getBlurDataURL(breather.image) ? "blur" : "empty"}
          blurDataURL={getBlurDataURL(breather.image)}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 md:inset-8"
        >
          <span className="absolute top-0 left-0 w-9 h-9 md:w-12 md:h-12 border-t border-l border-[var(--background)]/45" />
          <span className="absolute bottom-0 right-0 w-9 h-9 md:w-12 md:h-12 border-b border-r border-[var(--background)]/45" />
        </div>
      </motion.div>

      {breather.caption && (
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.1 }}
          className="text-center font-display italic text-base md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto px-6 py-10 md:py-14"
        >
          &ldquo;{breather.caption}&rdquo;
        </motion.p>
      )}
    </section>
  );
}