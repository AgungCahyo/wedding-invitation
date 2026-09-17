"use client";

import { motion } from "motion/react";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function ImageBreak({ guestName = "", guestSlug = "", invitation, invitationId }: {
  guestName?: string;
  guestSlug?: string;
  invitation: any;
  invitationId?: string | undefined;
}) {
  // Use the first gallery image if available for the break
  const firstImage = invitation.gallery?.[0];

  return (
    <section className="relative section">
      <div className="relative z-10 section-inner">
        {firstImage && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.1 }}
            className="aspect-[16/9] w-full"
          >
            <img
              src={firstImage.src}
              alt={firstImage.alt || "Visual break"}
              className="object-cover w-full h-full rounded-lg"
              loading="lazy"
            />
          </motion.div>
        )}

        {/* Fallback decorative break when no image available */}
        {!firstImage && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.1 }}
            className="h-12 mx-auto"
          >
            <div className="w-16 h-0.5 bg-[var(--accent)] block mx-auto" />
          </motion.div>
        )}
      </div>
    </section>
  );
}