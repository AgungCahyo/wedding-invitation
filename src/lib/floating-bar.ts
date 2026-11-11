import { WINDOW_EVENTS } from "@/src/constants/events";

/** Shared look for every button inside the floating bar. */
export const BAR_BUTTON =
  "w-12 h-11 md:w-14 md:h-12 flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors duration-300";

/** The PhotoBooth section listens for this to open the booth modal. */
export const OPEN_PHOTOBOOTH_EVENT = WINDOW_EVENTS.PHOTOBOOTH_OPEN;

/** Game/aksi lain menyuruh auto-scroll berhenti (mis. saat mini game dimulai). */
export const PAUSE_AUTOSCROLL_EVENT = WINDOW_EVENTS.AUTOSCROLL_PAUSE;
