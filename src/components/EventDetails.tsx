"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";
import { splitEventDate } from "@/src/lib/event-date";
import { useGuestEvents } from "@/src/hooks/useGuestEvents";

interface EventBlockProps {
  title: string;
  dateISO: string;
  dayName: string;
  times: { label: string; value: string }[];
  venue: string;
  address: string;
  mapsUrl: string;
}

/** Satu acara: judul, tanggal, jam, tempat, peta. Dipakai sama untuk semua acara. */
function EventBlock({ title, dateISO, dayName, times, venue, address, mapsUrl }: EventBlockProps) {
  const { day, month, year } = splitEventDate(dateISO);

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      transition={easeOut}
      className="text-center"
    >
      <p className="eyebrow mb-5">{title}</p>
      <p className="eyebrow mb-3 text-[var(--text-secondary)]">{dayName}</p>
      <p className="font-display text-[clamp(3.75rem,13vw,6rem)] leading-none tracking-tight text-[var(--text-primary)]">
        {String(day).padStart(2, "0")}
      </p>
      <p className="font-display italic text-lg md:text-xl text-[var(--text-secondary)] mt-2 mb-10">
        {month} {year}
      </p>

      <div
        className={`grid gap-8 md:gap-16 max-w-md mx-auto mb-10 ${
          times.length > 1 ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        {times.map((t) => (
          <div key={t.label}>
            <p className="eyebrow mb-2">{t.label}</p>
            <p className="font-body text-sm md:text-base text-[var(--text-primary)]">{t.value}</p>
          </div>
        ))}
      </div>

      <p className="font-display text-xl md:text-2xl text-[var(--text-primary)] mb-2">{venue}</p>
      <p className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto mb-8">
        {address}
      </p>

      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-editorial">
        Peta Lokasi
      </a>
    </motion.article>
  );
}

export function EventDetails() {
  const { akad, reception } = invitation.events;
  const { extraEvents, calendarHref } = useGuestEvents();

  return (
    <section id="events" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-2xl">
        <SectionHeader label="Acara" />

        <EventBlock
          title="Akad Nikah & Resepsi"
          dateISO={invitation.wedding.date}
          dayName={akad.dayName}
          times={[
            { label: "Akad Nikah", value: akad.time },
            { label: "Resepsi", value: reception.time },
          ]}
          venue={akad.venue}
          address={akad.address}
          mapsUrl={akad.mapsUrl}
        />

        {/* Acara tambahan: hanya muncul untuk tamu yang boleh melihatnya (dari server). */}
        {extraEvents.map((event) => (
          <Fragment key={event.id}>
            <span aria-hidden="true" className="block w-px h-14 md:h-20 bg-[var(--border)] mx-auto my-12 md:my-16" />
            <EventBlock
              title={event.title}
              dateISO={event.dateISO}
              dayName={event.dayName}
              times={[{ label: "Waktu", value: event.time }]}
              venue={event.venue}
              address={event.address}
              mapsUrl={event.mapsUrl}
            />
          </Fragment>
        ))}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={easeOut}
          className="mt-14 md:mt-16 text-center"
        >
          <a href={calendarHref} className="btn-editorial">
            Tambah ke Kalender
          </a>
        </motion.div>
      </div>
    </section>
  );
}
