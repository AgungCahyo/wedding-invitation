"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MusicProvider } from "@/src/context/MusicContext";
import { Opening } from "@/src/components/Opening";
import { Footer } from "@/src/components/Footer";
import { FloatingBar } from "@/src/components/FloatingBar";
import { LyricsRail } from "@/src/components/LyricsRail";
import { PhotoBooth } from "@/src/components/PhotoBooth";
import { useCameraDeepLink } from "@/src/hooks/useCameraDeepLink";

interface InvitationShellProps {
  children: React.ReactNode;
  /** PhotoBooth placement: "outside" = after </main> (public page), "inside" = inside <main> (guest page) */
  photoBoothPlacement?: "outside" | "inside";
  /** Auto-open PhotoBooth from deep-link `?camera=open` (public page only) */
  autoOpenCamera?: boolean;
  /** Guest name for personalized Opening (guest page only) */
  guestName?: string;
}

export function InvitationShell({
  children,
  photoBoothPlacement = "outside",
  autoOpenCamera: autoOpenCameraProp = false,
  guestName,
}: InvitationShellProps) {
  const [showOpening, setShowOpening] = useState(true);
  const [autoOpenCamera, setAutoOpenCamera] = useState(autoOpenCameraProp);

  // Handle deep-link ?camera=open (public page only)
  useCameraDeepLink(setShowOpening, setAutoOpenCamera);

  return (
    <MusicProvider>
      <AnimatePresence mode="wait">
        {showOpening && (
          <Opening key="opening" onEnter={() => setShowOpening(false)} guestName={guestName} />
        )}
      </AnimatePresence>

      {!showOpening && (
        <>
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {children}
            {photoBoothPlacement === "inside" && <PhotoBooth autoOpen={autoOpenCamera} />}
          </motion.main>
          {photoBoothPlacement === "outside" && <PhotoBooth autoOpen={autoOpenCamera} />}
          <Footer />
          <LyricsRail />
          <FloatingBar />
        </>
      )}
    </MusicProvider>
  );
}