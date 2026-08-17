"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";

interface OpeningProps {
  onEnter: () => void;
}

export function Opening({ onEnter }: OpeningProps) {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isEntering ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50"
    >
      <div className="relative w-full h-full bg-gradient-to-b from-[#faf8f3] via-[#faf8f3] to-[#f5f3f0]">
        {/* Background pattern - subtle diagonal lines */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 35px,
                  #2b2520 35px,
                  #2b2520 70px
                )
              `,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 md:px-8">
          {/* Top decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-16 h-px bg-[#c9a876] mb-8 md:mb-12"
          />

          {/* Opening text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-8 md:mb-12"
          >
            <p className="text-[#8b7f76] text-sm md:text-base tracking-widest font-body mb-4 md:mb-6">
              THE WEDDING OF
            </p>
          </motion.div>

          {/* Names */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display mb-6 md:mb-8 text-[#2b2520]">
              {invitation.couple.groom.name}
            </h1>
            <p className="text-[#8b7f76] text-lg md:text-2xl font-body">
              &
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display mt-6 md:mt-8 text-[#2b2520]">
              {invitation.couple.bride.name}
            </h1>
          </motion.div>

          {/* Date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="text-[#5a524a] text-sm md:text-base font-body tracking-wide">
              15 Juni 2024
            </p>
          </motion.div>

          {/* Bottom decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="w-16 h-px bg-[#c9a876] mb-12 md:mb-16"
          />

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEnter}
            className="px-8 md:px-10 py-3 md:py-4 border border-[#2b2520] text-[#2b2520] text-sm md:text-base font-body tracking-widest hover:bg-[#2b2520] hover:text-[#faf8f3] transition-colors duration-300"
          >
            OPEN INVITATION
          </motion.button>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-8 md:bottom-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-[#8b7f76] text-xs font-body">scroll</p>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-[#8b7f76]"
              >
                <path
                  d="M10 15L5 10M10 15L15 10M10 15V5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
