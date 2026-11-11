/**
 * Window event names — keep string values identical to existing dispatch/listen sites.
 */
export const WINDOW_EVENTS = {
  PHOTOBOOTH_OPEN: "photobooth:open",
  PHOTOBOOTH_CLOSE: "photobooth:close",
  PHOTOBOOTH_CAPTURED: "photobooth:captured",
  AUTOSCROLL_PAUSE: "autoscroll:pause",
} as const;

export type WindowEventType = keyof typeof WINDOW_EVENTS;
