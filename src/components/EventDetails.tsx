"use client";

import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Sprig } from "@/src/components/ui/Sprig";
import { Fleuron } from "@/src/components/ui/Fleuron";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";

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
        <SectionHeader label="Acara" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={easeOut}
          className="text-center"
        >
          <p className="eyebrow mb-5">{akad.dayName}</p>
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
            <Sprig className="h-20 sm:h-28 md:h-36 opacity-70" />
            <p className="font-display text-[clamp(4.5rem,16vw,8rem)] leading-none tracking-tight text-[var(--text-primary)]">
              {dayNum}
            </p>
            <Sprig mirrored className="h-20 sm:h-28 md:h-36 opacity-70" />
          </div>
          <p className="font-display italic text-xl md:text-2xl text-[var(--text-secondary)] mt-3 mb-14 md:mb-16">
            {monthName} {year}
          </p>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 max-w-md mx-auto mb-14 md:mb-16 items-start">
            <div>
              <p className="eyebrow mb-3">Akad Nikah</p>
              <p className="font-body text-sm md:text-base text-[var(--text-primary)]">
                {akad.time}
              </p>
            </div>
            <Fleuron className="mt-5" />
            <div>
              <p className="eyebrow mb-3">Resepsi</p>
              <p className="font-body text-sm md:text-base text-[var(--text-primary)]">
                {reception.time}
              </p>
            </div>
          </div>

          <p className="font-display text-xl md:text-2xl text-[var(--text-primary)] mb-3">
            {akad.venue}
          </p>
          <p className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto mb-12">
            {akad.address}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <a
              href={akad.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-editorial"
            >
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
