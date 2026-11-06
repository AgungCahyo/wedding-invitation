"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { useMusic } from "@/src/context/MusicContext";
import { CornerFrame } from "@/src/components/ui/CornerFrame";
import { Flourish } from "@/src/components/ui/Flourish";
import { easeOut, fadeUp } from "@/src/lib/motion";

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
  const monogram = `${bride.name.charAt(10)}${groom.name.charAt(0)}`;
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
      className="fixed inset-0 z-50 overflow-hidden bg-[var(--bg-primary)]"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--muted)] via-[var(--bg-primary)] to-[var(--accent-muted)]/35" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 50% 82%, var(--accent-muted) 0%, transparent 58%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 top-[26%] md:top-[16%]">
          <Image
            src={invitation.cover.image}
            alt="Wedding cover"
            fill
            priority
            className="object-contain object-bottom"
            sizes="100vw"
            placeholder={getBlurDataURL(invitation.cover.image) ? "blur" : "empty"}
            blurDataURL={getBlurDataURL(invitation.cover.image)}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isEntering ? 0 : 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-[var(--accent-muted)]"
      >
        <CornerFrame />
      </motion.div>

      <div className="relative h-full flex flex-col items-center justify-start px-6 md:px-10 pt-8 md:pt-12 pb-6 md:pb-8 text-center max-h-screen">
        {/* Monogram */}
        <motion.span
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.1 }}
          className="font-maellen text-2xl md:text-3xl text-[var(--accent)] mb-2 md:mb-3"
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
          className="eyebrow text-[var(--text-tertiary)] mb-3 md:mb-4"
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
          <h1 className="font-maellen text-[clamp(2.75rem,7.5vw,5.5rem)] leading-[1.02] text-[var(--text-primary)] md:self-start md:text-left md:pl-4 lg:pl-12">
            {getDisplayName(bride.name.split(" ").slice(-2).join(" "))}
          </h1>
          {/* Ampersand */}
          <span
            className="font-maellen text-[clamp(1.5rem,3.5vw,2.25rem)] text-[var(--accent)] my-0.5 md:my-1"
            aria-hidden="true"
          >
            &amp;
          </span>
          {/* Groom name — bottom, aligned slightly to the right on desktop */}
          <h1 className="font-maellen text-[clamp(2.75rem,7.5vw,5.5rem)] leading-[1.02] text-[var(--text-primary)] md:self-end md:text-right md:pr-4 lg:pr-12">
            {getDisplayName(groom.name)}
          </h1>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.55 }}
          className="mb-3 md:mb-4"
        >
          <Flourish className="mx-auto text-[var(--accent)]/70 w-36 md:w-44" />
        </motion.div>

        {/* Date */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.65 }}
          className="font-body text-xs md:text-sm text-[var(--text-secondary)] tracking-[0.08em] mb-4 md:mb-5"
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
            <p className="eyebrow text-[var(--text-tertiary)] mb-1.5 text-[10px] md:text-xs">
              Kepada Yth. Bapak/Ibu/Saudara/i
            </p>
            <p className="font-display italic capitalize text-base md:text-lg text-[var(--text-primary)] border-y border-[var(--border)] py-1.5 px-6">
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
          className="group relative px-12 md:px-16 py-3 md:py-3.5 border border-[var(--accent)] text-[var(--text-primary)] text-[10px] md:text-xs font-body tracking-[0.28em] uppercase overflow-hidden transition-colors duration-500 hover:border-[var(--accent)] disabled:pointer-events-none"
        >
          <span className="relative z-10 group-hover:text-[var(--bg-primary)] transition-colors duration-500">
            Buka Undangan
          </span>
          <span className="absolute inset-0 bg-[var(--accent)] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        </motion.button>
      </div>
    </motion.div>
  );
}
