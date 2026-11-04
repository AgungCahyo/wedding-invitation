"use client";

import { useEffect, useState, startTransition } from "react";
import { AnimatePresence } from "motion/react";
import { PhotoBoothModal } from "@/src/components/photobooth/PhotoBoothModal";
import { OPEN_PHOTOBOOTH_EVENT } from "@/src/lib/floating-bar";

export function PhotoBooth({
  guestName,
  autoOpen = false,
}: {
  guestName?: string;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (autoOpen) startTransition(() => setOpen(true));
  }, [autoOpen]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_PHOTOBOOTH_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PHOTOBOOTH_EVENT, onOpen);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <PhotoBoothModal
          key="photobooth"
          guestName={guestName}
          onClose={() => setOpen(false)}
        />
      )}
    </AnimatePresence>
  );
}
