interface SectionProps {
  guestName?: string;
  guestSlug?: string;
  invitation: any;
  invitationId?: string | undefined;
}

/** Template 02 proof-of-concept section: a short greeting that uses guestName when supplied. */
export function Intro({ guestName, guestSlug, invitation, invitationId }: SectionProps) {
  const { groom, bride } = invitation.couple;
  const hasGuestName = Boolean(guestName && guestName.trim() && guestName !== "Tamu");

  return (
    <section className="px-6 md:px-16 py-16 md:py-24 max-w-3xl">
      <p className="t02-eyebrow mb-4">Undangan Pernikahan</p>
      <p className="font-body text-lg md:text-2xl leading-relaxed text-[var(--text-secondary)]">
        {hasGuestName ? (
          <>
            Kepada <span className="text-[var(--text-primary)] font-medium">{guestName}</span>,
            dengan penuh sukacita kami mengundang Anda untuk hadir merayakan pernikahan{" "}
          </>
        ) : (
          "Dengan penuh sukacita kami mengundang Anda untuk hadir merayakan pernikahan "
        )}
        <span className="text-[var(--text-primary)] font-medium">{bride.name}</span> &{" "}
        <span className="text-[var(--text-primary)] font-medium">{groom.name}</span>.
      </p>
    </section>
  );
}