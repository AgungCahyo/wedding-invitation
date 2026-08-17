"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { easeOut, fadeUp, lineReveal, viewportOnce } from "@/src/lib/motion";

export function Quote() {
  const { main, quranic, quranicTranslation, quranicReference } =
    invitation.quote;

  return (
    <section className="section bg-[var(--bg-secondary)]">
      <div className="section-inner">
        <div className="max-w-[var(--prose-max)] mx-auto text-center">
          <motion.blockquote
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={easeOut}
            className="font-display text-[clamp(1.5rem,4vw,2.75rem)] text-[var(--text-primary)] leading-[1.35] italic mb-14 md:mb-20"
          >
            &ldquo;{main}&rdquo;
          </motion.blockquote>

          {quranic && (
            <>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={lineReveal}
                transition={{ ...easeOut, delay: 0.1 }}
                className="w-10 h-px bg-[var(--accent)] mx-auto mb-12 origin-center"
              />

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={fadeUp}
                transition={{ ...easeOut, delay: 0.2 }}
                className="space-y-4"
              >
                <p
                  className="font-display text-lg md:text-xl text-[var(--text-tertiary)] leading-[1.9]"
                  dir="rtl"
                  lang="ar"
                >
                  {quranic}
                </p>
                <p className="text-sm md:text-base text-[var(--text-secondary)] font-body italic leading-relaxed">
                  {quranicTranslation}
                </p>
                {quranicReference && (
                  <p className="eyebrow">{quranicReference}</p>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
