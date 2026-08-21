"use client";

import { motion } from "motion/react";
import { Kicker } from "@/src/designs/editorial/ornaments/Kicker";
import { EditorialRule } from "@/src/designs/editorial/ornaments/EditorialRule";
import { editorialEasing, fadeUpEditorial, viewportOnce } from "@/src/designs/editorial/motion";

interface SectionHeaderProps {
  index?: string;
  label?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Left-aligned, asymmetric header — the editorial counterpart to the
 * centered Flourish header. Reads like a magazine section opener.
 */
export function SectionHeader({ index, label, subtitle, className = "" }: SectionHeaderProps) {
  return (
    <motion.header
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUpEditorial}
      transition={{ duration: 0.9, ease: editorialEasing }}
      className={`mb-12 md:mb-16 lg:mb-20 ${className}`}
    >
      <Kicker index={index} label={label ?? ""} className="mb-4" />
      <EditorialRule align="left" width="2.75rem" />
      {subtitle && (
        <p className="text-[var(--text-secondary)] text-sm md:text-base font-body max-w-md leading-relaxed mt-6">
          {subtitle}
        </p>
      )}
    </motion.header>
  );
}
