"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera } from "lucide-react";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { PhotoBoothModal } from "@/src/components/photobooth/PhotoBoothModal";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

export function PhotoBooth({ guestName, autoOpen = false }: { guestName?: string; autoOpen? : boolean}) {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    if(autoOpen) {
      setOpen(true)
    }
  }, [autoOpen])
  return (
    <section id="photobooth" className="section bg-[var(--bg-secondary)]">
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

      <AnimatePresence>
        {open && <PhotoBoothModal key="photobooth" guestName={guestName} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}
