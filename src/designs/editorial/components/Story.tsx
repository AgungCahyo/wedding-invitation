"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/designs/editorial/ui/SectionHeader";
import { SectionBackdrop } from "@/src/designs/romantic/ui/SectionBackdrop";
import { editorialEasing, fadeUpEditorial, viewportOnce } from "@/src/designs/editorial/motion";

export function Story() {
  const { story, gallery } = invitation;

  return (
    <section id="story" className="relative section bg-[var(--bg-primary)] overflow-hidden">
      <SectionBackdrop src={gallery[1].src} position="center 25%" />
      <div className="relative z-10 section-inner max-w-3xl">
        <SectionHeader
          index="03"
          label="Kisah Kami"
          subtitle="Jejak langkah perjalanan cinta yang membawa kami ke ikatan suci ini"
        />

        <div className="space-y-0">
          {story.map((item, index) => (
            <motion.article
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUpEditorial}
              transition={{ delay: index * 0.1, duration: 0.9, ease: editorialEasing }}
              className={`relative grid grid-cols-[3.5rem_1fr] md:grid-cols-[5rem_1fr] gap-4 md:gap-8 py-8 md:py-10 ${
                index > 0 ? "border-t border-[var(--border-subtle)]" : ""
              }`}
            >
              <span className="font-display text-2xl md:text-3xl text-[var(--accent)] leading-none pt-1">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="max-w-lg">
                <time
                  className="block mb-3 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
                  style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
                >
                  {item.date}
                </time>
                <h3 className="font-display text-[clamp(1.375rem,3vw,1.75rem)] leading-tight mb-3 text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
