"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { useMusic } from "@/src/context/MusicContext";
import { Ampersand } from "@/src/designs/editorial/ornaments/Ampersand";
import { EditorialRule } from "@/src/designs/editorial/ornaments/EditorialRule";
import { editorialEasing, fadeUpEditorial } from "@/src/designs/editorial/motion";

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
  const showGuestName = Boolean(guestName && guestName.trim() && guestName !== "Tamu");

  const handleEnter = () => {
    setIsEntering(true);
    startMusic();
    setTimeout(onEnter, 700);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isEntering ? 0 : 1 }}
      transition={{ duration: 0.7, ease: editorialEasing }}
      className="fixed inset-0 z-50 overflow-hidden bg-[var(--bg-primary)]"
    >
      {/* Asymmetric split: image occupies a deliberate portion, not a full-bleed hero */}
      <div className="relative h-full grid md:grid-cols-[1.1fr_1fr]">
        {/* Text column — comes first in DOM/visually on mobile, left column on desktop */}
        <div className="relative order-2 md:order-1 flex flex-col justify-center px-6 md:px-14 lg:px-20 py-10 text-left">
          <motion.div
            initial="hidden"
            animate={isEntering ? "hidden" : "visible"}
            variants={fadeUpEditorial}
            transition={{ ...fadeUpEditorial.visible && { delay: 0.1 } }}
          >
            <EditorialRule align="left" className="mb-5 md:mb-6" />
            <p
              className="mb-4 md:mb-5 text-[0.6875rem] font-medium uppercase tracking-[0.28em]"
              style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
            >
              {invitation.cover.label}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isEntering ? "hidden" : "visible"}
            variants={fadeUpEditorial}
            transition={{ delay: 0.25, duration: 0.9, ease: editorialEasing }}
            className="mb-2"
          >
            <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.02em] text-[var(--text-primary)]">
              {getDisplayName(bride.name)}
            </h1>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isEntering ? "hidden" : "visible"}
            variants={fadeUpEditorial}
            transition={{ delay: 0.4, duration: 0.9, ease: editorialEasing }}
            className="mb-2 pl-[6%]"
          >
            <Ampersand />
          </motion.div>

          <motion.div
            initial="hidden"
            animate={isEntering ? "hidden" : "visible"}
            variants={fadeUpEditorial}
            transition={{ delay: 0.5, duration: 0.9, ease: editorialEasing }}
            className="mb-6 md:mb-8 pl-[6%]"
          >
            <h1 className="font-display italic text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.02em] text-[var(--text-primary)]">
              {getDisplayName(groom.name)}
            </h1>
          </motion.div>

          <motion.p
            initial="hidden"
            animate={isEntering ? "hidden" : "visible"}
            variants={fadeUpEditorial}
            transition={{ delay: 0.65, duration: 0.8, ease: editorialEasing }}
            className="mb-6 md:mb-8 font-body text-sm md:text-base text-[var(--text-secondary)] tracking-[0.02em]"
          >
            {invitation.wedding.displayDate}
          </motion.p>

          {showGuestName && (
            <motion.div
              initial="hidden"
              animate={isEntering ? "hidden" : "visible"}
              variants={fadeUpEditorial}
              transition={{ delay: 0.75, duration: 0.8, ease: editorialEasing }}
              className="mb-7 md:mb-9"
            >
              <p
                className="mb-1.5 text-[0.625rem] font-medium uppercase tracking-[0.28em]"
                style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
              >
                Kepada Yth.
              </p>
              <p className="font-display italic capitalize text-lg md:text-xl text-[var(--text-primary)]">
                {guestName}
              </p>
            </motion.div>
          )}

          <motion.button
            initial="hidden"
            animate={isEntering ? "hidden" : "visible"}
            variants={fadeUpEditorial}
            transition={{ delay: 0.9, duration: 0.8, ease: editorialEasing }}
            onClick={handleEnter}
            disabled={isEntering}
            className="group relative inline-flex w-fit items-center gap-3 text-[var(--text-primary)] text-[0.6875rem] font-medium uppercase tracking-[0.25em] disabled:pointer-events-none"
            style={{ fontFamily: "var(--font-label)" }}
          >
            <span>Buka Undangan</span>
            <span className="relative h-px w-10 bg-[var(--text-primary)] overflow-hidden">
              <span className="absolute inset-0 bg-[var(--accent)] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </span>
          </motion.button>
        </div>

        {/* Image column — asymmetric crop, not full-bleed hero */}
        <div className="relative order-1 md:order-2 h-[42vh] md:h-full overflow-hidden">
          <Image
            src={invitation.cover.image}
            alt="Wedding cover"
            fill
            priority
            className="object-cover object-[center_20%] scale-[1.03]"
            sizes="(min-width: 768px) 45vw, 100vw"
            placeholder={getBlurDataURL(invitation.cover.image) ? "blur" : "empty"}
            blurDataURL={getBlurDataURL(invitation.cover.image)}
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[var(--overlay)]/25 via-transparent to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}
