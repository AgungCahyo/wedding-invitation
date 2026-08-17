"use client";

import { motion } from "motion/react";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

interface SectionHeaderProps {
  label: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ label, subtitle, className = "" }: SectionHeaderProps) {
  return (
    <motion.header
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      transition={easeOut}
      className={`text-center mb-14 md:mb-20 ${className}`}
    >
      <div className="flex items-center justify-center gap-5 mb-5">
        <span className="flex-1 max-w-[120px] md:max-w-[180px] h-px bg-[var(--border)]" />
        <p className="text-[var(--text-tertiary)] text-[10px] md:text-xs tracking-[0.3em] font-body uppercase">
          {label}
        </p>
        <span className="flex-1 max-w-[120px] md:max-w-[180px] h-px bg-[var(--border)]" />
      </div>
      {subtitle && (
        <p className="text-[var(--text-secondary)] text-sm md:text-base font-body max-w-md mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.header>
  );
}
