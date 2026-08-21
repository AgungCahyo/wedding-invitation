"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { GeometricLine } from "@/src/designs/modern/ornaments/GeometricLine";
import { fadeUpModern, viewportOnce } from "@/src/designs/modern/motion";

export function Closing() {
  const { closing, couple, wedding } = invitation;
  const brideShort = couple.bride.name.split(" ")[0];
  const groomShort = couple.groom.name.split(" ")[0];

  return (
    <section id="closing" className="bg-[var(--overlay)] text-white py-24 md:py-32">
      <div className="max-w-3xl pl-6 md:pl-8 pr-5 md:pr-8 mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUpModern}
        >
          <p className="text-[10px] font-body font-medium tracking-[0.28em] uppercase text-white/40 mb-8">
            08 · Terima Kasih
          </p>
          <p className="font-body text-sm md:text-base leading-relaxed max-w-md mb-10 text-white/65">
            {closing.message}
          </p>
          <GeometricLine length={40} width={2} color="var(--accent)" className="mb-8" />
          <p className="text-[11px] font-body tracking-[0.22em] uppercase text-white/40 mb-3">
            Kami yang berbahagia
          </p>
          <h2 className="font-body font-medium text-[clamp(2.75rem,9vw,5rem)] leading-[0.9] tracking-[-0.05em]">
            {brideShort}
            <span className="text-[var(--accent)]"> &amp; </span>
            {groomShort}
          </h2>
          <p className="font-body text-xs text-white/35 mt-5 tabular-nums">
            {wedding.displayDate}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
