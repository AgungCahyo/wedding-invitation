"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { QuoteMark } from "@/src/designs/editorial/ornaments/QuoteMark";
import { editorialEasing, fadeUpEditorial, viewportOnce } from "@/src/designs/editorial/motion";

export function Quote() {
  const { quranic, quranicTranslation, quranicReference } = invitation.quote;

  return (
    <section className="section bg-[var(--bg-secondary)]">
      <div className="section-inner">
        <div className="max-w-2xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUpEditorial}
            transition={{ duration: 0.9, ease: editorialEasing }}
          >
            <QuoteMark size={88} className="mb-4 block" />

            <blockquote
              className="font-display text-[clamp(1.5rem,3.8vw,2.15rem)] text-[var(--text-primary)] leading-[1.9] text-right"
              dir="rtl"
              lang="ar"
            >
              {quranic}
            </blockquote>

            <div className="mt-10 md:mt-12 pl-6 border-l-2" style={{ borderColor: "var(--accent)" }}>
              <p className="text-sm md:text-[0.95rem] text-[var(--text-secondary)] font-body italic leading-relaxed max-w-md">
                {quranicTranslation}
              </p>
              {quranicReference && (
                <p
                  className="mt-5 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
                  style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
                >
                  {quranicReference}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
