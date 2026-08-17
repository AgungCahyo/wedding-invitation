"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, scaleIn, viewportOnce } from "@/src/lib/motion";

const aspectClasses = {
  tall: "row-span-2 aspect-[3/4]",
  square: "aspect-square",
  wide: "col-span-2 aspect-[16/9]",
} as const;

export function Gallery() {
  const { gallery } = invitation;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrevious = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      return current === 0 ? gallery.length - 1 : current - 1;
    });
  }, [gallery.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null) return null;
      return current === gallery.length - 1 ? 0 : current + 1;
    });
  }, [gallery.length]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIndex, handlePrevious, handleNext]);

  return (
    <section id="gallery" className="section bg-[var(--bg-secondary)]">
      <div className="section-inner">
        <SectionHeader label="Gallery" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-fr">
          {gallery.map((photo, index) => (
            <motion.button
              key={photo.id}
              type="button"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
              transition={{ ...easeOut, delay: index * 0.08 }}
              onClick={() => setSelectedIndex(index)}
              className={`relative overflow-hidden bg-[var(--bg-primary)] group cursor-pointer ${aspectClasses[photo.aspect]}`}
              aria-label={`Open ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-[var(--text-primary)]/0 group-hover:bg-[var(--text-primary)]/10 transition-colors duration-500" />
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selectedIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedIndex(null)}
              className="fixed inset-0 bg-[var(--text-primary)]/90 z-50 flex items-center justify-center p-4 md:p-10"
              role="dialog"
              aria-modal="true"
              aria-label="Photo gallery lightbox"
            >
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={scaleIn}
                transition={easeOut}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl"
              >
                <button
                  type="button"
                  onClick={() => setSelectedIndex(null)}
                  className="absolute -top-10 md:-top-12 right-0 text-[#faf8f3]/80 hover:text-[#faf8f3] transition-colors"
                  aria-label="Close gallery"
                >
                  <X size={28} strokeWidth={1.5} />
                </button>

                <div className="relative w-full aspect-[4/5] md:aspect-[3/2] max-h-[75vh]">
                  <Image
                    src={gallery[selectedIndex].src}
                    alt={gallery[selectedIndex].alt}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePrevious}
                  className="absolute left-0 md:-left-14 top-1/2 -translate-y-1/2 text-[#faf8f3]/70 hover:text-[#faf8f3] transition-colors p-2"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={32} strokeWidth={1.5} />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-0 md:-right-14 top-1/2 -translate-y-1/2 text-[#faf8f3]/70 hover:text-[#faf8f3] transition-colors p-2"
                  aria-label="Next photo"
                >
                  <ChevronRight size={32} strokeWidth={1.5} />
                </button>

                <p className="text-center text-[#faf8f3]/60 text-xs font-body tracking-widest mt-4">
                  {selectedIndex + 1} / {gallery.length}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
