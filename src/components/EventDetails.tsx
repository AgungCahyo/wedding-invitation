"use client";

import { motion } from "motion/react";
import { MapPin, CalendarPlus } from "lucide-react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { Ornament } from "@/src/components/ui/Ornament";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";
import {
  buildCalendarEvent,
  buildGoogleCalendarUrl,
} from "@/src/lib/calendar";

type EventData = (typeof invitation.events)["akad"];

function EventBlock({
  title,
  event,
  index,
}: {
  title: string;
  event: EventData;
  index: number;
}) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      transition={{ ...easeOut, delay: index * 0.12 }}
      className="py-10 md:py-14"
    >
      <h3 className="display-heading text-[clamp(1.75rem,4vw,2.25rem)] mb-10 md:mb-12">
        {title}
      </h3>

      <dl className="space-y-7 md:space-y-9">
        <div>
          <dt className="eyebrow mb-2">Hari &amp; Tanggal</dt>
          <dd className="font-display text-xl md:text-2xl text-[var(--text-primary)]">
            {event.dayName}, {event.date}
          </dd>
        </div>

        <div>
          <dt className="eyebrow mb-2">Waktu</dt>
          <dd className="font-body text-base md:text-lg text-[var(--text-primary)]">
            {event.time}
          </dd>
        </div>

        <div>
          <dt className="eyebrow mb-2">Lokasi</dt>
          <dd>
            <p className="font-display text-xl md:text-2xl text-[var(--text-primary)] mb-3">
              {event.venue}
            </p>
            <p className="font-body text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-sm">
              {event.address}
            </p>
          </dd>
        </div>
      </dl>
    </motion.article>
  );
}

export function EventDetails() {
  const { akad, reception } = invitation.events;
  const { groom, bride } = invitation.couple;

  // Single shared location & calendar event for the wedding day
  const fullLocation = `${akad.venue}, ${akad.address}`;
  const calendarEvent = buildCalendarEvent({
    title: `Pernikahan ${groom.name.split(" ")[0]} & ${bride.name.split(" ")[0]}`,
    description: `Pernikahan ${groom.name} & ${bride.name}.\nAkad: ${akad.time}\nResepsi: ${reception.time}\nLokasi: ${fullLocation}`,
    location: fullLocation,
    dateISO: invitation.wedding.date,
    timeRange: `${akad.time} & ${reception.time}`,
  });

  const googleCalendarUrl = buildGoogleCalendarUrl(calendarEvent);

  return (
    <section id="events" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-5xl">
        <SectionHeader label="Event Details" />

        <div className="section-divider mb-2" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-16 lg:gap-24">
          <EventBlock title="Akad Nikah" event={akad} index={0} />
          <div className="hidden md:flex flex-col items-center justify-center w-px bg-[var(--border-subtle)] self-stretch relative" aria-hidden="true">
            <span className="absolute top-1/2 -translate-y-1/2 bg-[var(--bg-primary)] py-3">
              <Ornament />
            </span>
          </div>
          <EventBlock title="Resepsi" event={reception} index={1} />
        </div>

        {/* Single unified CTA buttons centered at the bottom of the section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 md:mt-10"
        >
          <a
            href={akad.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-editorial-filled text-center py-3.5 px-8 text-[11px] tracking-[0.2em] uppercase font-body flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <MapPin size={14} strokeWidth={1.5} />
            <span>Google Maps</span>
          </a>

          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-300 text-center py-3.5 px-8 text-[11px] tracking-[0.2em] uppercase font-body flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <CalendarPlus size={14} strokeWidth={1.5} />
            <span>Save the Date</span>
          </a>
        </motion.div>

        <div className="section-divider mt-12" />
      </div>
    </section>
  );
}
