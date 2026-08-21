"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/designs/editorial/ui/SectionHeader";
import { editorialEasing, fadeUpEditorial, viewportOnce } from "@/src/designs/editorial/motion";

export function EventDetails() {
  const { akad, reception } = invitation.events;
  const [year, month, day] = invitation.wedding.date.split("-").map(Number);
  const dayNum = String(day).padStart(2, "0");
  const monthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
    new Date(year, month - 1, 1)
  );

  return (
    <section id="events" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-2xl">
        <SectionHeader index="02" label="Acara" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUpEditorial}
          transition={{ duration: 0.9, ease: editorialEasing }}
        >
          <p
            className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.25em]"
            style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
          >
            {akad.dayName}
          </p>
          <div className="flex items-end gap-4 mb-12 md:mb-16">
            <p className="font-display text-[clamp(4.5rem,16vw,8rem)] leading-[0.85] tracking-tight text-[var(--text-primary)]">
              {dayNum}
            </p>
            <p className="font-display italic text-xl md:text-2xl text-[var(--text-secondary)] pb-2">
              {monthName} {year}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-md mb-14 md:mb-16">
            <div>
              <p
                className="mb-2 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
                style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
              >
                Akad Nikah
              </p>
              <p className="font-body text-sm md:text-base text-[var(--text-primary)]">{akad.time}</p>
            </div>
            <div>
              <p
                className="mb-2 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
                style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
              >
                Resepsi
              </p>
              <p className="font-body text-sm md:text-base text-[var(--text-primary)]">{reception.time}</p>
            </div>
          </div>

          <p className="font-display text-xl md:text-2xl text-[var(--text-primary)] mb-3">{akad.venue}</p>
          <p className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-sm mb-10">
            {akad.address}
          </p>

          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            <a href={akad.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-editorial">
              Peta Lokasi
            </a>
            <a href="/calendar.ics" className="btn-editorial">
              Tambah ke Kalender
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
