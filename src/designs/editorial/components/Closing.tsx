"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { EditorialRule } from "@/src/designs/editorial/ornaments/EditorialRule";
import { editorialEasing, fadeUpEditorial, viewportOnce } from "@/src/designs/editorial/motion";

export function Closing() {
  const { closing, couple } = invitation;
  const brideShort = couple.bride.name.split(" ")[0];
  const groomShort = couple.groom.name.split(" ")[0];

  return (
    <section
      id="closing"
      className="section bg-[var(--bg-secondary)] min-h-[70vh] flex items-center py-20 md:py-28"
    >
      <div className="section-inner w-full">
        <div className="max-w-xl space-y-8 md:space-y-10">
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUpEditorial}
            transition={{ duration: 0.9, ease: editorialEasing }}
            className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-md"
          >
            {closing.message}
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUpEditorial}
            transition={{ delay: 0.15, duration: 0.8, ease: editorialEasing }}
          >
            <EditorialRule align="left" className="mb-6" />
            <p
              className="mb-2 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
              style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
            >
              Kami yang berbahagia
            </p>
            <h2 className="font-display text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.95] tracking-[-0.02em] text-[var(--text-primary)]">
              {brideShort} <span className="italic">&amp;</span> {groomShort}
            </h2>
            <p
              className="mt-3 text-xs tracking-wider"
              style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
            >
              Beserta keluarga besar
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
