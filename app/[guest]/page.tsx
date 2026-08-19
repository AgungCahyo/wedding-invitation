"use client";

import { AnimatePresence, motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { MusicProvider } from "@/src/context/MusicContext";
import { Opening } from "@/src/components/Opening";
import { Ornament } from "@/src/components/ui/Ornament";
import { Couple } from "@/src/components/Couple";
import { Quote } from "@/src/components/Quote";
import { EventDetails } from "@/src/components/EventDetails";
import { Countdown } from "@/src/components/Countdown";
import { Story } from "@/src/components/Story";
import { Gallery } from "@/src/components/Gallery";
import { RSVP } from "@/src/components/RSVP";
import { Wishes } from "@/src/components/Wishes";
import { DigitalGift } from "@/src/components/DigitalGift";
import { Closing } from "@/src/components/Closing";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { LyricsRail } from "@/src/components/LyricsRail";
import { LyricsTester } from "@/src/components/LyricsTester";
import { AutoScroll } from "@/src/components/AutoScroll";
import { ImageBreak } from "@/src/components/ImageBreak";
import { Footer } from "@/src/components/Footer";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function GuestInvitation() {
  const params = useParams();
  const guestParam = typeof params?.guest === "string" ? decodeURIComponent(params.guest) : "";
  const guestName = guestParam || "Tamu"; // fallback if no name supplied

  const [showOpening, setShowOpening] = useState(true);

  const { groom, bride } = invitation.couple;
  const monogram = `${groom.name.charAt(0)}${bride.name.charAt(0)}`;

  return (
    <MusicProvider>
      <AnimatePresence mode="wait">
        {showOpening && (
          <Opening
            key="opening"
            onEnter={() => setShowOpening(false)}
            guestName={guestName}
          />
        )}
      </AnimatePresence>

      {!showOpening && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* ── Personalized greeting ── */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center px-6 pt-16 pb-10 md:pt-20 md:pb-14 text-center max-w-lg mx-auto"
          >
            {/* Monogram */}
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="font-maellen text-3xl md:text-4xl text-[var(--accent)] mb-5"
              aria-hidden="true"
            >
              {monogram}
            </motion.span>

            {/* Eyebrow label */}
            <p className="eyebrow mb-3">Wedding Invitation</p>

            <div className="flex items-center justify-center gap-3 mb-8 w-full">
              <span className="flex-1 max-w-[64px] h-px bg-[var(--border)]" />
              <Ornament />
              <span className="flex-1 max-w-[64px] h-px bg-[var(--border)]" />
            </div>

            {/* Salutation */}
            <p className="eyebrow mb-5 text-[var(--text-tertiary)]">Kepada Yth.</p>

            {/* Guest name, set as a framed name plate */}
            <h1 className="font-display capitalize italic text-[clamp(1.75rem,5vw,2.75rem)] leading-tight text-[var(--text-primary)] border-y border-[var(--border)] py-5 px-6 md:px-10 mb-8 w-full">
              {guestName}
            </h1>

            {/* Invitation copy */}
            <p className="font-body text-[13px] md:text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm">
              Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i
              untuk berkenan hadir dan memberikan doa restu pada pernikahan kami
            </p>
          </motion.section>
          <Couple />
          <Quote />
          <EventDetails />
          <Countdown />
          <ImageBreak />
          <Story />
          <Gallery />
          <RSVP guestName={guestName} />
          <Wishes guestName={guestName} />
          <DigitalGift />
          <Closing />
          <Footer />
          <MusicPlayer />
          <LyricsRail />
          <LyricsTester />
          <AutoScroll enabled={!showOpening} />
        </motion.main>
      )}
    </MusicProvider>
  );
}