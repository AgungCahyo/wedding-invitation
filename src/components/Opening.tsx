"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";
import { useMusic } from "@/src/context/MusicContext";
import { FloralAccent } from "@/src/components/ui/FloralAccent";
import { easeOut, fadeUp, lineReveal } from "@/src/lib/motion";

interface OpeningProps {
  onEnter: () => void;
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
      animate={{ opacity: isEntering ? 0 : 1, scale: isEntering ? 1.02 : 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Background photo */}
      <div className="absolute inset-0">
        <Image
          src={invitation.cover.image}
          alt="Wedding cover"
          fill
          priority
          className="object-cover object-center scale-105"
          sizes="100vw"
        />
        {/* Layered overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2b2520]/50 via-[#2b2520]/40 to-[#2b2520]/70" />
        <div className="absolute inset-0 bg-[#faf8f3]/10 mix-blend-overlay" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 md:px-10 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.2 }}
          className="mb-6"
        >
          <FloralAccent className="mx-auto text-[#faf8f3]/70" />
        </motion.div>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.35 }}
          className="text-[#faf8f3]/80 text-[10px] md:text-xs tracking-[0.35em] font-body uppercase mb-8 md:mb-10"
        >
          {invitation.cover.label}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.45 }}
          className="space-y-3 md:space-y-4 mb-8 md:mb-10"
        >
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[#faf8f3] font-medium leading-tight tracking-tight">
            {groom.name.split(" ").slice(0, 2).join(" ")}
          </h1>
          <p className="font-display text-xl md:text-3xl text-[#faf8f3]/70 italic">
            &amp;
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-[#faf8f3] font-medium leading-tight tracking-tight">
            {bride.name.split(" ").slice(0, 2).join(" ")}
          </h1>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={lineReveal}
          transition={{ ...easeOut, delay: 0.55 }}
          className="w-12 h-px bg-[#faf8f3]/40 origin-center mb-6 md:mb-8"
        />

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.6 }}
          className="text-[#faf8f3]/90 text-sm md:text-base font-body tracking-wide mb-12 md:mb-16"
        >
          {invitation.wedding.displayDate}
        </motion.p>

        <motion.button
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.75 }}
          onClick={handleEnter}
          disabled={isEntering}
          className="group relative px-10 md:px-14 py-3.5 md:py-4 border border-[#faf8f3]/60 text-[#faf8f3] text-[11px] md:text-xs font-body tracking-[0.25em] uppercase overflow-hidden transition-colors duration-500 hover:border-[#faf8f3] disabled:pointer-events-none"
        >
          <span className="relative z-10 group-hover:text-[#2b2520] transition-colors duration-500">
            Open Invitation
          </span>
          <span className="absolute inset-0 bg-[#faf8f3] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out" />
        </motion.button>
      </div>
    </motion.div>
  );
}
