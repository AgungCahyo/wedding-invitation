"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { SectionBackdrop } from "@/src/designs/romantic/ui/SectionBackdrop";
import { Flourish } from "@/src/designs/romantic/ui/Flourish";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function Quote() {
  const { quranic, quranicTranslation, quranicReference } = invitation.quote;

  return (
    <section className="relative section bg-[var(--bg-secondary)] overflow-hidden">
      <SectionBackdrop src={invitation.cover.image} position="center 30%" />
      <div className="relative z-10 section-inner">
        <div className="max-w-[var(--prose-max)] mx-auto text-center py-6 md:py-10">
          <motion.blockquote
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={easeOut}
            className="font-display text-[clamp(1.5rem,3.8vw,2.15rem)] text-[var(--text-primary)] leading-[2] text-balance"
            dir="rtl"
            lang="ar"
          >
            {quranic}
          </motion.blockquote>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.1 }}
            className="flex justify-center my-10 md:my-14"
          >
            <Flourish className="text-[var(--accent)] opacity-70" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.16 }}
          >
            <p className="text-sm md:text-[0.95rem] text-[var(--text-secondary)] font-body italic leading-relaxed max-w-md mx-auto">
              {quranicTranslation}
            </p>
            {quranicReference && (
              <p className="eyebrow mt-6">{quranicReference}</p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
