"use client";

import { AnimatePresence, motion } from "motion/react";
import { MusicProvider } from "@/src/context/MusicContext";
import { getTemplateImplementation } from "@/src/templates/active-template";
import { MusicPlayer } from "@/src/components/MusicPlayer";
import { LyricsRail } from "@/src/components/LyricsRail";
import { Footer } from "@/src/components/Footer";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getInvitationBySlug } from "@/src/lib/invitation-service";
import { notFound } from "next/navigation";

export default function GuestInvitation() {
  const params = useParams();
  const [showOpening, setShowOpening] = useState(true);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvitation() {
      setLoading(true);
      try {
        const slug = typeof params?.slug === "string" ? decodeURIComponent(params.slug) : "";
        const data = await getInvitationBySlug(slug);
        if (data) {
          setInvitationData(data);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Failed to load invitation:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    if (params?.slug) {
      loadInvitation();
    } else {
      setLoading(false);
    }
  }, [params.slug]);

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
              guestName=""
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
            {sectionOrder.map((key) => {
              const Section = sections[key];
              return (
                <Section
                  key={key}
                  guestName="" // No guest for invitation root
                  invitation={invitationData}
                />
              );
            })}
            <Footer invitation={invitationData} />
            <MusicPlayer />
            <LyricsRail invitation={invitationData} />
          </motion.main>
        )}
      </MusicProvider>
    </>
  );
}