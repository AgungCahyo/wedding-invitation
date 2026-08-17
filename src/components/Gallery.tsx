"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { invitation } from "@/src/data/invitation";

export function Gallery() {
  const { gallery } = invitation;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(
        selectedIndex === 0 ? gallery.length - 1 : selectedIndex - 1
      );
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(
        selectedIndex === gallery.length - 1 ? 0 : selectedIndex + 1
      );
    }
  };

  return (
    <section className="section bg-white">
      <div className="section-inner">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#e8e3dd]" />
            <p className="text-[#8b7f76] text-xs tracking-widest font-body">
              GALERI KAMI
            </p>
            <div className="flex-1 h-px bg-[#e8e3dd]" />
          </div>
        </motion.div>

        {/* Masonry gallery */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {gallery.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setSelectedIndex(index)}
              className={`relative cursor-pointer overflow-hidden bg-[#f5f3f0] group ${
                index % 5 === 0 ? "col-span-2 md:col-span-2 row-span-2" : ""
              } ${index % 7 === 2 ? "md:col-span-2" : ""}`}
            >
              <div
                className={`relative w-full ${
                  index % 5 === 0
                    ? "aspect-square md:aspect-square"
                    : "aspect-square"
                }`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-white"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-8"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl"
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="absolute top-4 right-4 z-10 text-white hover:text-[#c9a876] transition-colors"
                  aria-label="Close"
                >
                  <X size={28} />
                </button>

                {/* Image */}
                <div className="relative w-full aspect-square md:aspect-auto md:max-h-[80vh]">
                  <Image
                    src={gallery[selectedIndex].src}
                    alt={gallery[selectedIndex].alt}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Navigation */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-[#c9a876] transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-[#c9a876] transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>

                {/* Counter */}
                <div className="text-center text-white mt-4 text-sm">
                  {selectedIndex + 1} / {gallery.length}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
