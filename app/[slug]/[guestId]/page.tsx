"use client";

import { AnimatePresence, motion } from "motion/react";
import { MusicProvider } from "@/src/context/MusicContext";
import { getTemplateImplementation } from "@/src/templates/active-template";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { LyricsRail } from "@/src/components/LyricsRail";
import { AutoScroll } from "@/src/components/AutoScroll";
import { Footer } from "@/src/components/Footer";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchPublicGuestTouch, type PublicGuestTouch } from "@/src/lib/public-invitation-service";
import { getInvitationBySlug } from "@/src/lib/invitation-service";
import { notFound } from "next/navigation";

export default function GuestInvitation() {
  const params = useParams();
  const invitationSlug = typeof params?.slug === "string" ? params.slug : "";
  // IMPORTANT: unlike Route Handler `params`, page-level `params` (via
  // useParams here, or an async server-component `params` prop) are NOT
  // automatically URI-decoded by Next.js — verified directly against this
  // app's Next.js 16 build. The URL segment "budi%20kejora" arrives here
  // still literally encoded. Decode it ONCE to get the canonical value
  // that matches guest_links.slug — this same value is reused below for
  // both display (guestName) and the personalization lookup (guestSlug).
  const guestParam = typeof params?.guestId === "string" ? decodeURIComponent(params.guestId) : "";
  const guestName = guestParam || "Tamu"; // fallback if no name supplied

  const [showOpening, setShowOpening] = useState(true);
  const [guestTouch, setGuestTouch] = useState<PublicGuestTouch | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch invitation data based on slug
  useEffect(() => {
    async function loadInvitation() {
      setLoading(true);
      try {
        const data = await getInvitationBySlug(invitationSlug);
        if (data) {
          setInvitationData(data);
        } else {
          // Invitation not found
          notFound();
        }
      } catch (error) {
        console.error("Failed to load invitation:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    if (invitationSlug) {
      loadInvitation();
    } else {
      setLoading(false);
    }
  }, [invitationSlug]);

  // Fire-and-forget view tracking — lets the admin dashboard show which
  // guests have opened their invitation. Reuses the decoded guestParam
  // (canonical, matches guest_links.slug) rather than the raw route
  // param — fetchPublicGuestTouch encodes it once for its own request
  // URL, and the API route's params are auto-decoded back to this same
  // canonical value by Next.js.
  const guestSlug = guestParam;
  useEffect(() => {
    if (guestSlug && invitationData) {
      fetchPublicGuestTouch(invitationData.slug, guestSlug).then((result) => {
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

  const { Opening, sectionOrder, sections } = getTemplateImplementation(invitationData.template);

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
            return <Section key={key} guestName={guestName} invitation={invitationData} guestSlug={guestSlug} />;
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