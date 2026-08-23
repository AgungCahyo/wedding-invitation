"use client";

import { useState } from "react";

/**
 * Template 02's cover screen.
 *
 * Deliberately different visual direction from Ayutika: no cover
 * photograph, no floral/calligraphy ornament, no monogram — a flat,
 * high-contrast editorial layout with an asymmetric name stack and a
 * single hairline rule instead of a decorative flourish.
 *
 * Contract matches Ayutika's OpeningProps exactly ({ onEnter, guestName? })
 * so active-template.ts can treat both templates' Opening interchangeably.
 * onEnter still fires from an explicit user action (button press) — the
 * app-shell lifecycle (AnimatePresence, showOpening state) is untouched.
 */
interface OpeningProps {
  onEnter: () => void;
  guestName?: string;
  invitation?: any;
}

export function Opening({ onEnter, guestName, invitation }: OpeningProps) {
  const [isEntering, setIsEntering] = useState(false);
  const { groom, bride } = invitation.couple;
  const showGuestName = Boolean(guestName && guestName.trim() && guestName !== "Tamu");

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(onEnter, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[var(--bg-primary)] px-6 py-10 md:px-16 md:py-14 transition-opacity duration-400"
      style={{ opacity: isEntering ? 0 : 1 }}
    >
      <p className="t02-eyebrow">{invitation.wedding.displayDate}</p>

      <div className="flex flex-col gap-1 md:gap-2 self-start max-w-2xl">
        <h1 className="t02-display text-[clamp(2.5rem,9vw,6rem)]">{bride.name}</h1>
        <h1 className="t02-display text-[clamp(2.5rem,9vw,6rem)] self-end pr-2 md:pr-6">
          {groom.name}
        </h1>
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
        <div className="t02-hairline pt-6 md:pt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          {showGuestName ? (
            <div>
              <p className="t02-eyebrow mb-1">Kepada Yth.</p>
              <p className="font-body text-sm md:text-base text-[var(--text-primary)]">
                {guestName}
              </p>
            </div>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={handleEnter}
            disabled={isEntering}
            className="t02-btn self-start md:self-auto"
          >
            Buka Undangan
          </button>
        </div>
      </div>
    </div>
  );
}