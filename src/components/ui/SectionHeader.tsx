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
      className={`text-center mb-12 md:mb-16 lg:mb-20 ${className}`}
    >
      <p className="eyebrow mb-6">{label}</p>
      <div className="flex items-center justify-center gap-4">
        <span className="flex-1 max-w-[100px] md:max-w-[160px] h-px bg-[var(--border)]" />
        <span className="w-1 h-1 rounded-full bg-[var(--accent-muted)]" aria-hidden="true" />
        <span className="flex-1 max-w-[100px] md:max-w-[160px] h-px bg-[var(--border)]" />
      </div>
      {subtitle && (
        <p className="text-[var(--text-secondary)] text-sm md:text-base font-body max-w-md mx-auto leading-relaxed mt-8">
          {subtitle}
        </p>
      )}
    </motion.header>
  );
}
