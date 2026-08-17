"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function Story() {
  const { story } = invitation;

  return (
    <section id="story" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-3xl">
        <SectionHeader label="Our Story" />

        <div className="relative">
          <div
            className="absolute left-[7px] md:left-1/2 top-0 bottom-0 w-px bg-[var(--border)] md:-translate-x-px"
            aria-hidden="true"
          />

          <ol className="space-y-12 md:space-y-16">
            {story.map((item, index) => (
              <motion.li
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={fadeUp}
                transition={{ ...easeOut, delay: index * 0.12 }}
                className={`relative pl-8 md:pl-0 ${
                  index % 2 === 0
                    ? "md:pr-[calc(50%+2rem)] md:text-right"
                    : "md:pl-[calc(50%+2rem)]"
                }`}
              >
                <span
                  className="absolute left-0 md:left-1/2 top-1.5 w-[15px] h-[15px] rounded-full border border-[var(--accent)] bg-[var(--bg-primary)] md:-translate-x-1/2"
                  aria-hidden="true"
                />

                <time className="block text-[var(--text-tertiary)] text-[10px] tracking-[0.3em] uppercase font-body mb-2">
                  {item.date}
                </time>
                <h4 className="font-display text-xl md:text-2xl text-[var(--text-primary)] mb-2">
                  {item.title}
                </h4>
                <p className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
