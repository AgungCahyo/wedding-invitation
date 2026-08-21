"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { useMusic } from "@/src/context/MusicContext";
import { GeometricLine } from "@/src/designs/modern/ornaments/GeometricLine";
import { modernFade, staggerContainer, staggerItem } from "@/src/designs/modern/motion";

interface OpeningProps {
  onEnter: () => void;
  guestName?: string;
}

export function Opening({ onEnter, guestName }: OpeningProps) {
  const [isEntering, setIsEntering] = useState(false);
  const { startMusic } = useMusic();
  const { groom, bride } = invitation.couple;
  const showGuestName = Boolean(guestName && guestName.trim() && guestName !== "Tamu");

  const handleEnter = () => {
    setIsEntering(true);
    startMusic();
    setTimeout(onEnter, 480);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isEntering ? 0 : 1 }}
      transition={modernFade}
      className="fixed inset-0 z-50 flex flex-col md:flex-row bg-[var(--overlay)]"
    >
      <div className="relative h-[44vh] md:h-full md:w-[54%] order-1 md:order-2 shrink-0">
        <Image
          src={invitation.cover.image}
          alt="Wedding cover"
          fill
          priority
          className="object-cover object-[center_18%]"
          sizes="(max-width: 768px) 100vw, 54vw"
          placeholder={getBlurDataURL(invitation.cover.image) ? "blur" : "empty"}
          blurDataURL={getBlurDataURL(invitation.cover.image)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--overlay)] via-transparent to-transparent md:bg-gradient-to-r md:from-[var(--overlay)] md:via-[var(--overlay)]/20 md:to-transparent" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative flex-1 flex flex-col justify-end md:justify-center px-7 py-10 md:px-14 md:py-16 order-2 md:order-1"
      >
        <motion.p
          variants={staggerItem}
          className="text-[11px] font-body font-medium tracking-[0.32em] uppercase text-white/50 mb-6"
        >
          The Wedding Of
        </motion.p>

        <motion.h1
          variants={staggerItem}
          className="font-body font-medium text-[clamp(2.75rem,8vw,5.25rem)] leading-[0.9] tracking-[-0.05em] text-white"
        >
          {bride.name.split(" ")[0]}
        </motion.h1>
        <motion.h1
          variants={staggerItem}
          className="font-body font-medium text-[clamp(2.75rem,8vw,5.25rem)] leading-[0.9] tracking-[-0.05em] text-[var(--accent)] mb-8"
        >
          {groom.name.split(" ")[0]}
        </motion.h1>

        <motion.div variants={staggerItem} className="mb-7">
          <GeometricLine length={48} width={2} color="var(--accent)" />
        </motion.div>

        <motion.p variants={staggerItem} className="font-body text-sm text-white/80 mb-1">
          {invitation.wedding.displayDate}
        </motion.p>
        <motion.p variants={staggerItem} className="font-body text-xs text-white/45 mb-8">
          {invitation.events.reception.venue}
        </motion.p>

        {showGuestName && (
          <motion.p
            variants={staggerItem}
            className="font-body text-xs capitalize text-white/55 mb-8"
          >
            Kepada Yth. {guestName}
          </motion.p>
        )}

        <motion.button
          variants={staggerItem}
          onClick={handleEnter}
          disabled={isEntering}
          className="group inline-flex items-center gap-4 text-[11px] font-body font-medium tracking-[0.22em] uppercase text-white disabled:pointer-events-none w-fit"
        >
          Buka Undangan
          <span className="block h-px w-10 bg-[var(--accent)] transition-all duration-300 group-hover:w-16" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
