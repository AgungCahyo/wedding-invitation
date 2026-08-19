"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { Ornament } from "@/src/components/ui/Ornament";
import { easeOut, fadeUp, scaleIn, viewportOnce } from "@/src/lib/motion";

export function Closing() {
  const { closing, couple } = invitation;
  const monogram = `${couple.groom.name.charAt(0)}${couple.bride.name.charAt(0)}`;
  const brideShort = couple.bride.name.split(" ")[0];
  const groomShort = couple.groom.name.split(" ")[0];

  return (
    <section
      id="closing"
      className="section bg-[var(--bg-secondary)] min-h-[70vh] flex items-center relative py-20 md:py-28 overflow-hidden"
    >
      {/* Corner Frame Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 md:inset-8"
      >
        <span className="absolute top-0 left-0 w-8 h-8 md:w-12 md:h-12 border-t border-l border-[var(--border)]" />
        <span className="absolute bottom-0 right-0 w-8 h-8 md:w-12 md:h-12 border-b border-r border-[var(--border)]" />
      </div>

      <div className="section-inner w-full relative z-10">
        <div className="max-w-xl mx-auto text-center px-4 space-y-8 md:space-y-10">
          {/* Monogram Seal Badge */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={scaleIn}
            transition={easeOut}
            className="relative w-20 h-20 md:w-24 md:h-24 mx-auto flex items-center justify-center"
          >
            <span className="absolute inset-0 rounded-full border border-[var(--accent)]/35" />
            <span className="absolute inset-[5px] rounded-full border border-[var(--border)]" />
            <span className="font-maellen text-2xl md:text-3xl text-[var(--accent)] leading-none select-none">
              {monogram}
            </span>
          </motion.div>

          {/* Salutation / Eyebrow */}
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.1 }}
            className="eyebrow text-[var(--text-tertiary)] tracking-[0.25em]"
          >
            Ungkapan Terima Kasih
          </motion.p>

          {/* Closing Message */}
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.18 }}
            className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed italic max-w-md mx-auto"
          >
            {closing.message}
          </motion.p>

          {/* Divider */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.25 }}
            className="flex items-center justify-center gap-3 w-full"
          >
            <span className="flex-1 max-w-[48px] h-px bg-[var(--border)]" />
            <Ornament />
            <span className="flex-1 max-w-[48px] h-px bg-[var(--border)]" />
          </motion.div>

          {/* Signature Block */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.32 }}
            className="space-y-2 pt-2"
          >
            <p className="eyebrow text-[var(--text-tertiary)] text-[10px] md:text-xs">
              Kami yang berbahagia,
            </p>
            <h2 className="font-maellen text-[clamp(2.5rem,7vw,4.25rem)] text-[var(--text-primary)] leading-tight">
              {brideShort} &amp; {groomShort}
            </h2>
            <p className="font-body text-xs text-[var(--text-tertiary)] tracking-wider">
              Beserta Keluarga Besar
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}