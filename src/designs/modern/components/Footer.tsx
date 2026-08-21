"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { GeometricLine } from "@/src/designs/modern/ornaments/GeometricLine";
import { fadeUpModern, viewportOnce } from "@/src/designs/modern/motion";

export function Footer() {
  const year = new Date().getFullYear();
  const { maker } = invitation;

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUpModern}
      className="bg-[var(--bg-primary)] py-10 md:py-12 border-t border-[var(--border)]"
    >
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <GeometricLine length={32} width={2} color="var(--accent)" className="mb-6" />
        <p className="text-[11px] font-body tracking-[0.08em] text-[var(--text-tertiary)]">
          &copy; {year} {invitation.closing.couple}
        </p>
        {maker && (
          <p className="text-[11px] font-body text-[var(--text-tertiary)] mt-2">
            Dibuat oleh{" "}
            {maker.url ? (
              <a
                href={maker.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-secondary)] underline underline-offset-4 decoration-[var(--border)] hover:text-[var(--accent)]"
              >
                {maker.name}
              </a>
            ) : (
              <span className="text-[var(--text-secondary)]">{maker.name}</span>
            )}
          </p>
        )}
      </div>
    </motion.footer>
  );
}
