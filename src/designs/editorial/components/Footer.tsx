"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { EditorialRule } from "@/src/designs/editorial/ornaments/EditorialRule";
import { editorialEasing, fadeUpEditorial, viewportOnce } from "@/src/designs/editorial/motion";

export function Footer() {
  const year = new Date().getFullYear();
  const { maker } = invitation;

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUpEditorial}
      transition={{ duration: 0.8, ease: editorialEasing }}
      className="bg-[var(--bg-primary)] py-8 md:py-10"
    >
      <div className="section-inner">
        <EditorialRule align="left" width="2.5rem" className="mb-6" />
        <p
          className="text-[var(--text-tertiary)] text-[11px] md:text-xs font-body tracking-[0.05em] leading-relaxed"
        >
          &copy; {year} {invitation.closing.couple}. All rights reserved.
        </p>
        {maker && (
          <p className="mt-2 text-[var(--text-tertiary)]/70 text-[10px] md:text-[11px] font-body tracking-[0.05em]">
            Dibuat oleh{" "}
            {maker.url ? (
              <a href={maker.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">
                {maker.name}
              </a>
            ) : (
              maker.name
            )}
          </p>
        )}
      </div>
    </motion.footer>
  );
}
