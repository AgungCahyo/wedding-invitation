"use client";

import { motion } from "motion/react";
import { CornerMark } from "@/src/designs/modern/ornaments/CornerMark";
import { fadeUpModern, viewportOnce } from "@/src/designs/modern/motion";

interface ModernHeaderProps {
  guestName: string;
  relation?: string | null;
  note?: string | null;
}

export function ModernHeader({ guestName, relation, note }: ModernHeaderProps) {
  const showGuestName = Boolean(guestName && guestName.trim() && guestName !== "Tamu");
  if (!showGuestName) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpModern}
      viewport={viewportOnce}
      className="relative max-w-lg border border-[var(--border)] px-7 py-8 md:px-10 md:py-10"
    >
      <CornerMark size={16} corner="TL" className="text-[var(--accent)]" />
      <CornerMark size={16} corner="TR" className="text-[var(--accent)]" />
      <CornerMark size={16} corner="BL" className="text-[var(--accent)]" />
      <CornerMark size={16} corner="BR" className="text-[var(--accent)]" />

      <p className="text-[10px] font-body font-medium tracking-[0.28em] uppercase text-[var(--text-tertiary)] mb-3">
        Kepada Yth.
      </p>
      <p className="font-body font-medium text-2xl md:text-3xl capitalize tracking-tight text-[var(--text-primary)]">
        {guestName}
      </p>
      {relation && (
        <p className="text-sm font-body mt-1.5 text-[var(--text-secondary)]">{relation}</p>
      )}
      {note ? (
        <p className="font-body text-sm leading-relaxed mt-5 text-[var(--text-secondary)] border-l-2 border-[var(--accent)] pl-4">
          {note}
        </p>
      ) : (
        <p className="font-body text-sm leading-relaxed mt-5 text-[var(--text-secondary)]">
          Dengan hormat kami mengundang Anda untuk hadir dan memberikan doa restu.
        </p>
      )}
    </motion.div>
  );
}
