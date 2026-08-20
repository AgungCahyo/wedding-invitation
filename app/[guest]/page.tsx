"use client";

import { AnimatePresence, motion } from "motion/react";
import { MusicProvider } from "@/src/context/MusicContext";
import { Opening } from "@/src/components/Opening";
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
import { AutoScroll } from "@/src/components/AutoScroll";
import { ImageBreak } from "@/src/components/ImageBreak";
import { Footer } from "@/src/components/Footer";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { recordGuestView } from "@/src/lib/guest-link-service";
import { Flourish } from "@/src/components/ui/Flourish";

export default function GuestInvitation() {
  const params = useParams();
  const guestParam = typeof params?.guest === "string" ? decodeURIComponent(params.guest) : "";
  const guestName = guestParam || "Tamu"; // fallback if no name supplied

  const [showOpening, setShowOpening] = useState(true);

  // Fire-and-forget view tracking — lets the admin dashboard show which
  // guests have opened their invitation. Uses the raw (still-encoded) slug
  // from the URL so it matches the slug persisted by the link generator.
  const guestSlug = typeof params?.guest === "string" ? params.guest : "";
  useEffect(() => {
    if (guestSlug) {
      recordGuestView(guestSlug);
    }
  }, [guestSlug]);

  return (
    <>
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
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center px-6 pt-20 pb-6 md:pt-28 md:pb-10 text-center max-w-md mx-auto"
          >
            <p className="eyebrow mb-6">Kepada Yth.</p>

            <h1 className="font-display capitalize italic text-[clamp(1.75rem,5vw,2.5rem)] leading-tight text-[var(--text-primary)] mb-8">
              {guestName}
            </h1>

            <Flourish className="mx-auto mb-8 text-[var(--accent-muted)]" />

            <p className="font-body text-sm md:text-[0.95rem] text-[var(--text-secondary)] leading-relaxed">
              Dengan hormat kami mengundang Bapak/Ibu/Saudara/i untuk hadir
              dan memberikan doa restu pada pernikahan kami.
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
          <AutoScroll enabled={!showOpening} />
        </motion.main>
      )}
      </MusicProvider>
    </>
  );
}