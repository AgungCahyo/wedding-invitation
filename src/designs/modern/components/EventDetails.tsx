"use client";

import { motion } from "motion/react";
import { MapPin, Clock, CalendarPlus } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { ModernSection } from "@/src/designs/modern/layout/ModernSection";
import { SectionLabel } from "@/src/designs/modern/layout/SectionLabel";
import { fadeUpModern, viewportOnce } from "@/src/designs/modern/motion";

function EventRow({
  index,
  label,
  time,
  venue,
  address,
  mapsUrl,
  delay,
}: {
  index: string;
  label: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
  delay: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUpModern}
      transition={{ delay }}
      className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 py-8 border-t border-[var(--border)]"
    >
      <span className="text-[10px] font-body tabular-nums tracking-[0.16em] text-[var(--accent)] pt-1">
        {index}
      </span>
      <div>
        <p className="text-[11px] font-body font-medium tracking-[0.22em] uppercase text-[var(--text-tertiary)] mb-3">
          {label}
        </p>
        <div className="flex items-start gap-3 mb-3">
          <Clock size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[var(--text-primary)]" />
          <p className="font-body text-base md:text-lg tracking-tight">{time}</p>
        </div>
        <div className="flex items-start gap-3">
          <MapPin size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[var(--text-primary)]" />
          <div>
            <p className="font-body text-base md:text-lg tracking-tight mb-1">{venue}</p>
            <p className="font-body text-sm leading-relaxed text-[var(--text-secondary)]">{address}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-[11px] font-body tracking-[0.16em] uppercase text-[var(--accent)] underline underline-offset-4"
            >
              Lihat Peta
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function EventDetails() {
  const { akad, reception } = invitation.events;
  const [year, month, day] = invitation.wedding.date.split("-").map(Number);
  const dayNum = String(day).padStart(2, "0");
  const monthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
    new Date(year, month - 1, 1)
  );

  return (
    <ModernSection id="events">
      <SectionLabel index="01">Save The Date</SectionLabel>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUpModern}
        className="flex items-end gap-5 mb-10"
      >
        <span className="font-body font-medium text-[clamp(4.5rem,16vw,7.5rem)] leading-none tracking-[-0.06em]">
          {dayNum}
        </span>
        <div className="pb-2 border-l-2 border-[var(--accent)] pl-5">
          <p className="font-body text-lg md:text-xl tracking-tight">{monthName}</p>
          <p className="font-body text-sm text-[var(--text-tertiary)] tabular-nums">{year}</p>
        </div>
      </motion.div>

      <EventRow
        index="A"
        label="Akad Nikah"
        time={akad.time}
        venue={akad.venue}
        address={akad.address}
        mapsUrl={akad.mapsUrl}
        delay={0.08}
      />
      <EventRow
        index="B"
        label="Resepsi"
        time={reception.time}
        venue={reception.venue}
        address={reception.address}
        mapsUrl={reception.mapsUrl}
        delay={0.12}
      />

      <motion.a
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUpModern}
        href="/calendar.ics"
        className="inline-flex items-center gap-2 mt-8 text-[11px] font-body font-medium tracking-[0.16em] uppercase border border-[var(--text-primary)] px-4 py-2.5 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
      >
        <CalendarPlus size={14} strokeWidth={1.5} />
        Tambah ke Kalender
      </motion.a>
    </ModernSection>
  );
}
