"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";
import { getBlurDataURL } from "@/src/data/blur-placeholders";
import { useMusic } from "@/src/context/MusicContext";
import { CornerFrame } from "@/src/components/ui/CornerFrame";
import { Flourish } from "@/src/components/ui/Flourish";
import { WaxSeal } from "@/src/components/ui/WaxSeal";
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

/** Satu baris nama yang "terangkat" dari balik garis, seperti dicetak/ditatah. */
function NameLine({
  children,
  delay,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <span className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "108%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Titik tempat layar "menutup" saat undangan dibuka (kira-kira posisi segel).
const IRIS_ORIGIN = "50% 90%";

export function Opening({ onEnter, guestName }: OpeningProps) {
  const [isEntering, setIsEntering] = useState(false);
  const { startMusic } = useMusic();
  const reduceMotion = useReducedMotion();
  const { groom, bride } = invitation.couple;
  const monogram = `${bride.name.charAt(10)}${groom.name.charAt(0)}`;
  const showGuestName = Boolean(guestName && guestName.trim() && guestName !== "Tamu");

  const brideName = getDisplayName(bride.name.split(" ").slice(-2).join(" "));
  const groomName = getDisplayName(groom.name);

  const handleEnter = () => {
    setIsEntering(true);
    startMusic();
    setTimeout(onEnter, reduceMotion ? 400 : 950);
  };

  // Transisi keluar: layar menyempit ke arah segel (iris). Fade biasa jika reduced-motion.
  const rootAnimate = reduceMotion
    ? { opacity: isEntering ? 0 : 1 }
    : {
        clipPath: isEntering
          ? `circle(0% at ${IRIS_ORIGIN})`
          : `circle(150% at ${IRIS_ORIGIN})`,
      };

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { clipPath: `circle(150% at ${IRIS_ORIGIN})` }}
      animate={rootAnimate}
      transition={{ duration: reduceMotion ? 0.4 : 0.95, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-50 overflow-hidden bg-[var(--bg-primary)]"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={invitation.cover.image}
            alt="Wedding cover"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            placeholder={getBlurDataURL(invitation.cover.image) ? "blur" : "empty"}
            blurDataURL={getBlurDataURL(invitation.cover.image)}
          />
        </motion.div>

        <div className="absolute inset-0 bg-[var(--bg-primary)]/25" />

        {/* Atas ringan, bawah pekat: foto tetap hidup di tengah, teks terbaca di bawah */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/50 via-transparent via-45% to-[var(--bg-primary)]/92" />
      </div>

      {/* Corner Frame */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isEntering ? 0 : 1 }}
        transition={{ duration: 1, delay: isEntering ? 0 : 0.3 }}
        className="text-[var(--accent-muted)]"
      >
        <CornerFrame />
      </motion.div>

      {/* Main Layout */}
      <div className="relative flex h-full flex-col items-center justify-between px-6 pb-8 pt-8 text-center md:px-10 md:pb-10 md:pt-10">
        {/* TOP */}
        <div className="flex shrink-0 flex-col items-center">
          <motion.span
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.1 }}
            className="mb-2 font-maellen text-2xl text-[var(--accent)] md:text-3xl"
            aria-hidden="true"
          >
            {monogram}
          </motion.span>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.25 }}
            className="eyebrow text-[var(--text-tertiary)]"
          >
            {invitation.cover.label}
          </motion.p>
        </div>

        {/* MIDDLE: ruang untuk foto */}
        <div className="min-h-0 w-full flex-1" aria-hidden="true" />

        {/* BOTTOM */}
        <div className="flex w-full max-w-3xl shrink-0 flex-col items-center">
          {/* Couple Names — Asymmetric Editorial */}
<motion.div
  initial="hidden"
  animate="visible"
  variants={fadeUp}
  transition={{ ...easeOut, delay: 0.4 }}
  className="relative w-full max-w-3xl flex flex-col items-center mb-5 md:mb-7"
>
  {/* Bride */}
  <div className="w-full md:pl-4 lg:pl-12 text-left">
    <h1 className="font-maellen text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.95] text-[var(--text-primary)]">
      {getDisplayName(bride.name.split(" ").slice(-2).join(" "))}
    </h1>
  </div>

  {/* Ampersand */}
  <div className="relative w-full flex items-center justify-center my-1 md:my-2">
    <span className="absolute left-0 top-1/2 w-[25%] h-px bg-[var(--accent)]/35" />

    <span className="font-maellen italic text-[clamp(3rem,7vw,5rem)] text-[var(--accent)]/85 leading-none">
      &amp;
    </span>

    <span className="absolute right-0 top-1/2 w-[25%] h-px bg-[var(--accent)]/35" />
  </div>

  {/* Groom */}
  <div className="w-full md:pr-4 lg:pr-12 text-right">
    <h1 className="font-maellen text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.95] text-[var(--text-primary)]">
      {getDisplayName(groom.name)}
    </h1>
  </div>
</motion.div>

          {/* Flourish */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ ...easeOut, delay: 1.1 }}
            className="mb-3 md:mb-4"
          >
            <Flourish className="mx-auto w-32 text-[var(--accent)]/55 md:w-44" />
          </motion.div>

          {/* Date */}
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ ...easeOut, delay: 1.2 }}
            className="mb-4 font-body text-xs tracking-[0.08em] text-[var(--text-secondary)] md:text-sm"
          >
            {invitation.wedding.displayDate}
          </motion.p>

          {/* Guest Name: seperti alamat di amplop */}
          {showGuestName && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ ...easeOut, delay: 1.3 }}
              className="mb-5 flex flex-col items-center"
            >
              <p className="mb-1.5 font-display text-xs italic text-[var(--text-tertiary)] md:text-sm">
                Kepada Yth. Bapak/Ibu/Saudara/i
              </p>

              <p className="border-b border-[var(--accent)]/40 px-6 pb-1.5 font-display text-lg capitalize text-[var(--text-primary)] md:text-xl">
                {guestName}
              </p>
            </motion.div>
          )}

          {/* Segel lilin: tombol buka undangan */}
          <div className="flex flex-col items-center">
            <motion.button
              type="button"
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 1.4, y: -16 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0.5, delay: 1.45 }
                  : { type: "spring", stiffness: 260, damping: 20, delay: 1.45 }
              }
              whileHover={reduceMotion || isEntering ? undefined : { scale: 1.04, rotate: -2 }}
              whileTap={reduceMotion || isEntering ? undefined : { scale: 0.93 }}
              onClick={handleEnter}
              disabled={isEntering}
              aria-label="Buka undangan"
              className="relative h-32 w-32 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] disabled:pointer-events-none md:h-36 md:w-36"
            >
              {isEntering && !reduceMotion ? (
                <>
                  {/* Segel retak jadi dua saat dibuka */}
                  <motion.span
                    className="absolute inset-0 block"
                    style={{ transformOrigin: "50% 100%" }}
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                    animate={{ x: -16, y: 10, rotate: -12, opacity: 0 }}
                    transition={{ duration: 0.65, ease: [0.4, 0, 0.9, 0.6] }}
                  >
                    <WaxSeal monogram={monogram} half="left" className="h-full w-full" />
                  </motion.span>
                  <motion.span
                    className="absolute inset-0 block"
                    style={{ transformOrigin: "50% 100%" }}
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                    animate={{ x: 16, y: 10, rotate: 12, opacity: 0 }}
                    transition={{ duration: 0.65, ease: [0.4, 0, 0.9, 0.6] }}
                  >
                    <WaxSeal monogram={monogram} half="right" className="h-full w-full" />
                  </motion.span>
                </>
              ) : (
                <WaxSeal monogram={monogram} className="h-full w-full" />
              )}
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: isEntering ? 0 : 1 }}
              transition={{ duration: 0.8, delay: isEntering ? 0 : 2.1 }}
              className="mt-1 font-display text-xs italic text-[var(--text-tertiary)] md:text-sm"
              aria-hidden="true"
            >
              Ketuk segel untuk membuka
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}