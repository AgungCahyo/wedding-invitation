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
      className="section bg-[var(--bg-secondary)] min-h-[70vh] flex items-center relative py-20 md:py-28"
    >
      <div className="section-inner w-full">
        <div className="max-w-xl mx-auto text-center px-4 space-y-8 md:space-y-10">
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

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.12 }}
            className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto"
          >
            {closing.message}
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.2 }}
            className="flex items-center justify-center gap-3 w-full"
          >
            <span className="flex-1 max-w-[48px] h-px bg-[var(--border)]" />
            <Ornament />
            <span className="flex-1 max-w-[48px] h-px bg-[var(--border)]" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.28 }}
            className="space-y-2 pt-2"
          >
            <p className="eyebrow">Kami yang berbahagia</p>
            <h2 className="font-maellen text-[clamp(2.5rem,7vw,4.25rem)] text-[var(--text-primary)] leading-tight">
              {brideShort} &amp; {groomShort}
            </h2>
            <p className="font-body text-xs text-[var(--text-tertiary)] tracking-wider">
              Beserta keluarga besar
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
