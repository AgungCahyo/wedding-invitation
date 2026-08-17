"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { easeOut, fadeUp, lineReveal, viewportOnce } from "@/src/lib/motion";

export function Closing() {
  const { closing } = invitation;

  return (
    <section
      id="closing"
      className="section bg-[var(--bg-secondary)] min-h-[65vh] flex items-center"
    >
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
            variants={lineReveal}
            transition={{ ...easeOut, delay: 0.2 }}
            className="w-12 h-px bg-[var(--accent)] mx-auto mb-10 md:mb-12 origin-center"
          />

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
