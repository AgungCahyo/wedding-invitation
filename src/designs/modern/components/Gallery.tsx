"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { ModernGallery as ModernGalleryGrid } from "@/src/designs/modern/layout/ModernGallery";
import { SectionLabel } from "@/src/designs/modern/layout/SectionLabel";

export function Gallery() {
  const { gallery } = invitation;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrevious = useCallback(() => {
    setSelectedIndex((current) =>
      current === null ? null : current === 0 ? gallery.length - 1 : current - 1
    );
  }, [gallery.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((current) =>
      current === null ? null : current === gallery.length - 1 ? 0 : current + 1
    );
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
    <section id="gallery" className="bg-[var(--bg-primary)] py-16 md:py-24">
      <div className="pl-6 md:pl-8 mb-8">
        <SectionLabel index="03" className="mb-0">
          Galeri
        </SectionLabel>
      </div>

      <ModernGalleryGrid photos={gallery} onSelect={setSelectedIndex} />

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelectedIndex(null)}
            className="fixed inset-0 bg-[var(--overlay)]/96 z-50 flex items-center justify-center p-4 md:p-10"
            role="dialog"
            aria-modal="true"
            aria-label="Photo gallery"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl"
            >
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="absolute -top-10 md:-top-12 right-0 text-white/70 hover:text-white transition-colors"
                aria-label="Close gallery"
              >
                <X size={22} strokeWidth={1.5} />
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
                className="absolute left-0 md:-left-14 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2"
                aria-label="Previous photo"
              >
                <ChevronLeft size={26} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-0 md:-right-14 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-2"
                aria-label="Next photo"
              >
                <ChevronRight size={26} strokeWidth={1.5} />
              </button>

              <p className="text-center text-white/45 text-[10px] font-body tracking-[0.2em] uppercase mt-6 tabular-nums">
                {String(selectedIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
