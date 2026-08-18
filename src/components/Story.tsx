"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Ornament } from "@/src/components/ui/Ornament";
import { SectionBackdrop } from "@/src/components/ui/SectionBackdrop";
import { easeOut, fadeUp, lineReveal, viewportOnce } from "@/src/lib/motion";

export function Story() {
  const { story, gallery } = invitation;

  return (
    <section id="story" className="relative section bg-[var(--bg-primary)] overflow-hidden">
      <SectionBackdrop src={gallery[1].src} position="center 25%" />
      <div className="relative z-10 section-inner max-w-3xl">
        <SectionHeader label="Our Story" />

        <div className="space-y-0">
          {story.map((item, index) => (
            <motion.article
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
              transition={{ ...easeOut, delay: index * 0.1 }}
              className={`relative py-10 md:py-14 ${
                index > 0 ? "border-t border-[var(--border-subtle)]" : ""
              } ${index % 2 === 1 ? "md:text-right md:ml-auto md:max-w-[85%]" : "md:max-w-[85%]"}`}
            >
              {index > 0 && (
                <span
                  className="absolute -top-[7px] left-1/2 -translate-x-1/2 bg-[var(--bg-primary)] px-3"
                  aria-hidden="true"
                >
                  <Ornament />
                </span>
              )}
              <time className="eyebrow block mb-4">{item.date}</time>
              <h3 className="display-heading text-[clamp(1.375rem,3vw,1.75rem)] mb-3">
                {item.title}
              </h3>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={lineReveal}
                transition={{ ...easeOut, delay: index * 0.1 + 0.05 }}
                className={`w-8 h-px bg-[var(--accent)] mb-5 origin-left ${
                  index % 2 === 1 ? "md:ml-auto md:origin-right" : ""
                }`}
              />
              <p className="prose-editorial text-sm md:text-base">
                {item.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}