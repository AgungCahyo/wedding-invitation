"use client";

import { AnimatePresence, motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { MusicProvider } from "@/src/context/MusicContext";
import { Opening } from "@/src/components/Opening";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
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
import { ImageBreak } from "@/src/components/ImageBreak";
import { Footer } from "@/src/components/Footer";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function GuestInvitation() {
  const params = useParams();
  const guestParam = typeof params?.guest === "string" ? decodeURIComponent(params.guest) : "";
  const guestName = guestParam || "Tamu"; // fallback if no name supplied

  const [showOpening, setShowOpening] = useState(true);

  return (
    <MusicProvider>
      <AnimatePresence mode="wait">
        {showOpening && (
          <Opening key="opening" onEnter={() => setShowOpening(false)} />
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
            className="flex flex-col items-center gap-4 px-6 pt-12 pb-10 md:pt-16 md:pb-12 text-center max-w-xl mx-auto"
          >
            {/* Eyebrow label */}
            <p className="eyebrow tracking-widest text-xs md:text-sm uppercase text-[var(--text-secondary)]">
              Wedding Invitation
            </p>

            {/* Guest name */}
            <h1 className="font-display text-[clamp(2rem,6vw,3.25rem)] leading-tight text-[var(--text-primary)]">
              Dear {guestName},
            </h1>

            {/* Invitation copy */}
            <p className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
              You are cordially invited to celebrate the wedding of
            </p>


            {/* Decorative rule */}
            <div className="section-inner">
              <SectionHeader className="mt-0" />
            </div>
          </motion.section>
          <Couple />
          <Quote />
          <EventDetails />
          <Countdown />
          <ImageBreak />
          <Story />
          <Gallery />
          <RSVP />
          <Wishes />
          <DigitalGift />
          <Closing />
          <Footer />
          <MusicPlayer />
        </motion.main>
      )}
    </MusicProvider>
  );
}
