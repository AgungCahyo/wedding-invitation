"use client";

import { motion } from "motion/react";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function Story({ guestName = "", guestSlug = "", invitation, invitationId }: {
  guestName?: string;
  guestSlug?: string;
  invitation: any;
  invitationId?: string | undefined;
}) {
  const { story } = invitation;

  // Handle case where story data might be missing or empty
  const hasStoryData = Array.isArray(story) && story.length > 0;

  // Return null if no story data - section won't be rendered
  if (!hasStoryData) {
    return null;
  }

  return (
    <section id="story" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-3xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.1 }}
          className="mb-12 text-center"
        >
          <h1 className="font-display text-[clamp(2.25rem,5vw,3rem)] tracking-tight leading-none text-[var(--text-primary)] mb-4">
            Kisah Kita
          </h1>
          <p className="font-body text-lg md:text-xl leading-relaxed text-[var(--text-secondary)]">
            Perjalananmenujuhariberkahi
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.3 }}
          className="space-y-8"
        >
          {story.map((entry, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
              transition={{ ...easeOut, delay: 0.4 + index * 0.1 }}
              className="bg-[var(--bg-secondary)] rounded-xl p-6 md:p-8"
            >
              <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-[var(--text-primary)] mb-3">
                {entry.title}
              </h2>
              <p className="font-body text-[0.95rem] md:text-base leading-relaxed text-[var(--text-tertiary)]">
                {entry.date}
              </p>
              <p className="font-body text-base leading-relaxed text-[var(--text-secondary)] mb-4">
                {entry.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}