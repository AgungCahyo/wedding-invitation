"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { modernFade, viewportOnce } from "@/src/designs/modern/motion";

interface GalleryPhoto {
  id: number;
  src: string;
  alt: string;
  aspect: "tall" | "square" | "wide";
}

interface ModernGalleryProps {
  photos: GalleryPhoto[];
  onSelect: (index: number) => void;
}

const aspectClass: Record<GalleryPhoto["aspect"], string> = {
  tall: "aspect-[3/4]",
  square: "aspect-square",
  wide: "aspect-[16/10]",
};

/**
 * Full-width, edge-to-edge masonry — 2 columns on mobile, 3 on desktop.
 * No captions, no hover chrome, varied aspect ratios for visual rhythm.
 */
export function ModernGallery({ photos, onSelect }: ModernGalleryProps) {
  return (
    <div className="w-full columns-2 md:columns-3 gap-1">
      {photos.map((photo, index) => (
        <motion.button
          key={photo.id}
          type="button"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ ...modernFade, delay: index * 0.05 }}
          onClick={() => onSelect(index)}
          className={`relative w-full mb-1 overflow-hidden bg-[var(--muted)] block break-inside-avoid group ${aspectClass[photo.aspect]}`}
          aria-label={`Open ${photo.alt}`}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 33vw"
            placeholder={getBlurDataURL(photo.src) ? "blur" : "empty"}
            blurDataURL={getBlurDataURL(photo.src)}
          />
        </motion.button>
      ))}
    </div>
  );
}
