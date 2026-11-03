"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera } from "lucide-react";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { PhotoBoothModal } from "@/src/components/photobooth/PhotoBoothModal";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function PhotoBooth({ guestName, autoOpen = false }: { guestName?: string; autoOpen? : boolean}) {
  const [open, setOpen] = useState(false);
  const [inView, setInView] = useState(false);
  const [pulse, setPulse] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if(autoOpen) {
      setOpen(true)
    }
  }, [autoOpen])

  // The floating button steps aside while the booth section itself is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A gentle pulse for the first few seconds only, then it stays calm.
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const showFab = !open && !inView;

  return (
    <section ref={sectionRef} id="photobooth" className="section bg-[var(--bg-secondary)]">
      <div className="section-inner max-w-xl text-center">
        <SectionHeader
          label="Photo Booth"
          subtitle="Abadikan momen bahagia bersama kami. Pilih frame pernikahan, tambahkan filter, lalu unduh atau bagikan fotonya."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.12 }}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-editorial-filled max-w-[16rem] mx-auto !flex items-center justify-center gap-3"
          >
            <Camera size={16} strokeWidth={1.5} />
            Ambil Foto
          </button>
          <p className="mt-5 text-[11px] text-[var(--text-tertiary)] tracking-wide">
            Foto baru dikirim ke layar acara jika Anda menyetujuinya. Mengunduh foto tidak mengunggah apa pun.
          </p>
        </motion.div>
      </div>

      {/* Floating shortcut — sits just above the music button */}
      <AnimatePresence>
        {showFab && (
          <motion.button
            key="photobooth-fab"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Buka Photo Booth"
            initial={{ opacity: 0, scale: 0.7, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
            className="fixed z-40 bottom-[4.75rem] right-5 md:bottom-[5.75rem] md:right-8 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-[var(--accent)] text-[var(--bg-primary)] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.4)] hover:brightness-110 transition duration-300"
          >
            {pulse && (
              <span className="absolute inset-0 border border-[var(--accent)] animate-ping opacity-50 pointer-events-none" />
            )}
            <Camera size={18} strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && <PhotoBoothModal key="photobooth" guestName={guestName} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}