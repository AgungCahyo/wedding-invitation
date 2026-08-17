"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { FloralAccent } from "@/src/components/ui/FloralAccent";
import { easeOut, fadeUp, lineReveal, viewportOnce } from "@/src/lib/motion";

export function Quote() {
  const { main, quranic, quranicTranslation, quranicReference } =
    invitation.quote;

  return (
    <section className="section bg-[var(--bg-secondary)]">
      <div className="section-inner">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={easeOut}
            className="mb-10"
          >
            <FloralAccent className="mx-auto" />
          </motion.div>

          <motion.blockquote
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.1 }}
            className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] text-[var(--text-primary)] leading-snug md:leading-relaxed italic mb-12 md:mb-16"
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
                transition={{ ...easeOut, delay: 0.2 }}
                className="w-10 h-px bg-[var(--accent)] mx-auto mb-10 origin-center"
              />

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={fadeUp}
                transition={{ ...easeOut, delay: 0.3 }}
                className="space-y-3"
              >
                <p
                  className="font-display text-lg md:text-xl text-[var(--text-tertiary)] leading-loose"
                  dir="rtl"
                  lang="ar"
                >
                  {quranic}
                </p>
                <p className="text-sm md:text-base text-[var(--text-secondary)] font-body italic">
                  {quranicTranslation}
                </p>
                {quranicReference && (
                  <p className="text-xs text-[var(--text-tertiary)] font-body tracking-widest uppercase">
                    {quranicReference}
                  </p>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
