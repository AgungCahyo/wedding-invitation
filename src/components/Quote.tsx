"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { FloralAccent } from "@/src/components/ui/FloralAccent";
import { SectionBackdrop } from "@/src/components/ui/SectionBackdrop";
import { easeOut, fadeUp, scaleIn, viewportOnce } from "@/src/lib/motion";

export function Quote() {
  const { main, quranic, quranicTranslation, quranicReference } =
    invitation.quote;

  return (
    <section className="relative section bg-[var(--bg-secondary)] overflow-hidden">
      <SectionBackdrop src={invitation.cover.image} position="center 30%" />
      <div className="relative z-10 section-inner">
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
                variants={scaleIn}
                transition={{ ...easeOut, delay: 0.1 }}
                className="flex justify-center mb-12"
              >
                <FloralAccent className="w-14 md:w-16 opacity-50" />
              </motion.div>

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