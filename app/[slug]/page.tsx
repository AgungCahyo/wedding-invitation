"use client";

import { AnimatePresence, motion } from "motion/react";
import { MusicProvider } from "@/src/context/MusicContext";
import { activeTemplateImplementation } from "@/src/templates/active-template";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { LyricsRail } from "@/src/components/LyricsRail";
import { AutoScroll } from "@/src/components/AutoScroll";
import { Footer } from "@/src/components/Footer";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { recordGuestView, fetchGuestLinkBySlug, type GuestLinkRecord } from "@/src/lib/guest-link-service";
import { invitation } from "@/src/data/invitation";

export default function GuestInvitation() {
  const params = useParams();
  const guestParam = typeof params?.slug === "string" ? decodeURIComponent(params.slug) : "";
  const guestName = guestParam || "Tamu"; // fallback if no name supplied

  const [showOpening, setShowOpening] = useState(true);
  const [guestTouch, setGuestTouch] = useState<GuestLinkRecord | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch invitation data based on slug (static data for legacy route)
  useEffect(() => {
    async function loadInvitation() {
      setLoading(true);
      try {
        // For legacy route, we use static invitation data
        setInvitationData(invitation);
      } catch (error) {
        console.error("Failed to load invitation:", error);
        // Not found equivalent for static data - just keep loading false
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, []);

  // Fire-and-forget view tracking — lets the admin dashboard show which
  // guests have opened their invitation. Uses the raw (still-encoded) slug
  // from the URL so it matches the slug persisted by the link generator.
  const guestSlug = typeof params?.slug === "string" ? params.slug : "";
  useEffect(() => {
    if (guestSlug && invitationData) {
      // For legacy route, we use the static invitation ID
      recordGuestView(invitationData.id, guestSlug);
      fetchGuestLinkBySlug(invitationData.id, guestSlug).then((result) => {
        if (result.success && result.data) {
          setGuestTouch(result.data);
        }
      });
    }
  }, [guestSlug, invitationData]);

  if (loading || !invitationData) {
    // Return null or a loading state while fetching
    return null;
  }

  const { Opening, sectionOrder, sections } = activeTemplateImplementation;

  return (
    <>
      <MusicProvider invitation={invitationData}>
      <AnimatePresence mode="wait">
        {showOpening && (
          <Opening
            key="opening"
            onEnter={() => setShowOpening(false)}
            guestName={guestName}
            invitation={invitationData}
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
            <p className="text-[0.625rem] md:text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-[var(--text-tertiary)] mb-6">
              Kepada Yth.
            </p>

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

            <div className="mx-auto mb-8 h-px w-16 bg-[var(--accent-muted)]" />

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
          {sectionOrder.map((key) => {
            const Section = sections[key];
            return <Section key={key} guestName={guestName} invitation={invitationData} />;
          })}
          <Footer invitation={invitationData} />
          <MusicPlayer />
          <LyricsRail invitation={invitationData} />
          <AutoScroll enabled={!showOpening} />
        </motion.main>
      )}
      </MusicProvider>
    </>
  );
}