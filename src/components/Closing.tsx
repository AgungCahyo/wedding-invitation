"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { FloralAccent } from "@/src/components/ui/FloralAccent";
import { easeOut, fadeUp, lineReveal, viewportOnce } from "@/src/lib/motion";

export function Closing() {
  const { closing } = invitation;

  return (
    <section id="closing" className="section bg-[var(--bg-secondary)] min-h-[70vh] flex items-center">
      <div className="section-inner w-full">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={easeOut}
            className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-10 md:mb-14 rounded-full overflow-hidden"
          >
            <Image
              src={invitation.cover.image}
              alt={closing.couple}
              fill
              className="object-cover"
              sizes="160px"
            />
          </motion.div>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.1 }}
            className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[var(--text-primary)] leading-snug mb-10 md:mb-12"
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
            className="font-display text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] mb-8"
          >
            {closing.couple}
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.4 }}
          >
            <FloralAccent className="mx-auto opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
