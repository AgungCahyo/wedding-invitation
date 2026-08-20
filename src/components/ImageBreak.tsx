"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { easeOut, easeOutSlow, fadeUp, scaleIn, viewportOnce } from "@/src/lib/motion";

/**
 * Quiet full-bleed image between text-heavy sections.
 * Photo first, caption as a single line of type — no plate, no frame.
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
      </motion.div>

      {breather.caption && (
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.08 }}
          className="text-center font-display italic text-base md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto px-6 py-10 md:py-14"
        >
          {breather.caption}
        </motion.p>
      )}
    </section>
  );
}
