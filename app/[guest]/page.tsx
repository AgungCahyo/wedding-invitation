"use client";

import { motion } from "motion/react";
import { Flourish } from "@/src/components/ui/Flourish";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { recordGuestView, fetchGuestLinkBySlug, type GuestLinkRecord } from "@/src/lib/guest-link-service";
import { splitGuestSegment } from "@/src/lib/guest-token";
import { InvitationShell } from "@/src/components/invitation/InvitationShell";
import { InvitationSections } from "@/src/components/invitation/InvitationSections";

export default function GuestInvitation() {
  const params = useParams();
  // URL segment is "<encoded-name>~<token>" (token optional on legacy links).
  const rawSegment = typeof params?.guest === "string" ? params.guest : "";
  const { slug: nameSlug } = splitGuestSegment(rawSegment);
  const guestParam = nameSlug ? decodeURIComponent(nameSlug) : "";
  const guestName = guestParam || "Tamu"; // fallback if no name supplied

  const [guestTouch, setGuestTouch] = useState<GuestLinkRecord | null>(null);

  // Fire-and-forget view tracking — lets the admin dashboard show which
  // guests have opened their invitation. Uses the raw (still-encoded) slug
  // from the URL so it matches the slug persisted by the link generator.
  const guestSlug = nameSlug;
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

  const welcomeSection = (
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
  );

  return (
    <InvitationShell photoBoothPlacement="inside" guestName={guestName}>
      <InvitationSections
        guestName={guestName}
        footerInsideMain={true}
        welcomeSection={welcomeSection}
      />
    </InvitationShell>
  );
}