"use client";

import { AnimatePresence, motion } from "motion/react";
import { MusicProvider } from "@/src/context/MusicContext";
import { TemplateProvider } from "@/src/context/TemplateContext";

// Design 1 — Romantic Minimalist
import { Opening as RomanticOpening } from "@/src/designs/romantic/components/Opening";
import { Couple as RomanticCouple } from "@/src/designs/romantic/components/Couple";
import { Quote } from "@/src/designs/romantic/components/Quote";
import { EventDetails as RomanticEventDetails } from "@/src/designs/romantic/components/EventDetails";
import { Countdown as RomanticCountdown } from "@/src/designs/romantic/components/Countdown";
import { Story as RomanticStory } from "@/src/designs/romantic/components/Story";
import { Gallery as RomanticGallery } from "@/src/designs/romantic/components/Gallery";
import { RSVP as RomanticRSVP } from "@/src/designs/romantic/components/RSVP";
import { Wishes as RomanticWishes } from "@/src/designs/romantic/components/Wishes";
import { DigitalGift as RomanticDigitalGift } from "@/src/designs/romantic/components/DigitalGift";
import { Closing as RomanticClosing } from "@/src/designs/romantic/components/Closing";
import { ImageBreak } from "@/src/designs/romantic/components/ImageBreak";
import { Flourish } from "@/src/designs/romantic/ui/Flourish";

// Design 2 — Modern Contemporary (own components + theme)
import {
  Opening as ModernOpening,
  EventDetails as ModernEventDetails,
  Countdown as ModernCountdown,
  Couple as ModernCouple,
  Gallery as ModernGallery,
  Story as ModernStory,
  RSVP as ModernRSVP,
  Wishes as ModernWishes,
  DigitalGift as ModernDigitalGift,
  Closing as ModernClosing,
  Footer as ModernFooter,
} from "@/src/designs/modern/components";
import { ModernHeader } from "@/src/designs/modern/layout/ModernHeader";
import { ModernShell } from "@/src/designs/modern/layout/ModernShell";

// Shared chrome
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { LyricsRail } from "@/src/components/LyricsRail";
import { AutoScroll } from "@/src/components/AutoScroll";
import { Footer } from "@/src/components/Footer";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { recordGuestView, fetchGuestLinkBySlug, type GuestLinkRecord } from "@/src/lib/guest-link-service";

export default function GuestInvitation() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isModern = searchParams.get("design") === "modern";

  const guestParam = typeof params?.guest === "string" ? decodeURIComponent(params.guest) : "";
  const guestName = guestParam || "Tamu";

  const [showOpening, setShowOpening] = useState(true);
  const [guestTouch, setGuestTouch] = useState<GuestLinkRecord | null>(null);

  const guestSlug = typeof params?.guest === "string" ? params.guest : "";
  useEffect(() => {
    if (guestSlug) {
      recordGuestView(guestSlug);
      fetchGuestLinkBySlug(guestSlug).then((result) => {
        if (result.success && result.data) {
          setGuestTouch(result.data);
        }
      });
    }
  }, [guestSlug]);

  return (
    <TemplateProvider template={isModern ? "modern" : "romantic"}>
      <MusicProvider>
        {isModern ? (
          <ModernShell>
            <AnimatePresence mode="wait">
              {showOpening && (
                <ModernOpening
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
                transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="pt-16 md:pt-24 px-6 md:px-8 pb-4">
                  <ModernHeader
                    guestName={guestName}
                    relation={guestTouch?.relation}
                    note={guestTouch?.personal_note}
                  />
                </div>
                <ModernEventDetails />
                <ModernCountdown />
                <ModernCouple />
                <ModernGallery />
                <ModernStory />
                <ModernRSVP guestName={guestName} />
                <ModernWishes guestName={guestName} />
                <ModernDigitalGift />
                <ModernClosing />
                <ModernFooter />
                <MusicPlayer />
                <LyricsRail />
                <AutoScroll enabled={!showOpening} />
              </motion.main>
            )}
          </ModernShell>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {showOpening && (
                <RomanticOpening
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

                  <h1 className="font-display capitalize italic text-[clamp(1.75rem,5vw,2.5rem)] leading-tight text-[var(--text-primary)] mb-2">
                    {guestName}
                  </h1>

                  {guestTouch?.relation ? (
                    <p className="text-xs text-[var(--text-tertiary)] font-body italic mb-6">
                      {guestTouch.relation}
                    </p>
                  ) : (
                    <div className="mb-6" />
                  )}

                  <Flourish className="mx-auto mb-8 text-[var(--accent-muted)]" />

                  {guestTouch?.personal_note ? (
                    <p className="font-display italic text-base md:text-lg text-[var(--text-primary)] leading-relaxed border-l-2 border-[var(--accent)] pl-4 text-left max-w-xs mx-auto">
                      {guestTouch.personal_note}
                    </p>
                  ) : (
                    <p className="font-body text-sm md:text-[0.95rem] text-[var(--text-secondary)] leading-relaxed">
                      Dengan hormat kami mengundang Bapak/Ibu/Saudara/i untuk hadir
                      dan memberikan doa restu pada pernikahan kami.
                    </p>
                  )}
                </motion.section>
                <RomanticCouple />
                <Quote />
                <RomanticEventDetails />
                <RomanticCountdown />
                <ImageBreak />
                <RomanticStory />
                <RomanticGallery />
                <RomanticRSVP guestName={guestName} />
                <RomanticWishes guestName={guestName} />
                <RomanticDigitalGift />
                <RomanticClosing />
                <Footer />
                <MusicPlayer />
                <LyricsRail />
                <AutoScroll enabled={!showOpening} />
              </motion.main>
            )}
          </>
        )}
      </MusicProvider>
    </TemplateProvider>
  );
}
