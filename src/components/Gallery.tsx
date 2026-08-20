"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, scaleIn, viewportOnce } from "@/src/lib/motion";

const layoutClasses = [
  "col-span-2 row-span-2 md:col-span-7 md:row-span-2 aspect-[3/4] md:aspect-auto md:min-h-[420px]",
  "col-span-1 md:col-span-5 aspect-square md:aspect-auto md:min-h-[200px]",
  "col-span-1 md:col-span-5 aspect-[4/5] md:aspect-auto md:min-h-[200px]",
  "col-span-1 md:col-span-4 aspect-square md:aspect-auto md:min-h-[180px]",
  "col-span-1 md:col-span-4 aspect-[3/4] md:aspect-auto md:min-h-[240px]",
  "col-span-2 md:col-span-4 aspect-[16/9] md:aspect-auto md:min-h-[180px]",
];

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
        <SectionHeader label="Galeri" />

        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-6 auto-rows-min">
          {gallery.map((photo, index) => (
            <motion.button
              key={photo.id}
              type="button"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
              transition={{ ...easeOut, delay: index * 0.07 }}
              onClick={() => setSelectedIndex(index)}
              className={`relative overflow-hidden bg-[var(--bg-primary)] group cursor-pointer ${layoutClasses[index]}`}
              aria-label={`Open ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                sizes={
                  index === 0
                    ? "(max-width: 768px) 100vw, 50vw"
                    : "(max-width: 768px) 50vw, 25vw"
                }
                placeholder={getBlurDataURL(photo.src) ? "blur" : "empty"}
                blurDataURL={getBlurDataURL(photo.src)}
              />
              <div className="absolute inset-0 bg-[var(--foreground)]/0 group-hover:bg-[var(--foreground)]/8 transition-colors duration-500" />
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
              className="fixed inset-0 bg-[var(--overlay)]/92 z-50 flex items-center justify-center p-4 md:p-10"
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
                  className="absolute -top-10 md:-top-12 right-0 text-[var(--background)]/70 hover:text-[var(--background)] transition-colors"
                  aria-label="Close gallery"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>

                <div className="relative w-full aspect-[4/5] md:aspect-[3/2] max-h-[75vh]">
                  <Image
                    src={gallery[selectedIndex].src}
                    alt={gallery[selectedIndex].alt}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                    placeholder={getBlurDataURL(gallery[selectedIndex].src) ? "blur" : "empty"}
                    blurDataURL={getBlurDataURL(gallery[selectedIndex].src)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePrevious}
                  className="absolute left-0 md:-left-14 top-1/2 -translate-y-1/2 text-[var(--background)]/60 hover:text-[var(--background)] transition-colors p-2"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={28} strokeWidth={1.5} />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-0 md:-right-14 top-1/2 -translate-y-1/2 text-[var(--background)]/60 hover:text-[var(--background)] transition-colors p-2"
                  aria-label="Next photo"
                >
                  <ChevronRight size={28} strokeWidth={1.5} />
                </button>

                <p className="text-center text-[var(--background)]/50 eyebrow mt-6">
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
