"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { FloralAccent } from "@/src/components/ui/FloralAccent";
import { easeOut, fadeUp, scaleIn, viewportOnce } from "@/src/lib/motion";

export function Closing() {
  const { closing } = invitation;

  return (
    <section
      id="closing"
      className="section bg-[var(--bg-secondary)] min-h-[65vh] flex items-center relative"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 md:inset-8"
      >
        <span className="absolute top-0 left-0 w-9 h-9 md:w-12 md:h-12 border-t border-l border-[var(--border)]" />
        <span className="absolute bottom-0 right-0 w-9 h-9 md:w-12 md:h-12 border-b border-r border-[var(--border)]" />
      </div>

      <div className="section-inner w-full">
        <div className="max-w-[var(--prose-max)] mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={easeOut}
            className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-10 md:mb-14 overflow-hidden"
          >
            <Image
              src={invitation.cover.image}
              alt={closing.couple}
              fill
              className="object-cover object-[center_20%]"
              sizes="144px"
            />
          </motion.div>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.1 }}
            className="font-display text-[clamp(1.5rem,4vw,2.5rem)] text-[var(--text-primary)] leading-[1.35] mb-10 md:mb-12"
          >
            {closing.message}
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={scaleIn}
            transition={{ ...easeOut, delay: 0.2 }}
            className="mb-10 md:mb-12 flex justify-center"
          >
            <FloralAccent className="w-16 md:w-20 opacity-50" />
          </motion.div>

          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.3 }}
            className="display-heading text-[clamp(2.25rem,6vw,3.75rem)]"
          >
            {closing.couple}
          </motion.h2>
        </div>
      </div>
    </section>
  );
}