"use client";

import { motion } from "motion/react";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function Footer({ invitation }: { invitation: any }) {
  const year = new Date().getFullYear();
  const { maker } = invitation;

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      transition={easeOut}
      className="bg-[var(--bg-primary)] py-8 md:py-10"
    >
      <div className="section-inner">
        <div className="flex items-center justify-center gap-4 mb-6 md:mb-8">
          <span className="flex-1 max-w-[120px] md:max-w-[200px] h-px bg-[var(--border)]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-muted)]" aria-hidden="true" />
          <span className="flex-1 max-w-[120px] md:max-w-[200px] h-px bg-[var(--border)]" />
        </div>
        <p className="text-center text-[var(--text-tertiary)] text-[11px] md:text-xs font-body tracking-[0.05em] leading-relaxed">
          &copy; {year} {invitation.closing.couple}. All rights reserved.
        </p>
        {maker && (
          <p className="text-center text-[var(--text-tertiary)] text-[11px] md:text-xs font-body tracking-[0.05em] mt-2">
            Undangan digital dibuat dengan{" "}
            <span aria-hidden="true">&#9825;</span> oleh{" "}
            {maker.url ? (
              <a
                href={maker.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors underline underline-offset-2 decoration-[var(--border)]"
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