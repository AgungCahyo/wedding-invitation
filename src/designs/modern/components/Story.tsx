"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { ModernSection } from "@/src/designs/modern/layout/ModernSection";
import { SectionLabel } from "@/src/designs/modern/layout/SectionLabel";
import { fadeUpModern, viewportOnce } from "@/src/designs/modern/motion";

export function Story() {
  const { story } = invitation;

  return (
    <ModernSection id="story" tone="muted">
      <SectionLabel index="04">Kisah Kami</SectionLabel>

      <div>
        {story.map((item, index) => (
          <motion.article
            key={item.title}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUpModern}
            transition={{ delay: index * 0.06 }}
            className="grid grid-cols-[5.5rem_1fr] md:grid-cols-[7rem_1fr] gap-4 md:gap-6 py-8 border-t border-[var(--border)] first:border-t-0 first:pt-0"
          >
            <span className="text-xs font-body tabular-nums tracking-[0.06em] text-[var(--accent)] pt-1">
              {item.date}
            </span>
            <div>
              <h3 className="font-body font-medium text-lg md:text-xl tracking-tight mb-2">
                {item.title}
              </h3>
              <p className="font-body text-sm md:text-base leading-relaxed text-[var(--text-secondary)] max-w-[36rem]">
                {item.description}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </ModernSection>
  );
}
