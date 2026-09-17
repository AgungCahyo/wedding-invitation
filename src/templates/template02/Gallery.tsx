"use client";

import { motion } from "motion/react";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function Gallery({ guestName = "", guestSlug = "", invitation, invitationId }: {
  guestName?: string;
  guestSlug?: string;
  invitation: any;
  invitationId?: string | undefined;
}) {
  const { gallery } = invitation;

  // Handle case where gallery data might be missing or empty
  const hasGalleryData = Array.isArray(gallery) && gallery.length > 0;

  // Return null if no gallery data - section won't be rendered
  if (!hasGalleryData) {
    return null;
  }

  return (
    <section id="gallery" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-4xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.1 }}
          className="mb-12 text-center"
        >
          <h1 className="font-display text-[clamp(2.25rem,5vw,3rem)] tracking-tight leading-none text-[var(--text-primary)] mb-4">
            Galeri Foto
          </h1>
          <p className="font-body text-lg md:text-xl leading-relaxed text-[var(--text-secondary)]">
            Momento berharga dalam gambar
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.3 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {gallery.map((image, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
              transition={{ ...easeOut, delay: 0.4 + index * 0.05 }}
              className="relative overflow-hidden rounded-lg"
            >
              <img
                src={image.src}
                alt={image.alt || `Foto ${index + 1}`}
                className="object-cover w-full h-full"
                loading="lazy"
              />
              {image.aspect && (
                <span className="absolute bottom-2 left-2 bg-[var(--accent)]/20 px-2 py-0.5 text-xs text-[var(--text-primary)]">
                  {image.aspect}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}