"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { editorialEasing, fadeUpEditorial, viewportOnce } from "@/src/designs/editorial/motion";

/** Full-bleed photo with a left-aligned caption underneath — magazine photo-spread pacing. */
export function ImageBreak() {
  const { breather } = invitation;
  if (!breather) return null;

  return (
    <section className="bg-[var(--bg-primary)]">
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 1.1, ease: editorialEasing }}
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
          variants={fadeUpEditorial}
          transition={{ delay: 0.1, duration: 0.8, ease: editorialEasing }}
          className="font-display italic text-base md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-lg px-6 md:px-14 lg:px-20 py-10 md:py-14"
        >
          {breather.caption}
        </motion.p>
      )}
    </section>
  );
}
