"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { useMusic } from "@/src/context/MusicContext";
import { easeOut, fadeUp, lineReveal } from "@/src/lib/motion";

interface OpeningProps {
  onEnter: () => void;
  guestName?: string;
}

function getDisplayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName;
  return `${parts[0]} ${parts[1]}`;
}

export function Opening({ onEnter, guestName }: OpeningProps) {
  const [isEntering, setIsEntering] = useState(false);
  const { startMusic } = useMusic();
  const { groom, bride } = invitation.couple;
  const monogram = `${groom.name.charAt(0)}${bride.name.charAt(0)}`;
  const showGuestName = Boolean(guestName && guestName.trim() && guestName !== "Tamu");

  const handleEnter = () => {
    setIsEntering(true);
    startMusic();
    setTimeout(onEnter, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isEntering ? 0 : 1, scale: isEntering ? 1.015 : 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <div className="absolute inset-0">
        <Image
          src={invitation.cover.image}
          alt="Wedding cover"
          fill
          priority
          className="object-cover object-[center_20%] scale-[1.03]"
          sizes="100vw"
          placeholder={getBlurDataURL(invitation.cover.image) ? "blur" : "empty"}
          blurDataURL={getBlurDataURL(invitation.cover.image)}
        />
        <div className="absolute inset-0 bg-[var(--foreground)]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/75 via-[var(--foreground)]/25 to-[var(--foreground)]/40" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isEntering ? 0 : 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 md:inset-8"
      >
        <span className="absolute top-0 left-0 w-9 h-9 md:w-12 md:h-12 border-t border-l border-[var(--background)]/40" />
        <span className="absolute bottom-0 right-0 w-9 h-9 md:w-12 md:h-12 border-b border-r border-[var(--background)]/40" />
      </motion.div>

      <div className="relative h-full flex flex-col items-center justify-center px-6 md:px-10 py-6 md:py-8 text-center max-h-screen">
        {/* Monogram */}
        <motion.span
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.1 }}
          className="font-maellen text-2xl md:text-3xl text-[var(--background)]/90 mb-2 md:mb-3"
          aria-hidden="true"
        >
          {monogram}
        </motion.span>

        {/* Eyebrow */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.25 }}
          className="eyebrow text-[var(--background)]/75 mb-3 md:mb-4"
        >
          {invitation.cover.label}
        </motion.p>

        {/* Couple Names — Grand vertical staggered (left/right offset) typography */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.4 }}
          className="mb-4 md:mb-5 w-full max-w-3xl flex flex-col items-center justify-center"
        >
          {/* Bride name — top, aligned slightly to the left on desktop */}
          <h1 className="font-maellen text-[clamp(2.75rem,7.5vw,5.5rem)] leading-[1.02] text-[var(--background)] md:self-start md:text-left md:pl-4 lg:pl-12">
            {getDisplayName(bride.name)}
          </h1>
          {/* Ampersand */}
          <span
            className="font-maellen text-[clamp(1.5rem,3.5vw,2.25rem)] text-[var(--background)]/70 my-0.5 md:my-1"
            aria-hidden="true"
          >
            &amp;
          </span>
          {/* Groom name — bottom, aligned slightly to the right on desktop */}
          <h1 className="font-maellen text-[clamp(2.75rem,7.5vw,5.5rem)] leading-[1.02] text-[var(--background)] md:self-end md:text-right md:pr-4 lg:pr-12">
            {getDisplayName(groom.name)}
          </h1>
        </motion.div>

        {/* Divider line */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={lineReveal}
          transition={{ ...easeOut, delay: 0.55 }}
          className="w-12 md:w-16 h-px bg-[var(--background)]/35 origin-center mb-3 md:mb-4"
        />

        {/* Date */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.65 }}
          className="font-body text-xs md:text-sm text-[var(--background)]/85 tracking-[0.08em] mb-4 md:mb-5"
        >
          {invitation.wedding.displayDate}
        </motion.p>

        {/* Guest Name Card */}
        {showGuestName && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.72 }}
            className="mb-4 md:mb-5 flex flex-col items-center"
          >
            <p className="eyebrow text-[var(--background)]/60 mb-1.5 text-[10px] md:text-xs">
              Kepada Yth. Bapak/Ibu/Saudara/i
            </p>
            <p className="font-display italic capitalize text-base md:text-lg text-[var(--background)] border-y border-[var(--background)]/25 py-1.5 px-6">
              {guestName}
            </p>
          </motion.div>
        )}

        {/* Open Button */}
        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.9 }}
          onClick={handleEnter}
          disabled={isEntering}
          className="group relative px-12 md:px-16 py-3 md:py-3.5 border border-[var(--background)]/50 text-[var(--background)] text-[10px] md:text-xs font-body tracking-[0.28em] uppercase overflow-hidden transition-colors duration-500 hover:border-[var(--background)] disabled:pointer-events-none"
        >
          <span className="relative z-10 group-hover:text-[var(--foreground)] transition-colors duration-500">
            Open Invitation
          </span>
          <span className="absolute inset-0 bg-[var(--background)] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        </motion.button>
      </div>
    </motion.div>
  );
}