/**
 * Window event names — centralized to avoid typos.
 */
export const WINDOW_EVENTS = {
  PHOTOBOOTH_OPEN: "photobooth:open",
  PHOTOBOOTH_CLOSE: "photobooth:close",
  PHOTOBOOTH_CAPTURED: "photobooth:captured",
} as const;

export type WindowEventType = keyof typeof WINDOW_EVENTS;