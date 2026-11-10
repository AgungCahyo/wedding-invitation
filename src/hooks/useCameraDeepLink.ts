"use client";

import { useEffect } from "react";
import { startTransition } from "react";

/**
 * Hook to handle the `?camera=open` deep-link from QR codes at the venue.
 * Opens the PhotoBooth directly and cleans the URL.
 * Uses `startTransition` to avoid ESLint `set-state-in-effect` error.
 */
export function useCameraDeepLink(
  setShowOpening: (value: boolean) => void,
  setAutoOpenCamera: (value: boolean) => void
) {
  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get("camera") === "open") {
      startTransition(() => {
        setShowOpening(false);
        setAutoOpenCamera(true);
      });

      url.searchParams.delete("camera");

      window.history.replaceState(
        {},
        "",
        `${url.pathname}${url.search}${url.hash}`
      );
    }
  }, [setShowOpening, setAutoOpenCamera]);
}