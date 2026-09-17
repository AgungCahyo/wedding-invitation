"use client";

import { motion } from "motion/react";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function Quote({ guestName = "", guestSlug = "", invitation, invitationId }: {
  guestName?: string;
  guestSlug?: string;
  invitation: any;
  invitationId?: string | undefined;
}) {
  const { quranic, quranicTranslation, quranicReference } = invitation.quote;

  // Handle case where quote data might be missing
  const hasQuoteData = Boolean(quranic && quranic.trim());

  // Return null if no quote data - section won't be rendered
  if (!hasQuoteData) {
    return null;
  }

  return (
    <section className="relative section bg-[var(--bg-secondary)]">
      <div className="relative z-10 section-inner py-16 md:py-20 px-6">
        <motion.blockquote
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.1 }}
          className="font-display text-[clamp(1.75rem,5vw,2.5rem)] leading-[1.8] text-[var(--text-primary)] text-balance mb-12 dir-[rtl] lang-[ar]"
        >
          {quranic}
        </motion.blockquote>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <span className="w-4 h-0.5 bg-[var(--accent)]" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.3 }}
          className="text-center space-y-3"
        >
          <p className="font-body text-[0.95rem] md:text-base leading-relaxed text-[var(--text-secondary)] italic">
            {quranicTranslation}
          </p>
          {quranicReference && (
            <p className="font-body text-[0.875rem] text-[var(--text-tertiary)]">
              {quranicReference}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}