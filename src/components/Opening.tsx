"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";
import { useMusic } from "@/src/context/MusicContext";
import { easeOut, fadeUp, lineReveal } from "@/src/lib/motion";

interface OpeningProps {
  onEnter: () => void;
}

function getDisplayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName;
  return `${parts[0]} ${parts[1]}`;
}

export function Opening({ onEnter }: OpeningProps) {
  const [isEntering, setIsEntering] = useState(false);
  const { startMusic } = useMusic();
  const { groom, bride } = invitation.couple;

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

      <div className="relative h-full flex flex-col items-center justify-end md:justify-center px-6 md:px-10 pb-16 md:pb-0 text-center">
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.25 }}
          className="eyebrow text-[var(--background)]/75 mb-10 md:mb-12"
        >
          {invitation.cover.label}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.4 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="display-heading text-[clamp(2.5rem,8vw,5.5rem)] text-[var(--background)]">
            {getDisplayName(groom.name)}
          </h1>
          <p
            className="font-display text-[clamp(1.25rem,3vw,2rem)] text-[var(--background)]/60 italic my-3 md:my-4"
            aria-hidden="true"
          >
            &amp;
          </p>
          <h1 className="display-heading text-[clamp(2.5rem,8vw,5.5rem)] text-[var(--background)]">
            {getDisplayName(bride.name)}
          </h1>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={lineReveal}
          transition={{ ...easeOut, delay: 0.55 }}
          className="w-16 h-px bg-[var(--background)]/35 origin-center mb-6 md:mb-8"
        />

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.65 }}
          className="font-body text-sm md:text-base text-[var(--background)]/85 tracking-[0.08em] mb-14 md:mb-16"
        >
          {invitation.wedding.displayDate}
        </motion.p>

        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.8 }}
          onClick={handleEnter}
          disabled={isEntering}
          className="group relative px-12 md:px-16 py-3.5 md:py-4 border border-[var(--background)]/50 text-[var(--background)] text-[11px] md:text-xs font-body tracking-[0.28em] uppercase overflow-hidden transition-colors duration-500 hover:border-[var(--background)] disabled:pointer-events-none"
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